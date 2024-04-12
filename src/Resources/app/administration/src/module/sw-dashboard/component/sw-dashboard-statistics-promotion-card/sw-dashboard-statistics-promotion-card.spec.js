import { mount } from '@vue/test-utils';

const STATISTICS_APP_NAME = 'StatisticsService';

Shopware.Component.register(
    'sw-dashboard-statistics-promotion-card',
    () => import('SwagExtensionStore/module/sw-dashboard/component/sw-dashboard-statistics-promotion-card')
);

describe('src/module/sw-dashboard/component/sw-dashboard-statistics-promotion-card', () => {
    async function createWrapper(isAppExistingInTheStore = true) {
        const app = !isAppExistingInTheStore ? null : {
            id: 99999,
            label: 'Statistics service app by shopware',
            name: STATISTICS_APP_NAME
        };

        const extensionStoreDataService = {
            getExtensionByName: jest.fn(() => Promise.resolve(app))
        };

        const wrapper = await mount(await Shopware.Component.build('sw-dashboard-statistics-promotion-card'), {
            global: {
                provide: {
                    extensionStoreDataService
                },
                stubs: {
                    'sw-button': await wrapTestComponent('sw-button'),
                    'sw-button-deprecated': await wrapTestComponent('sw-button-deprecated', { sync: true }),
                    'sw-icon': true
                }
            }
        });

        wrapper.vm.$router = {
            push: jest.fn()
        };

        return wrapper;
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

        expect(wrapper.find('.sw-dashboard-statistics-promotion-card').exists()).toBe(true);
    });

    it('does not show the banner if the app is installed', async () => {
        installApp();
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-card').exists()).toBe(false);
    });

    it('does not show the banner if the app is installed but deactivated', async () => {
        installApp(false);
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-dashboard-statistics-promotion-card').exists()).toBe(false);
    });

    it('disables the button if the app is not found in the store', async () => {
        const wrapper = await createWrapper(false);

        expect(wrapper.find('button[disabled]').exists()).toBe(true);

        wrapper.vm.goToStatisticsAppDetailPage();
        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(0);
    });

    it('enables the button if the app is found in the store', async () => {
        const wrapper = await createWrapper(true);

        expect(wrapper.find('button').exists()).toBe(true);
        expect(wrapper.find('button[disabled]').exists()).toBe(false);

        wrapper.vm.goToStatisticsAppDetailPage();
        expect(wrapper.vm.$router.push).toHaveBeenCalled();
    });
});
