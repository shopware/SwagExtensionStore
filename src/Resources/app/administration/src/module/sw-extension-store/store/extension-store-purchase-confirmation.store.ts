import { reactive } from 'vue';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import { trackExtensionStoreEvent } from "SwagExtensionStore/util/telemetry";

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

const state = reactive<PurchaseConfirmationState>({
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
    errorDocumentationLink: null,
});

const trackExtensionStorePurchaseEvent = (
    name: 'initiated' | 'confirmed' | 'successful' | 'failed' | 'cancelled',
): void => {
    const [position] = state.cartData?.positions ?? [];
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

export const purchaseConfirmationStore = {
    get state() {
        return state;
    },

    openModal(
        cartResponse: ExtensionStoreBasket,
        paymentMeansResponse: ExtensionStorePaymentMean[],
        onConfirm: OnConfirmCallback,
        onCancel: OnCancelCallback,
    ): void {
        state.cartData = cartResponse;
        state.paymentMeansData = paymentMeansResponse;
        state.onConfirm = onConfirm;
        state.onCancel = onCancel;
        state.isOpen = true;

        trackExtensionStorePurchaseEvent('initiated');
    },

    async confirm(): Promise<void> {
        if (!state.onConfirm) {
            return;
        }

        trackExtensionStorePurchaseEvent('confirmed');

        state.isSubmitted = true;
        state.isLoading = true;

        const response = await state.onConfirm();

        state.isSuccessful = response.result ?? false;

        if (response.result) {
            state.onCancel = null;
            state.onConfirm = null;

            trackExtensionStorePurchaseEvent('successful');
        } else {
            state.errorTitle = response.title;
            state.errorDescription = response.description;
            trackExtensionStorePurchaseEvent('failed');
        }

        state.isLoading = false;
    },

    cancel(): void {
        if (state.onCancel) {
            state.onCancel();
        }

        if (!state.isSuccessful) {
            trackExtensionStorePurchaseEvent('cancelled');
        }

        this.closeModal();
    },

    closeModal(): void {
        state.isOpen = false;
        state.isLoading = false;
        state.isSubmitted = false;
        state.isSuccessful = false;
        state.isFailedOnBasketCreation =false;
        state.cartData = null;
        state.paymentMeansData = null;
        state.onConfirm = null;
        state.onCancel = null;
        state.errorTitle = null;
        state.errorDescription = null;
        state.errorDocumentationLink = null;
    },

    openErrorModal(errorTitle: string, errorDescription: string, errorDocumentationLink: string, onCancel: OnCancelCallback): void {
        state.onCancel = onCancel;
        state.errorTitle = errorTitle;
        state.errorDescription = errorDescription;
        state.errorDocumentationLink = errorDocumentationLink;
        state.isFailedOnBasketCreation = true;
        state.isOpen = true;
    },
};
