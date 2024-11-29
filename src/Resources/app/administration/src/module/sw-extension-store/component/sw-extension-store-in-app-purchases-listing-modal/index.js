import template from './sw-extension-store-in-app-purchases-listing-modal.html.twig';

const { Utils } = Shopware;

/**
 * @private
 */
export default {
    template,

    props: {
        extension: {
            type: Object,
            required: true
        },
        inAppPurchases: {
            type: Array,
            required: true
        }
    },
    methods: {
        closeInAppPurchasesListingModal() {
            this.$emit('modal-close');
        },

        formatCurrency(price, currency) {
            return Utils.format.currency(price, currency);
        }
    }
};
