import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-price-box.html.twig';
import './sw-in-app-purchase-price-box.scss';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        priceModel: {
            type: Object as PropType<IAP.InAppPurchasePriceModel>,
            required: true,
        },
    },

    computed: {
        rentDuration(): string | null {
            if (this.priceModel.type === 'rent') {
                return this.priceModel.variant;
            }

            return null;
        },
    },
});
