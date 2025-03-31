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
        },
        global: {
            stubs: {
                'sw-in-app-purchase-price-box': true,
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

    it('should set the priceModel and emit update:variant when setPriceModel is called', async () => {
        // when the component is created, the first price model is set emitting this data
        // setPriceModel is called during the component creation, therefor we don't need to explicitly test it
        expect(wrapper.vm.priceModel).toStrictEqual(wrapper.vm.purchase.priceModels[0]);
        expect(wrapper.emitted('update:gtc-accepted')).toBeTruthy();
        expect(wrapper.emitted('update:gtc-accepted')[0]).toEqual([true]);
        expect(wrapper.emitted('update:variant')).toBeTruthy();
        expect(wrapper.emitted('update:variant')[0]).toStrictEqual(['monthly']);

        const priceModel = {
            type: 'rent',
            price: 10.99,
            duration: 12,
            variant: 'yearly',
            conditionsType: null,
        };

        // now we call it with a different price model, to see if it updates and emits accordingly
        wrapper.vm.setPriceModel(priceModel);
        expect(wrapper.vm.priceModel).toStrictEqual(priceModel);
        expect(wrapper.emitted('update:gtc-accepted')).toBeTruthy();
        expect(wrapper.emitted('update:gtc-accepted')[1]).toEqual([true]);
        expect(wrapper.emitted('update:variant')).toBeTruthy();
        expect(wrapper.emitted('update:variant')[1]).toStrictEqual(['yearly']);
    });
});
