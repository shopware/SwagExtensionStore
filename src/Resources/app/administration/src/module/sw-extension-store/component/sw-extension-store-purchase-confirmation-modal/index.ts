import extensionStorePurchaseConfirmationStore from '../../store/extension-store-purchase-confirmation.store';
import template from './sw-extension-store-purchase-confirmation-modal.html.twig';
import './sw-extension-store-purchase-confirmation-modal.scss';

type ModalView = 'checkout' | 'permissions';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['extensionStorePreferencesService'],

    data() {
        return {
            view: 'checkout' as ModalView,
            tocAccepted: false,
            permissionsAccepted: false,
            installAfterPurchase: true
        };
    },

    computed: {
        isOpen() {
            return extensionStorePurchaseConfirmationStore().isOpen;
        },

        isLoading() {
            return extensionStorePurchaseConfirmationStore().isLoading;
        },

        cart() {
            return extensionStorePurchaseConfirmationStore().cartData;
        },

        paymentMeans() {
            return extensionStorePurchaseConfirmationStore().paymentMeansData;
        },

        installAfterPurchase() {
            return extensionStorePurchaseConfirmationStore().isCompatible
                && this.extensionStorePreferencesService.state.installAfterPurchase;
        }
    },

    watch: {
        isOpen(value: boolean) {
            if (!value) {
                this.resetModal();
            } else {
                this.installAfterPurchase = this.extensionStorePreferencesService.state.installAfterPurchase;
            }
        }
    },

    methods: {
        resetModal() {
            this.view = 'checkout';
            this.tocAccepted = false;
            this.permissionsAccepted = false;
        },

        onModalChange(value: boolean) {
            if (!value) {
                extensionStorePurchaseConfirmationStore().cancel();
            }
        },

        updateInstallAfterPurchase(value: boolean) {
            this.installAfterPurchase = value;
            this.extensionStorePreferencesService.update({ installAfterPurchase: value });
        }
    }
});
