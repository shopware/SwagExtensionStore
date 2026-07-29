import { flushPromises } from '@vue/test-utils';
import extensionStorePurchaseConfirmationStore, {
    type PurchaseConfirmationOnConfirmCallbackResult,
} from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store';
import { pageReload } from 'SwagExtensionStore/util/page-reload';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';
import type { ExtensionStoreBasket } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-basket.types';

jest.mock('SwagExtensionStore/util/telemetry', () => ({
    trackExtensionStoreEvent: jest.fn(() => Promise.resolve()),
}));

const trackMock = trackExtensionStoreEvent as jest.MockedFunction<typeof trackExtensionStoreEvent>;

const cart = {
    positions: [
        {
            extension: {
                id: 'extension-id',
                name: 'SwagApp',
            },
            netPrice: 19.99,
            taxRate: 19,
            firstMonthFree: false,
            discountAppliesForMonths: null,
            pseudoPrice: 19.99,
        },
    ],
} as unknown as ExtensionStoreBasket;

const openModalWith = (result: PurchaseConfirmationOnConfirmCallbackResult | Promise<PurchaseConfirmationOnConfirmCallbackResult>) => {
    extensionStorePurchaseConfirmationStore().openModal({
        cart,
        paymentMeans: [],
        isCompatible: true,
        onConfirm: () => Promise.resolve(result),
        onCancel: jest.fn(),
    });
};

describe('SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store', () => {
    let reloadAfterSpy: jest.SpyInstance;

    beforeEach(() => {
        extensionStorePurchaseConfirmationStore().$reset();
        trackMock.mockClear();
        trackMock.mockImplementation(() => Promise.resolve());
        reloadAfterSpy = jest.spyOn(pageReload, 'reloadAfter').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('confirm with a required reload', () => {
        it('should show the reload hint and keep loading until the page is reloaded', async () => {
            openModalWith({ success: true, requiresReload: true });

            await extensionStorePurchaseConfirmationStore().confirm();

            const store = extensionStorePurchaseConfirmationStore();
            expect(store.isLoading).toBe(true);
            expect(store.isSuccessful).toBe(true);
            expect(reloadAfterSpy).toHaveBeenCalledWith(1_500);
        });

        it('should track the successful purchase before reloading the page', async () => {
            let dispatchTracking = (): void => {};
            trackMock.mockImplementation(() => new Promise((resolve) => {
                dispatchTracking = () => resolve();
            }));

            openModalWith({ success: true, requiresReload: true });

            const confirmed = extensionStorePurchaseConfirmationStore().confirm();
            await flushPromises();

            // The tracking event has been handed over, but did not reach the gateway yet.
            expect(trackMock).toHaveBeenCalledWith('extension_purchase_successful', expect.objectContaining({
                extension_id: 'extension-id',
                extension_name: 'SwagApp',
            }));
            expect(reloadAfterSpy).not.toHaveBeenCalled();

            dispatchTracking();
            await confirmed;

            expect(reloadAfterSpy).toHaveBeenCalledTimes(1);
        });

    });

    describe('confirm without a required reload', () => {
        it('should finish loading and not reload the page when no extension was installed', async () => {
            openModalWith({ success: true, requiresReload: false });

            await extensionStorePurchaseConfirmationStore().confirm();

            const store = extensionStorePurchaseConfirmationStore();
            expect(store.isLoading).toBe(false);
            expect(store.isSuccessful).toBe(true);
            expect(store.checkoutStep).toBeNull();
            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });

        it('should not reload the page when the result does not request it', async () => {
            openModalWith({ success: true });

            await extensionStorePurchaseConfirmationStore().confirm();

            expect(extensionStorePurchaseConfirmationStore().isLoading).toBe(false);
            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });

        it('should not reload the page when the purchase failed', async () => {
            openModalWith({
                success: false,
                requiresReload: true,
                title: 'error-title',
                description: 'error-description',
                documentationLink: 'error-link',
            });

            await extensionStorePurchaseConfirmationStore().confirm();

            const store = extensionStorePurchaseConfirmationStore();
            expect(store.isLoading).toBe(false);
            expect(store.isSuccessful).toBe(false);
            expect(store.errorTitle).toBe('error-title');
            expect(store.errorDescription).toBe('error-description');
            expect(store.errorDocumentationLink).toBe('error-link');
            expect(trackMock).toHaveBeenCalledWith('extension_purchase_failed', expect.any(Object));
            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });
    });
});
