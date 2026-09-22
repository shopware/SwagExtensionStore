import { flushPromises } from '@vue/test-utils';
import { handle, publish, setExtensions } from '@shopware-ag/meteor-admin-sdk/es/channel';
import { ExtensionStoreChannelService } from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import extensionStoreContextStore from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import extensionStorePurchaseConfirmationStore from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-purchase-confirmation.store';
import type { ExtensionStoreBasket } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-basket.types';

jest.mock('@shopware-ag/meteor-admin-sdk/es/channel', () => ({
    handle: jest.fn(() => jest.fn()),
    publish: jest.fn(),
    setExtensions: jest.fn(),
}));

jest.mock('SwagExtensionStore/util/telemetry', () => ({
    trackExtensionStoreEvent: jest.fn(() => Promise.resolve()),
}));

const handleMock = handle as jest.MockedFunction<typeof handle>;
const publishMock = publish as jest.MockedFunction<typeof publish>;
const setExtensionsMock = setExtensions as jest.MockedFunction<typeof setExtensions>;

const STORE_ORIGIN = 'https://sky-bridge-store.production.shopware.in';

type ChannelInformation = {
    _event_: MessageEvent<string>;
};

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
    let router: { push: jest.Mock; afterEach: jest.Mock; currentRoute: { value: { params: object; query: object } } };
    let channelWindow: Window;

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
        router = {
            push: jest.fn(),
            afterEach: jest.fn(() => jest.fn()),
            currentRoute: { value: { params: {}, query: {} } },
        };

        return new ExtensionStoreChannelService(
            extensionStoreActionService as never,
            shopwareExtensionService as never,
            extensionStoreLicensesService as never,
            extensionHelperService as never,
            cacheApiService as never,
            router as never,
            extensionStorePreferencesService as never,
        );
    };

    /** Runs the handshake through the channel and returns the context the iframe receives. */
    const performHandshake = async (bundles?: Record<string, unknown>) => {
        Shopware.Context.app.config.bundles = bundles as never;
        service.register();

        const channelHandler = handleMock.mock.calls[0][1] as (
            data: unknown,
            additionalInformation: ChannelInformation
        ) => Promise<{ isDemoShop: boolean }>;

        return channelHandler(
            { action: 'handshake', sessionToken: 'session-token', version: '1.0.0' },
            {
                _event_: {
                    source: channelWindow,
                    origin: STORE_ORIGIN,
                } as MessageEvent<string>,
            },
        );
    };

    /** Runs the purchase action through the channel and returns the confirm callback result. */
    const performPurchase = async () => {
        service.register();

        await performHandshake();

        const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
        await channelHandler(purchaseActionData);

        const onConfirm = extensionStorePurchaseConfirmationStore().onConfirm;
        expect(onConfirm).not.toBeNull();

        return onConfirm!();
    };

    const expectPublishedToStore = (data: object) => {
        expect(publishMock).toHaveBeenCalledWith(
            'swag-extension-store-channel',
            data,
            [expect.objectContaining({
                source: channelWindow,
                origin: STORE_ORIGIN,
                sdkVersion: '1.0.0',
            })],
        );
    };

    beforeEach(() => {
        handleMock.mockClear();
        publishMock.mockClear();
        setExtensionsMock.mockClear();
        extensionStorePurchaseConfirmationStore().$reset();
        channelWindow = { postMessage: jest.fn() } as unknown as Window;
        extensionStoreContextStore().iframeUrl = `${STORE_ORIGIN}/`;
        createNotificationSpy = jest.spyOn(Shopware.Store.get('notification'), 'createNotification')
            .mockImplementation(() => null);
        service = createService(buildCart());
    });

    afterEach(() => {
        service.unregister();
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

    describe('channel registration', () => {
        it('should register and target the store iframe after its handshake', async () => {
            await performHandshake();

            expect(setExtensionsMock).toHaveBeenCalledWith({
                'swag-extension-store-sky-bridge': {
                    baseUrl: STORE_ORIGIN,
                    permissions: {},
                },
            });
        });

        it('should remove the same popstate listener that was registered', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            service.register();

            const popstateListener = addEventListenerSpy.mock.calls
                .find(([eventName]) => eventName === 'popstate')?.[1];

            service.unregister();

            expect(popstateListener).toBeDefined();
            expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', popstateListener);
        });
    });

    describe('routeTo', () => {
        it('should navigate to the named route with its parameters', async () => {
            service.register();

            const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
            await channelHandler({
                action: 'routeTo',
                name: 'sw.extension.store.detail',
                params: { id: 'extension-id' },
            });

            expect(router.push).toHaveBeenCalledWith({
                name: 'sw.extension.store.detail',
                params: { id: 'extension-id' },
            });
        });

        it('should ignore route parameters with non-string values', async () => {
            service.register();

            const channelHandler = handleMock.mock.calls[0][1] as (data: unknown) => Promise<unknown>;
            await channelHandler({
                action: 'routeTo',
                name: 'sw.extension.store.detail',
                params: { id: 1 },
            });

            expect(router.push).not.toHaveBeenCalled();
        });
    });

    describe('purchase with installation', () => {
        it('should request a reload and publish the installed version', async () => {
            const result = await performPurchase();

            expect(extensionHelperService.downloadAndActivateExtension).toHaveBeenCalledWith('SwagExtension', 'plugin');
            expect(result).toEqual({ success: true, requiresReload: true });
            expectPublishedToStore({
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
            await performHandshake();
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
            expectPublishedToStore({
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
            // The handshake loads the extensions once. A failed install must not look the version up again.
            expect(extensionStoreActionService.getMyExtensions).toHaveBeenCalledTimes(1);
            expectPublishedToStore({
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
