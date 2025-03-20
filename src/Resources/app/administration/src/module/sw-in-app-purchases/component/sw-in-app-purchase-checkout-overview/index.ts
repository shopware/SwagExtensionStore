import type * as IAP from 'src/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-overview.html.twig';
import './sw-in-app-purchase-checkout-overview.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    emits: ['update:tos-accepted'],

    props: {
        purchase: {
            type: Object as PropType<IAP.InAppPurchase>,
            required: true,
        },
        tosAccepted: {
            type: Boolean,
            required: true,
        },
    },

    methods: {
        onTosAcceptedChange(value: boolean) {
            this.$emit('update:tos-accepted', value);
        },

        getPurchaseOptions(priceModels: IAP.InAppPurchasePriceModelCollection): Array<{ value: string, name: string }> {
            return priceModels.map((priceModel: IAP.InAppPurchasePriceModel) => {
                return {
                    value: priceModel.variant,
                    name: `€${priceModel.price}* /${ this.$t(`sw-in-app-purchase-price-box.duration.${priceModel.variant}`)}`
                };
            });
        },
    },
});
