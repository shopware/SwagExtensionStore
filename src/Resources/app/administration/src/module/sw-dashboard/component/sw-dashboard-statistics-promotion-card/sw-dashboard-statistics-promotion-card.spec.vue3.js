import { mount } from '@vue/test-utils';

const STATISTICS_APP_NAME = 'SwagAnalytics';

Shopware.Component.register(
    'sw-dashboard-statistics-promotion-card',
    () => import('SwagExtensionStore/module/sw-dashboard/component/sw-dashboard-statistics-promotion-card')
);

describe('src/module/sw-dashboard/component/sw-dashboard-statistics-promotion-card', () => {
    const extensionStoreDataService = {};
    const router = {};

    async function createWrapper(isAppExistingInTheStore = true, hasPermission = true) {
        const app = !isAppExistingInTheStore ? null : {
            id: 99999,
            label: 'Statistics service app by shopware',
            name: STATISTICS_APP_NAME
        };

        extensionStoreDataService.getExtensionByName = hasPermission
            ? jest.fn(() => Promise.resolve(app))
            : jest.fn(() => Promise.reject(new Error('Request failed with status code 403')));

        router.push = jest.fn();

        return mount(await Shopware.Component.build('sw-dashboard-statistics-promotion-card'), {
            global: {
                provide: {
                    extensionStoreDataService,
                    acl: {
                        can: () => hasPermission
                    }
                },
                stubs: {
                    'sw-button': await wrapTestComponent('sw-button'),
                    'sw-button-deprecated': await wrapTestComponent('sw-button-deprecated', { sync: true }),
                    'sw-icon': true
                },
                mocks: {
                    $router: router
                }
            }
        });
    }

    function installApp(isActive = true) {
        Shopware.Context.app.config.bundles[STATISTICS_APP_NAME] = {
            baseUrl: null,
            css: [],
            js: [],
            type: 'app',
            active: isActive
        };
    }

    function uninstallApp() {
        delete Shopware.Context.app.config.bundles[STATISTICS_APP_NAME];
    }

    beforeEach(() => {
        if (!Shopware.Context.app.config.bundles) {
            Shopware.Context.app.config.bundles = {};
        }
    });

    afterEach(() => {
        uninstallApp();
    });

    it('shows the banner if the app is not installed', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-banner').exists()).toBe(true);
    });

    it('does not show the banner if the app is installed', async () => {
        installApp();
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-banner').exists()).toBe(false);
    });

    it('does not show the banner if the app is installed but deactivated', async () => {
        installApp(false);
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-banner').exists()).toBe(false);
    });

    it('disables the button if the app is not found in the store', async () => {
        const wrapper = await createWrapper(false);

        expect(wrapper.find('button[disabled]').exists()).toBe(true);

        wrapper.vm.goToStatisticsAppDetailPage();
        expect(router.push).toHaveBeenCalledTimes(0);
    });

    it('does not fetch the extension when the user does not have permission to access the extension store', async () => {
        await createWrapper(true, false);
        expect(extensionStoreDataService.getExtensionByName).toHaveBeenCalledTimes(0);
    });

    it(
        'redirects to the extension store even if the user does not have permission to access the extension store',
        async () => {
            const wrapper = await createWrapper(true, false);

            expect(wrapper.find('button').exists()).toBe(true);
            expect(wrapper.find('button[disabled]').exists()).toBe(false);

            wrapper.vm.goToStatisticsAppDetailPage();
            expect(router.push).toHaveBeenNthCalledWith(1, { name: 'sw.extension.store' });
        }
    );

    it('shows the badge if the date is before 2025', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-04-25'));
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-banner__advertisement-details-badge').exists()).toBe(true);
        jest.useRealTimers();
    });

    it('does not show the badge if the date is after 2024', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2025-04-25'));
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-banner__advertisement-details-badge').exists()).toBe(false);
        jest.useRealTimers();
    });

    it('enables the button if the app is found in the store', async () => {
        const wrapper = await createWrapper(true);

        expect(wrapper.find('button').exists()).toBe(true);
        expect(wrapper.find('button[disabled]').exists()).toBe(false);

        wrapper.vm.goToStatisticsAppDetailPage();
        expect(router.push).toHaveBeenNthCalledWith(1, {
            name: 'sw.extension.store.detail',
            params: { id: 99999 }
        });
    });
});
