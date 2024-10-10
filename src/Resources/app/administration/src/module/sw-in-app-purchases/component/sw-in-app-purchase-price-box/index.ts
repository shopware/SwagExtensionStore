import type * as IAP from 'src/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-price-box.html.twig';
import './sw-in-app-purchase-price-box.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        priceModel: {
            type: Object as PropType<IAP.InAppPurchasePriceModel>,
            required: true
        }
    },

    computed: {
        rentDuration(): string | null {
            if (this.priceModel.type === 'rent') {
                switch (this.priceModel.duration) {
                    case 1: return 'monthly';
                    case 12: return 'yearly';
                    default: return null;
                }
            }

            return null;
        }
    }
});
