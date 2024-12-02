import template from './sw-extension-card-base.html.twig';
import './sw-extension-card-base.scss';

const accountUrl = 'https://account.shopware.com';

/**
 * @package checkout
 */
export default Shopware.Component.wrapComponentConfig({
    template: template,

    methods: {
        openAccountPage() {
            window.open(`${accountUrl}/shops/shops`, '_blank');
        },

        hasActiveInAppPurchases(extensionName: string) {
            return Shopware.InAppPurchase.getByExtension(extensionName).length > 0;
        }
    }
});
