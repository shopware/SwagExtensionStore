import enSnippets from './snippet/en.json';
import deSnippets from './snippet/de.json';

const MODULE_ID = 'sw-payments';
const APP_PRIVILEGE = 'app.ShopwarePayments';

let addPrivilegeMappingEntrySpy;
let getPrivilegesSpy;
let privilegesService;

async function loadModule() {
    await import('SwagExtensionStore/module/sw-payments');
}

describe('SwagExtensionStore/module/sw-payments', () => {
    beforeEach(() => {
        jest.resetModules();
        Shopware.Module.getModuleRegistry().delete(MODULE_ID);

        const serviceAccessor = Shopware.Service;
        privilegesService = {
            getPrivileges: jest.fn(() => ['payment:read']),
            addPrivilegeMappingEntry: jest.fn(() => privilegesService),
        };
        getPrivilegesSpy = privilegesService.getPrivileges;
        addPrivilegeMappingEntrySpy = privilegesService.addPrivilegeMappingEntry;

        jest.spyOn(Shopware, 'Service').mockImplementation((serviceName) => {
            if (serviceName === 'privileges') {
                return privilegesService;
            }

            return serviceAccessor(serviceName);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Shopware.Module.getModuleRegistry().delete(MODULE_ID);
    });

    it('registers the parent menu module', async () => {
        await loadModule();

        const moduleDefinition = Shopware.Module.getModuleRegistry().get(MODULE_ID);
        const route = moduleDefinition.routes.get('sw.payments.index');
        const navigation = moduleDefinition.navigation[0];

        expect(moduleDefinition.manifest.type).toBe('core');
        expect(moduleDefinition.manifest.name).toBe('payments');
        expect(moduleDefinition.manifest.title).toBe('sw-payments.general.mainMenuItemGeneral');
        expect(moduleDefinition.manifest.description).toBe('sw-payments.general.description');
        expect(route.path).toBe('/sw/payments/index');
        expect(navigation).toEqual(expect.objectContaining({
            id: MODULE_ID,
            label: 'global.sw-admin-menu.navigation.mainMenuItemShopwarePayments',
            color: '#FFBC51',
            icon: 'regular-credit-card',
            position: 35,
            privilege: 'sw-payments.viewer',
        }));
    });

    it('registers the payments privilege mapping', async () => {
        await loadModule();

        expect(getPrivilegesSpy).toHaveBeenCalledWith('payment.viewer');
        expect(addPrivilegeMappingEntrySpy).toHaveBeenCalledWith({
            category: 'permissions',
            key: MODULE_ID,
            parent: 'settings',
            roles: {
                viewer: {
                    privileges: [
                        ['payment:read'],
                        APP_PRIVILEGE,
                    ],
                    dependencies: [
                        APP_PRIVILEGE,
                    ],
                },
                editor: {
                    privileges: [],
                    dependencies: [
                        'sw-payments.viewer',
                    ],
                },
                creator: {
                    privileges: [],
                    dependencies: [
                        'sw-payments.viewer',
                        'sw-payments.editor',
                    ],
                },
            },
        });
    });

    it('provides menu and privilege snippets', () => {
        [
            enSnippets,
            deSnippets,
        ].forEach((snippets) => {
            expect(snippets).toHaveProperty([
                'global',
                'sw-admin-menu',
                'navigation',
                'mainMenuItemShopwarePayments',
            ]);
            expect(snippets).toHaveProperty([
                'sw-payments',
                'general',
                'mainMenuItemGeneral',
            ]);
            expect(snippets).toHaveProperty([
                'sw-payments',
                'general',
                'description',
            ]);
            expect(snippets).toHaveProperty([
                'sw-privileges',
                'permissions',
                MODULE_ID,
                'label',
            ]);
        });
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
