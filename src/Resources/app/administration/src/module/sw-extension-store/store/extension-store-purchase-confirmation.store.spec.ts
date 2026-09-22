import extensionStorePurchaseConfirmationStore, {
    type PurchaseConfirmationOnConfirmCallbackResult
} from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store';
import { pageReload } from 'SwagExtensionStore/util/page-reload';
import type { ExtensionStoreBasket } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-basket.types';

const cart = {
    positions: [
        {
            extension: {
                id: 'extension-id',
                name: 'SwagApp'
            }
        }
    ]
} as ExtensionStoreBasket;

const openModalWith = (result: PurchaseConfirmationOnConfirmCallbackResult) => {
    extensionStorePurchaseConfirmationStore().openModal({
        cart,
        paymentMeans: [],
        isCompatible: true,
        onConfirm: () => Promise.resolve(result),
        onCancel: () => {}
    });
};

const openModalWithPendingPurchase = (result: PurchaseConfirmationOnConfirmCallbackResult) => {
    const onCancel = jest.fn();
    let finishPurchase = (): void => {};

    const purchase = new Promise<PurchaseConfirmationOnConfirmCallbackResult>((resolve) => {
        finishPurchase = () => resolve(result);
    });

    extensionStorePurchaseConfirmationStore().openModal({
        cart,
        paymentMeans: [],
        isCompatible: true,
        onConfirm: () => purchase,
        onCancel
    });

    return { onCancel, finishPurchase };
};

describe('SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store', () => {
    let reloadAfterSpy: jest.SpyInstance;
    let reloadSpy: jest.SpyInstance;
    let createNotificationSpy: jest.Mock;
    let originalCommit: typeof Shopware.State.commit;

    beforeEach(() => {
        extensionStorePurchaseConfirmationStore().$reset();
        reloadAfterSpy = jest.spyOn(pageReload, 'reloadAfter').mockResolvedValue();
        reloadSpy = jest.spyOn(pageReload, 'reload').mockImplementation(() => {});
        jest.spyOn(Shopware, 'Snippet', 'get').mockReturnValue({
            tc: (key: string, params?: Record<string, string>) => `${key}:${JSON.stringify(params ?? {})}`
        } as never);
        originalCommit = Shopware.State.commit;
        createNotificationSpy = jest.fn();
        Object.defineProperty(Shopware.State, 'commit', {
            value: createNotificationSpy,
            configurable: true,
            writable: true
        });
    });

    afterEach(() => {
        Object.defineProperty(Shopware.State, 'commit', {
            value: originalCommit,
            configurable: true,
            writable: true
        });
        jest.restoreAllMocks();
    });

    describe('confirm with a required reload', () => {
        it('should reload the page after a short delay to display the success step', async () => {
            openModalWith({ success: true, requiresReload: true });

            await extensionStorePurchaseConfirmationStore().confirm();

            expect(reloadAfterSpy).toHaveBeenCalledWith(1_500);
        });
    });

    describe('confirm without a required reload', () => {
        it('should not reload the page', async () => {
            openModalWith({ success: true });

            await extensionStorePurchaseConfirmationStore().confirm();

            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });
    });

    describe('confirm when the modal was closed during the purchase', () => {
        it('should notify the user instead of reloading immediately', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            store.cancel();

            expect(store.isOpen).toBe(false);

            finishPurchase();
            await confirmed;

            expect(reloadAfterSpy).not.toHaveBeenCalled();
            expect(createNotificationSpy).toHaveBeenCalledWith('notification/createNotification', expect.objectContaining({
                variant: 'info',
                title: 'sw-extension-store.installation.reloadRequiredTitle:{}',
                message: 'sw-extension-store.installation.reloadRequiredMessage:{"name":"SwagApp"}',
                actions: [
                    expect.objectContaining({
                        label: 'sw-extension-store.installation.reloadRequiredAction:{}'
                    })
                ]
            }));
        });

        it('should reload the page when clicking the notification action', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const confirmed = store.confirm();
            store.cancel();
            finishPurchase();
            await confirmed;

            const calls = createNotificationSpy.mock.calls as Array<[string, { actions: Array<{ method: () => void }> }]>;
            const notificationPayload = calls[0][1];
            notificationPayload.actions[0].method();

            expect(reloadSpy).toHaveBeenCalledTimes(1);
        });

        it('should not notify the user when the purchase was not successful', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: false, requiresReload: true });

            const confirmed = store.confirm();
            store.cancel();
            finishPurchase();
            await confirmed;

            expect(reloadAfterSpy).not.toHaveBeenCalled();
            expect(createNotificationSpy).not.toHaveBeenCalled();
        });

        it('should not notify the user when the purchase does not require a reload', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { finishPurchase } = openModalWithPendingPurchase({ success: true, requiresReload: false });

            const confirmed = store.confirm();
            store.cancel();
            finishPurchase();
            await confirmed;

            expect(reloadAfterSpy).not.toHaveBeenCalled();
            expect(createNotificationSpy).not.toHaveBeenCalled();
        });

        it('should not reload the page when another purchase was started in the meantime', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const firstPurchase = openModalWithPendingPurchase({ success: true, requiresReload: true });

            const firstConfirmed = store.confirm();
            store.cancel();

            openModalWith({ success: true });

            firstPurchase.finishPurchase();
            await firstConfirmed;

            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });
    });

    describe('confirm with an error', () => {
        it('should update the error state and not reload the page', async () => {
            openModalWith({
                success: false,
                title: 'error-title',
                description: 'error-description',
                documentationLink: 'error-link'
            });

            const store = extensionStorePurchaseConfirmationStore();
            await store.confirm();

            expect(store.errorTitle).toBe('error-title');
            expect(store.errorDescription).toBe('error-description');
            expect(store.errorDocumentationLink).toBe('error-link');
            expect(reloadAfterSpy).not.toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('should report the cancellation of a pending purchase before it was submitted', () => {
            const store = extensionStorePurchaseConfirmationStore();
            const onCancel = jest.fn();

            store.openModal({
                cart,
                paymentMeans: [],
                isCompatible: true,
                onConfirm: () => Promise.resolve({ success: true }),
                onCancel
            });
            store.cancel();

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should not report a cancellation when closing the modal while submitting', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { onCancel, finishPurchase } = openModalWithPendingPurchase({ success: true });

            const confirmed = store.confirm();

            // A running purchase cannot be aborted, so it must not be reported as cancelled either.
            store.cancel();

            expect(onCancel).not.toHaveBeenCalled();
            expect(store.isOpen).toBe(false);

            finishPurchase();
            await confirmed;
        });

        it('should not report a cancellation when closing the result of a failed purchase', async () => {
            const store = extensionStorePurchaseConfirmationStore();
            const { onCancel, finishPurchase } = openModalWithPendingPurchase({ success: false });

            const confirmed = store.confirm();
            finishPurchase();
            await confirmed;

            // The purchase already reported its failure, closing the result must not report it again.
            store.cancel();

            expect(onCancel).not.toHaveBeenCalled();
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
