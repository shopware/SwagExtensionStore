import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';

type OnConfirmCallback = () => Promise<{ result: boolean; title?: string; description?: string }>;
type OnCancelCallback = () => void;

type PurchaseConfirmationState = {
    isFailedOnBasketCreation: boolean;
    isOpen: boolean;
    isLoading: boolean;
    isSubmitted: boolean;
    isSuccessful: boolean;
    cartData: ExtensionStoreBasket | null;
    paymentMeansData: ExtensionStorePaymentMean[] | null;
    onConfirm: OnConfirmCallback | null;
    onCancel: OnCancelCallback | null;
    errorTitle: string | null;
    errorDescription: string | null;
    errorDocumentationLink: string | null;
};

export default Shopware.Store.register('extensionStorePurchaseConfirmationStore', {
    state: (): PurchaseConfirmationState => ({
        isFailedOnBasketCreation: false,
        isOpen: false,
        isLoading: false,
        isSubmitted: false,
        isSuccessful: false,
        cartData: null,
        paymentMeansData: null,
        onConfirm: null,
        onCancel: null,
        errorTitle: null,
        errorDescription: null,
        errorDocumentationLink: null
    }),
    actions: {
        openModal(
            cartResponse: ExtensionStoreBasket,
            paymentMeansResponse: ExtensionStorePaymentMean[],
            onConfirm: OnConfirmCallback,
            onCancel: OnCancelCallback
        ): void {
            this.cartData = cartResponse;
            this.paymentMeansData = paymentMeansResponse;
            this.onConfirm = onConfirm;
            this.onCancel = onCancel;
            this.isOpen = true;
        },

        async confirm(): Promise<void> {
            if (!this.onConfirm) {
                return;
            }

            this.isSubmitted = true;
            this.isLoading = true;

            const response = await this.onConfirm();

            this.isSuccessful = response.result ?? false;

            if (response.result) {
                this.onCancel = null;
                this.onConfirm = null;
            } else {
                this.errorTitle = response.title ?? null;
                this.errorDescription = response.description ?? null;
            }

            this.isLoading = false;
        },

        cancel(): void {
            if (this.onCancel) {
                this.onCancel();
            }

            this.closeModal();
        },

        closeModal(): void {
            this.isOpen = false;
            this.isLoading = false;
            this.isSubmitted = false;
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

        openErrorModal(errorTitle: string, errorDescription: string, errorDocumentationLink: string, onCancel: OnCancelCallback): void {
            this.onCancel = onCancel;
            this.errorTitle = errorTitle;
            this.errorDescription = errorDescription;
            this.errorDocumentationLink = errorDocumentationLink;
            this.isFailedOnBasketCreation = true;
            this.isOpen = true;
        }
    }
});
