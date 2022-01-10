import { createLocalVue, shallowMount } from '@vue/test-utils';
import { activateFeature12608 } from "../../../_helper/activate-feature-12608";
import 'SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail';

function createWrapper(extensionCustomProps = {}, canBeOpened = true) {
    const localVue = createLocalVue();
    localVue.filter('date', v => v);

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
    }

    return shallowMount(Shopware.Component.build('sw-extension-store-detail'), {
        localVue,
        propsData: {
            id: 'a1b2c3'
        },
        mocks: {
            $tc: v => v,
            $route: {
                hash: '',
                meta: {}
            }
        },
        stubs: {
            'sw-meteor-page': Shopware.Component.build('sw-meteor-page'),
            'sw-search-bar': {
                template: '<div class="sw-search-bar"></div>'
            },
            'sw-loader': true,
            'sw-extension-type-label': true,
            'sw-extension-store-slider': true,
            'sw-icon': true,
            'sw-meteor-card': true,
            'sw-button': true,
            'sw-button-group': true,
            'sw-context-button': true,
            'sw-context-menu-item': true,
            'sw-extension-ratings-card': true,
            'sw-button-process': true,
            'sw-alert': true,
            'sw-notification-center': true,
            'sw-meteor-navigation': true
        },
        provide: {
            shopwareExtensionService: {
                updateExtensionData: jest.fn(),
                isVariantDiscounted: jest.fn(),
                orderVariantsByRecommendation: () => [],
                canBeOpened: () => canBeOpened,
                getOpenLink: () => null
            },
            extensionStoreDataService: {
                getDetail: () => {
                    return testExtension
                }
            },
            extensionHelperService: {}
        }
    });
}

const setSearchValueMock = jest.fn();
describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-detail', () => {
    beforeAll(async () => {
        activateFeature12608();

        // import dependency async because the component is behind a feature flag prrior 6.4.8.0
        await import('src/app/component/meteor/sw-meteor-page');

        Shopware.State.registerModule('shopwareExtensions', {
            namespaced: true,
            mutations: {
                setSearchValue: setSearchValueMock
            }
        });
    });

    beforeEach(() => {
        Shopware.State.get('session').languageId = 'b2c3d4';
        Shopware.State.get('shopwareExtensions').myExtensions = {
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
        Shopware.State.get('shopwareExtensions').myExtensions = null;
    });

    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
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
            variants: [],
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find('.sw-extension-store-detail__alert').text())
            .toBe('sw-extension-store.detail.enterpriseFeatureAlertText');
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

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-add-extension').text())
                .toBe('sw-extension-store.detail.labelButtonAddExtension');
        });

        it('should render "install" button when extension is not installed but already licensed', async () => {
            const wrapper = await createWrapper();

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-install-extension').text())
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
                        date: "2021-07-08 07:34:11.794000",
                        timezone: "UTC",
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: "2021-07-08 07:34:11.794000",
                    timezone: "UTC",
                    timezone_type: 3
                }
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-open-extension').text())
                .toBe('sw-extension-store.detail.labelButtonOpenExtension');
        });

        it('should render "configuration" context menu when extension is installed, licensed and configurable', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: { variants: [{}] },
                    id: 1337,
                    configurable: true,
                    installedAt: {
                        date: "2021-07-08 07:34:11.794000",
                        timezone: "UTC",
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: "2021-07-08 07:34:11.794000",
                    timezone: "UTC",
                    timezone_type: 3
                }
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-context').text())
                .toBe('sw-extension-store.detail.openConfiguration');
        });

        it('should render "configuration" button when extension is installed, licensed and configurable but can\'t be opened', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'SwagB2BPlatform',
                    storeLicense: { variants: [{}] },
                    configurable: true,
                    id: 1337,
                    installedAt: {
                        date: "2021-07-08 07:34:11.794000",
                        timezone: "UTC",
                        timezone_type: 3
                    }
                }]
            };

            const wrapper = await createWrapper({
                installedAt: {
                    date: "2021-07-08 07:34:11.794000",
                    timezone: "UTC",
                    timezone_type: 3
                }
            }, false);

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-open-configuration').text())
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
                variants: [],
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-enterprise-contact').text())
                .toBe('sw-extension-store.detail.enterpriseContactLinkText');
        });

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

            await wrapper.vm.$nextTick();

            expect(wrapper.find('.sw-extension-store-detail__action-add-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-open-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-install-extension').exists()).toBe(false);
            expect(wrapper.find('.sw-extension-store-detail__action-enterprise-contact').exists()).toBe(false);
        });
    });
});
