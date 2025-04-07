import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-button.html.twig';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    emits: ['click'],

    props: {
        state: {
            type: String as PropType<'error' | 'success' | 'purchase'>,
            required: true,
        },
        tosAccepted: {
            type: Boolean,
            required: true,
        },
        gtcAccepted: {
            type: Boolean,
            required: true,
        },
        variant: {
            type: String as PropType<IAP.InAppPurchasePriceModel['variant']>,
            required: false,
            default: null,
        },
    },

    computed: {
        show() {
            return ['error', 'success', 'purchase'].includes(this.state);
        },

        disabled() {
            return this.state === 'purchase' && (!this.tosAccepted || !this.gtcAccepted || !this.variant);
        },

        text() {
            switch (this.state) {
                case 'error':
                    return this.$t('sw-in-app-purchase-checkout-button.tryAgainButton');
                case 'success':
                    return this.$t('sw-in-app-purchase-checkout-button.closeButton');
                case 'purchase':
                    return this.$t('sw-in-app-purchase-checkout-button.purchaseButton');
                default:
                    return null;
            }
        },
    },

    methods: {
        onClick() {
            this.$emit('click');
        },
    },
});
