import { purchaseConfirmationStore } from '../../store/extension-store-purchase-confirmation.store';
import template from './sw-extension-store-purchase-confirmation-modal.html.twig';
import './sw-extension-store-purchase-confirmation-modal.scss';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    data() {
        return {
            store: purchaseConfirmationStore,
        };
    },

    computed: {
        isOpen() {
            return this.store.state.isOpen;
        },

        isLoading() {
            return this.store.state.isLoading;
        },

        cartData() {
            return this.store.state.cartData;
        },
    },

    methods: {
        async onConfirmPurchase() {
            await this.store.confirm();
        },

        onCancelPurchase() {
            this.store.cancel();
        },
    },
});
