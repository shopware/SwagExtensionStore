const MODULE_ID = 'sw-payments';

async function loadModule() {
    await import('SwagExtensionStore/module/sw-payments');
}

describe('SwagExtensionStore/module/sw-payments', () => {
    beforeEach(() => {
        jest.resetModules();
        Shopware.Module.getModuleRegistry().delete(MODULE_ID);
    });

    afterEach(() => {
        Shopware.Module.getModuleRegistry().delete(MODULE_ID);
    });

    it('registers the parent menu module', async () => {
        await loadModule();

        const moduleDefinition = Shopware.Module.getModuleRegistry().get(MODULE_ID);
        const route = moduleDefinition.routes.get('sw.payments.index');
        const navigation = moduleDefinition.navigation[0];

        expect(moduleDefinition.manifest.type).toBe('core');
        expect(moduleDefinition.manifest.name).toBe('payments');
        expect(route.path).toBe('/sw/payments/index');
        expect(navigation).toEqual(expect.objectContaining({
            id: MODULE_ID,
            color: '#FFBC51',
            icon: 'regular-credit-card',
            position: 35,
            privilege: 'payments.viewer',
        }));
    });

    it('does not overwrite an existing module registration', async () => {
        const existingModule = {
            manifest: {
                name: 'existing',
            },
            routes: new Map(),
            navigation: [],
        };

        Shopware.Module.getModuleRegistry().set(MODULE_ID, existingModule);

        await loadModule();

        expect(Shopware.Module.getModuleRegistry().get(MODULE_ID)).toBe(existingModule);
    });
});
