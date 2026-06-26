import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';

export type PurchaseConfirmationOnConfirmCallback = () => Promise<{ result: boolean; title?: string; description?: string }>;
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

const trackExtensionStorePurchaseEvent = (
    cartData: ExtensionStoreBasket | null,
    name: 'initiated' | 'confirmed' | 'successful' | 'failed' | 'cancelled',
): void => {
    const [position] = cartData?.positions ?? [];
    if (!position) {
        return;
    }

    trackExtensionStoreEvent(`extension_purchase_${name}`, {
        extension_id: position.extension.id,
        extension_name: position.extension.name,
        net_price: position.netPrice,
        tax_rate: position.taxRate,
        is_first_month_free: position.firstMonthFree,
        discount_applies_for_months: position.discountAppliesForMonths,
        pseudo_price: position.pseudoPrice,
    });
};

export default Shopware.Store.register('extensionStorePurchaseConfirmation', {
    state: (): PurchaseConfirmationState => ({
        isFailedOnBasketCreation: false,
        isOpen: false,
        isLoading: false,
        isSubmitted: false,
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

            trackExtensionStorePurchaseEvent(this.cartData, 'initiated');
        },

        async confirm(): Promise<void> {
            if (!this.onConfirm) {
                return;
            }

            trackExtensionStorePurchaseEvent(this.cartData, 'confirmed');

            this.isSubmitted = true;
            this.isLoading = true;

            const response = await this.onConfirm();

            this.isSuccessful = response.result ?? false;

            if (response.result) {
                this.onCancel = null;
                this.onConfirm = null;

                trackExtensionStorePurchaseEvent(this.cartData, 'successful');
            } else {
                this.errorTitle = response.title ?? null;
                this.errorDescription = response.description ?? null;
                trackExtensionStorePurchaseEvent(this.cartData, 'failed');
            }

            this.isLoading = false;
        },

        cancel(): void {
            if (this.onCancel) {
                this.onCancel();
            }

            if (!this.isSuccessful) {
                trackExtensionStorePurchaseEvent(this.cartData, 'cancelled');
            }

            this.closeModal();
        },

        closeModal(): void {
            this.isOpen = false;
            this.isLoading = false;
            this.isSubmitted = false;
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

        openErrorModal(errorTitle: string, errorDescription: string, errorDocumentationLink: string, onCancel: PurchaseConfirmationOnCancelCallback): void {
            this.onCancel = onCancel;
            this.errorTitle = errorTitle;
            this.errorDescription = errorDescription;
            this.errorDocumentationLink = errorDocumentationLink;
            this.isFailedOnBasketCreation = true;
            this.isOpen = true;
        },
    },
});
