import type { DemoShopStatus } from 'SwagExtensionStore/module/sw-extension-store/types/extension-store-demo-shop.types';

const demoShopStatus: DemoShopStatus = {
    isDemoShop: true,
    demoShopInformation: {
        remainingDays: 5,
        expirationDate: '2099-12-31',
        accountLink: 'https://account.shopware.com/shops/demoshops/1',
        contact: { firstName: 'John', lastName: 'Doe' },
    },
};

describe('extension-store-context.store', () => {
    const getDemoShopStatus = jest.fn();
    let serviceSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;

    async function getStore() {
        // Start each test with a fresh store and no cached status
        Shopware.Store.unregister('extensionStoreContext' as never);
        jest.resetModules();
        const storeModule = await import('./extension-store-context.store');

        return storeModule.default();
    }

    beforeEach(() => {
        getDemoShopStatus.mockReset();
        serviceSpy = jest.spyOn(Shopware, 'Service').mockImplementation(((name: string) => {
            if (name === 'extensionStoreDemoShopService') {
                return { getDemoShopStatus };
            }

            throw new Error(`Unexpected service: ${name}`);
        }) as typeof Shopware.Service);
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        serviceSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it('loads and caches the demo shop status', async () => {
        getDemoShopStatus.mockResolvedValue(demoShopStatus);
        const store = await getStore();

        await expect(store.loadDemoShopStatus()).resolves.toEqual(demoShopStatus);

        expect(store.demoShopStatus).toEqual(demoShopStatus);

        await expect(store.loadDemoShopStatus()).resolves.toEqual(demoShopStatus);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent requests', async () => {
        getDemoShopStatus.mockResolvedValue(demoShopStatus);
        const store = await getStore();

        const [first, second] = await Promise.all([
            store.loadDemoShopStatus(),
            store.loadDemoShopStatus(),
        ]);

        expect(first).toEqual(demoShopStatus);
        expect(second).toEqual(demoShopStatus);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(1);
    });

    it('falls back to a regular shop on errors without caching the result', async () => {
        getDemoShopStatus.mockRejectedValueOnce(new Error('sbp unreachable'));
        getDemoShopStatus.mockResolvedValueOnce(demoShopStatus);
        const store = await getStore();

        await expect(store.loadDemoShopStatus()).resolves.toEqual({
            isDemoShop: false,
            demoShopInformation: null,
        });

        expect(store.demoShopStatus).toBeNull();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        // The next call retries instead of caching the fallback.
        await expect(store.loadDemoShopStatus()).resolves.toEqual(demoShopStatus);
        expect(store.demoShopStatus).toEqual(demoShopStatus);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(2);
    });
});
