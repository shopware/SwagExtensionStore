import { reactive } from 'vue';
import type { ExtensionStoreBasket } from '../types/extension-store-basket.types';

type OnConfirmCallback = () => Promise<void>;
type OnCancelCallback = () => void;

type PurchaseConfirmationState = {
    isOpen: boolean;
    isLoading: boolean;
    cartData: ExtensionStoreBasket | null;
    onConfirm: OnConfirmCallback | null;
    onCancel: OnCancelCallback | null;
};

const state = reactive<PurchaseConfirmationState>({
    isOpen: false,
    isLoading: false,
    cartData: null,
    onConfirm: null,
    onCancel: null,
});

export const purchaseConfirmationStore = {
    get state() {
        return state;
    },

    openModal(
        cartResponse: ExtensionStoreBasket,
        onConfirm: OnConfirmCallback,
        onCancel: OnCancelCallback,
    ): void {
        state.cartData = cartResponse;
        state.onConfirm = onConfirm;
        state.onCancel = onCancel;
        state.isOpen = true;
    },

    async confirm(): Promise<void> {
        if (!state.onConfirm) {
            return;
        }

        state.isLoading = true;

        try {
            await state.onConfirm();
        } finally {
            this.closeModal();
        }
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
        state.cartData = null;
        state.onConfirm = null;
        state.onCancel = null;
    },
};
