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

async function createWrapper(extensionCustomProps = {}, canBeOpened = true, inAppPurchases = true) {
    const testExtension = {
        id: 1337,
        categories: [
            { details: { name: 'Productivity' } },
            { details: { name: 'Admin' } },
            { details: { name: 'Storefront' } }
        ],
        description: '<p>This is a really cool extension.</p>',
        inAppFeaturesAvailable: inAppPurchases,
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

    const inAppPurchasesService = getInAppPurchasesMockService(inAppPurchases);

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
                cacheApiService,
                inAppPurchasesService
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

            expect(wrapper.find('.sw-extension-store-detail__action-add-extension').exists()).toBeFalsy();
            expect(wrapper.find('.sw-extension-store-detail__action-open-extension').exists()).toBeFalsy();
            expect(wrapper.find('.sw-extension-store-detail__action-install-extension').exists()).toBeFalsy();
            expect(wrapper.find('.sw-extension-store-detail__action-enterprise-contact').exists()).toBeFalsy();
        });

        it('should render in-app-purchase badge when extension has available in-app-purchase', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'TestExtension',
                    storeLicense: false,
                    id: 1337
                }]
            };

            const wrapper = await createWrapper({
                inAppFeaturesAvailable: true,
                variants: [{ foo: 'bar' }]
            });

            await flushPromises();

            expect(wrapper.find('.sw-extension-store-detail__in-app-purchases__badge').exists()).toBeTruthy();
            expect(wrapper.get('.sw-extension-store-detail__in-app-purchases__badge').text())
                .toBe('sw-extension.in-app-purchase.badge-label');
        });

        it('should not render in-app-purchase badge when extension has available in-app-purchase', async () => {
            Shopware.State.get('shopwareExtensions').myExtensions = {
                data: [{
                    active: true,
                    name: 'TestExtension',
                    storeLicense: false,
                    id: 1337
                }]
            };

            const wrapper = await createWrapper({
                inAppFeaturesAvailable: false,
                variants: [{ foo: 'bar' }]
            });

            await flushPromises();

            expect(wrapper.find('.sw-extension-store-detail__in-app-purchases__badge').exists()).toBeFalsy();
        });

        it('should not render in-app purchases section when not available', async () => {
            const wrapper = await createWrapper({}, true, false);
            await flushPromises();

            expect(wrapper.find('.sw-extension-store-detail-card-details-in-app-purchases__count').exists()).toBe(false);
        });

        it('should render in-app purchases section when available', async () => {
            const wrapper = await createWrapper();
            await flushPromises();

            expect(wrapper.find('.sw-extension-store-detail-card-details-in-app-purchases__count').exists()).toBe(true);
            expect(wrapper.get('.sw-extension-store-detail-card-details-in-app-purchases__count').text()).toBe('2');
        });
    });
});

function getInAppPurchasesMockService(inAppPurchases) {
    return {
        getAvailablePurchases: jest.fn(() => getInAppPurchaseMockResponse(inAppPurchases))
    };
}

function getInAppPurchaseMockResponse(inAppPurchases) {
    if (!inAppPurchases) {
        return [];
    }
    return [
        {
            identifier: 'feature1',
            name: 'Feature One',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at magna commodo, sodales mauris ut, aliquam dolor. Proin tellus nunc, tempor eget blandit vel, elementum quis velit. Curabitur bibendum consequat odio, sed aliquam lacus vestibulum in. Nam eleifend sollicitudin lorem, gravida fringilla urna consectetur id. Nullam lacus nunc, fringilla at odio id, luctus porta dolor. Ut varius pretium ex, non porta mi vulputate id. Suspendisse vel maximus turpis, nec lacinia dolor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Ut vel quam placerat, ultricies nunc ac, dapibus urna. Sed tincidunt ullamcorper arcu nec tempus. Aenean elementum augue eget cursus cursus. Donec vitae elementum elit. Nunc ac sem in ante hendrerit vulputate vel id tortor. Curabitur mollis vulputate urna, vel viverra lorem. Nunc sed neque at libero ornare commodo.\n' +
                '\n' +
                'Etiam fringilla ornare mauris in fermentum. Aliquam dapibus facilisis nisi at porta. Quisque dignissim sem ipsum, in efficitur metus blandit non. Donec sodales eleifend ipsum nec viverra. Etiam vitae ipsum magna. Nam mi ante, dignissim eget malesuada nec, feugiat vel ipsum. Phasellus augue erat, imperdiet non odio a, luctus lacinia est. Nunc blandit purus sit amet ante vehicula accumsan. Duis neque metus, consequat non enim at, porta maximus risus. Duis euismod odio sapien, in feugiat magna ultricies vel. Curabitur dictum condimentum ligula dapibus faucibus.\n' +
                '\n' +
                'Donec augue risus, vulputate in ipsum nec, gravida eleifend ante. Quisque maximus sapien dui, eget mollis dolor gravida ac. Proin a enim tincidunt, maximus erat ac, fermentum nisi. Nullam molestie eros vel ipsum viverra, sit amet congue nunc feugiat. Nullam elementum lorem libero, in scelerisque nunc congue in. Aliquam in dolor suscipit, pellentesque leo vel, malesuada velit. Ut felis mauris, lacinia ut efficitur ut, consectetur at ipsum. Nam dui magna, fringilla id semper sed, vulputate vel nunc. Duis quis metus ante.\n' +
                '\n' +
                'Sed at enim eu velit vestibulum efficitur ac non nunc. Vestibulum in maximus ligula, ac condimentum erat. Proin mauris nunc, ullamcorper quis lorem vitae, porta convallis orci. Maecenas vitae lectus mauris. Cras leo nisl, finibus vitae varius vitae, maximus eget erat. In vitae tristique libero. Nam eget eleifend leo.',
            priceModels: [
                {
                    price: 9.99,
                    currency: 'USD',
                    duration: 'monthly'
                },
                {
                    price: 99.99,
                    currency: 'USD',
                    duration: 'yearly'
                }
            ]
        },
        {
            identifier: 'feature2',
            name: 'Feature Two',
            description: 'Description for Feature Two',
            priceModels: [
                {
                    price: 4.99,
                    currency: 'USD',
                    duration: 'monthly'
                },
                {
                    price: 49.99,
                    currency: 'USD',
                    duration: 'yearly'
                }
            ]
        }
    ];
}
