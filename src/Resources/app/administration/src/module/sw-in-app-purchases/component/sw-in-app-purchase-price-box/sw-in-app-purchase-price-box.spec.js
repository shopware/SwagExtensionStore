import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-price-box',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-price-box')
);

async function createWrapper(overrides) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-price-box'), {
        props: {
            priceModel: {
                type: 'rent',
                duration: 1,
                ...overrides
            }
        },
        global: {
            stubs: {
                'sw-icon': true
            }
        }
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
        wrapper.setProps({ priceModel: { type: 'rent', duration: 1 } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBe('monthly');
    });

    it('computes rentDuration correctly for yearly rent', async () => {
        wrapper.setProps({ priceModel: { type: 'rent', duration: 12 } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBe('yearly');
    });

    it('computes rentDuration correctly for non-rent type', async () => {
        wrapper.setProps({ priceModel: { type: 'buy', duration: 0 } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBeNull();
    });

    it('computes rentDuration correctly for unknown duration', async () => {
        wrapper.setProps({ priceModel: { type: 'rent', duration: 6 } });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.rentDuration).toBeNull();
    });
});
