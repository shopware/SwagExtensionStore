import template from './sw-extension-store-detail.html.twig';
import './sw-extension-store-detail.scss';

const { Utils } = Shopware;

/**
 * @private
 */
export default {
    template,

    inject: [
        'extensionStoreDataService',
        'shopwareExtensionService',
        'extensionHelperService',
        'cacheApiService'
    ],

    mixins: ['sw-extension-error'],

    props: {
        id: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            extension: null,
            inAppPurchases: [],
            isLoading: false,
            showBuyModal: false,
            showPermissionsModal: false,
            showAcceptPermissionsModal: false,
            showAccountModal: false,
            showInstallationFailedModal: false,
            showInAppPurchasesListingModal: false,
            isInstalling: false,
            isInstallSuccessful: false,
            permissionsAccepted: false,
            isDescriptionCollapsed: false,
            installationError: null,
            fetchError: false,
            canBeOpened: false
        };
    },

    computed: {
        suspended() {
            return this.extension === null;
        },

        extensionMetaData() {
            if (this.suspended) {
                return null;
            }

            return Shopware.State.get('shopwareExtensions').myExtensions.data.find((extension) => {
                return extension.id === this.extension.id;
            });
        },

        isLicensed() {
            if (!this.extensionMetaData) {
                return false;
            }

            return !!this.extensionMetaData.storeLicense;
        },

        isInstalled() {
            return !!this.extensionMetaData && !!this.extensionMetaData.installedAt;
        },

        isConfigurable() {
            return !!this.extensionMetaData && this.extensionMetaData.configurable;
        },

        images() {
            if (this.suspended) {
                return [];
            }

            return this.extension.images.map((image) => {
                return image.remoteLink;
            });
        },

        extensionCategoryNames() {
            if (this.suspended) {
                return '';
            }

            return this.extension.categories.map((category) => category.details.name).join(', ');
        },

        extensionLanguages() {
            if (this.suspended) {
                return '';
            }

            return this.extension.languages.join(', ');
        },

        isPurchasable() {
            if (this.suspended) {
                return false;
            }

            if (!this.extension.variants.length) {
                return false;
            }

            return !this.isLicensed;
        },

        languageId() {
            return Shopware.State.get('session').languageId;
        },

        recommendedVariant() {
            return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants)[0];
        },

        dateFilter() {
            return Shopware.Filter.getByName('date');
        },

        hasActiveDiscount() {
            return this.shopwareExtensionService.isVariantDiscounted(this.recommendedVariant);
        },

        discountAppliesForMonths() {
            if (!this.hasActiveDiscount) {
                return null;
            }

            return this.recommendedVariant.discountCampaign.discountAppliesForMonths;
        },

        discountClass() {
            return {
                'is--discounted': this.hasActiveDiscount
            };
        },

        discountedPrice() {
            return this.shopwareExtensionService.getPriceFromVariant(this.recommendedVariant);
        },

        variantClass() {
            return {
                'is--theme': this.extension && this.extension.isTheme
            };
        },

        orderedBinaries() {
            return Utils.get(this.extension, 'binaries', []).slice().reverse();
        },

        description() {
            return Utils.get(this.extension, 'description');
        },

        hasPermissions() {
            return Object.keys(this.extension.permissions).length;
        },

        installationErrorDocumentationLink() {
            return Utils.get(this.installationError, 'meta.documentationLink', null);
        },

        isEnterpriseFeature() {
            if (this.suspended) {
                return false;
            }

            return !!this.extension.addons.find(addon => addon === 'SW6_EnterpriseFeature');
        }
    },

    watch: {
        id: {
            immediate: true,
            handler() {
                this.fetchExtension();
            }
        },

        '$route.hash'() {
            this.scrollToElementFromHash();
        },

        suspended() {
            if (!this.suspended) {
                // wait for all child components to be mounted
                this.$nextTick(() => {
                    this.scrollToElementFromHash();
                });
            }
        },

        languageId(newValue) {
            if (newValue !== '') {
                this.fetchExtension();
            }
        },

        description() {
            this.isDescriptionCollapsed = true;
            this.$nextTick(() => {
                this.checkDescriptionCollapsed();
            });
        }
    },

    async created() {
        await this.shopwareExtensionService.updateExtensionData();
        this.canBeOpened = !!this.shopwareExtensionService.getOpenLink(this.extension);
        this.setInAppPurchases();
    },

    methods: {
        async fetchExtension() {
            this.isLoading = true;

            if (this.languageId === '') {
                return;
            }

            try {
                this.fetchError = false;
                this.extension = await this.extensionStoreDataService.getDetail(
                    this.id,
                    { ...Shopware.Context.api, languageId: this.languageId }
                );
            } catch (error) {
                const errorData = error.response.data.errors[0];

                if (errorData.code === 'FRAMEWORK__STORE_ERROR' && errorData.title === 'Extension unknown') {
                    this.fetchError = errorData;

                    // eslint-disable-next-line max-len
                    const docLink = this.$tc('sw-extension.errors.messageToTheShopwareDocumentation', 0, errorData.meta);

                    this.createNotificationError({
                        title: errorData.title,
                        message: `${errorData.detail} <br> ${docLink}`,
                        autoClose: false
                    });

                    return;
                }

                this.showExtensionErrors(error);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchExtensionAndScrollToRatings() {
            await this.fetchExtension();
            this.$router.push({ hash: '#ratings-card' });
        },

        scrollToElementFromHash() {
            if (!this.$route.hash) {
                return;
            }

            const elementWithHashId = this.$el.querySelector(this.$route.hash);
            const pageBody = document.querySelector('div.sw-meteor-page__body');
            const header = document.querySelector('header.sw-meteor-page__head-area');

            const topOfElement = elementWithHashId.offsetTop - header.getBoundingClientRect().height;

            pageBody.scroll({ top: topOfElement, behavior: 'smooth' });

            // clear hash so user can click link again
            this.$router.push({ ...this.route, hash: null });
        },

        async onClickAddExtension() {
            await this.shopwareExtensionService.checkLogin();

            if (!Shopware.State.get('shopwareExtensions').userInfo) {
                this.openAccountModal();
                return;
            }

            this.openBuyModal();
        },

        renderPrice(price) {
            return Utils.format.currency(price, 'EUR');
        },

        onLoginSuccess() {
            this.closeAccountModal();
            this.openBuyModal();
        },

        openBuyModal() {
            this.showBuyModal = true;
        },

        closeBuyModal() {
            this.showBuyModal = false;
        },

        openAccountModal() {
            this.showAccountModal = true;
        },

        closeAccountModal() {
            this.showAccountModal = false;
        },

        openPermissionsModal() {
            this.showPermissionsModal = true;
        },

        closePermissionsModal() {
            this.showPermissionsModal = false;
        },

        openAcceptPermissionsModal() {
            this.showAcceptPermissionsModal = true;
        },

        closeAcceptPermissionsModal() {
            this.showAcceptPermissionsModal = false;
        },

        openInAppPurchasesListingModal() {
            this.showInAppPurchasesListingModal = true;
        },

        closeInAppPurchasesListingModal() {
            this.showInAppPurchasesListingModal = false;
        },

        async closePermissionsModalAndInstallExtension() {
            this.permissionsAccepted = true;
            this.closeAcceptPermissionsModal();
            await this.installExtension();
        },

        async handleInstallWithPermissionsModal() {
            if (Object.keys(this.extension.permissions).length) {
                this.openAcceptPermissionsModal();

                return;
            }

            this.permissionsAccepted = true;
            await this.installExtension();
        },

        async installExtension() {
            this.isInstalling = true;

            try {
                await this.extensionHelperService.downloadAndActivateExtension(this.extension.name, this.extension.type);

                if (this.extension.type === 'plugin') {
                    await this.cacheApiService.clear();
                }

                this.isInstallSuccessful = true;

                window.location.reload();
            } catch (error) {
                this.showExtensionErrors(error);

                if (Utils.get(error, 'response.data.errors[0]', null)) {
                    this.installationError = error.response.data.errors[0];
                }

                this.openInstallationFailedModal();
            } finally {
                this.isInstalling = false;
            }
        },

        async finishedInstall() {
            await this.shopwareExtensionService.updateExtensionData();
            this.isInstallSuccessful = false;
        },

        async openExtension() {
            const openLink = await this.shopwareExtensionService.getOpenLink(this.extension);

            if (openLink) {
                this.$router.push(openLink);
            }
        },

        openConfiguration() {
            this.$router.push({ name: 'sw.extension.config', params: { namespace: this.extension.name } });
        },

        openListingPage() {
            if (this.extension && this.extension.isTheme) {
                this.$router.push({ name: 'sw.extension.my-extensions.listing.theme' });
                return;
            }

            this.$router.push({ name: 'sw.extension.my-extensions.listing.app' });
        },

        checkDescriptionCollapsed() {
            const description = this.$el.querySelector('.sw-extension-store-detail__description');

            if (description && description.scrollHeight <= 300) {
                this.expandDescription();
            }
        },

        expandDescription() {
            this.isDescriptionCollapsed = false;
        },

        openInstallationFailedModal() {
            this.showInstallationFailedModal = true;
        },

        closeInstallationFailedModal() {
            this.showInstallationFailedModal = false;
        },

        setInAppPurchases() {
            this.inAppPurchases = [
                {
                    identifier: 'feature1',
                    name: 'Feature One',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at magna commodo, sodales mauris ut, aliquam dolor. Proin tellus nunc, tempor eget blandit vel, elementum quis velit. Curabitur bibendum consequat odio, sed aliquam lacus vestibulum in. Nam eleifend sollicitudin lorem, gravida fringilla urna consectetur id. Nullam lacus nunc, fringilla at odio id, luctus porta dolor. Ut varius pretium ex, non porta mi vulputate id. Suspendisse vel maximus turpis, nec lacinia dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut vel quam placerat, ultricies nunc ac, dapibus urna. Sed tincidunt ullamcorper arcu nec tempus. Aenean elementum augue eget cursus cursus. Donec vitae elementum elit. Nunc ac sem in ante hendrerit vulputate vel id tortor. Curabitur mollis vulputate urna, vel viverra lorem. Nunc sed neque at libero ornare commodo.\n' +
                        '\n' +
                        'Etiam fringilla ornare mauris in fermentum. Aliquam dapibus facilisis nisi at porta. Quisque dignissim sem ipsum, in efficitur metus blandit non. Donec sodales eleifend ipsum nec viverra. Etiam vitae ipsum magna. Nam mi ante, dignissim eget malesuada nec, feugiat vel ipsum. Phasellus augue erat, imperdiet non odio a, luctus lacinia est. Nunc blandit purus sit amet ante vehicula accumsan. Duis neque metus, consequat non enim at, porta maximus risus. Duis euismod odio sapien, in feugiat magna ultricies vel. Curabitur dictum condimentum ligula dapibus faucibus.\n' +
                        '\n' +
                        'Donec augue risus, vulputate in ipsum nec, gravida eleifend ante. Quisque maximus sapien dui, eget mollis dolor gravida ac. Proin a enim tincidunt, maximus erat ac, fermentum nisi. Nullam molestie eros vel ipsum viverra, sit amet congue nunc feugiat. Nullam elementum lorem libero, in scelerisque nunc congue in. Aliquam in dolor suscipit, pellentesque leo vel, malesuada velit. Ut felis mauris, lacinia ut efficitur ut, consectetur at ipsum. Nam dui magna, fringilla id semper sed, vulputate vel nunc. Duis quis metus ante.\n' +
                        '\n' +
                        'Sed at enim eu velit vestibulum efficitur ac non nunc. Vestibulum in maximus ligula, ac condimentum erat. Proin mauris nunc, ullamcorper quis lorem vitae, porta convallis orci. Maecenas vitae lectus mauris. Cras leo nisl, finibus vitae varius vitae, maximus eget erat. In vitae tristique libero. Nam eget eleifend leo.',
                    priceModels: [
                        {
                            price: 9.99,
                            currency: 'USD',
                            duration: 'monthly'
                        },
                        {
                            price: 99.99,
                            currency: 'USD',
                            duration: 'yearly'
                        }
                    ]
                },
                {
                    identifier: 'feature2',
                    name: 'Feature Two',
                    description: 'Description for Feature Two',
                    priceModels: [
                        {
                            price: 4.99,
                            currency: 'USD',
                            duration: 'monthly'
                        },
                        {
                            price: 49.99,
                            currency: 'USD',
                            duration: 'yearly'
                        }
                    ]
                }
            ];
        },

        formatCurrency(price, currency) {
            return Utils.format.currency(price, currency);
        }
    }
};
