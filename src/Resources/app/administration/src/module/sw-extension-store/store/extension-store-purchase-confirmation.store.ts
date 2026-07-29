import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';
import { pageReload } from 'SwagExtensionStore/util/page-reload';

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

const trackExtensionStorePurchaseEvent = (
    cartData: ExtensionStoreBasket | null,
    name: 'initiated' | 'confirmed' | 'successful' | 'failed' | 'cancelled',
): Promise<void> => {
    const [position] = cartData?.positions ?? [];
    if (!position) {
        return Promise.resolve();
    }

    return trackExtensionStoreEvent(`extension_purchase_${name}`, {
        extension_id: position.extension.id,
        extension_name: position.extension.name,
        net_price: position.netPrice,
        tax_rate: position.taxRate,
        is_first_month_free: position.firstMonthFree,
        discount_applies_for_months: position.discountAppliesForMonths,
        pseudo_price: position.pseudoPrice,
    });
};

/**
 * Duration the 'reload' hint is shown before the page is reloaded. Must stay above the
 * telemetry gateway's flush interval (1s), so the tracked purchase events are sent out
 * before the page is torn down.
 */
const RELOAD_DELAY_MS = 1_500;

export default Shopware.Store.register('extensionStorePurchaseConfirmation', {
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

            void trackExtensionStorePurchaseEvent(this.cartData, 'initiated');
        },

        async confirm(): Promise<void> {
            if (!this.onConfirm) {
                return;
            }

            void trackExtensionStorePurchaseEvent(this.cartData, 'confirmed');

            this.isSubmitted = true;
            this.isLoading = true;

            const result = await this.onConfirm().catch((): PurchaseConfirmationOnConfirmCallbackResult => ({
                success: false,
            }));

            this.isSuccessful = result.success;
            let trackingDispatched: Promise<void>;
            if (this.isSuccessful) {
                this.onCancel = null;
                this.onConfirm = null;
                trackingDispatched = trackExtensionStorePurchaseEvent(this.cartData, 'successful');
            } else {
                this.errorTitle = result.title ?? null;
                this.errorDescription = result.description ?? null;
                this.errorDocumentationLink = result.documentationLink ?? null;
                trackingDispatched = trackExtensionStorePurchaseEvent(this.cartData, 'failed');
            }

            if (this.isSuccessful && result.requiresReload) {
                // Ensure the tracking event is sent before the page is reloaded, otherwise it will be lost.
                await trackingDispatched;
                await pageReload.reloadAfter(RELOAD_DELAY_MS);

                return;
            }

            this.isLoading = false;
        },

        cancel(): void {
            if (this.onCancel) {
                this.onCancel();
            }

            if (!this.isSuccessful) {
                void trackExtensionStorePurchaseEvent(this.cartData, 'cancelled');
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
