import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

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
        this.extensionStoreChannelService.register();

        try {
            // TODO: find other way to store the iframe URL
            const config = await this.systemConfigApiService.getValues('SwagExtensionStore.config');

            this.storeUrl = config['SwagExtensionStore.config.iframeUrl'];

        } catch (e) {
            // Fallback to default store URL if config fetch fails
        }
    },

    beforeUnmount() {
        this.extensionStoreChannelService.unregister();
    },
};
