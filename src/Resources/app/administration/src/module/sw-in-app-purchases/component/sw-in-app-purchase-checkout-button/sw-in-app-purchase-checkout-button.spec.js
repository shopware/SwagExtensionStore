import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-button',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-button')
);
async function createWrapper(propsData) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-button'), {
        props: propsData,
        global: {
            mocks: {
                $tc: (key) => key
            }
        }
    });
}

describe('sw-in-app-purchase-checkout-button', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = await createWrapper({ state: 'purchase', tosAccepted: false });
    });

    it('should be a Vue.js component', () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('computes show correctly', async () => {
        await wrapper.setProps({ state: 'error' });
        expect(wrapper.vm.show).toBe(true);

        await wrapper.setProps({ state: 'success' });
        expect(wrapper.vm.show).toBe(true);

        await wrapper.setProps({ state: 'purchase' });
        expect(wrapper.vm.show).toBe(true);

        await wrapper.setProps({ state: 'unknown' });
        expect(wrapper.vm.show).toBe(false);
    });

    it('computes disabled correctly', async () => {
        await wrapper.setProps({ state: 'purchase', tosAccepted: false });
        expect(wrapper.vm.disabled).toBe(true);

        await wrapper.setProps({ state: 'purchase', tosAccepted: true });
        expect(wrapper.vm.disabled).toBe(false);

        await wrapper.setProps({ state: 'error', tosAccepted: false });
        expect(wrapper.vm.disabled).toBe(false);
    });

    it('computes text correctly', async () => {
        await wrapper.setProps({ state: 'error' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.tryAgainButton');

        await wrapper.setProps({ state: 'success' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.closeButton');

        await wrapper.setProps({ state: 'purchase' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.purchaseButton');

        await wrapper.setProps({ state: 'random' });
        expect(wrapper.vm.text).toBe(null);
    });

    it('emits click event on onClick method', async () => {
        wrapper.vm.onClick();
        expect(wrapper.emitted().click).toBeTruthy();
    });
});
