import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-overview',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-overview'),
);

jest.mock('SwagExtensionStore/module/sw-in-app-purchases/types', () => ({
    InAppPurchase: jest.fn(),
}));

async function createWrapper() {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-overview'), {
        props: {
            purchase: {
                priceModels: [{
                    type: 'rent',
                    price: 0.99,
                    duration: 1,
                    variant: 'monthly',
                    conditionsType: null,
                }],
            },
            tosAccepted: false,
            gtcAccepted: false,
            producer: 'shopware',
            variant: 'monthly',
            cart: {
                netPrice: 1,
                grossPrice: 2.99,
                taxPrice: 2.99,
                taxValue: 4,
                positions: [{
                    variant: 1,
                    subscriptionChange: null,
                }],
            },
        },
        global: {
            stubs: {
                'sw-in-app-purchase-price-box': true,
                'sw-in-app-purchase-checkout-subscription-change': true,
                'sw-gtc-checkbox': true,
                'sw-radio-field': true,
                'sw-button': true,
            },
        },
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

    it('should emit update:tos-accepted event when onGtcAcceptedChange is called', async () => {
        wrapper.vm.onGtcAcceptedChange(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted('update:gtc-accepted')).toBeTruthy();
        expect(wrapper.emitted('update:gtc-accepted')[0]).toEqual([true]);
    });

    it('should open the modal when openConditionsModal is called', async () => {
        wrapper.vm.openConditionsModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.showConditionsModal).toBe(true);
    });

    it('should close the modal when closeConditionsModal is called', async () => {
        wrapper.vm.showConditionsModal = true;
        wrapper.vm.closeConditionsModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.showConditionsModal).toBe(false);
    });


    it('should render not subscription change card', async () => {
        expect(wrapper.find('sw-in-app-purchase-checkout-subscription-change-stub').exists()).toBeFalsy();
    });

    it('should render subscription change card', async () => {
        await wrapper.setProps({
            cart: {
                positions: [{
                    variant: 1,
                    subscriptionChange: 'upgrade',
                }],
            },
        });

        expect(wrapper.find('sw-in-app-purchase-checkout-subscription-change-stub')).toBeTruthy();
    });
});
