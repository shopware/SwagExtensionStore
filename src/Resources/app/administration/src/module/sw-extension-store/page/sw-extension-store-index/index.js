import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

/**
 * @private
 */
export default {
    template,

    // we have to add the extensionStoreLicensesService for the checkout example
    inject: ['extensionStoreChannelService'],

    data() {
        return {

        };
    },

    created() {
        this.extensionStoreChannelService.register();
    },
};
