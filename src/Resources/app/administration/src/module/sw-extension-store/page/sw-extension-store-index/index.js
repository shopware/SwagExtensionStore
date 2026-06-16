import './sw-extension-store-index.scss';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import template from './sw-extension-store-index.html.twig';

/**
 * @private
 */
export default {
    template,

    inject: [
        'extensionStoreChannelService'
    ],

    computed: {
        storeUrl() {
            return extensionStoreContextStore().iframeUrl;
        }
    },

    created() {
        this.extensionStoreChannelService.register();
    },

    beforeUnmount() {
        this.extensionStoreChannelService.unregister();
    }
};
