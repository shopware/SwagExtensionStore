import { createLocalVue, shallowMount } from '@vue/test-utils';
import { activateFeature12608 } from "../../../_helper/activate-feature-12608";
import 'SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index';
import 'SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail';
import ExtensionErrorService from 'src/module/sw-extension/service/extension-error.service';

const storePingMock = jest.fn(() => Promise.resolve({}));
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

function createWrapper() {
    const localVue = createLocalVue();

    return shallowMount(Shopware.Component.build('sw-extension-store-index'), {
        localVue,
        propsData: {},
        mocks: {
            $tc: v => v,
            $route: {
                name: 'sw.extension.store.listing.app',
                meta: {
                    $module: {}
                }
            }
        },
        stubs: {
            'sw-meteor-page': Shopware.Component.build('sw-meteor-page'),
            'sw-search-bar': {
                template: '<div class="sw-search-bar"></div>'
            },
            'sw-notification-center': true,
            'sw-meteor-navigation': true,
            'sw-loader': true,
            'sw-tabs': true,
            'router-view': true,
            'sw-extension-store-error-card': true,
            'sw-extension-store-update-warning': true
        },
        provide: {
            extensionStoreActionService: {
                getMyExtensions: myExtensionsMock
            },
            shopwareExtensionService: {
                updateExtensionData: jest.fn()
            },
            storeService: {
                ping: storePingMock
            },
            extensionErrorService: Shopware.Service('extensionErrorService'),
        }
    });
}

const setSearchValueMock = jest.fn();
describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index', () => {
    beforeAll(async () => {
        activateFeature12608();

        // import dependency async because the component is behind a feature flag prrior 6.4.8.0
        await import('src/app/component/meteor/sw-meteor-page');

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
        storePingMock.mockClear();
        setSearchValueMock.mockClear();
        myExtensionsMock.mockClear();
    });

    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
    });

    it('should commit the search value to the store', async () => {
        const wrapper = await createWrapper();

        expect(setSearchValueMock).toHaveBeenCalledTimes(1);
        expect(setSearchValueMock).toHaveBeenCalledWith(expect.anything(), {
            key: 'page',
            value: 1
        });

        const searchBar = wrapper.find('.sw-search-bar');
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
        await wrapper.vm.$nextTick();

        const filter = Shopware.State.get('shopwareExtensions').search.filter;

        expect(filter).toEqual({
            group: 'themes'
        });
    });

    it('should show error message when store is offline', async () => {
        // Reject store ping to simulate offline store
        storePingMock.mockImplementationOnce(() =>  Promise.reject());

        const wrapper = await createWrapper();

        expect(wrapper.find('sw-extension-store-error-card-stub').attributes().variant).toBe('danger');
        expect(wrapper.find('sw-extension-store-error-card-stub').attributes().title).toBe('sw-extension-store.offline.headline');
        expect(wrapper.find('sw-extension-store-error-card-stub').text()).toBe('sw-extension-store.offline.description');
    });

    it('should show update message when newer version is available', async () => {
        // Mock higher `latestVersion` to show update card
        myExtensionsMock.mockImplementationOnce(() =>  Promise.resolve([{
            name: 'SwagExtensionStore',
            latestVersion: '1.4.0',
            version: '1.3.0'
        }]));

        const wrapper = await createWrapper();

        // Wait for loader to disappear
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('sw-extension-store-update-warning-stub').exists()).toBe(true);
    });

    it('should show listing errors on listing errors event', async () => {
        const wrapper = await createWrapper();

        // Wait for loader to disappear
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

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
        await wrapper.get('router-view-stub').vm.$emit('extension-listing-errors', listingError);

        expect(wrapper.find('sw-extension-store-error-card-stub').attributes().title).toBe('Shopware version is unknown');
        expect(wrapper.find('sw-extension-store-error-card-stub').attributes().variant).toBe('danger');
        expect(wrapper.find('sw-extension-store-error-card-stub').text()).toBe('The given Shopware version is unknown, please contact our customer service');
    });
});
