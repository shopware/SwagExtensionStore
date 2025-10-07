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
        cart: {
            type: Object as PropType<IAP.InAppPurchaseCart>,
            required: true,
        },
        variant: {
            type: String,
            required: true,
        },
    },

    data(): {
        showConditionsModal: boolean;
    } {
        return {
            showConditionsModal: false,
        };
    },

    watch: {
        priceModel: {
            immediate: true,
            handler() {
                this.onGtcAcceptedChange(this.priceModel.conditionsType === null);
            },
        },
    },

    computed: {
        purchaseOptions(): Array<{ value: string; name: string }> {
            return this.purchase.priceModels.map((priceModel): { value: string; name: string } => {
                return {
                    value: priceModel.variant,
                    name: `€${priceModel.price}* /${this.$t(`sw-in-app-purchase-price-box.duration.${priceModel.variant}`)}`,
                };
            });
        },

        priceModel(): IAP.InAppPurchasePriceModel {
            return this.purchase.priceModels.find(
                (pm: IAP.InAppPurchasePriceModel) => this.cart.positions[0].variant === pm.variant,
            ) || this.purchase.priceModels[0];
        },

        subscriptionChange() {
            return this.cart.positions.find(position => position.subscriptionChange !== null);
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

        updateVariant(variant : string) {
            if (this.variant !== variant) {
                this.$emit('update:variant', variant);
            }
        },
    },
});
