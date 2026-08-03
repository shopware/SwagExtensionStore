import { flushPromises } from '@vue/test-utils';
import { handle, publish } from '@shopware-ag/meteor-admin-sdk/es/channel';
import { ExtensionStoreChannelService } from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import extensionStorePurchaseConfirmationStore from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store';
import type { ExtensionStoreBasket } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-basket.types';

jest.mock('@shopware-ag/meteor-admin-sdk/es/channel', () => ({
    handle: jest.fn(() => jest.fn()),
    publish: jest.fn(),
}));

jest.mock('SwagExtensionStore/util/telemetry', () => ({
    trackExtensionStoreEvent: jest.fn(() => Promise.resolve()),
}));

const handleMock = handle as jest.MockedFunction<typeof handle>;
const publishMock = publish as jest.MockedFunction<typeof publish>;

const buildCart = (type: 'app' | 'plugin' = 'plugin') => ({
    positions: [
        {
            extension: {
                id: 1,
                name: 'SwagExtension',
                type,
            },
            variant: { id: 2, duration: 1 },
            netPrice: 19.99,
            taxRate: 19,
            firstMonthFree: false,
            pseudoPrice: 19.99,
            discountAppliesForMonths: null,
        },
    ],
} as unknown as ExtensionStoreBasket);

const purchaseActionData = {
    action: 'purchase',
    productId: 'product-id',
    variantId: 'variant-id',
    isCompatible: true,
    sessionToken: 'session-token',
};

describe('SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service', () => {
    let service: ExtensionStoreChannelService;
    let extensionStoreActionService: { getMyExtensions: jest.Mock };
    let shopwareExtensionService: { checkLogin: jest.Mock; updateExtensionData: jest.Mock };
    let extensionStoreLicensesService: { newCart: jest.Mock; getPaymentMeans: jest.Mock; orderCart: jest.Mock };
    let extensionHelperService: { downloadAndActivateExtension: jest.Mock };
    let cacheApiService: { clear: jest.Mock };
    let extensionStorePreferencesService: { state: { installAfterPurchase: boolean } };
    let createNotificationSpy: jest.SpyInstance;

    const createService = (cart: ExtensionStoreBasket) => {
        extensionStoreActionService = {
            getMyExtensions: jest.fn().mockResolvedValue([{ name: 'SwagExtension', version: '2.1.0' }]),
        };
        shopwareExtensionService = {
            checkLogin: jest.fn().mockResolvedValue(undefined),
            updateExtensionData: jest.fn().mockResolvedValue(undefined),
        };
        extensionStoreLicensesService = {
            newCart: jest.fn().mockResolvedValue({ data: cart }),
            getPaymentMeans: jest.fn().mockResolvedValue({ data: [] }),
            orderCart: jest.fn().mockResolvedValue(undefined),
        };
        extensionHelperService = {
            downloadAndActivateExtension: jest.fn().mockResolvedValue(undefined),
        };
        cacheApiService = { clear: jest.fn().mockResolvedValue(undefined) };
        extensionStorePreferencesService = { state: { installAfterPurchase: true } };

        return new ExtensionStoreChannelService(
            extensionStoreActionService as never,
            shopwareExtensionService as never,
            extensionStoreLicensesService as never,
            extensionHelperService as never,
            cacheApiService as never,
            {
                push: jest.fn(),
                afterEach: jest.fn(() => jest.fn()),
                currentRoute: { value: { params: {}, query: {} } },
            } as never,
            extensionStorePreferencesService as never,
        );
    };

    /** Runs the purchase action through the channel and returns the confirm callback result. */
    const performPurchase = async () => {
        service.register();

        const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
        await channelHandler(purchaseActionData);

        const onConfirm = extensionStorePurchaseConfirmationStore().onConfirm;
        expect(onConfirm).not.toBeNull();

        return onConfirm!();
    };

    beforeEach(() => {
        handleMock.mockClear();
        publishMock.mockClear();
        extensionStorePurchaseConfirmationStore().$reset();
        createNotificationSpy = jest.spyOn(Shopware.Store.get('notification'), 'createNotification')
            .mockImplementation(() => null);
        service = createService(buildCart());
    });

    afterEach(() => {
        service.unregister();
        jest.restoreAllMocks();
    });

    describe('purchase with installation', () => {
        it('should request a reload and publish the installed version', async () => {
            const result = await performPurchase();

            expect(extensionHelperService.downloadAndActivateExtension).toHaveBeenCalledWith('SwagExtension', 'plugin');
            expect(result).toEqual({ success: true, requiresReload: true });
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', {
                action: 'purchaseResult',
                sessionToken: 'session-token',
                success: true,
                extensionVersion: '2.1.0',
            });
        });

        it('should publish the purchase result after the extension has been installed', async () => {
            await performPurchase();

            const installOrder = extensionHelperService.downloadAndActivateExtension.mock.invocationCallOrder[0];
            const publishOrder = publishMock.mock.invocationCallOrder[publishMock.mock.calls.length - 1];

            expect(installOrder).toBeLessThan(publishOrder);
        });

        it('should notify about the successful installation', async () => {
            await performPurchase();

            expect(createNotificationSpy).toHaveBeenCalledWith(expect.objectContaining({
                variant: 'positive',
                growl: true,
            }));
        });

        it.each(['plugin', 'app'] as const)('should clear the cache for a %s', async (type) => {
            service = createService(buildCart(type));

            await performPurchase();

            expect(cacheApiService.clear).toHaveBeenCalledTimes(1);
        });

        it('should publish the successful result when the modal is closed while installing', async () => {
            let finishInstallation = (): void => {};
            extensionHelperService.downloadAndActivateExtension.mockReturnValue(new Promise((resolve) => {
                finishInstallation = () => resolve(undefined);
            }));

            service.register();
            const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
            await channelHandler(purchaseActionData);

            const store = extensionStorePurchaseConfirmationStore();
            const confirmed = store.confirm();
            await flushPromises();

            // The user closes the modal while the extension is being installed.
            store.cancel();

            expect(publishMock).not.toHaveBeenCalled();

            finishInstallation();
            await confirmed;

            expect(publishMock).toHaveBeenCalledTimes(1);
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', {
                action: 'purchaseResult',
                sessionToken: 'session-token',
                success: true,
                extensionVersion: '2.1.0',
            });
        });

        it('should still request a reload when clearing the cache fails', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            cacheApiService.clear.mockRejectedValue(new Error('cache clear failed'));

            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: true });
            expect(createNotificationSpy).toHaveBeenCalledWith(expect.objectContaining({
                variant: 'positive',
            }));
        });
    });

    describe('purchase with a failing installation', () => {
        beforeEach(() => {
            jest.spyOn(console, 'error').mockImplementation(() => {});
            extensionHelperService.downloadAndActivateExtension.mockRejectedValue(new Error('install failed'));
        });

        it('should not request a reload and skip the version lookup', async () => {
            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: false });
            expect(extensionStoreActionService.getMyExtensions).not.toHaveBeenCalled();
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', {
                action: 'purchaseResult',
                sessionToken: 'session-token',
                success: true,
                extensionVersion: null,
            });
        });

        it('should notify about the failed installation', async () => {
            await performPurchase();

            expect(createNotificationSpy).toHaveBeenCalledWith(expect.objectContaining({
                variant: 'critical',
                growl: true,
            }));
        });
    });

    describe('purchase without installation', () => {
        it('should not request a reload when the installation preference is disabled', async () => {
            extensionStorePreferencesService.state.installAfterPurchase = false;

            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: false });
            expect(extensionHelperService.downloadAndActivateExtension).not.toHaveBeenCalled();
            expect(cacheApiService.clear).not.toHaveBeenCalled();
        });

        it('should not request a reload when the extension is incompatible', async () => {
            service.register();
            const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
            await channelHandler({ ...purchaseActionData, isCompatible: false });

            const result = await extensionStorePurchaseConfirmationStore().onConfirm!();

            expect(result).toEqual({ success: true, requiresReload: false });
            expect(extensionHelperService.downloadAndActivateExtension).not.toHaveBeenCalled();
        });
    });

    describe('failing purchase', () => {
        it('should not request a reload when the order fails', async () => {
            extensionStoreLicensesService.orderCart.mockRejectedValue({
                response: { data: { errors: [{ title: 'order-error', description: 'order failed' }] } },
            });

            const result = await performPurchase();

            expect(result).toEqual({
                success: false,
                title: 'order-error',
                description: 'order failed',
                documentationLink: '',
            });
            expect(extensionHelperService.downloadAndActivateExtension).not.toHaveBeenCalled();
        });
    });
});
