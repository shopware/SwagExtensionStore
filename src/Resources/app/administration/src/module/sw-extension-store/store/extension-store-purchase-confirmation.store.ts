import { reactive } from 'vue';
import type { ExtensionStoreBasket, ExtensionStoreBasketPosition, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import { trackExtensionStoreEvent } from '../util/extension-store-tracking';

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

const trackExtensionStorePurchaseEvent = (eventName: string) => {
    const position = state.cartData?.positions[0] as ExtensionStoreBasketPosition;
    const extension = position?.extension;

    trackExtensionStoreEvent(`purchase_${eventName}`, {
        extension_id: extension?.id ?? null,
        extension_name: extension?.name ?? null,
        net_price: position?.netPrice ?? null,
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

        state.isSubmitted = true;
        state.isLoading = true;

        const success = await state.onConfirm();

        state.isSuccessful = success ?? false;

        if (success) {
            state.onCancel = null;
            state.onConfirm = null;

            trackExtensionStorePurchaseEvent('successful');
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
        state.cartData = null;
        state.paymentMeansData = null;
        state.onConfirm = null;
        state.onCancel = null;
    },
};
