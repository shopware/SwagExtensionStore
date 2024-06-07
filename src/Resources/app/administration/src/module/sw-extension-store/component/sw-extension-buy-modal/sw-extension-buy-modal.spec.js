import { mount } from '@vue/test-utils';

/* service */
import 'src/module/sw-extension/service';
import ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import ShopwareDiscountCampaignService from 'src/app/service/discount-campaign.service';
import StoreApiService from 'src/core/service/api/store.api.service';
import ExtensionStoreLicensesService from
    'SwagExtensionStore/module/sw-extension-store/service/extension-store-licenses.service';

/* stores */
import extensionStore from 'src/module/sw-extension/store/extensions.store';

/* mixin */
import 'src/module/sw-extension/mixin/sw-extension-error.mixin';

Shopware.Component.register(
    'sw-extension-buy-modal',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-buy-modal')
);

Shopware.State.registerModule('shopwareExtensions', extensionStore);

describe('src/module/sw-extension/component/sw-extension-buy-modal', () => {
    function provideTestExtension(overrides) {
        return {
            name: 'test-app',
            label: 'Test app',
            permissions: {},
            variants: [],
            ...overrides
        };
    }

    async function createWrapper(overrides, httpClient = null) {
        const loginService = {
            getToken: () => Promise.resolve({ access: true, refresh: true })
        };

        httpClient = httpClient ?? {
            post: jest.fn(),
            get: jest.fn(() => Promise.resolve())
        };

        const shopwareExtensionService = new ShopwareExtensionService(
            { fetchAppModules() { return Promise.resolve(); } },
            new ExtensionStoreActionService(httpClient, loginService),
            new ShopwareDiscountCampaignService(),
            new StoreApiService(httpClient, loginService)
        );

        const extensionStoreLicensesService = new ExtensionStoreLicensesService(httpClient, loginService);

        const wrapper = mount(await Shopware.Component.build('sw-extension-buy-modal'), {
            props: {
                extension: provideTestExtension(overrides)
            },
            global: {
                renderStubDefaultSlot: true,
                mixins: [
                    Shopware.Mixin.getByName('sw-extension-error')
                ],
                provide: {
                    shopwareExtensionService,
                    extensionStoreLicensesService
                },
                stubs: {
                    'sw-modal': {
                        template: `<div class="sw-modal">
                                   <slot name="default"></slot>
                                   <slot name="footer"></slot>
                               </div>`
                    },
                    'sw-alert': await wrapTestComponent('sw-alert', { sync: true }),
                    'sw-button': await wrapTestComponent('sw-button'),
                    'sw-button-deprecated': await wrapTestComponent('sw-button-deprecated'),
                    'sw-base-field': await wrapTestComponent('sw-base-field', { sync: true }),
                    'sw-field-error': await wrapTestComponent('sw-field-error', { sync: true }),
                    'sw-checkbox-field': await wrapTestComponent('sw-checkbox-field', { sync: true }),
                    'sw-checkbox-field-deprecated': await wrapTestComponent('sw-checkbox-field-deprecated', { sync: true }),
                    'sw-gtc-checkbox': await wrapTestComponent('sw-gtc-checkbox', { sync: true }),
                    'sw-extension-adding-failed': true,
                    'sw-extension-adding-success': true,
                    'sw-icon': true,
                    'sw-loader': true,
                    'sw-extension-permissions-modal': true,
                    'sw-extension-privacy-policy-extensions-modal': true,
                    'sw-external-link': true
                }
            }
        });

        Shopware.Application.getApplicationRoot = () => { return wrapper.vm; };

        return wrapper;
    }

    it('does not show permissions and privacy checkbox if extension has not entries', async () => {
        const wrapper = await createWrapper({
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
        const wrapper = await createWrapper({
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
        await flushPromises();

        await wrapper.get('.sw-extension-buy-modal__checkbox-permissions--test-app .permissions-modal-trigger')
            .trigger('click');

        await wrapper.getComponent('sw-extension-permissions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-permissions-modal-stub').exists()).toBe(false);
    });

    it('opens and closes modal for privacy adjustments', async () => {
        const wrapper = await createWrapper({
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

        await wrapper.getComponent('sw-extension-privacy-policy-extensions-modal-stub').vm.$emit('modal-close');

        expect(wrapper.find('sw-extension-privacy-policy-extensions-modal-stub').exists()).toBe(false);
    });

    it('should show app provider legal text checkbox and modal for on-premise plugins without permissions', async () => {
        const httpClient = {
            get: () => Promise.resolve(),
            post: (route) => {
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

                if (route === '/_action/store/checklogin') {
                    return Promise.resolve({
                        data: {
                            userInfo: { email: 'j.doe@shopware.com' }
                        }
                    });
                }

                return Promise.resolve();
            }
        };

        const wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],
            type: 'plugin'
        }, httpClient);

        // Check gtc checkbox to re-evaluate computed `userCanBuyFromStore`
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);
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
        await wrapper.getComponent('.sw-extension-buy-modal__legal-text-modal').vm.$emit('modal-close');

        // Expect app provider detail modal to be removed
        expect(wrapper.find('.sw-extension-buy-modal__legal-text-modal').exists()).toBeFalsy();
    });

    it('shows failed status if extensions could not be bought', async () => {
        const httpClient = {
            get: jest.fn((route) => {
                if (route === '/_action/extension/installed') {
                    return Promise.resolve({
                        data: []
                    });
                }
                return Promise.resolve();
            }),
            post: (route) => {
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

                if (route === '/_action/store/checklogin') {
                    return Promise.resolve({
                        data: {
                            userInfo: { email: 'j.doe@shopware.com' }
                        }
                    });
                }

                return Promise.resolve();
            }
        };

        const wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        }, httpClient);
        await flushPromises();

        // check gtc checkbox
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);
        await flushPromises();

        const buyButton = wrapper.findComponent('button.sw-button--primary');

        expect(buyButton.attributes('disabled')).toBeUndefined();
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

        await wrapper.getComponent('sw-extension-adding-failed-stub').trigger('close');

        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });

    it('shows success status if extensions was installed successfully', async () => {
        const httpClient = {
            get: jest.fn((route) => {
                if (route === '/_action/extension/installed') {
                    return Promise.resolve({
                        data: []
                    });
                }

                return Promise.resolve();
            }),
            post: (route) => {
                if (route === '/_action/extension-store/purchase') {
                    return Promise.resolve();
                }

                if (route === '/_action/extension/refresh') {
                    return Promise.resolve({
                        data: []
                    });
                }

                if (route === '/_action/store/checklogin') {
                    return Promise.resolve({
                        data: {
                            userInfo: { email: 'j.doe@shopware.com' }
                        }
                    });
                }

                return Promise.resolve();
            }
        };

        const wrapper = await createWrapper({
            variants: [{
                id: 78674,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }]
        }, httpClient);
        await flushPromises();

        // check gtc checkbox
        await wrapper.get('.sw-gtc-checkbox input').setChecked(true);

        const buyButton = wrapper.findComponent('button.sw-button--primary');

        expect(buyButton.attributes('disabled')).toBeUndefined();
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

        await wrapper.getComponent('sw-extension-adding-success-stub').trigger('close');

        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });
});
