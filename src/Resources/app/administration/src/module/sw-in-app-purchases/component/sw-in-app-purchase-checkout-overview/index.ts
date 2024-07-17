import type * as IAP from 'src/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-overview.html.twig';
import './sw-in-app-purchase-checkout-overview.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        purchase: {
            type: Object as PropType<IAP.InAppPurchase>,
            required: true
        },
        priceModel: {
            type: Object as PropType<IAP.InAppPurchasePriceModel>,
            required: true
        },
        tosAccepted: {
            type: Boolean,
            required: true
        }
    },

    methods: {
        onTosAcceptedChange(value: boolean) {
            this.$emit('update:tos-accepted', value);
        }
    }
});
