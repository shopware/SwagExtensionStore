import template from './sw-extension-card-base.html.twig';
import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import {
    getLegacyServicesExtensionRoute,
    isLegacyServicesExtension,
} from 'SwagExtensionStore/util/legacy-services-extension';
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

    computed: {
        isLegacyServicesExtension() {
            return isLegacyServicesExtension((this.extension as IAP.Extension).name);
        },
    },

    methods: {
        openAccountPage() {
            window.open(`${accountUrl}/shops/shops`, '_blank');
        },

        openLegacyServicesExtension() {
            const route = getLegacyServicesExtensionRoute((this.extension as IAP.Extension).name);

            if (route) {
                this.$router.push(route);
            }
        },

        async openPermissionsModalForInstall() {
            if (this.isLegacyServicesExtension) {
                this.openLegacyServicesExtension();

                return;
            }

            if (!this.permissions) {
                this.permissionsAccepted = true;
                this.isLoading = true;
                await (this as unknown as { installAndActivateExtension: () => Promise<void> }).installAndActivateExtension();

                return;
            }

            this.permissionModalActionLabel = this.$t(
                'sw-extension-store.component.sw-extension-card-base.labelAcceptAndInstall',
            );
            this.showPermissionsModal = true;
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
