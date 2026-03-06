import { purchaseConfirmationStore } from '../../store/extension-store-purchase-confirmation.store';
import template from './sw-extension-store-purchase-confirmation-modal.html.twig';
import './sw-extension-store-purchase-confirmation-modal.scss';

type ModalView = 'checkout' | 'permissions';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    data() {
        return {
            view: 'checkout' as ModalView,
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

        cart() {
            return this.store.state.cartData;
        },

        paymentMeans() {
            return this.store.state.paymentMeansData;
        },
    },

    watch: {
        isOpen(value: boolean) {
            if (!value) {
                this.resetModal();
            }
        },
    },

    methods: {
        resetModal() {
            this.view = 'checkout';
        },

        onModalChange(value: boolean) {
            if (!value) {
                this.store.cancel();
            }
        },
    },
});
