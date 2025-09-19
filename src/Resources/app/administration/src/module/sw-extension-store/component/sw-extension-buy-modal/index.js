import template from './sw-extension-buy-modal.html.twig';
import './sw-extension-buy-modal.scss';

const { Utils } = Shopware;

/**
 * @private
 */
export default {
    template,

    inject: [
        'shopwareExtensionService',
        'extensionStoreService',
        'extensionStoreLicensesService',
    ],

    emits: [
        'modal-close',
    ],

    mixins: [
        'sw-extension-error',
    ],

    props: {
        extension: {
            type: Object,
            required: true,
        },
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
            paymentMeans: [],
        };
    },

    computed: {
        actualPrice() {
            const cartPosition = this.cart && this.cart.positions && this.cart.positions[0];
            const netPrice = cartPosition && cartPosition.netPrice;

            if (netPrice && cartPosition && cartPosition.firstMonthFree) {
                return Utils.format.currency(0, 'EUR');
            }

            if (netPrice) {
                return Utils.format.currency(netPrice, 'EUR', 2);
            }

            return Utils.format.currency(
                this.extensionStoreService.getPriceFromVariant(this.selectedVariant),
                'EUR',
            );
        },

        actualPriceSnippet() {
            if (this.extensionStoreService.isVariantOfTypeFree(this.selectedVariant)) {
                return 'sw-extension-store.general.labelFree';
            }

            if (this.extensionStoreService.isVariantOfTypeBuy(this.selectedVariant)) {
                return 'sw-extension-store.general.labelPriceOneTime';
            }

            const cartPosition = this.cart && this.cart.positions && this.cart.positions[0];
            const netPrice = cartPosition && cartPosition.netPrice;

            if (netPrice && cartPosition && cartPosition.firstMonthFree) {
                return 'sw-extension-store.general.labelPriceFirstMonth';
            }

            if (this.isRentDurationYearly(this.selectedVariant)) {
                return 'sw-extension-store.general.labelPricePerYear';
            }

            return 'sw-extension-store.general.labelPricePerMonth';
        },

        finalPriceSnippet() {
            if (this.isRentDurationYearly(this.selectedVariant)) {
                return 'sw-extension-store.buy-modal.rent.yearly.finalPrice';
            }

            return 'sw-extension-store.buy-modal.rent.monthly.finalPrice';
        },

        recommendedVariants() {
            return this.extensionStoreService.orderVariantsByRentDuration(this.extension.variants);
        },

        selectedVariant() {
            return this.extension.variants.find((variant) => {
                return variant.id === this.selectedVariantId;
            });
        },

        dateFilter() {
            return Utils.format.date;
        },

        purchaseButtonLabel() {
            if (this.isVariantOfTypeFree(this.selectedVariant)) {
                return this.$t('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.free');
            }

            if (this.isVariantOfTypeRent(this.selectedVariant)) {
                return this.$t('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.rent');
            }

            return this.$t('sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.buy');
        },

        vatIncludedClasses() {
            return {
                'is--hidden': this.isVariantOfTypeFree(this.selectedVariant),
            };
        },

        renewalDate() {
            const date = new Date();

            if (this.isRentDurationMonthly(this.selectedVariant)) {
                date.setMonth(date.getMonth() + 1);
            } else {
                date.setMonth(date.getMonth() + 12);
            }

            return date;
        },

        renewalDateClasses() {
            return {
                'is--hidden': false === this.isVariantOfTypeRent(this.selectedVariant),
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

            const _trigger = this.tocAccepted;

            return Shopware.Store.get('shopwareExtensions').userInfo !== null;
        },

        showPaymentWarning() {
            return (this.paymentMeans || []).length <= 0 &&
                this.cart && this.cart.payment && this.cart.payment.paymentMeanRequired;
        },

        checkoutSteps() {
            return Object.freeze({
                CHECKOUT: null,
                SUCCESS: 'checkout-success',
                FAILED: 'checkout-failed',
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
                ALLOWED_ATTR: ['href', 'target', 'rel'],
            });
        },

        legalText() {
            if (!this.cart || !this.cart.legalText) {
                return null;
            }

            return this.$sanitize(this.cart.legalText, {
                ALLOWED_TAGS: ['a', 'b', 'i', 'u', 'br', 'strong', 'p', 'br'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
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
                    id: paymentId,
                };
            },
        },

        checkoutErrorDocumentationLink() {
            return Utils.get(this.checkoutError, 'meta.documentationLink', null);
        },

        firstMonthFree() {
            return this.cart && this.cart.positions[0] && this.cart.positions[0].firstMonthFree === true;
        },
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
         * userCanBuyFromStore is used in the getCart() method to make an early return
         *
         * @param value
         */
        userCanBuyFromStore(value) {
            if (value) {
                this.getCart();
            }
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
        },
    },

    methods: {
        emitClose() {
            if (this.isLoading) {
                return;
            }

            this.$emit('modal-close');
        },

        getDiscountClasses(variant) {
            return {
                'is--discounted': this.hasActiveDiscount(variant),
            };
        },

        getVariantPrice(variant) {
            return this.extensionStoreService.getCalculatedPrice(variant);
        },

        getVariantPriceSnippet(variant) {
            return this.extensionStoreService.getPriceSnippetForVariant(variant);
        },

        getVariantDiscountInformationSnippet(variant) {
            if (this.isRentDurationYearly(variant)) {
                return 'sw-extension-store.buy-modal.rent.yearly.discountInformation';
            }

            return 'sw-extension-store.buy-modal.rent.monthly.discountInformation';
        },

        getVariantCancellationInformationSnippet(variant) {
            if (this.isRentDurationYearly(variant)) {
                return 'sw-extension-store.buy-modal.rent.yearly.cancellationInformation';
            }

            return 'sw-extension-store.buy-modal.rent.monthly.cancellationInformation';
        },

        getVariantClasses(variant) {
            return {
                'is--monthly': this.isRentDurationMonthly(variant),
                'is--yearly': this.isRentDurationYearly(variant),
            };
        },

        getVariantBadgeClasses(variant) {
            return {
                'sw-extension-buy-modal__variants-card-badge-discounted': this.hasActiveDiscount(variant),
                'is--monthly': this.isRentDurationMonthly(variant),
                'is--yearly': this.isRentDurationYearly(variant),
            };
        },

        getVariantBadgeSavings(variant) {
            const monthlyVariant = this.extension.variants.find((v) => {
                return this.extensionStoreService.isRentDurationMonthly(v);
            });

            if (!monthlyVariant) {
                return 0;
            }

            const monthlyNetPrice = monthlyVariant.netPrice;
            const variantNetPrice = variant.netPrice;
            const variantDuration = variant.duration;

            const hasSaving = variantNetPrice !== (monthlyNetPrice * variantDuration);
            const hasDiscount = this.hasActiveDiscount(variant);

            let savingsPercentage = 0;

            if (hasSaving && false === hasDiscount) {
                savingsPercentage = 100 * (1 - variantNetPrice / (monthlyNetPrice * variantDuration));
            } else if (false === hasSaving && hasDiscount) {
                savingsPercentage = 100 * (1 - variant.discountCampaign.discountedPrice / variant.netPrice);
            } else if (hasSaving && hasDiscount) {
                const savingPercentage = 100 * (1 - variantNetPrice / (monthlyNetPrice * variantDuration));
                const discountPercentage = 100 * (1 - variant.discountCampaign.discountedPrice / (monthlyNetPrice * variantDuration));

                savingsPercentage = discountPercentage - savingPercentage;
            }

            return savingsPercentage.toFixed(2).replace(/\.00$/, '');
        },

        hasActiveDiscount(variant) {
            return this.extensionStoreService.isVariantDiscounted(variant);
        },

        isRentDurationMonthly(variant) {
            return this.extensionStoreService.isRentDurationMonthly(variant);
        },

        isRentDurationYearly(variant) {
            return this.extensionStoreService.isRentDurationYearly(variant);
        },

        isVariantOfTypeFree(variant) {
            return this.extensionStoreService.isVariantOfTypeFree(variant);
        },

        isVariantOfTypeBuy(variant) {
            return this.extensionStoreService.isVariantOfTypeBuy(variant);
        },

        isVariantOfTypeRent(variant) {
            return this.extensionStoreService.isVariantOfTypeRent(variant);
        },

        setSelectedVariantId(variantId) {
            if (this.isLoading) {
                return;
            }

            this.selectedVariantId = variantId;
        },

        variantCardClass(variant) {
            return {
                'is--selected': variant.id === this.selectedVariantId,
            };
        },

        onChangeVariantSelection(variant) {
            this.setSelectedVariantId(variant.id);
        },

        async purchaseExtension() {
            this.isLoading = true;

            let checkoutResult = null;

            try {
                await this.orderCart();

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

        async orderCart() {
            await this.extensionStoreLicensesService.orderCart(this.cart);
        },

        async getCart() {
            if (!this.userCanBuyFromStore) {
                return;
            }

            this.isLoading = true;

            try {
                const response = await this.extensionStoreLicensesService.newCart(this.extension.id, this.selectedVariantId);
                this.cart = response.data;
            } catch (error) {
                this.handleErrors(error);
                this.isLoading = false;
                this.emitClose();
            } finally {
                this.isLoading = false;
            }
        },

        renderPrice(price) {
            return Utils.format.currency(price, 'EUR');
        },

        renderBuyPrice(variant) {
            if (this.hasActiveDiscount(variant)) {
                return this.renderPrice(variant.discountCampaign.discountedPrice);
            }

            return this.renderPrice(variant.netPrice);
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
                        message: e.detail,
                    });
                });
            });
        },

        openPrivacyModal() {
            this.showPrivacyModal = true;
        },

        closePrivacyModal() {
            this.showPrivacyModal = false;
        },
    },
};
