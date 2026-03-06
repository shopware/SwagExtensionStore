import { reactive } from 'vue';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';

type OnConfirmCallback = () => Promise<boolean>;
type OnCancelCallback = () => void;

type PurchaseConfirmationState = {
    isOpen: boolean;
    isLoading: boolean;
    isSubmitted: boolean;
    isSuccessful: boolean;
    cartData: ExtensionStoreBasket | null;
    paymentMeansData: ExtensionStorePaymentMean[] | null;
    onConfirm: OnConfirmCallback | null;
    onCancel: OnCancelCallback | null;
};

const state = reactive<PurchaseConfirmationState>({
    isOpen: false,
    isLoading: false,
    isSubmitted: false,
    isSuccessful: false,
    cartData: null,
    paymentMeansData: null,
    onConfirm: null,
    onCancel: null,
});

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
    },

    async confirm(): Promise<void> {
        if (!state.onConfirm) {
            return;
        }

        state.isSubmitted = true;
        state.isLoading = true;

        const success = await state.onConfirm();

        state.isSuccessful = success ?? false;

        if (success) {
            state.onCancel = null;
            state.onConfirm = null;
        }

        state.isLoading = false;
    },

    cancel(): void {
        if (state.onCancel) {
            state.onCancel();
        }
        this.closeModal();
    },

    closeModal(): void {
        state.isOpen = false;
        state.isLoading = false;
        state.isSubmitted = false;
        state.isSuccessful = false;
        state.cartData = null;
        state.paymentMeansData = null;
        state.onConfirm = null;
        state.onCancel = null;
    },
};
