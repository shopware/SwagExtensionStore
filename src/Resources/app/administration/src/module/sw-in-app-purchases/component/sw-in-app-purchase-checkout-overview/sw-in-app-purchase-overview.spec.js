import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-overview',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-overview')
);

jest.mock('SwagExtensionStore/module/sw-in-app-purchases/types', () => ({
    InAppPurchase: jest.fn(),
    InAppPurchasePriceModel: jest.fn()
}));

async function createWrapper() {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-overview'), {
        props: {
            purchase: {},
            priceModel: {},
            tosAccepted: false
        }
    });
}

describe('sw-in-app-purchase-checkout-overview', () => {
    let wrapper = null;

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('should render correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('should emit update:tos-accepted event when onTosAcceptedChange is called', async () => {
        wrapper.vm.onTosAcceptedChange(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:tos-accepted')).toBeTruthy();
        expect(wrapper.emitted('update:tos-accepted')[0]).toEqual([true]);
    });
});
