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

/** Opens the modal with a purchase that only finishes once the returned `finishPurchase` is called. */
const openModalWithPendingPurchase = (result: PurchaseConfirmationOnConfirmCallbackResult) => {
    let finishPurchase = (): void => {};
    const onCancel = jest.fn();

    extensionStorePurchaseConfirmationStore().openModal({
        cart,
        paymentMeans: [],
        isCompatible: true,
        onConfirm: () => new Promise((resolve) => {
            finishPurchase = () => resolve(result);
        }),
        onCancel,
    });

    return {
        onCancel,
        finishPurchase: () => finishPurchase(),
    };
};

describe('SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store', () => {
    let reloadAfterSpy: jest.SpyInstance;
    let reloadSpy: jest.SpyInstance;
    let createNotificationSpy: jest.SpyInstance;

    beforeEach(() => {
        extensionStorePurchaseConfirmationStore().$reset();
        trackMock.mockClear();
        trackMock.mockImplementation(() => Promise.resolve());
        reloadAfterSpy = jest.spyOn(pageReload, 'reloadAfter').mockResolvedValue();
        reloadSpy = jest.spyOn(pageReload, 'reload').mockImplementation(() => {});
        createNotificationSpy = jest.spyOn(Shopware.Store.get('notification'), 'createNotification')
            .mockImplementation(() => null);
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

        it('should not reload the page when the modal was closed while the purchase was in progress', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            await flushPromises();

            // The user closes the modal and possibly navigates away while the purchase is still running.
            store.closeModal();
            finishPurchase();
            await confirmed;

            expect(store.isOpen).toBe(false);
            expect(store.isLoading).toBe(false);
            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });

        it('should offer the reload when the modal was closed while the extension was installed', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            await flushPromises();

            store.closeModal();
            finishPurchase();
            await confirmed;

            expect(createNotificationSpy).toHaveBeenCalledTimes(1);
            expect(createNotificationSpy).toHaveBeenCalledWith(expect.objectContaining({
                variant: 'info',
                growl: true,
                autoClose: false,
            }));

            // The notification offers the reload the store did not perform on its own.
            const notification = createNotificationSpy.mock.calls[0][0] as {
                actions: { method: () => void }[];
            };
            expect(reloadSpy).not.toHaveBeenCalled();

            notification.actions[0].method();

            expect(reloadSpy).toHaveBeenCalledTimes(1);
        });

        it('should not reload the page when another purchase was started in the meantime', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            await flushPromises();

            // The user closes the modal and starts another purchase while the first one is still running.
            store.closeModal();
            openModalWith({ success: true });
            finishPurchase();
            await confirmed;

            expect(store.isOpen).toBe(true);
            expect(reloadAfterSpy).not.toHaveBeenCalled();
            expect(createNotificationSpy).toHaveBeenCalledTimes(1);
        });

        it('should not offer the reload when nothing was installed', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: false });

            const confirmed = store.confirm();
            await flushPromises();

            store.closeModal();
            finishPurchase();
            await confirmed;

            expect(createNotificationSpy).not.toHaveBeenCalled();
        });

        it('should track the purchase result when the modal was closed while the purchase was in progress', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            await flushPromises();

            // `closeModal` resets the cart, the tracked event must still contain the purchased extension.
            store.closeModal();
            finishPurchase();
            await confirmed;

            expect(trackMock).toHaveBeenCalledWith('extension_purchase_successful', expect.objectContaining({
                extension_id: 'extension-id',
                extension_name: 'SwagApp',
            }));
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

        it('should track the failed purchase when the modal was closed while the purchase was in progress', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: false });

            const confirmed = store.confirm();
            await flushPromises();

            store.closeModal();
            finishPurchase();
            await confirmed;

            expect(trackMock).toHaveBeenCalledWith('extension_purchase_failed', expect.objectContaining({
                extension_id: 'extension-id',
            }));
            expect(createNotificationSpy).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should report the cancellation when the purchase was not confirmed yet', () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { onCancel } = openModalWithPendingPurchase({ success: true });

            store.cancel();

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(trackMock).toHaveBeenCalledWith('extension_purchase_cancelled', expect.any(Object));
            expect(store.isOpen).toBe(false);
        });

        it('should not report a cancellation while the purchase is still running', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { onCancel, finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            await flushPromises();

            // A running purchase cannot be aborted, so it must not be reported as cancelled either.
            store.cancel();

            expect(onCancel).not.toHaveBeenCalled();
            expect(trackMock).not.toHaveBeenCalledWith('extension_purchase_cancelled', expect.anything());
            expect(store.isOpen).toBe(false);

            finishPurchase();
            await confirmed;
        });

        it('should not report a cancellation when closing the result of a failed purchase', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { onCancel, finishPurchase } = openModalWithPendingPurchase({ success: false });

            const confirmed = store.confirm();
            await flushPromises();
            finishPurchase();
            await confirmed;

            // The purchase already reported its failure, closing the result must not report it again.
            store.cancel();

            expect(onCancel).not.toHaveBeenCalled();
            expect(trackMock).not.toHaveBeenCalledWith('extension_purchase_cancelled', expect.anything());
        });

        it('should report the cancellation of a failed basket creation', () => {
            const store = extensionStorePurchaseConfirmationStore();
            const onCancel = jest.fn();

            store.openErrorModal('error-title', 'error-description', 'error-link', onCancel);
            store.cancel();

            expect(store.isFailedOnBasketCreation).toBe(false);
            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('openModal', () => {
        it('should reset the state of a previous purchase', () => {
            const store = extensionStorePurchaseConfirmationStore();

            store.isSubmitted = true;
            store.isSuccessful = true;
            store.checkoutStep = 'reload';
            store.errorTitle = 'previous-error';
            store.isFailedOnBasketCreation = true;

            openModalWith({ success: true });

            expect(store.isOpen).toBe(true);
            expect(store.isSubmitted).toBe(false);
            expect(store.isSuccessful).toBe(false);
            expect(store.checkoutStep).toBeNull();
            expect(store.errorTitle).toBeNull();
            expect(store.isFailedOnBasketCreation).toBe(false);
        });
    });
});
