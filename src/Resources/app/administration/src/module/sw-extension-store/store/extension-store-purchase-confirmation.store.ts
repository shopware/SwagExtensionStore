import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';

export type PurchaseConfirmationCheckoutStep = 'order' | 'update' | 'install';

export type PurchaseConfirmationOnConfirmCallbackResult = {
    success: boolean;
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

export default Shopware.Store.register({
    id: 'extensionStorePurchaseConfirmationStore',
    state: (): PurchaseConfirmationState => ({
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
        errorDocumentationLink: null,
    }),

    actions: {
        openModal(data: PurchaseConfirmationModalData): void {
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

            this.isSubmitted = true;
            this.isLoading = true;

            const result = await this.onConfirm().catch((): PurchaseConfirmationOnConfirmCallbackResult => ({
                success: false,
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
            this.checkoutStep = null;
            this.isSuccessful = false;
            this.isFailedOnBasketCreation =false;
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
            onCancel: PurchaseConfirmationOnCancelCallback,
        ): void {
            this.onCancel = onCancel;
            this.errorTitle = errorTitle;
            this.errorDescription = errorDescription;
            this.errorDocumentationLink = errorDocumentationLink;
            this.isFailedOnBasketCreation = true;
            this.isOpen = true;
        },
    },
});
