import { purchaseConfirmationStore } from '../../store/extension-store-purchase-confirmation.store';
import template from './sw-extension-store-purchase-confirmation-checkout.html.twig';
import './sw-extension-store-purchase-confirmation-checkout.scss';

import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../../types/extension-store-basket.types';
import { trackExtensionStoreEvent } from '../../util/extension-store-tracking';

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
    },

    emits: [
        'update:modal-view',
        'update:toc-accepted',
        'update:permissions-accepted',
    ],

    data() {
        return {
            store: purchaseConfirmationStore,
        };
    },

    computed: {
        steps() {
            return Object.freeze({
                CHECKOUT: null,
                SUCCESS: 'success',
                FAILED: 'failed',
            });
        },

        step() {
            if (this.isSubmitted && !this.isLoading) {
                return this.store.state.isSuccessful ? this.steps.SUCCESS : this.steps.FAILED;
            }

            return this.steps.CHECKOUT;
        },

        isOpen() {
            return this.store.state.isOpen;
        },

        isLoading() {
            return this.store.state.isLoading;
        },

        isSubmitted() {
            return this.store.state.isSubmitted;
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

            trackExtensionStoreEvent('purchase_show_permissions', {
                extension_id: this.extension?.id ?? null,
                extension_name: this.extension?.name ?? null,
                net_price: this.position?.netPrice ?? null,
            });
        },

        closeModal() {
            this.store.closeModal();
        },

        cancelPurchase() {
            this.store.cancel();
        },

        async confirmPurchase() {
            await this.store.confirm();
        },
    },
});
