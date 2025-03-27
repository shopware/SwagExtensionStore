import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-overview.html.twig';
import './sw-in-app-purchase-checkout-overview.scss';

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
        }
    },

    data(): {
        showConditionsModal: boolean
    } {
        return {
            showConditionsModal: false
        };
    },

    created() {
        this.setVariant();
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

        getPurchaseOptions(priceModels: Array<IAP.InAppPurchasePriceModel>): Array<{ value: string, name: string }> {
            return priceModels.map((priceModel): { value: string, name: string } => {
                return {
                    value: priceModel.variant,
                    name: `€${priceModel.price}* /${this.$t(`sw-in-app-purchase-price-box.duration.${priceModel.variant}`)}`
                };
            });
        },

        setVariant(variant?: string) {
            if (!variant) {
                variant = this.purchase.priceModels[0].variant;
            }
            this.$emit('update:variant', variant);
        },
    },
});
