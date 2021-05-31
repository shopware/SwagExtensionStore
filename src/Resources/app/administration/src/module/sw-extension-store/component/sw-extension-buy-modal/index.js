import template from './sw-extension-buy-modal.html.twig';
import './sw-extension-buy-modal.scss';

const { Component, Utils } = Shopware;

/**
 * @private
 */
Component.register('sw-extension-buy-modal', {
    template,

    inject: [
        'shopwareExtensionService',
        'extensionStoreLicensesService'
    ],

    mixins: [
        'sw-extension-error'
    ],

    props: {
        extension: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            tocAccepted: false,
            selectedVariantId: null,
            isLoading: false,
            permissionsAccepted: false,
            legalTextAccepted: false,
            showPermissionsModal: false,
            showLegalTextModal: false,
            privacyExtensionsAccepted: false,
            showPrivacyModal: false,
            checkoutStep: null,
            checkoutError: null,
            cart: null,
            paymentMeans: []
        };
    },

    computed: {
        recommendedVariants() {
            return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants);
        },

        selectedVariant() {
            return this.extension.variants.find((variant) => {
                return variant.id === this.selectedVariantId;
            });
        },

        todayPlusOneMonth() {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);

            return date;
        },

        dateFilter() {
            return Utils.format.date;
        },

        formattedPrice() {
            const cartPosition = this.cart && this.cart.positions && this.cart.positions[0];
            const netPrice = cartPosition && cartPosition.netPrice;

            if (netPrice && cartPosition && cartPosition.firstMonthFree) {
                return Utils.format.currency(0, 'EUR');
            }

            if (netPrice) {
                return Utils.format.currency(Math.round(netPrice, 2), 'EUR');
            }

            return Utils.format.currency(
                this.shopwareExtensionService.getPriceFromVariant(this.selectedVariant), 'EUR'
            );
        },

        purchaseButtonLabel() {
            switch (this.selectedVariant.type) {
                case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.FREE:
                    return this.$tc('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.free');

                case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.RENT:
                    return this.$tc('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.rent');

                case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.BUY:
                default:
                    return this.$tc('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.buy');
            }
        },

        vatIncludedClasses() {
            return {
                'is--hidden': this.selectedVariant.type === this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.FREE
            };
        },

        renewalDateClasses() {
            return {
                'is--hidden': this.selectedVariant.type !== this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.RENT
            };
        },

        extensionHasPermissions() {
            return !!Object.keys(this.extension.permissions).length;
        },

        canPurchaseExtension() {
            return this.tocAccepted &&
                this.permissionsAccepted &&
                this.legalTextAccepted &&
                this.privacyExtensionsAccepted &&
                this.userCanBuyFromStore &&
                !this.showPaymentWarning;
        },

        /* onPrem we need to check if the user is connected to the store in saas we check if the user has a plan */
        userCanBuyFromStore() {
            // Trigger for recompute value
            // eslint-disable-next-line no-unused-vars
            const trigger = this.tocAccepted;
            return Shopware.State.get('shopwareExtensions').loginStatus;
        },

        showPaymentWarning() {
            return (this.paymentMeans || []).length <= 0 &&
                this.cart && this.cart.payment && this.cart.payment.paymentMeanRequired;
        },

        checkoutSteps() {
            return Object.freeze({
                CHECKOUT: null,
                SUCCESS: 'checkout-success',
                FAILED: 'checkout-failed'
            });
        },

        showPaymentSelection() {
            return (this.paymentMeans || []).length > 0 &&
                this.cart && this.cart.payment && this.cart.payment.paymentMeanRequired;
        },

        paymentText() {
            if (!this.cart || !this.cart.payment || !this.cart.payment.paymentText) {
                return null;
            }

            return this.$sanitize(this.cart.payment.paymentText, {
                ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'br', 'strong', 'p', 'br'],
                ALLOWED_ATTR: ['href', 'target', 'rel']
            });
        },

        legalText() {
            if (!this.cart || !this.cart.legalText) {
                return null;
            }

            return this.$sanitize(this.cart.legalText, {
                ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'br', 'strong', 'p', 'br'],
                ALLOWED_ATTR: ['href', 'target', 'rel']
            });
        },

        selectedPaymentMean: {
            get() {
                return this.cart &&
                    this.cart.payment &&
                    this.cart.payment.paymentMean &&
                    this.cart.payment.paymentMean.id;
            },
            set(paymentId) {
                if (this.cart && this.cart.payment && this.cart.payment.paymentMean) {
                    this.cart.payment.paymentMean.id = paymentId;
                }

                this.cart.payment.paymentMean = {
                    id: paymentId
                };
            }
        },

        checkoutErrorDocumentationLink() {
            return Utils.get(this.checkoutError, 'meta.documentationLink', null);
        }
    },

    async created() {
        const variantId = this.recommendedVariants.length > 0 ? this.recommendedVariants[0].id : null;

        this.setSelectedVariantId(variantId);
        this.permissionsAccepted = !this.extensionHasPermissions;
        this.privacyExtensionsAccepted = !this.extension.privacyPolicyExtension;

        await this.fetchPlan();

        this.legalTextAccepted = !this.legalText;
    },

    watch: {
        selectedVariantId() {
            this.getCart();
        },

        /**
         * Watcher to automatically sync the `legalTextAccepted` value with the permissions.
         * When an App has permissions which need to be accepted, the permissions automatically accept
         * the `legalText` as well because for Apps they are combined in a single checkbox.
         *
         * @param value
         */
        permissionsAccepted(value) {
            this.legalTextAccepted = value;
        }
    },

    methods: {
        emitClose() {
            if (this.isLoading) {
                return;
            }

            this.$emit('modal-close');
        },

        setSelectedVariantId(variantId) {
            if (this.isLoading) {
                return;
            }

            this.selectedVariantId = variantId;
        },

        variantCardClass(variant) {
            return {
                'is--selected': variant.id === this.selectedVariantId
            };
        },

        onChangeVariantSelection(variant) {
            this.setSelectedVariantId(variant.id);
        },

        variantRecommendation(variant) {
            return this.shopwareExtensionService.mapVariantToRecommendation(variant);
        },

        async purchaseExtension() {
            this.isLoading = true;

            let checkoutResult = null;

            try {
                await this.extensionStoreLicensesService.orderCart(this.cart);

                await this.shopwareExtensionService.updateExtensionData();
                checkoutResult = this.checkoutSteps.SUCCESS;
            } catch (error) {
                this.handleErrors(error);
                checkoutResult = this.checkoutSteps.FAILED;

                if (Utils.get(error, 'response.data.errors[0]', null)) {
                    this.checkoutError = error.response.data.errors[0];
                }
            } finally {
                await this.shopwareExtensionService.updateExtensionData();
                this.checkoutStep = checkoutResult;

                this.isLoading = false;
            }
        },

        async getCart() {
            if (!this.userCanBuyFromStore) {
                return;
            }

            this.isLoading = true;

            try {
                const response = await this.extensionStoreLicensesService.newCart(this.extension.id, this.selectedVariantId);
                this.cart = response.data;
            } catch (e) {
                Shopware.Utils.debug.warn('Error: ', e);
            } finally {
                this.isLoading = false;
            }
        },

        variantPrice(variant) {
            const netPrice = Utils.format.currency(Math.round(variant.netPrice), 'EUR');
            const discountCampaign = variant.discountCampaign;
            const discountStartDate = discountCampaign && new Date(Date.parse(discountCampaign.startDate));
            const discountEndDate = discountCampaign && new Date(Date.parse(discountCampaign.endDate));
            const discountPrice = discountCampaign && Utils.format.currency(
                Math.round(discountCampaign.discountedPrice),
                'EUR'
            );

            if (variant.trialPhaseIncluded && variant.type === 'rent') {
                if (discountCampaign && discountStartDate < (new Date())) {
                    return this.$t('sw-extension-store.buy-modal.rent.priceTrialAndDiscount', {
                        trialPrice: Utils.format.currency(0, 'EUR'),
                        discountPrice: discountPrice,
                        discountEnds: Shopware.Utils.format.date(discountEndDate),
                        netPrice: netPrice
                    });
                }

                return this.$t('sw-extension-store.buy-modal.rent.priceTrialWithoutDiscount', {
                    trialPrice: Utils.format.currency(0, 'EUR'),
                    netPrice: netPrice
                });
            }

            if (variant.type === 'rent' && discountCampaign && discountStartDate < (new Date())) {
                return this.$t('sw-extension-store.buy-modal.rent.priceWithoutTrialWithDiscount', {
                    discountPrice: discountPrice,
                    discountEnds: Shopware.Utils.format.date(discountEndDate),
                    netPrice: netPrice
                });
            }

            if (variant.type === 'rent') {
                return this.$t('sw-extension-store.buy-modal.rent.priceWithoutTrialWithoutDiscount', {
                    netPrice: netPrice
                });
            }

            return netPrice;
        },

        handleErrors(error) {
            this.showExtensionErrors(error);
        },

        openPermissionsModal() {
            this.showPermissionsModal = true;
        },

        closePermissionsModal() {
            this.showPermissionsModal = false;
        },

        openLegalTextModal() {
            this.showLegalTextModal = true;
        },

        closeLegalTextModal() {
            this.showLegalTextModal = false;
        },

        async fetchPlan() {
            this.isLoading = true;
            await this.shopwareExtensionService.checkLogin();
            await this.getPaymentMeans();
            await this.getCart();
            this.isLoading = false;
        },

        async getPaymentMeans() {
            this.extensionStoreLicensesService.getPaymentMeans().then((response) => {
                this.paymentMeans = response.data;
            }).catch(error => {
                const errorMessages = (error.response && error.response.data && error.response.data.errors) || [];

                if (!Array.isArray(errorMessages)) {
                    Shopware.Utils.debug.warn('Payment loading error', error);
                    return;
                }

                errorMessages.forEach(e => {
                    this.createNotificationError({
                        system: true,
                        autoClose: false,
                        growl: true,
                        title: e.title,
                        message: e.detail
                    });
                });
            });
        },

        legalTextForVariant(variant) {
            if (!variant || !variant.legalText) {
                return null;
            }

            return this.$sanitize(variant.legalText, {
                ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'br', 'strong', 'p', 'br'],
                ALLOWED_ATTR: ['href', 'target', 'rel']
            });
        },

        openPrivacyModal() {
            this.showPrivacyModal = true;
        },

        closePrivacyModal() {
            this.showPrivacyModal = false;
        }
    }
});
