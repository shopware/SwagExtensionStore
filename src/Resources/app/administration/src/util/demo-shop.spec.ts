import { hasDemoShopBundle } from 'SwagExtensionStore/util/demo-shop';

describe('SwagExtensionStore/util/demo-shop', () => {
    const originalBundles = Shopware.Context.app.config.bundles;

    afterEach(() => {
        Shopware.Context.app.config.bundles = originalBundles;
    });

    it('should detect a demo shop when the demo environment bundle is present', () => {
        Shopware.Context.app.config.bundles = { SwagDemoEnvironment: { js: [], css: [] } } as never;

        expect(hasDemoShopBundle()).toBe(true);
    });

    it('should not detect a demo shop when the demo environment bundle is absent', () => {
        Shopware.Context.app.config.bundles = { SwagExtensionStore: { js: [], css: [] } } as never;

        expect(hasDemoShopBundle()).toBe(false);
    });

    it('should not detect a demo shop when no bundles are known', () => {
        Shopware.Context.app.config.bundles = undefined as never;

        expect(hasDemoShopBundle()).toBe(false);
    });
});
