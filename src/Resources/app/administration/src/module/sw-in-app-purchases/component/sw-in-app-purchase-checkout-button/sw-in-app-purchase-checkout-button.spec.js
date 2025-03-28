import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-button',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-button'),
);
async function createWrapper(props) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-button'), {
        props,
        global: {
            mocks: {
                $t: (key) => key,
            },
        },
    });
}

describe('sw-in-app-purchase-checkout-button', () => {
    const buttonStatesDataSet = [
        { state: 'purchase', tosAccepted: false, gtcAccepted: false, variant: null, expected: true },
        { state: 'purchase', tosAccepted: false, gtcAccepted: false, variant: 'monthly', expected: true },
        { state: 'purchase', tosAccepted: false, gtcAccepted: true, variant: null, expected: true },
        { state: 'purchase', tosAccepted: false, gtcAccepted: true, variant: 'monthly', expected: true },
        { state: 'purchase', tosAccepted: true, gtcAccepted: false, variant: null, expected: true },
        { state: 'purchase', tosAccepted: true, gtcAccepted: false, variant: 'monthly', expected: true },
        { state: 'purchase', tosAccepted: true, gtcAccepted: true, variant: null, expected: true },
        { state: 'purchase', tosAccepted: true, gtcAccepted: true, variant: 'monthly', expected: false },
        { state: 'error', tosAccepted: false, gtcAccepted: true, variant: null, expected: false },
        { state: 'error', tosAccepted: false, gtcAccepted: true, variant: 'monthly', expected: false },
        { state: 'error', tosAccepted: true, gtcAccepted: false, variant: null, expected: false },
        { state: 'error', tosAccepted: true, gtcAccepted: false, variant: 'monthly', expected: false },
        { state: 'error', tosAccepted: false, gtcAccepted: false, variant: null, expected: false },
        { state: 'error', tosAccepted: false, gtcAccepted: false, variant: 'monthly', expected: false },
    ];

    let wrapper;

    beforeEach(async () => {
        wrapper = await createWrapper({ state: 'purchase', tosAccepted: false, gtcAccepted: false, variant: null });
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

    it.each(buttonStatesDataSet)(
        'computes disabled correctly ($state, $tosAccepted, $gtcAccepted, $variant)',
        async ({ state, tosAccepted, gtcAccepted, variant, expected }) => {
            await wrapper.setProps({ state: state, tosAccepted: tosAccepted, gtcAccepted: gtcAccepted, variant: variant });
            expect(wrapper.vm.disabled).toBe(expected);
        },
    );

    it('computes text correctly', async () => {
        await wrapper.setProps({ state: 'error' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.tryAgainButton');

        await wrapper.setProps({ state: 'success' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.closeButton');

        await wrapper.setProps({ state: 'purchase' });
        expect(wrapper.vm.text).toBe('sw-in-app-purchase-checkout-button.purchaseButton');

        await wrapper.setProps({ state: 'random' });
        expect(wrapper.vm.text).toBeNull();
    });

    it('emits click event on onClick method', async () => {
        wrapper.vm.onClick();
        expect(wrapper.emitted().click).toBeTruthy();
    });
});
