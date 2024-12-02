import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-extension-card-base',
    () => import('src/module/sw-extension/component/sw-extension-card-base')
);

Shopware.Component.override(
    'sw-extension-card-base',
    () => import('SwagExtensionStore/module/sw-extension/component/sw-extension-card-base')
);

Shopware.State.get('context').app = { config: { settings: {}, inAppPurchases: { SwagB2BPlatform: ['purchase1', 'purchase2'] } } };

async function createWrapper(extensionCustomProps = {}) {
    const testExtension = {
        id: 1337,
        categories: [
            { details: { name: 'Productivity' } },
            { details: { name: 'Admin' } },
            { details: { name: 'Storefront' } }
        ],
        installedAt: { date: new Date() },
        description: '<p>This is a really cool extension.</p>',
        label: 'B2B Suite',
        name: 'SwagB2BPlatform',
        producerName: 'shopware AG',
        shortDescription: 'Foo',
        type: 'plugin',
        updateSource: 'local',
        variants: [{}],
        languages: ['German', 'English'],
        storeLicense: { creationDate: new Date(), variants: [{}] },
        images: [],
        permissions: [],
        labels: [],
        faq: [],
        addons: [],
        ...extensionCustomProps
    };


    return mount(await Shopware.Component.build('sw-extension-card-base'), {
        props: {
            extension: testExtension
        },
        global: {
            renderStubDefaultSlot: true,
            stubs: {
                'sw-meteor-card': true
            },
            provide: {
                shopwareExtensionService: {
                    updateExtensionData: jest.fn(),
                    isVariantDiscounted: jest.fn(),
                    orderVariantsByRecommendation: () => [],
                    getOpenLink: () => { }
                }
            }
        }
    });
}
describe('SwagExtensionStore/module/sw-extension/component/sw-extension', () => {
    it('should be a Vue.js component', async () => {
        const wrapper = await createWrapper({ inAppFeaturesAvailable: true });

        expect(wrapper.vm).toBeTruthy();
    });

    it('should not show in-app-purchases badge', async () => {
        const wrapper = await createWrapper({ inAppFeaturesAvailable: false });

        expect(wrapper.find('.sw-extension-card-base__in-app-purchase__badge').exists()).toBe(false);
    });

    it('should show in-app-purchases badge', async () => {
        const wrapper = await createWrapper({ inAppFeaturesAvailable: true });

        expect(wrapper.find('.sw-extension-card-base__in-app-purchase__badge').exists()).toBe(true);
        expect(wrapper.get('.sw-extension-card-base__in-app-purchase__badge').text())
            .toBe('sw-extension.in-app-purchase.badge-label');
    });

    it('should show shop account link', async () => {
        const wrapper = await createWrapper({ inAppFeaturesAvailable: true });

        expect(wrapper.find('.sw-extension-card-base__in-app-purchase__store_link').exists()).toBe(true);
        expect(wrapper.get('.sw-extension-card-base__in-app-purchase__store_link').text())
            .toBe('sw-extension.in-app-purchase.context-menu.account-link-label');
    });
});
