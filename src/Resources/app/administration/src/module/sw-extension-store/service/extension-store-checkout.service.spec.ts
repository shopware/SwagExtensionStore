import { flushPromises } from '@vue/test-utils';
import ExtensionStoreCheckoutService from './extension-store-checkout.service';
import extensionStorePurchaseConfirmationStore from '../store/extension-store-purchase-confirmation.store';
import type { ExtensionStoreBasket } from '../types/extension-store-basket.types';

jest.mock('SwagExtensionStore/util/telemetry', () => ({
    trackExtensionStoreEvent: jest.fn(() => Promise.resolve()),
}));

const request = { sourceExtensionName: 'AcmeBaseExtension', extensionId: 'store-uuid', variantId: 'monthly-variant' };
const cart = {
    positions: [{ extension: { id: 1, name: 'OtherExtension', type: 'plugin' } }],
} as unknown as ExtensionStoreBasket;

describe('extensionStoreCheckoutService public API', () => {
    const licenses = {
        newCart: jest.fn(),
        getPaymentMeans: jest.fn(),
        orderCart: jest.fn(),
    };
    const extensions = { checkLogin: jest.fn(), updateExtensionData: jest.fn() };
    const helper = { downloadAndActivateExtension: jest.fn() };
    const acl = { can: jest.fn() };
    let service: ExtensionStoreCheckoutService;

    beforeEach(() => {
        jest.resetAllMocks();
        extensionStorePurchaseConfirmationStore().$reset();
        Shopware.Store.get('shopwareExtensions').userInfo = {} as never;
        licenses.newCart.mockResolvedValue({ data: cart });
        licenses.getPaymentMeans.mockResolvedValue({ data: [] });
        licenses.orderCart.mockResolvedValue(undefined);
        extensions.checkLogin.mockResolvedValue(undefined);
        extensions.updateExtensionData.mockResolvedValue(undefined);
        acl.can.mockReturnValue(true);
        service = new ExtensionStoreCheckoutService(
            { getMyExtensions: jest.fn() } as never,
            extensions as never,
            licenses as never,
            helper as never,
            { clear: jest.fn() } as never,
            { state: { installAfterPurchase: true } } as never,
            acl,
            () => {},
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens checkout without visiting the Store and orders only after confirmation', async () => {
        const result = service.open(request);
        await flushPromises();
        const store = extensionStorePurchaseConfirmationStore();

        expect(extensions.checkLogin).toHaveBeenCalledTimes(1);
        expect(licenses.newCart).toHaveBeenCalledWith('store-uuid', 'monthly-variant', 'AcmeBaseExtension');
        expect(store.isOpen).toBe(true);
        expect(store.cartData).toEqual(cart);
        expect(store.isCompatible).toBeNull();
        expect(licenses.orderCart).not.toHaveBeenCalled();

        await store.confirm();

        await expect(result).resolves.toEqual({ status: 'purchased', installed: false, extensionVersion: null });
        expect(licenses.orderCart).toHaveBeenCalledTimes(1);
        expect(extensions.updateExtensionData).toHaveBeenCalledTimes(1);
        expect(helper.downloadAndActivateExtension).not.toHaveBeenCalled();
    });

    it('returns cancellation and releases the checkout for another request', async () => {
        const result = service.open(request);
        await flushPromises();
        extensionStorePurchaseConfirmationStore().cancel();
        await expect(result).resolves.toEqual({ status: 'cancelled' });
        expect(licenses.orderCart).not.toHaveBeenCalled();

        const next = service.open(request);
        await flushPromises();
        expect(extensionStorePurchaseConfirmationStore().isOpen).toBe(true);
        extensionStorePurchaseConfirmationStore().cancel();
        await expect(next).resolves.toEqual({ status: 'cancelled' });
    });

    it('rejects concurrent requests while preparing the cart and showing the modal', async () => {
        const first = service.open(request);
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'busy' });
        await flushPromises();
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'busy' });
        expect(licenses.newCart).toHaveBeenCalledTimes(1);
        extensionStorePurchaseConfirmationStore().cancel();
        await first;
    });

    it('keeps the purchase running when its modal is closed during the order', async () => {
        let finishOrder = (): void => {};
        licenses.orderCart.mockReturnValue(new Promise<void>((resolve) => {
            finishOrder = resolve;
        }));
        const result = service.open(request);
        await flushPromises();
        const store = extensionStorePurchaseConfirmationStore();
        const confirmed = store.confirm();
        store.cancel();

        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'busy' });
        finishOrder();
        await confirmed;
        await expect(result).resolves.toEqual({ status: 'purchased', installed: false, extensionVersion: null });
        expect(store.isOpen).toBe(false);
        expect(store.isSuccessful).toBe(false);
    });

    it('returns a failure and shows the backend error when cart creation fails', async () => {
        licenses.newCart.mockRejectedValue({
            response: { data: { errors: [{ title: 'Unavailable', description: 'Variant is unavailable' }] } },
        });
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'checkout_failed' });
        const store = extensionStorePurchaseConfirmationStore();
        expect(store.isFailedOnBasketCreation).toBe(true);
        expect(store.errorTitle).toBe('Unavailable');
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'busy' });
        store.cancel();
        expect(licenses.orderCart).not.toHaveBeenCalled();
    });

    it('reports a rejected order without installing anything', async () => {
        licenses.orderCart.mockRejectedValue({ response: { data: { errors: [{
            title: 'Order rejected', description: 'The backend rejected this order.',
        }] } } });
        const result = service.open(request);
        await flushPromises();
        await extensionStorePurchaseConfirmationStore().confirm();
        await expect(result).resolves.toEqual({ status: 'failed', code: 'checkout_failed' });
        expect(extensionStorePurchaseConfirmationStore().errorTitle).toBe('Order rejected');
        expect(extensionStorePurchaseConfirmationStore().errorDescription).toBe('The backend rejected this order.');
        expect(extensions.updateExtensionData).not.toHaveBeenCalled();
        expect(helper.downloadAndActivateExtension).not.toHaveBeenCalled();
    });

    it('keeps a successful purchase successful if refreshing the extension list fails', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        extensions.updateExtensionData.mockRejectedValue(new Error('Refresh failed'));
        const result = service.open(request);
        await flushPromises();
        await extensionStorePurchaseConfirmationStore().confirm();
        await expect(result).resolves.toEqual({ status: 'purchased', installed: false, extensionVersion: null });
    });

    it('requires permission before accessing the Store API', async () => {
        acl.can.mockReturnValue(false);
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'forbidden' });
        expect(acl.can).toHaveBeenCalledWith('system.plugin_maintain');
        expect(extensions.checkLogin).not.toHaveBeenCalled();
        expect(licenses.newCart).not.toHaveBeenCalled();
    });

    it('requires an Account login and can be retried after logging in', async () => {
        Shopware.Store.get('shopwareExtensions').userInfo = null;
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'login_required' });
        expect(licenses.newCart).not.toHaveBeenCalled();
        Shopware.Store.get('shopwareExtensions').userInfo = {} as never;
        const result = service.open(request);
        await flushPromises();
        extensionStorePurchaseConfirmationStore().cancel();
        await expect(result).resolves.toEqual({ status: 'cancelled' });
    });

    it('does not expose the Store-only capability on the public service', () => {
        expect('openFromStore' in service).toBe(false);
        expect('start' in service).toBe(false);
    });

    it('passes the source only when creating the cart', async () => {
        const result = service.open(request);
        await flushPromises();
        await extensionStorePurchaseConfirmationStore().confirm();
        await result;
        expect(licenses.newCart).toHaveBeenCalledWith('store-uuid', 'monthly-variant', 'AcmeBaseExtension');
        expect(licenses.orderCart).toHaveBeenCalledWith(cart);
        expect(cart).not.toHaveProperty('sourceExtensionName');
    });

    it('shows a backend checkout rejection through the existing error modal', async () => {
        licenses.newCart.mockRejectedValue({ response: { data: { errors: [{
            code: 'BACKEND_CHECKOUT_REJECTED',
            title: 'Checkout not allowed',
            description: 'The backend rejected this offer.',
            meta: { documentationLink: 'https://example.com/help' },
        }] } } });
        await expect(service.open(request)).resolves.toEqual({ status: 'failed', code: 'checkout_failed' });
        const store = extensionStorePurchaseConfirmationStore();
        expect(store.isFailedOnBasketCreation).toBe(true);
        expect(store.cartData).toBeNull();
        expect(store.errorTitle).toBe('Checkout not allowed');
        expect(store.errorDescription).toBe('The backend rejected this offer.');
        expect(store.errorDocumentationLink).toBe('https://example.com/help');
        expect(licenses.orderCart).not.toHaveBeenCalled();
    });

    it.each([
        { ...request, extensionId: '', variantId: 'variant' },
        { ...request, extensionId: 'id', variantId: ' ' },
        { ...request, extensionId: 123, variantId: 'variant' },
        { extensionId: 'id', variantId: 'variant' },
        { ...request, sourceExtensionName: '' },
        null,
    ])('rejects invalid identifiers: %p', async (invalidRequest) => {
        await expect(service.open(invalidRequest as never)).resolves.toEqual({ status: 'failed', code: 'invalid_request' });
        expect(licenses.newCart).not.toHaveBeenCalled();
    });
});
