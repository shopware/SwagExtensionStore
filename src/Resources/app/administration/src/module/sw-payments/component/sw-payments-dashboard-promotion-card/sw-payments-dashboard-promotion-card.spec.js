import { flushPromises, mount } from '@vue/test-utils';
import { registerOnboardingStatusStore } from '../../service/onboarding-status.store';

const SHOPWARE_PAYMENTS_APP_NAME = 'ShopwarePayments';
const SHOPWARE_PAYMENTS_ORIGIN = 'https://payments.example.test';
const DISMISSAL_STORAGE_KEY = 'shopware-payments.dashboard-promotion.dismissed';
const LEARN_MORE_URL = 'https://www.shopware.com/products/shopware-payments/';

Shopware.Component.register(
    'sw-payments-dashboard-promotion-card',
    () => import('SwagExtensionStore/module/sw-payments/component/sw-payments-dashboard-promotion-card'),
);

describe('src/module/sw-payments/component/sw-payments-dashboard-promotion-card', () => {
    const router = {
        push: jest.fn(),
    };

    async function createWrapper({
        version = '6.5.7.0',
        installed = false,
    } = {}) {
        Shopware.Context.app.config.version = version;
        Shopware.Context.app.config.bundles = {};
        Shopware.Store.get('extensions').extensionsState = {};

        if (installed) {
            Shopware.Store.get('extensions').extensionsState[SHOPWARE_PAYMENTS_APP_NAME] = {
                name: SHOPWARE_PAYMENTS_APP_NAME,
                baseUrl: `${SHOPWARE_PAYMENTS_ORIGIN}/admin`,
                permissions: {},
                type: 'app',
                active: true,
            };
        }

        const wrapper = mount(await Shopware.Component.build('sw-payments-dashboard-promotion-card'), {
            global: {
                stubs: {
                    'mt-card': {
                        template: '<div v-bind="$attrs"><slot /></div>',
                    },
                    'mt-button': {
                        template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
                    },
                    'mt-icon': true,
                },
                mocks: {
                    $router: router,
                    $t: (key) => {
                        if (key === 'sw-payments.dashboardPromotion.learnMoreUrl') {
                            return LEARN_MORE_URL;
                        }

                        return key;
                    },
                },
            },
        });

        await flushPromises();

        return wrapper;
    }

    async function setOnboardingStatus(hasOnboardedMerchant) {
        registerOnboardingStatusStore().setHasOnboardedMerchant(hasOnboardedMerchant);
        await flushPromises();
    }

    beforeEach(() => {
        if (!Shopware.Context.app.config) {
            Shopware.Context.app.config = {};
        }

        localStorage.clear();
        Shopware.Store.get('extensions').extensionsState = {};
        registerOnboardingStatusStore().setHasOnboardedMerchant(null);
        router.push.mockClear();
        global.window.open = jest.fn();
    });

    it('does not show the banner below Shopware 6.5.7.0', async () => {
        const wrapper = await createWrapper({ version: '6.5.6.9' });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('shows the banner starting with Shopware 6.5.7.0', async () => {
        const wrapper = await createWrapper({ version: '6.5.7.0' });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
    });

    it('shows the banner on supported versions when Shopware Payments is not installed', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
        expect(wrapper.find('.sw-payments-dashboard-promotion-card__brand').attributes('src'))
            .toBe('swagextensionstore/administration/static/img/payments/dashboard/shopware-payments-dashboard-logo.svg');
        expect(wrapper.find('.sw-payments-dashboard-promotion-card__visual').attributes('src'))
            .toBe('swagextensionstore/administration/static/img/payments/dashboard/shopware-payments-dashboard-marketing.png');
        expect(wrapper.text()).toContain('sw-payments.dashboardPromotion.badge');
        expect(wrapper.text()).toContain('sw-payments.dashboardPromotion.headline');
        expect(wrapper.text()).toContain('sw-payments.dashboardPromotion.description');
        expect(wrapper.text()).toContain('sw-payments.dashboardPromotion.learnMore');
        expect(wrapper.text()).not.toContain('sw-payments.dashboardPromotion.activateNow');
    });

    it('hides the banner after dismissing it', async () => {
        const wrapper = await createWrapper();

        await wrapper.find('.sw-payments-dashboard-promotion-card__dismiss').trigger('click');

        expect(localStorage.getItem(DISMISSAL_STORAGE_KEY)).toBe('true');
        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('does not show the banner when it was already dismissed', async () => {
        localStorage.setItem(DISMISSAL_STORAGE_KEY, 'true');

        const wrapper = await createWrapper();

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('does not show the banner while waiting for Shopware Payments onboarding status', async () => {
        const wrapper = await createWrapper({ installed: true });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('does not show the banner when Shopware Payments reports an onboarded merchant', async () => {
        const wrapper = await createWrapper({ installed: true });

        await setOnboardingStatus(true);

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('shows the banner when Shopware Payments reports no onboarded merchant', async () => {
        const wrapper = await createWrapper({ installed: true });

        await setOnboardingStatus(false);

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
    });

    it('keeps the banner visible after navigating away and back when no merchant is onboarded', async () => {
        const wrapper = await createWrapper({ installed: true });
        await setOnboardingStatus(false);

        wrapper.unmount();
        const remountedWrapper = await createWrapper({ installed: true });

        expect(remountedWrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
    });

    it('supports numeric Shopware version comparison', async () => {
        const wrapper = await createWrapper({ version: '6.10.0.0' });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
    });

    it('ignores prerelease suffixes when checking the Shopware version', async () => {
        const wrapper = await createWrapper({ version: '6.5.7.0-dev' });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(true);
    });

    it('keeps the banner hidden while the onboarding status is unknown', async () => {
        const wrapper = await createWrapper({ installed: true });

        expect(wrapper.find('.sw-payments-dashboard-promotion-card').exists()).toBe(false);
    });

    it('shows the activate button only when Shopware Payments is installed', async () => {
        const wrapperWithoutApp = await createWrapper();
        expect(wrapperWithoutApp.find('.sw-payments-dashboard-promotion-card__activate').exists()).toBe(false);

        const wrapperWithApp = await createWrapper({ installed: true });
        await setOnboardingStatus(false);

        expect(wrapperWithApp.find('.sw-payments-dashboard-promotion-card__activate').exists()).toBe(true);
    });

    it('routes to the Shopware Payments app overview when activating', async () => {
        const wrapper = await createWrapper({ installed: true });
        await setOnboardingStatus(false);

        await wrapper.find('.sw-payments-dashboard-promotion-card__activate').trigger('click');

        expect(router.push).toHaveBeenCalledWith({
            name: 'sw.extension.module',
            params: {
                appName: SHOPWARE_PAYMENTS_APP_NAME,
                moduleName: 'sw-shopware-payments-overview',
            },
        });
    });

    it('opens the external landing page when learning more', async () => {
        const wrapper = await createWrapper();

        await wrapper.find('.sw-payments-dashboard-promotion-card__learn-more').trigger('click');

        expect(global.window.open).toHaveBeenCalledWith(LEARN_MORE_URL, '_blank');
    });
});
