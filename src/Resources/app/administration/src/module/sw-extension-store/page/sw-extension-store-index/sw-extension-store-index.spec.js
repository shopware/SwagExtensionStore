import { mount } from '@vue/test-utils';
import ExtensionErrorService from 'src/module/sw-extension/service/extension-error.service';
import 'src/app/component/meteor/sw-meteor-page';
import { reactive } from 'vue';

Shopware.Component.register(
    'sw-extension-store-index',
    () => import('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index')
);
Shopware.Component.register(
    'sw-extension-store-detail',
    () => import('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail')
);

const myExtensionsMock = jest.fn(() => Promise.resolve([{
    name: 'SwagExtensionStore',
    latestVersion: null,
    version: '1.3.0'
}]));

Shopware.Application.addServiceProvider('extensionErrorService', () => {
    return new ExtensionErrorService({}, {
        title: 'global.default.error',
        message: 'global.notification.unspecifiedSaveErrorMessage'
    });
});

async function createWrapper() {
    return mount(await Shopware.Component.build('sw-extension-store-index'), {
        props: {},
        global: {
            renderStubDefaultSlot: true,
            mocks: {
                $route: reactive({
                    name: 'sw.extension.store.listing.app',
                    meta: {
                        $module: {}
                    }
                })
            },
            stubs: {
                'sw-meteor-page': await wrapTestComponent('sw-meteor-page'),
                'sw-search-bar': {
                    template: '<div class="sw-search-bar"></div>'
                },
                'sw-notification-center': true,
                'sw-meteor-navigation': true,
                'sw-loader': true,
                'sw-tabs': true,
                'sw-tabs-item': true,
                'router-view': true,
                'sw-extension-store-error-card': true,
                'sw-extension-store-update-warning': true,
                'sw-help-center': true
            },
            provide: {
                extensionStoreActionService: {
                    getMyExtensions: myExtensionsMock
                },
                shopwareExtensionService: {
                    updateExtensionData: jest.fn()
                },
                extensionErrorService: Shopware.Service('extensionErrorService')
            }
        }
    });
}

const setSearchValueMock = jest.fn();
describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index', () => {
    beforeAll(async () => {
        Shopware.State.registerModule('shopwareExtensions', {
            namespaced: true,
            state: {
                search: {
                    filter: {}
                }
            },
            mutations: {
                setSearchValue: setSearchValueMock
            }
        });
    });

    beforeEach(async () => {
        Shopware.State.get('shopwareExtensions').search.filter = {};
        setSearchValueMock.mockClear();
        myExtensionsMock.mockClear();
    });

    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
    });

    it('should commit the search value to the store', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        expect(setSearchValueMock).toHaveBeenCalledTimes(1);
        expect(setSearchValueMock).toHaveBeenCalledWith(expect.anything(), {
            key: 'page',
            value: 1
        });

        const searchBar = wrapper.getComponent('.sw-search-bar');
        await searchBar.vm.$emit('search', 'Nice theme');

        expect(setSearchValueMock).toHaveBeenCalledWith(expect.anything(), {
            key: 'term',
            value: 'Nice theme'
        });
    });

    it('should filter to only app extensions', async () => {
        await createWrapper();

        const filter = Shopware.State.get('shopwareExtensions').search.filter;

        expect(filter).toEqual({
            group: 'apps'
        });
    });

    it('should filter to only theme extensions', async () => {
        const wrapper = await createWrapper();

        wrapper.vm.$route.name = 'sw.extension.store.listing.theme';
        await flushPromises();

        const filter = Shopware.State.get('shopwareExtensions').search.filter;

        expect(filter).toEqual({
            group: 'themes'
        });
    });

    it('should show update message when newer version is available', async () => {
        // Mock higher `latestVersion` to show update card
        myExtensionsMock.mockImplementationOnce(() => Promise.resolve([{
            name: 'SwagExtensionStore',
            latestVersion: '1.4.0',
            version: '1.3.0'
        }]));

        const wrapper = await createWrapper();

        // Wait for loader to disappear
        await flushPromises();

        expect(wrapper.get('sw-extension-store-update-warning-stub').exists()).toBe(true);
    });

    it('should show listing errors on listing errors event', async () => {
        const wrapper = await createWrapper();

        // Wait for loader to disappear
        await flushPromises();

        // Mock listing error response
        const listingError = new Error();
        listingError.response = {
            data: {
                errors: [
                    {
                        code: 'FRAMEWORK__STORE_ERROR',
                        detail: 'The given Shopware version is unknown, please contact our customer service',
                        meta: {
                            documentationLink: 'https://docs.shopware.com'
                        },
                        status: '500',
                        title: 'Shopware version is unknown'
                    }
                ]
            }
        };

        // Emit listing error on router view
        await wrapper.getComponent('router-view-stub').vm.$emit('extension-listing-errors', listingError);

        expect(wrapper.get('sw-extension-store-error-card-stub').attributes().title)
            .toBe('Shopware version is unknown');

        expect(wrapper.get('sw-extension-store-error-card-stub').attributes().variant)
            .toBe('danger');

        expect(wrapper.get('sw-extension-store-error-card-stub').text())
            .toBe('The given Shopware version is unknown, please contact our customer service');
    });
});
