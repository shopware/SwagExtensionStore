import extensionStorePurchaseConfirmationStore from '../../store/extension-store-purchase-confirmation.store';
import template from './sw-extension-store-purchase-confirmation-checkout.html.twig';
import './sw-extension-store-purchase-confirmation-checkout.scss';

import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../../types/extension-store-basket.types';

const { Utils } = Shopware;

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        cart: {
            type: Object as PropType<ExtensionStoreBasket>,
            required: true,
        },
        paymentMeans: {
            type: Object as PropType<ExtensionStorePaymentMean[]>,
            required: true,
        },
        tocAccepted: {
            type: Boolean,
            required: true,
        },
        permissionsAccepted: {
            type: Boolean,
            required: true,
        },
        installAfterPurchase: {
            type: Boolean,
            required: true,
        },
    },

    emits: [
        'update:modal-view',
        'update:toc-accepted',
        'update:permissions-accepted',
        'update:install-after-purchase',
    ],

    computed: {
        steps() {
            return Object.freeze({
                CHECKOUT: null,
                SUCCESS: 'success',
                FAILED: 'failed',
            });
        },

        step() {
            if (extensionStorePurchaseConfirmationStore().isFailedOnBasketCreation) {
                return this.steps.FAILED;
            }

            if (this.isSubmitted && !this.isLoading) {
                return extensionStorePurchaseConfirmationStore().isSuccessful ? this.steps.SUCCESS : this.steps.FAILED;
            }

            return this.steps.CHECKOUT;
        },

        isOpen() {
            return extensionStorePurchaseConfirmationStore().isOpen;
        },

        isLoading() {
            return extensionStorePurchaseConfirmationStore().isLoading;
        },

        isSubmitted() {
            return extensionStorePurchaseConfirmationStore().isSubmitted;
        },
        errorTitle() {
            return extensionStorePurchaseConfirmationStore().errorTitle;
        },
        errorDescription() {
            return extensionStorePurchaseConfirmationStore().errorDescription;
        },
        errorDocumentationLink() {
            return extensionStorePurchaseConfirmationStore().errorDocumentationLink;
        },
        position() {
            return this.cart?.positions?.[0];
        },

        extension() {
            return this.position?.extension;
        },

        permissions() {
            return this.extension?.permissions;
        },

        domains() {
            return this.extension?.domains.filter((domain) => domain !== null);
        },

        defaultPaymentMean() {
            const cartPaymentMeanId = this.cart?.payment?.paymentMean?.id;

            return this.paymentMeans?.find((paymentMean) => paymentMean.id === cartPaymentMeanId);
        },

        extensionHasPermissions() {
            return !!Object.keys(this.permissions ?? {}).length;
        },

        extensionHasDomains() {
            return (this.domains?.length ?? 0) > 0;
        },

        extensionHasPermissionsOrDomains() {
            return this.extensionHasPermissions || this.extensionHasDomains;
        },

        isDiscounted() {
            return this.position && this.position.netPrice !== this.position.pseudoPrice;
        },

        isFirstMonthFree() {
            return this.position && this.position.firstMonthFree;
        },

        durationIntervalSnippet() {
            const duration = this.position?.variant.duration;

            switch (duration) {
                case 12:
                    return this.$t('sw-extension-store.purchase-confirmation.checkout.order.perYear');
                case 1:
                    return this.$t('sw-extension-store.purchase-confirmation.checkout.order.perMonth');
                default:
                    return null;
            }
        },

        netPrice() {
            let price = 0;

            if (!this.isFirstMonthFree) {
                price = this.position?.netPrice ?? 0;
            }

            return this.formatCurrency(price);
        },

        netPriceIntervalSnippet() {
            if (this.isFirstMonthFree) {
                return this.$t('sw-extension-store.purchase-confirmation.checkout.order.firstMonth');
            }

            return this.durationIntervalSnippet;
        },

        discountedPriceIntervalSnippet() {
            let snippet = '';

            const duration = this.position?.variant.duration;

            if (duration === 12) {
                snippet += this.$t('sw-extension-store.purchase-confirmation.checkout.order.forFirstYear');
            } else {
                const discountAppliesForMonths = this.position?.discountAppliesForMonths;

                snippet += this.$t('sw-extension-store.purchase-confirmation.checkout.order.forMonths', {
                    months: discountAppliesForMonths,
                });
            }

            if (this.isFirstMonthFree) {
                const price = this.formatCurrency(this.position?.netPrice ?? 0);

                if (duration === 12) {
                    snippet = this.$t('sw-extension-store.purchase-confirmation.checkout.order.followingPerYear', {
                        price: price,
                    }) + ' (' + snippet + ')';
                } else {
                    snippet = this.$t('sw-extension-store.purchase-confirmation.checkout.order.followingPerMonth', {
                        price: price,
                    }) + ' ' + snippet;
                }
            }

            return snippet;
        },

        pseudoPrice() {
            return this.formatCurrency(this.position?.pseudoPrice ?? 0);
        },

        userCanBuyFromStore() {
            return Shopware.Store.get('shopwareExtensions').userInfo !== null;
        },

        hasPaymentMethodError() {
            return (this.paymentMeans || []).length <= 0 &&
                this.cart && this.cart.payment && this.cart.payment.paymentMeanRequired;
        },

        canConfirmPurchase() {
            return this.userCanBuyFromStore
                && this.tocAccepted
                && (!this.extensionHasPermissionsOrDomains || this.permissionsAccepted)
                && !this.hasPaymentMethodError;
        },

        isCompatible() {
            return extensionStorePurchaseConfirmationStore().isCompatible;
        },

        loadingTitle() {
            const step = extensionStorePurchaseConfirmationStore().checkoutStep;
            if (step === null) {
                return undefined;
            }

            return this.$t(`sw-extension-store.purchase-confirmation.checkout.loading.title.${step}`);
        },

        loadingDescription() {
            const step = extensionStorePurchaseConfirmationStore().checkoutStep;
            if (step === null) {
                return undefined;
            }

            return this.$t('sw-extension-store.purchase-confirmation.checkout.loading.description');
        },
    },

    methods: {
        formatCurrency(price: number) {
            return Utils.format.currency(price, 'EUR', 2);
        },

        onTocAcceptedChange(value: boolean) {
            this.$emit('update:toc-accepted', value);
        },

        onPermissionsAcceptedChange(value: boolean) {
            this.$emit('update:permissions-accepted', value);
        },

        showPermissions() {
            this.$emit('update:modal-view', 'permissions');
        },

        onInstallAfterPurchaseChange(value: boolean) {
            this.$emit('update:install-after-purchase', value);
        },

        closeModal() {
            extensionStorePurchaseConfirmationStore().closeModal();
        },

        cancelPurchase() {
            extensionStorePurchaseConfirmationStore().cancel();
        },

        async confirmPurchase() {
            await extensionStorePurchaseConfirmationStore().confirm();
        },
    },
});
