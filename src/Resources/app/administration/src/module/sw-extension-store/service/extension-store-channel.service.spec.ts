import { handle, publish } from '@shopware-ag/meteor-admin-sdk/es/channel';
import { ExtensionStoreChannelService } from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionStoreLicensesService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-licenses.service';
import type ExtensionHelperService from 'src/app/service/extension-helper.service';
import type { ExtensionStoreBasket } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-basket.types';
import extensionStorePurchaseConfirmationStore from '../store/extension-store-purchase-confirmation.store';

jest.mock('@shopware-ag/meteor-admin-sdk/es/channel', () => ({
    handle: jest.fn(),
    publish: jest.fn()
}));

const handleMock = handle as jest.MockedFunction<typeof handle>;
const publishMock = publish as jest.MockedFunction<typeof publish>;

const cartWithPlugin = {
    positions: [
        {
            extension: {
                id: 'extension-id',
                name: 'SwagPlugin',
                type: 'plugin'
            }
        }
    ]
} as ExtensionStoreBasket;

const cartWithApp = {
    positions: [
        {
            extension: {
                id: 'extension-id',
                name: 'SwagApp',
                type: 'app'
            }
        }
    ]
} as ExtensionStoreBasket;

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
            getMyExtensions: jest.fn().mockResolvedValue([
                { name: cart.positions[0].extension.name, version: '1.2.3' }
            ])
        };
        shopwareExtensionService = {
            checkLogin: jest.fn().mockResolvedValue(undefined),
            updateExtensionData: jest.fn().mockResolvedValue(undefined)
        };
        extensionStoreLicensesService = {
            newCart: jest.fn().mockResolvedValue({ data: cart }),
            getPaymentMeans: jest.fn().mockResolvedValue({ data: [] }),
            orderCart: jest.fn().mockResolvedValue(undefined)
        };
        extensionHelperService = {
            downloadAndActivateExtension: jest.fn().mockResolvedValue(undefined)
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
                currentRoute: { value: { params: {}, query: {} } }
            } as never,
            extensionStorePreferencesService as never
        );
    };

    /** Runs the handshake through the channel and returns the context the iframe receives. */
    const performHandshake = async (bundles?: Record<string, unknown>) => {
        Shopware.Context.app.config.bundles = bundles as never;
        service.register();

        const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<{ isDemoShop: boolean }>;

        return channelHandler({ action: 'handshake', sessionToken: 'session-token', version: '1.0.0' });
    };

    /** Runs the purchase action through the channel and returns the confirm callback result. */
    const performPurchase = async () => {
        service.register();

        const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
        await channelHandler({
            action: 'purchase',
            productId: 'product-id',
            variantId: 'variant-id',
            isCompatible: true,
            sessionToken: 'session-token'
        });

        return extensionStorePurchaseConfirmationStore().onConfirm!();
    };

    beforeEach(() => {
        Shopware.State.get('session').currentLocale = 'de-DE';
        Shopware.State.get('shopwareExtensions').userInfo = null;
        Shopware.Snippet = { tc: (key: string, params?: Record<string, string>) => `${key}:${JSON.stringify(params ?? {})}` } as never;
        createNotificationSpy = jest.spyOn(Shopware.State, 'commit').mockImplementation(() => {});

        service = createService(cartWithPlugin);
    });

    afterEach(() => {
        service.unregister();
        extensionStorePurchaseConfirmationStore().$reset();
        jest.restoreAllMocks();
    });

    describe('handshake', () => {
        it('should report a demo shop when the demo environment bundle is present', async () => {
            const context = await performHandshake({ SwagDemoEnvironment: { js: [], css: [] } });

            expect(context.isDemoShop).toBe(true);
        });

        it('should report a regular shop when the demo environment bundle is absent', async () => {
            const context = await performHandshake({ SwagExtensionStore: { js: [], css: [] } });

            expect(context.isDemoShop).toBe(false);
        });

        it('should report a regular shop when no bundles are known', async () => {
            const context = await performHandshake(undefined);

            expect(context.isDemoShop).toBe(false);
        });
    });

    describe('purchase with installation', () => {
        it('should request a reload and publish the installed version', async () => {
            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: true });
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', expect.objectContaining({
                action: 'purchaseResult',
                success: true,
                extensionVersion: '1.2.3'
            }));
            expect(extensionStorePurchaseConfirmationStore().checkoutStep).toBe('reload');
        });

        it('should clear the cache after installing a plugin', async () => {
            await performPurchase();

            expect(cacheApiService.clear).toHaveBeenCalledTimes(1);
        });

        it('should clear the cache after installing an app', async () => {
            service = createService(cartWithApp);

            await performPurchase();

            expect(cacheApiService.clear).toHaveBeenCalledTimes(1);
        });

        it('should still treat the purchase as successful when cache clearing fails', async () => {
            cacheApiService.clear.mockRejectedValue(new Error('clearing failed'));

            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: true });
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', expect.objectContaining({
                action: 'purchaseResult',
                success: true,
                extensionVersion: '1.2.3'
            }));
        });

        it('should notify the user about a successful installation', async () => {
            await performPurchase();

            expect(createNotificationSpy).toHaveBeenCalledWith('notification/createNotification', expect.objectContaining({
                variant: 'positive',
                title: 'sw-extension-store.installation.successTitle:{}',
                message: 'sw-extension-store.installation.successMessage:{"name":"SwagPlugin"}'
            }));
        });

        it('should notify the user and publish no version when installation fails', async () => {
            extensionHelperService.downloadAndActivateExtension.mockRejectedValue(new Error('installation failed'));

            const result = await performPurchase();

            expect(result).toEqual({ success: true, requiresReload: false });
            expect(publishMock).toHaveBeenCalledWith('swag-extension-store-channel', expect.objectContaining({
                action: 'purchaseResult',
                success: true,
                extensionVersion: null
            }));
            expect(createNotificationSpy).toHaveBeenCalledWith('notification/createNotification', expect.objectContaining({
                variant: 'critical',
                title: 'sw-extension-store.installation.errorTitle:{}',
                message: 'sw-extension-store.installation.errorMessage:{"name":"SwagPlugin"}'
            }));
        });
    });
});
