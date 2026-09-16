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

    inject: [
        'extensionStoreChannelService',
    ],

    computed: {
        storeUrl() {
            return extensionStoreContextStore().iframeUrl;
        },
    },

    created() {
        trackExtensionStoreEvent('extension_store_entered');
        this.extensionStoreChannelService.register();
    },

    beforeUnmount() {
        trackExtensionStoreEvent('extension_store_left');
        this.extensionStoreChannelService.unregister();
    },
};
