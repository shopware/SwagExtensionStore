import { flushPromises, mount } from '@vue/test-utils';

import 'src/app/store/in-app-purchase-checkout.store';

Shopware.Component.register(
    'sw-in-app-purchase-checkout',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout')
);

async function createWrapper(error = false) {
    const store = Shopware.Store.get('inAppPurchaseCheckout');

    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout'), {
        global: {
            provide: {
                store,
                inAppPurchasesService: {
                    getExtension: () => {
                        if (error) {
                            return Promise.reject(new Error('Test error'));
                        }
                        return Promise.resolve({
                            name: 'test-extension',
                            icon: 'test-icon',
                            iconRaw: 'test-icon-raw'
                        });
                    },
                    createCart: () => {
                        return Promise.resolve({
                            netPrice: 50.0,
                            grossPrice: 59.5,
                            taxRate: 19,
                            taxValue: 9.5,
                            positions: [{
                                priceModel: 'yearly',
                                feature: 'random-feature'
                            }]
                        });
                    },
                    orderCart: () => {
                        return Promise.resolve({
                            identifier: 'test-identifier',
                            name: 'test-name',
                            description: null,
                            price: 59.5
                        });
                    },
                    refreshInAppPurchases: () => {
                        return Promise.resolve();
                    }
                }
            },
            stubs: {
                'sw-modal': {
                    template: `<div class="sw-modal">
                               <slot name="default"></slot>
                           </div>`
                },
                'sw-alert': true,
                'sw-button': true,
                'sw-loader': true
            }
        }
    });
}

describe('src/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout', () => {
    let wrapper = null;

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('subscribes to store and calls requestFeature on createdComponent', async () => {
        const spy = jest.spyOn(wrapper.vm, 'requestFeature');
        wrapper.vm.createdComponent();

        // Simulate a state change in the store
        Shopware.State.commit('extensions/addExtension', {
            name: 'jestapp',
            baseUrl: '',
            permissions: [],
            version: '1.0.0',
            type: 'app',
            integrationId: '123',
            active: true
        });
        wrapper.vm.store.$reset();

        expect(spy).toHaveBeenCalled();
        wrapper.vm.reset();
    });

    it('handles requestFeature method correctly', async () => {
        Shopware.Context.app.config.bundles = {
            jestapp: {
                name: 'jestapp',
                baseUrl: '',
                permissions: [],
                version: '1.0.0',
                type: 'app',
                integrationId: '123',
                active: true
            }
        };

        wrapper.vm.store.request({ featureId: 'your-feature-id' }, 'jestapp');
        wrapper.vm.requestFeature();
        expect(wrapper.vm.state).toBe('loading');

        await flushPromises();
        expect(wrapper.vm.state).toBe('purchase');
        wrapper.vm.store.$reset();
        wrapper.vm.reset();
    });

    it('catches requestFeature error correctly', async () => {
        Shopware.Utils.debug.error = jest.fn();

        wrapper = await createWrapper(true);
        Shopware.Context.app.config.bundles = {
            jestapp: {
                name: 'jestapp',
                baseUrl: '',
                permissions: [],
                version: '1.0.0',
                type: 'app',
                integrationId: '123',
                active: true
            }
        };
        wrapper.vm.store.request({ featureId: 'your-feature-id' }, 'jestapp');

        wrapper.vm.requestFeature();
        expect(wrapper.vm.state).toBe('loading');

        await flushPromises();
        expect(wrapper.vm.state).toBe('error');
        wrapper.vm.store.$reset();
        wrapper.vm.reset();
    });

    it('does not call orderCart when entry or extension not set', async () => {
        const spy = jest.spyOn(wrapper.vm.inAppPurchasesService, 'orderCart');

        Shopware.Context.app.config.bundles = {
            jestapp: {
                name: 'jestapp',
                baseUrl: '',
                permissions: [],
                version: '1.0.0',
                type: 'app',
                integrationId: '123',
                active: true
            }
        };
        wrapper.vm.store.request(null, 'jestapp');

        wrapper.vm.onPurchaseFeature();
        expect(spy).toHaveBeenCalledTimes(0);
        wrapper.vm.store.$reset();
    });

    it('handles onPurchaseFeature method correctly', async () => {
        const spy = jest.spyOn(wrapper.vm.inAppPurchasesService, 'orderCart');

        Shopware.Context.app.config.bundles = {
            jestapp: {
                name: 'jestapp',
                baseUrl: '',
                permissions: [],
                version: '1.0.0',
                type: 'app',
                integrationId: '123',
                active: true
            }
        };

        wrapper.vm.store.request({ featureId: 'your-feature-id' }, 'jestapp');
        await flushPromises();

        wrapper.vm.onPurchaseFeature();
        expect(wrapper.vm.state).toBe('purchase');

        await flushPromises();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.state).toBe('success');
        wrapper.vm.store.$reset();
        wrapper.vm.reset();
    });

    it('catches onPurchaseFeature error correctly', async () => {
        Shopware.Utils.debug.error = jest.fn();

        wrapper = await createWrapper(true);

        Shopware.Context.app.config.bundles = {
            jestapp: {
                name: 'jestapp',
                baseUrl: '',
                permissions: [],
                version: '1.0.0',
                type: 'app',
                integrationId: '123',
                active: true
            }
        };
        wrapper.vm.store.request({ featureId: 'your-feature-id' }, 'jestapp');

        wrapper.vm.onPurchaseFeature();
        expect(wrapper.vm.state).toBe('loading');

        await flushPromises();
        expect(wrapper.vm.state).toBe('error');
        wrapper.vm.store.$reset();
        wrapper.vm.reset();
    });

    it('handles handleStateActions method correctly', async () => {
        delete window.location;
        window.location = {
            reload: jest.fn()
        };

        const spyOnPurchaseFeature = jest.spyOn(wrapper.vm, 'onPurchaseFeature');
        const spyReset = jest.spyOn(wrapper.vm, 'reset');
        const spyRequestFeature = jest.spyOn(wrapper.vm, 'requestFeature');

        const testHandleStateActions = (state, action, spy, expectedCalls) => {
            wrapper.vm.state = state;
            wrapper.vm.handleStateActions(action);
            expect(spy).toHaveBeenCalledTimes(expectedCalls);
            expect(spyReset).toHaveBeenCalledTimes(1);
            spy.mockReset();
            spyReset.mockReset();
        };

        testHandleStateActions('purchase', true, spyOnPurchaseFeature, 1);
        testHandleStateActions('purchase', false, spyOnPurchaseFeature, 0);
        testHandleStateActions('error', true, spyRequestFeature, 1);
        testHandleStateActions('error', false, spyRequestFeature, 0);

        wrapper.vm.state = 'success';
        wrapper.vm.handleStateActions(false);
        await flushPromises();
        expect(window.location.reload).toHaveBeenCalledTimes(1);
        expect(spyReset).toHaveBeenCalledTimes(1);
        spyReset.mockReset();

        wrapper.vm.handleStateActions(true);
        await flushPromises();
        expect(window.location.reload).toHaveBeenCalledTimes(2);
        expect(spyReset).toHaveBeenCalledTimes(1);
        spyReset.mockReset();

        wrapper.vm.state = 'random';
        wrapper.vm.handleStateActions(true);
        expect(spyReset).toHaveBeenCalledTimes(1);
        spyReset.mockReset();
        wrapper.vm.handleStateActions(true);
        expect(spyReset).toHaveBeenCalledTimes(1);
        spyReset.mockReset();
        wrapper.vm.reset();
    });

    it('resets the component state correctly', async () => {
        const spyDismiss = jest.spyOn(wrapper.vm.store, 'dismiss');

        wrapper.vm.reset();
        expect(spyDismiss).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.inAppPurchaseCart).toBeNull();
        expect(wrapper.vm.extension).toBeNull();
        expect(wrapper.vm.errorSnippet).toBeNull();
        expect(wrapper.vm.state).toBe('loading');
    });

    it('returns the correct asset filter', () => {
        const assetFilter = wrapper.vm.assetFilter;
        expect(assetFilter).toBeDefined();
        expect(typeof assetFilter).toBe('function');
    });

    it('returns the extension icon correctly', async () => {
        // Test when extension has an icon
        wrapper.setData({
            extension: {
                icon: 'icon-url'
            }
        });
        expect(wrapper.vm.extensionIcon).toBe('icon-url');

        // Test when extension has a raw icon
        wrapper.setData({
            extension: {
                icon: '',
                iconRaw: 'base64data'
            }
        });
        expect(wrapper.vm.extensionIcon).toBe('data:image/png;base64, base64data');

        // Test when extension has no icon
        wrapper.setData({
            extension: {
                icon: '',
                iconRaw: ''
            }
        });
        expect(wrapper.vm.extensionIcon).toBe('administration/static/img/theme/default_theme_preview.jpg');
    });

    it('refreshes after a successful purchase', async () => {
        const spyRefresh = jest.spyOn(wrapper.vm.inAppPurchasesService, 'refreshInAppPurchases');

        wrapper.vm.state = 'success';
        wrapper.vm.handleStateActions(true);
        expect(spyRefresh).toHaveBeenCalledTimes(1);
    });
});
