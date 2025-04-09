import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-state',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-state'),
);

async function createWrapper(props) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-state'), {
        props,
        global: {
            stubs: {
                'sw-loader': true,
            },
            mocks: {
                $te: (key) => {
                    return key === 'sw-in-app-purchase-checkout-state.errors.this-error-exists';
                },
            },
        },
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

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': true, 'is--loading': false });

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': false, 'is--loading': true });
    });

    it('should compute icon correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.icon).toBe('solid-times');

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBe('solid-checkmark');

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBeNull();
    });

    it('should compute title correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorTitle'));

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.successTitle'));

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.title).toBeNull();
    });

    it('should compute subtitle correctly', async () => {
        // error comes from SBP
        wrapper = await createWrapper({ state: 'error', error: 'The requested in-app feature has already been purchased' });
        expect(wrapper.vm.subtitle).toBe('The requested in-app feature has already been purchased');

        // error comes from ExtensionStore
        wrapper = await createWrapper({ state: 'error', error: 'This-error_exists.' });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errors.this-error-exists'));

        // error not found in SBP or allowed
        wrapper = await createWrapper({ state: 'error', error: 'error is not allowed' });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorSubtitle'));

        // error is not set
        wrapper = await createWrapper({ state: 'error', error: null });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorSubtitle'));

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.successSubtitle'));

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBeNull();
    });
});
