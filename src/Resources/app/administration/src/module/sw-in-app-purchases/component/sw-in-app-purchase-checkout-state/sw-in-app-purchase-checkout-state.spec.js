import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-state',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-state')
);

async function createWrapper(propsData) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-state'), {
        propsData
    });
}

describe('sw-in-app-purchase-checkout-state', () => {
    let wrapper;

    it('should be a Vue.js component', async () => {
        wrapper = await createWrapper({ state: 'loading' });
        expect(wrapper.vm).toBeTruthy();
    });

    it('should compute classes correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.classes).toEqual({ 'is--error': true, 'is--success': false, 'is--loading': false });

        wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': true, 'is--loading': false });

        wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': false, 'is--loading': true });
    });

    it('should compute icon correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.icon).toBe('solid-times');

        wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBe('solid-checkmark');

        wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBeNull();
    });

    it('should compute title correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.title).toBe(wrapper.vm.$tc('sw-in-app-purchase-checkout-state.errorTitle'));

        wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.title).toBe(wrapper.vm.$tc('sw-in-app-purchase-checkout-state.successTitle'));

        wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.title).toBeNull();
    });

    it('should compute subtitle correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$tc('sw-in-app-purchase-checkout-state.errorSubtitle'));

        wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$tc('sw-in-app-purchase-checkout-state.successSubtitle'));

        wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBeNull();
    });

    it('should handle custom errorSnippet correctly', async () => {
        wrapper = await createWrapper({ state: 'error', errorSnippet: 'customError' });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$tc('sw-in-app-purchase-checkout-state.customError'));
    });
});
