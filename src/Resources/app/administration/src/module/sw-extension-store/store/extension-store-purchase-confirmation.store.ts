import { pageReload } from 'SwagExtensionStore/util/page-reload';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';

export type PurchaseConfirmationCheckoutStep = 'order' | 'update' | 'install' | 'reload';

export type PurchaseConfirmationOnConfirmCallbackResult = {
    success: boolean;
    requiresReload?: boolean;
    title?: string;
    description?: string;
    documentationLink?: string;
};
export type PurchaseConfirmationOnConfirmCallback = () => Promise<PurchaseConfirmationOnConfirmCallbackResult>;
export type PurchaseConfirmationOnCancelCallback = () => void;

export type PurchaseConfirmationModalData = {
    cart: ExtensionStoreBasket;
    paymentMeans: ExtensionStorePaymentMean[];
    isCompatible: boolean;
    onConfirm: PurchaseConfirmationOnConfirmCallback;
    onCancel: PurchaseConfirmationOnCancelCallback;
};

type PurchaseConfirmationState = {
    /**
     * Increases with every opened modal. A purchase that outlived its modal uses it to tell whether
     * the modal currently on screen is still its own.
     */
    purchaseId: number;
    isFailedOnBasketCreation: boolean;
    isOpen: boolean;
    isLoading: boolean;
    isSubmitted: boolean;
    checkoutStep: PurchaseConfirmationCheckoutStep | null;
    isSuccessful: boolean;
    cartData: ExtensionStoreBasket | null;
    paymentMeansData: ExtensionStorePaymentMean[] | null;
    isCompatible: boolean;
    onConfirm: PurchaseConfirmationOnConfirmCallback | null;
    onCancel: PurchaseConfirmationOnCancelCallback | null;
    errorTitle: string | null;
    errorDescription: string | null;
    errorDocumentationLink: string | null;
};

/**
 * The extension is installed at this point, but the running administration does not know about it
 * yet. Reloading unprompted would be unexpected while the modal is closed, so the reload is offered
 * to the user instead.
 */
const notifyReloadRequired = (cartData: ExtensionStoreBasket | null): void => {
    const [position] = cartData?.positions ?? [];
    if (!position) {
        return;
    }

    const snippetService = Shopware.Snippet as unknown as {
        tc: (key: string, params?: Record<string, string>) => string;
    };

    Shopware.State.commit('notification/createNotification', {
        variant: 'info',
        growl: true,
        autoClose: false,
        title: snippetService.tc('sw-extension-store.installation.reloadRequiredTitle'),
        message: snippetService.tc('sw-extension-store.installation.reloadRequiredMessage', {
            name: String(position.extension.name)
        }),
        actions: [
            {
                label: snippetService.tc('sw-extension-store.installation.reloadRequiredAction'),
                method: () => pageReload.reload()
            }
        ]
    });
};

/**
 * Duration the 'reload' hint is shown before the page is reloaded.
 */
const RELOAD_DELAY_MS = 1_500;

export default Shopware.Store.register({
    id: 'extensionStorePurchaseConfirmationStore',
    state: (): PurchaseConfirmationState => ({
        purchaseId: 0,
        isFailedOnBasketCreation: false,
        isOpen: false,
        isLoading: false,
        isSubmitted: false,
        checkoutStep: null,
        isSuccessful: false,
        cartData: null,
        paymentMeansData: null,
        isCompatible: false,
        onConfirm: null,
        onCancel: null,
        errorTitle: null,
        errorDescription: null,
        errorDocumentationLink: null
    }),

    actions: {
        openModal(data: PurchaseConfirmationModalData): void {
            // A previous purchase might still be running detached from its closed modal and write to
            // the state after it finished. Start from a clean state, so nothing leaks into this modal.
            this.closeModal();

            this.purchaseId += 1;
            this.cartData = data.cart;
            this.paymentMeansData = data.paymentMeans;
            this.isCompatible = data.isCompatible;
            this.onConfirm = data.onConfirm;
            this.onCancel = data.onCancel;
            this.isOpen = true;
        },

        async confirm(): Promise<void> {
            if (!this.onConfirm) {
                return;
            }

            // The modal can be closed while the purchase is running, which resets `cartData`.
            const cartData = this.cartData;
            const purchaseId = this.purchaseId;

            this.isSubmitted = true;
            this.isLoading = true;

            const result = await this.onConfirm().catch((): PurchaseConfirmationOnConfirmCallbackResult => ({
                success: false
            }));

            this.isSuccessful = result.success;
            if (this.isSuccessful) {
                this.onCancel = null;
                this.onConfirm = null;
            } else {
                this.errorTitle = result.title ?? null;
                this.errorDescription = result.description ?? null;
                this.errorDocumentationLink = result.documentationLink ?? null;
            }

            if (this.isSuccessful && result.requiresReload) {
                // Only reload on our own while the modal still shows this purchase. If it was closed,
                // the user might have navigated away or even started another purchase in the meantime,
                // where a reload would be unexpected.
                if (this.isOpen && this.purchaseId === purchaseId) {
                    await pageReload.reloadAfter(RELOAD_DELAY_MS);

                    return;
                }

                notifyReloadRequired(cartData);
            }

            this.isLoading = false;
        },

        cancel(): void {
            // A submitted purchase cannot be aborted, so closing the modal must neither report a failure
            // nor track a cancellation. The purchase itself publishes the real result once it finished.
            if (!this.isSubmitted) {
                if (this.onCancel) {
                    this.onCancel();
                }
            }

            this.closeModal();
        },

        closeModal(): void {
            this.isOpen = false;
            this.isLoading = false;
            this.isSubmitted = false;
            this.checkoutStep = null;
            this.isSuccessful = false;
            this.isFailedOnBasketCreation = false;
            this.cartData = null;
            this.paymentMeansData = null;
            this.onConfirm = null;
            this.onCancel = null;
            this.errorTitle = null;
            this.errorDescription = null;
            this.errorDocumentationLink = null;
        },

        openErrorModal(
            errorTitle: string,
            errorDescription: string,
            errorDocumentationLink: string,
            onCancel: PurchaseConfirmationOnCancelCallback
        ): void {
            this.closeModal();

            this.onCancel = onCancel;
            this.errorTitle = errorTitle;
            this.errorDescription = errorDescription;
            this.errorDocumentationLink = errorDocumentationLink;
            this.isFailedOnBasketCreation = true;
            this.isOpen = true;
        }
    }
});
