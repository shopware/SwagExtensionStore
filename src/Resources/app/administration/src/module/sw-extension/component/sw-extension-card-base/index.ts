import template from './sw-extension-card-base.html.twig';
import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import './sw-extension-card-base.scss';

const accountUrl = 'https://account.shopware.com';

/**
 * @package checkout
 */
export default Shopware.Component.wrapComponentConfig({
    template: template,

    inject: [
        'inAppPurchasesService',
    ],

    data() {
        return {
            inAppPurchases: [] as IAP.InAppPurchase[],
            showInAppPurchasesListingModal: false,
        };
    },

    methods: {
        openAccountPage() {
            window.open(`${accountUrl}/shops/shops`, '_blank');
        },

        hasActiveInAppPurchases(extensionName: string) {
            return Shopware.InAppPurchase.getByExtension(extensionName).length > 0;
        },

        openInAppPurchasesListingModal() {
            this.showInAppPurchasesListingModal = true;
            this.fetchInAppPurchases();
        },

        closeInAppPurchasesListingModal() {
            this.showInAppPurchasesListingModal = false;
            this.inAppPurchases = [];
        },

        async fetchInAppPurchases() {
            this.inAppPurchases = await this.inAppPurchasesService.getAvailablePurchases((this.extension as IAP.Extension).name);
        },
    },
});
