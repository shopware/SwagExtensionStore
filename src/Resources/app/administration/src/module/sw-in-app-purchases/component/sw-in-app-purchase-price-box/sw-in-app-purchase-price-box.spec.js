import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-price-box',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-price-box'),
);

async function createWrapper(overrides) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-price-box'), {
        props: {
            priceModel: {
                type: 'rent',
                variant: 'monthly',
                ...overrides,
            },
        },
    });
}

describe('src/module/sw-in-app-purchases/component/sw-in-app-purchase-price-box', () => {
    let wrapper = null;

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('computes rentDuration correctly for monthly rent', async () => {
        await wrapper.setProps({ priceModel: { type: 'rent', variant: 'monthly' } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBe('monthly');
    });

    it('computes rentDuration correctly for yearly rent', async () => {
        await wrapper.setProps({ priceModel: { type: 'rent', variant: 'yearly' } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBe('yearly');
    });

    it('does not compute for priceModel that is not rent', async () => {
        await wrapper.setProps({ priceModel: { type: 'buy', variant: 'service' } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBeNull();
    });
});
