import { mount, createLocalVue } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import vuei18n from 'vue-i18n';

/* service */
import 'src/module/sw-extension/service';
import LicenseViolationsService from 'src/app/service/license-violations.service';
import LicenseViolationStore from 'src/app/state/license-violation.store';

/* components */
import 'src/app/component/base/sw-alert';
import 'src/app/component/base/sw-button';
import 'src/app/component/form/field-base/sw-base-field';
import 'src/app/component/form/field-base/sw-field-error';
import 'src/app/component/form/sw-checkbox-field';
import 'src/app/component/form/sw-gtc-checkbox';
import 'SwagExtensionStore/module/sw-extension-store/component/sw-extension-buy-modal';
import ExtensionStoreDataService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-data.service';
import ExtensionLicenseService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-licenses.service';

/* stores */
import extensionStore from 'src/module/sw-extension/store/extensions.store';

/* mixin */
import extensionErrorMixin from 'src/module/sw-extension/mixin/sw-extension-error.mixin';

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

Shopware.State.registerModule('licenseViolation', LicenseViolationStore);


Shopware.Application.addServiceProvider('appModulesService', () => {
    return {
        fetchAppModules: jest.fn()
    };
});

Shopware.Application.addServiceProvider('storeService', () => {
    return {
        checkLogin: () => Promise.resolve({ storeTokenExists: true })
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
        httpClient.get.mockImplementation((route) => {
            return Promise.resolve();
        });
    })

    function provideTestExtension(overrides) {
        return Object.assign({
            name: 'test-app',
            label: 'Test app',
            permissions: {},
            variants: []
        }, overrides);
    }

    function createWrapper(overrides) {
        const localVue = createLocalVue();
        localVue.use(vuei18n);
        localVue.mixin(extensionErrorMixin);

        return mount(Shopware.Component.build('sw-extension-buy-modal'), {
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
                'sw-alert': Shopware.Component.build('sw-alert'),
                'sw-button': Shopware.Component.build('sw-button'),
                'sw-base-field': Shopware.Component.build('sw-base-field'),
                'sw-field-error': Shopware.Component.build('sw-field-error'),
                'sw-checkbox-field': Shopware.Component.build('sw-checkbox-field'),
                'sw-gtc-checkbox': Shopware.Component.build('sw-gtc-checkbox'),
                'sw-extension-adding-failed': true,
                'sw-extension-adding-success': true,
                'sw-icon': true,
                'sw-loader': true,
                'sw-extension-permissions-modal': true,
                'sw-extension-privacy-policy-extensions-modal': true
            },
            mocks: {
                $tc: (key) => key
            }
        });
    }

    it('does not show permissions and privacy checkbox if extension has not entries', () => {
        wrapper = createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        });

        expect(wrapper.find('input[name="permissions-checkbox--test-app"]').exists()).toBe(false);
        expect(wrapper.find('input[name="privacy-extensions-checkbox--test-app"]').exists()).toBe(false);
    });

    it('opens and closes permission modal correctly', async () => {
        wrapper = createWrapper({
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

        await wrapper.get('label[for="permissions-checkbox--test-app"] + button').trigger('click');
        await wrapper.get('sw-extension-permissions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-permissions-modal-stub').exists()).toBe(false);
    });

    it('opens and closes modal for privacy adjustments', async () => {
        wrapper = createWrapper({
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

        await wrapper.get('label[for="privacy-extensions-checkbox--test-app"] + button').trigger('click');
        await wrapper.get('sw-extension-privacy-policy-extensions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-privacy-policy-extensions-modal-stub').exists()).toBe(false);
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
