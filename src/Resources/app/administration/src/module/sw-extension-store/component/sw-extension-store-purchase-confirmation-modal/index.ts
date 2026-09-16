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

        // Drives the billing and payment details, which a demo shop never shows for any booking.
        isDemoShop() {
            return this.cart?.bookingShop?.kind === 'demo';
        },

        isFreeExtension() {
            return this.cart?.positions?.[0]?.variant?.name === 'free';
        },

        // Drives the wording and the pricing. A demo shop books a free extension as a regular free
        // order, so only paid extensions become a test license.
        isTestLicense() {
            return this.isDemoShop && !this.isFreeExtension;
        },

        installAfterPurchase() {
            return extensionStorePurchaseConfirmationStore().isCompatible && this.extensionStorePreferencesService.state.installAfterPurchase;
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
            this.tocAccepted = false;
            this.permissionsAccepted = false;
        },

        onModalChange(value: boolean) {
            if (!value) {
                extensionStorePurchaseConfirmationStore().cancel();
            }
        },

        updateInstallAfterPurchase(value: boolean) {
            this.extensionStorePreferencesService.update({ installAfterPurchase: value });
        },
    },
});
