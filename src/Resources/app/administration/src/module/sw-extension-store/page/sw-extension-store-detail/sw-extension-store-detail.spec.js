import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-extension-store-detail',
    () => import('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail')
);

const cacheApiService = {
    clear: jest.fn(() => Promise.resolve())
};

const extensionHelperService = {
    downloadAndActivateExtension: jest.fn(() => Promise.resolve())
};

async function createWrapper(extensionCustomProps = {}, canBeOpened = true) {
    const testExtension = {
        id: 1337,
        categories: [
            { details: { name: 'Productivity' } },
            { details: { name: 'Admin' } },
            { details: { name: 'Storefront' } }
        ],
        description: '<p>This is a really cool extension.</p>',
        label: 'B2B Suite',
        name: 'SwagB2BPlatform',
        producerName: 'shopware AG',
        shortDescription: 'Foo',
        type: 'plugin',
        updateSource: 'local',
        variants: [{}],
        languages: ['German', 'English'],
        storeLicense: { variants: [{}] },
        images: [],
        permissions: [],
        labels: [],
        faq: [],
        addons: [],
        ...extensionCustomProps
    };

    return mount(await Shopware.Component.build('sw-extension-store-detail'), {
        props: {
            id: 'a1b2c3'
        },
        global: {
            renderStubDefaultSlot: true,
            stubs: {
                'sw-meteor-page': await wrapTestComponent('sw-meteor-page'),
                'sw-search-bar': {
                    template: '<div class="sw-search-bar"></div>'
                },
                'sw-loader': true,
                'sw-extension-type-label': true,
                'sw-extension-store-slider': true,
                'sw-icon': true,
                'sw-meteor-card': true,
                'sw-button': await wrapTestComponent('sw-button'),
                'sw-button-group': true,
                'sw-context-button': true,
                'sw-context-menu-item': true,
                'sw-extension-ratings-card': true,
                'sw-button-process': await wrapTestComponent('sw-button-process'),
                'sw-alert': true,
                'sw-notification-center': true,
                'sw-meteor-navigation': true,
                'sw-help-center': true
            },
            provide: {
                shopwareExtensionService: {
                    updateExtensionData: jest.fn(),
                    isVariantDiscounted: jest.fn(),
                    orderVariantsByRecommendation: () => [],
                    getOpenLink: () => (canBeOpened ? 'open-link' : null)
                },
                extensionStoreDataService: {
                    getDetail: () => {
                        return testExtension;
                    }
                },
                extensionHelperService,
                cacheApiService
            }
        }
    });
}

const setSearchValueMock = jest.fn();
describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail', () => {
    const originalWindowLocation = window.location;

    beforeAll(async () => {
        Shopware.State.registerModule('shopwareExtensions', {
            namespaced: true,
            mutations: {
                setSearchValue: setSearchValueMock
            }
        });

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: jest.fn() }
        });
    });

    afterAll(() => {
        Object.defineProperty(window, 'location', { configurable: true, value: originalWindowLocation });
    });

    beforeEach(() => {
        Shopware.State.get('session').languageId = 'b2c3d4';
        Shopware.State.get('shopwareExtensions').myExtensions = {
            loading: false,
            data: [{
                active: true,
                name: 'SwagB2BPlatform',
                storeLicense: { variants: [{}] },
                id: 1337
            }]
        };

        setSearchValueMock.mockClear();
    });

    afterEach(() => {
        Shopware.State.get('session').languageId = '';
        Shopware.State.get('shopwareExtensions').myExtensions = { data: [], loading: false };
    });

    it('should show all extension category names', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm.extensionCategoryNames).toBe('Productivity, Admin, Storefront');
    });

    it('should render alert box when extension is an enterprise feature', async () => {
        Shopware.State.get('shopwareExtensions').myExtensions = {
            data: [{
                active: true,
                name: 'SwagB2BPlatform',
                storeLicense: false,
                id: 1337
            }]
        };

        const wrapper = await createWrapper({
            storeLicense: false,
            addons: ['SW6_EnterpriseFeature'],
            variants: []
        });
        await flushPromises();

        expect(wrapper.get('.sw-extension-store-detail__alert').text())
            .toBe('sw-extension-store.detail.enterpriseFeatureAlertText');
    });

    it('should clear cache and reload the administration when a plugin is installed', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        const installButton = await wrapper.get('.sw-extension-store-detail__action-install-extension');
        await installButton.trigger('click');
        await flushPromises();

        expect(extensionHelperService.downloadAndActivateExtension).toHaveBeenCalledTimes(1);
        expect(cacheApiService.clear).toHaveBeenCalledTimes(1);
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it('should reload the administration when an app is installed', async () => {
        const wrapper = await createWrapper({ type: 'app' });
        await flushPromises();

        const installButton = await wrapper.get('.sw-extension-store-detail__action-install-extension');
        await installButton.trigger('click');
        await flushPromises();

        expect(extensionHelperService.downloadAndActivateExtension).toHaveBeenCalledTimes(1);
        expect(cacheApiService.clear).not.toHaveBeenCalled();
        expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    describe('verify smart bar primary action buttons', () => {
        it('should render "add extension" button when extension is purchasable', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'TestExtension',
                    storeLicense: false,
                    id: 1337
                }]
            };

            const wrapper = await createWrapper({
                storeLicense: null
            });
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-add-extension').text())
                .toBe('sw-extension-store.detail.labelButtonAddExtension');
        });

        it('should render "install" button when extension is not installed but already licensed', async () => {
            const wrapper = await createWrapper();
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-install-extension').text())
                .toBe('sw-extension-store.detail.labelButtonInstallExtension');
        });

        it('should render "open" button when extension is installed and licensed', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: { variants: [{}] },
                    id: 1337,
                    installedAt: {
                        date: '2021-07-08 07:34:11.794000',
                        timezone: 'UTC',
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: '2021-07-08 07:34:11.794000',
                    timezone: 'UTC',
                    timezone_type: 3
                }
            });
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-open-extension').text())
                .toBe('sw-extension-store.detail.labelButtonOpenExtension');
        });

        /* eslint-disable-next-line max-len */
        it('should render "configuration" context menu when extension is installed, licensed and configurable', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: { variants: [{}] },
                    id: 1337,
                    configurable: true,
                    installedAt: {
                        date: '2021-07-08 07:34:11.794000',
                        timezone: 'UTC',
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: '2021-07-08 07:34:11.794000',
                    timezone: 'UTC',
                    timezone_type: 3
                }
            });
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-context').text())
                .toBe('sw-extension-store.detail.openConfiguration');
        });

        /* eslint-disable-next-line max-len */
        it('should render "configuration" button when extension is installed, licensed and configurable but can\'t be opened', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: { variants: [{}] },
                    configurable: true,
                    id: 1337,
                    installedAt: {
                        date: '2021-07-08 07:34:11.794000',
                        timezone: 'UTC',
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: '2021-07-08 07:34:11.794000',
                    timezone: 'UTC',
                    timezone_type: 3
                }
            }, false);
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-open-configuration').text())
                .toBe('sw-extension-store.detail.openConfiguration');
        });

        it('should render "contact us" button when extension is not licensed and has enterprise flag', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: null,
                    id: 1337
                }]
            };

            const wrapper = await createWrapper({
                storeLicense: null,
                addons: ['SW6_EnterpriseFeature'],
                variants: []
            });
            await flushPromises();

            expect(wrapper.get('.sw-extension-store-detail__action-enterprise-contact').text())
                .toBe('sw-extension-store.detail.enterpriseContactLinkText');
        });

        /* eslint-disable-next-line max-len */
        it('should not render any button when extension is not licensed, not purchasable and has no enterprise flag', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SomeOtherExtension',
                    storeLicense: { variants: [{}] },
                    id: 555
                }]
            };

            const wrapper = await createWrapper({
                storeLicense: null,
                variants: []
            });
            await flushPromises();

            expect(wrapper.find('.sw-extension-store-detail__action-add-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-open-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-install-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-enterprise-contact').exists()).toBe(false);
        });
    });
});
