
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
        getDemoShopStatus.mockResolvedValue({ isDemoShop: true });
        const store = await getStore();

        await expect(store.loadIsDemoShop()).resolves.toBe(true);

        expect(store.isDemoShop).toBe(true);

        await expect(store.loadIsDemoShop()).resolves.toBe(true);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent requests', async () => {
        getDemoShopStatus.mockResolvedValue({ isDemoShop: true });
        const store = await getStore();

        const [first, second] = await Promise.all([
            store.loadIsDemoShop(),
            store.loadIsDemoShop(),
        ]);

        expect(first).toBe(true);
        expect(second).toBe(true);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(1);
    });

    it('falls back to a regular shop on errors without caching the result', async () => {
        getDemoShopStatus.mockRejectedValueOnce(new Error('endpoint unavailable'));
        getDemoShopStatus.mockResolvedValueOnce({ isDemoShop: true });
        const store = await getStore();

        await expect(store.loadIsDemoShop()).resolves.toBe(false);

        expect(store.isDemoShop).toBeNull();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        await expect(store.loadIsDemoShop()).resolves.toBe(true);
        expect(getDemoShopStatus).toHaveBeenCalledTimes(2);
    });
});
