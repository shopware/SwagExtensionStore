import template from './sw-extension-store-in-app-purchases-listing-modal.html.twig';
import './sw-extension-store-in-app-purchases-listing-modal.scss';

const { Utils } = Shopware;

/**
 * @private
 */
export default {
    template,

    emits: ['modal-close'],

    props: {
        extension: {
            type: Object,
            required: true,
        },
        inAppPurchases: {
            type: Array,
            required: true,
        },
    },
    methods: {
        closeInAppPurchasesListingModal() {
            this.$emit('modal-close');
        },

        formatCurrency(price, currency) {
            return Utils.format.currency(price, currency);
        },
    },
};
