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
                    return [
                        'sw-in-app-purchase-checkout-state.errors.this-error-exists',
                        'sw-in-app-purchase-checkout-state.infos.this-info-exists.title',
                        'sw-in-app-purchase-checkout-state.infos.this-info-exists.subtitle',
                        'sw-in-app-purchase-checkout-state.infos.subtitle-only.subtitle',
                    ].includes(key);
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
        expect(wrapper.vm.classes).toEqual({ 'is--error': true, 'is--success': false, 'is--loading': false, 'is--info': false });

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': true, 'is--loading': false, 'is--info': false });

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': false, 'is--loading': true, 'is--info': false });

        await wrapper.setProps({ state: 'info' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.classes).toEqual({ 'is--error': false, 'is--success': false, 'is--loading': false, 'is--info': true });
    });

    it('should compute icon correctly', async () => {
        wrapper = await createWrapper({ state: 'error' });
        expect(wrapper.vm.icon).toBe('solid-times');

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBe('solid-checkmark');

        await wrapper.setProps({ state: 'info' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.icon).toBe('solid-info-circle');

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
        // error not found in SBP or allowed
        wrapper = await createWrapper({ state: 'error', reason: 'error is not allowed' });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorSubtitle'));

        // error is not set
        wrapper = await createWrapper({ state: 'error', reason: null });
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorSubtitle'));

        await wrapper.setProps({ state: 'success' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.successSubtitle'));

        await wrapper.setProps({ state: 'loading' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.subtitle).toBeNull();
    });

    it('should use the flat error snippet as subtitle when the reason is known', async () => {
        wrapper = await createWrapper({ state: 'error', reason: 'this-error-exists' });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errorTitle'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.errors.this-error-exists'));
    });

    it('should use the reason specific title and subtitle in the info state', async () => {
        wrapper = await createWrapper({ state: 'info', reason: 'this-info-exists' });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infos.this-info-exists.title'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infos.this-info-exists.subtitle'));
    });

    it('should fall back to the generic wording per missing part in the info state', async () => {
        // only a subtitle is defined for this reason, the title falls back
        wrapper = await createWrapper({ state: 'info', reason: 'subtitle-only' });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infoTitle'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infos.subtitle-only.subtitle'));
    });

    it('should fall back to the generic wording for an unknown info reason', async () => {
        wrapper = await createWrapper({ state: 'info', reason: 'this-info-does-not-exist' });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infoTitle'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infoSubtitle'));

        // reason is not set at all
        wrapper = await createWrapper({ state: 'info', reason: null });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infoTitle'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.infoSubtitle'));
    });

    it('should ignore the reason in the success state', async () => {
        wrapper = await createWrapper({ state: 'success', reason: 'this-error-exists' });

        expect(wrapper.vm.title).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.successTitle'));
        expect(wrapper.vm.subtitle).toBe(wrapper.vm.$t('sw-in-app-purchase-checkout-state.successSubtitle'));
    });
});
