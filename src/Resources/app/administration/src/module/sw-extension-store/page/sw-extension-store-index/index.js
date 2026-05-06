import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';

/**
 * @private
 */
export default {
    template,

    // we have to add the extensionStoreLicensesService for the checkout example
    inject: [
        'extensionStoreChannelService',
        'systemConfigApiService',
    ],

    data() {
        return {
            storeUrl: null,
        };
    },

    async created() {
        const extensionStoreContext = extensionStoreContextStore();

        trackExtensionStoreEvent('extension_store_entered');
        this.extensionStoreChannelService.register();

        try {
            const [config, coreStoreConfig] = await Promise.all([
                this.systemConfigApiService.getValues('SwagExtensionStore.config'),
                this.systemConfigApiService.getValues('core.store'),
            ]);
            // TODO: find other way to store the iframe URL
            this.storeUrl = config['SwagExtensionStore.config.iframeUrl'];

            extensionStoreContext.updateLicenseHost(coreStoreConfig['core.store.licenseHost'] ?? null);
        } catch (e) {
            // Fallback to default store URL if config fetch fails
        }
    },

    beforeUnmount() {
        trackExtensionStoreEvent('extension_store_left');
        extensionStoreContextStore().resetLicenseHost();
        this.extensionStoreChannelService.unregister();
    },
};
