import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import vuei18n from 'vue-i18n';

/* service */
import 'src/module/sw-extension/service';
import LicenseViolationsService from 'src/app/service/license-violations.service';
import ExtensionStoreDataService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-data.service';
import ExtensionLicenseService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-licenses.service';

/* stores */
import extensionStore from 'src/module/sw-extension/store/extensions.store';

/* mixin */
import 'src/module/sw-extension/mixin/sw-extension-error.mixin';

/* components */
import 'src/app/component/base/sw-alert';
import 'src/app/component/base/sw-button';
import 'src/app/component/form/field-base/sw-base-field';
import 'src/app/component/form/field-base/sw-field-error';
import 'src/app/component/form/sw-checkbox-field';
import 'src/app/component/form/sw-gtc-checkbox';

Shopware.Component.register(
    'sw-extension-buy-modal',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-buy-modal')
);

Shopware.Application.addServiceProvider('extensionStoreDataService', () => {
    return new ExtensionStoreDataService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.Application.addServiceProvider('extensionStoreLicensesService', () => {
    return new ExtensionLicenseService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.Application.addServiceProvider('licenseViolationService', () => {
    return LicenseViolationsService(Shopware.Application.getContainer('service').storeService);
});

Shopware.Application.addServiceProvider('appModulesService', () => {
    return {
        fetchAppModules: jest.fn()
    };
});

Shopware.Application.addServiceProvider('storeService', () => {
    return {
        checkLogin: () => Promise.resolve({
            // keep for older shopware versions
            storeTokenExists: true,
            userInfo: { shopwareId: 1, email: 'user@shopware.com' }
        })
    };
});

Shopware.Application.addServiceProvider('loginService', () => {
    return {
        getToken: jest.fn(() => Promise.resolve({ access: true, refresh: true }))
    };
});

const httpClient = {
    post: jest.fn(),
    get: jest.fn()
};

Shopware.Application.getContainer('init').httpClient = httpClient;

Shopware.State.registerModule('shopwareExtensions', extensionStore);

describe('src/module/sw-extension/component/sw-extension-buy-modal', () => {
    let wrapper;

    afterEach(async () => {
        await flushPromises();
        if (wrapper) wrapper.destroy();
    });

    beforeEach(() => {
        httpClient.get.mockImplementation(() => {
            return Promise.resolve();
        });
    });

    function provideTestExtension(overrides) {
        return {
            name: 'test-app',
            label: 'Test app',
            permissions: {},
            variants: [],
            ...overrides
        };
    }

    async function createWrapper(overrides) {
        const localVue = createLocalVue();
        localVue.use(vuei18n);
        localVue.mixin(Shopware.Mixin.getByName('sw-extension-error'));

        const localWrapper = mount(await Shopware.Component.build('sw-extension-buy-modal'), {
            localVue,
            propsData: {
                extension: provideTestExtension(overrides)
            },
            provide: {
                shopwareExtensionService: Shopware.Service('shopwareExtensionService'),
                extensionStoreLicensesService: Shopware.Service('extensionStoreLicensesService')
            },
            stubs: {
                'sw-modal': {
                    template: `<div class="sw-modal">
                                   <slot name="default"></slot>
                                   <slot name="footer"></slot>
                               </div>`
                },
                'sw-alert': await Shopware.Component.build('sw-alert'),
                'sw-button': await Shopware.Component.build('sw-button'),
                'sw-base-field': await Shopware.Component.build('sw-base-field'),
                'sw-field-error': await Shopware.Component.build('sw-field-error'),
                'sw-checkbox-field': await Shopware.Component.build('sw-checkbox-field'),
                'sw-gtc-checkbox': await Shopware.Component.build('sw-gtc-checkbox'),
                'sw-extension-adding-failed': true,
                'sw-extension-adding-success': true,
                'sw-icon': true,
                'sw-loader': true,
                'sw-extension-permissions-modal': true,
                'sw-extension-privacy-policy-extensions-modal': true,
                'sw-external-link': true,
                'sw-extension-icon-polyfill': true
            },
            mocks: {
                $tc: (key) => key,
                $t: (key) => key,
                $sanitize: key => key
            }
        });

        Shopware.Application.getApplicationRoot = () => { return localWrapper.vm; };

        return localWrapper;
    }

    it('does not show permissions and privacy checkbox if extension has not entries', async () => {
        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        });

        expect(wrapper.find('.sw-extension-buy-modal__checkbox-permissions--test-app').exists()).toBe(false);
        expect(wrapper.find('.sw-extension-buy-modal__checkbox-privacy-policy--test-app').exists()).toBe(false);
    });

    it('opens and closes permission modal correctly', async () => {
        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],
            permissions: {
                product: [{
                    entity: 'product',
                    operation: 'read'
                }]
            }
        });

        await wrapper.get('.sw-extension-buy-modal__checkbox-permissions--test-app .permissions-modal-trigger')
            .trigger('click');

        await wrapper.get('sw-extension-permissions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-permissions-modal-stub').exists()).toBe(false);
    });

    it('opens and closes modal for privacy adjustments', async () => {
        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],
            privacyPolicyExtension: 'Don\'t talk about the fight club!'
        });

        await wrapper.get('.sw-extension-buy-modal__checkbox-privacy-policy--test-app .privacy-policy-modal-trigger')
            .trigger('click');

        await wrapper.get('sw-extension-privacy-policy-extensions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-privacy-policy-extensions-modal-stub').exists()).toBe(false);
    });

    it('should show app provider legal text checkbox and modal for on-premise plugins without permissions', async () => {
        Shopware.State.commit('shopwareExtensions/setUserInfo', { email: 'j.doe@shopware.com' });

        // Mock request which creates and returns a new cart item
        httpClient.post.mockImplementation((route) => {
            if (route === '/_action/extension-store/cart/new') {
                return Promise.resolve({
                    data: {
                        bookingShop: {},
                        grossPrice: 0,
                        licenseShop: {},
                        legalText: '<p>Sub processor text</p>'
                    }
                });
            }

            return Promise.resolve();
        });

        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],
            type: 'plugin'
        });

        // Check gtc checkbox to re-evaluate computed `userCanBuyFromStore`
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);
        await wrapper.vm.$nextTick();

        await flushPromises();

        // App provider checkbox should exist
        expect(wrapper.find('.sw-extension-buy-modal__checkbox-app-provider').exists()).toBeTruthy();

        // Open app provider details via link
        await wrapper.get('.sw-extension-buy-modal__checkbox-app-provider--test-app .legal-text-modal-trigger')
            .trigger('click');

        // Expect app provider detail modal to be present with correct legal text
        expect(wrapper.find('.sw-extension-buy-modal__legal-text-modal').exists()).toBeTruthy();
        expect(wrapper.find('.sw-extension-buy-modal__legal-text-modal').text()).toBe('Sub processor text');

        // Close the app provider detail modal again
        await wrapper.get('.sw-extension-buy-modal__legal-text-modal').vm.$emit('modal-close');

        // Expect app provider detail modal to be removed
        expect(wrapper.find('.sw-extension-buy-modal__legal-text-modal').exists()).toBeFalsy();
    });

    it('shows failed status if extensions could not be bought', async () => {
        httpClient.post.mockImplementation((route) => {
            if (route === '/_action/extension-store/cart/order') {
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject({
                    response: { data: { errors: [] } }
                });
            }

            if (route === '/_action/extension/refresh') {
                return Promise.resolve({
                    data: []
                });
            }

            return Promise.resolve();
        });
        httpClient.get.mockImplementation((route) => {
            if (route === '/_action/extension/installed') {
                return Promise.resolve({
                    data: []
                });
            }
            return Promise.resolve();
        });

        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        });

        await flushPromises();

        // check gtc checkbox
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);
        await wrapper.vm.$nextTick();

        const buyButton = wrapper.find('button.sw-button--primary');

        expect(buyButton.attributes().disabled).toBeFalsy();
        buyButton.trigger('click');

        await flushPromises();

        expect(httpClient.get).toBeCalledWith('/_action/extension/installed', {
            headers: expect.objectContaining({
                Accept: expect.anything(),
                Authorization: expect.anything(),
                'Content-Type': 'application/json'
            }),
            version: expect.anything()
        });

        await wrapper.get('sw-extension-adding-failed-stub').vm.$emit('close');

        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });

    it('shows success status if extensions was installed successfully', async () => {
        httpClient.post.mockImplementation((route) => {
            if (route === '/_action/extension-store/purchase') {
                return Promise.resolve();
            }

            if (route === '/_action/extension/refresh') {
                return Promise.resolve({
                    data: []
                });
            }

            return Promise.resolve();
        });

        httpClient.get.mockImplementation((route) => {
            if (route === '/_action/extension/installed') {
                return Promise.resolve({
                    data: []
                });
            }

            return Promise.resolve();
        });

        wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        });

        await flushPromises();

        // check gtc checkbox
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);

        const buyButton = wrapper.find('button.sw-button--primary');

        expect(buyButton.attributes().disabled).toBeFalsy();
        buyButton.trigger('click');

        await flushPromises();

        expect(httpClient.get).toBeCalledWith('/_action/extension/installed', {
            headers: expect.objectContaining({
                Accept: expect.anything(),
                Authorization: expect.anything(),
                'Content-Type': 'application/json'
            }),
            version: expect.anything()
        });

        await wrapper.get('sw-extension-adding-success-stub').vm.$emit('close');

        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });
});
