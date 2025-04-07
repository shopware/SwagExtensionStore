import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-extension-store-in-app-purchases-listing-modal',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-in-app-purchases-listing-modal'),
);

async function createWrapper(propsData = {}) {
    return mount(await Shopware.Component.build('sw-extension-store-in-app-purchases-listing-modal'), {
        props: {
            extension: propsData.extension || { name: 'Test Extension' },
            inAppPurchases: propsData.inAppPurchases || [],
        },
        global: {
            stubs: {
                'sw-modal': {
                    template: `<div class="sw-modal"><slot></slot><slot name="modal-footer"></slot></div>`,
                },
                'mt-icon': true,
                'sw-collapse': {
                    template: `<div class="sw-collapse"><slot name="header"></slot><slot name="content"></slot></div>`,
                },
            },
        },
    });
}

describe('sw-extension-store-in-app-purchases-listing-modal', () => {
    it('should be a Vue.js component', async () => {
        const wrapper = await createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it('emits "modal-close" when closeInAppPurchasesListingModal is called', async () => {
        const wrapper = await createWrapper();
        wrapper.vm.closeInAppPurchasesListingModal();
        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });

    it('formats currency using Shopware.Utils.format.currency', async () => {
        const wrapper = await createWrapper();
        const result = wrapper.vm.formatCurrency(100, 'EUR');

        expect(result).toBe('€100.00');
    });
});
