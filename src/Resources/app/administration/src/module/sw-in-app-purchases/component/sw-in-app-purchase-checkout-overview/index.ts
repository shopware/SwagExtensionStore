import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-overview.html.twig';
import './sw-in-app-purchase-checkout-overview.scss';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    emits: ['update:tos-accepted', 'update:gtc-accepted', 'update:variant'],

    props: {
        purchase: {
            type: Object as PropType<IAP.InAppPurchase>,
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
        producer: {
            type: String,
            required: true,
        },
    },

    data(): {
        showConditionsModal: boolean;
        priceModel: IAP.InAppPurchasePriceModel;
    } {
        return {
            showConditionsModal: false,
            priceModel: this.purchase.priceModels[0],
        };
    },

    created() {
        this.setPriceModel();
    },

    computed: {
        purchaseOptions(): Array<{ value: IAP.InAppPurchasePriceModel; name: string }> {
            return this.purchase.priceModels.map((priceModel): { value: IAP.InAppPurchasePriceModel; name: string } => {
                return {
                    value: priceModel,
                    name: `€${priceModel.price}* /${this.$t(`sw-in-app-purchase-price-box.duration.${priceModel.variant}`)}`,
                };
            });
        },
    },

    methods: {
        openConditionsModal() {
            this.showConditionsModal = true;
        },

        closeConditionsModal() {
            this.showConditionsModal = false;
        },

        onTosAcceptedChange(value: boolean) {
            this.$emit('update:tos-accepted', value);
        },

        onGtcAcceptedChange(value: boolean) {
            this.$emit('update:gtc-accepted', value);
        },

        setPriceModel(priceModel?: IAP.InAppPurchasePriceModel) {
            if (!priceModel) {
                priceModel = this.purchase.priceModels[0];
            }
            this.priceModel = priceModel;
            this.onGtcAcceptedChange(priceModel.conditionsType === null);
            this.$emit('update:variant', priceModel.variant);
        },
    },
});
