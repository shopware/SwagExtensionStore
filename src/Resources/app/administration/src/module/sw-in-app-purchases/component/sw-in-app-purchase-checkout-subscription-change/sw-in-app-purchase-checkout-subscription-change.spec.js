import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-in-app-purchase-checkout-subscription-change',
    () => import('SwagExtensionStore/module/sw-in-app-purchases/component/sw-in-app-purchase-checkout-subscription-change'),
);

jest.mock('SwagExtensionStore/module/sw-in-app-purchases/types', () => ({
    InAppPurchase: jest.fn(),
}));

const defaultCart = {
    netPrice: 5.99,
    grossPrice: 7.13,
    taxPrice: 7.13,
    taxValue: 19,
    positions: [{
        variant: 'monthly',
        proratedNetPrice: 3.50,
        nextBookingDate: '2026-04-01',
        subscriptionChange: {
            isIncludedInPluginLicense: false,
            currentFeature: {
                name: 'Basic Plan',
                priceModels: [{
                    type: 'rent',
                    price: 2.99,
                    duration: 1,
                    variant: 'monthly',
                }],
            },
        },
    }],
};

async function createWrapper(props = {}) {
    return mount(await Shopware.Component.build('sw-in-app-purchase-checkout-subscription-change'), {
        props: {
            purchase: {
                priceModels: [{
                    type: 'rent',
                    price: 5.99,
                    duration: 1,
                    variant: 'monthly',
                }],
            },
            cart: defaultCart,
            ...props,
        },
        global: {
            stubs: {
                'mt-banner': true,
            },
        },
    });
}

describe('sw-in-app-purchase-checkout-subscription-change', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    it('should be a Vue.js component', () => {
        expect(wrapper.vm).toBeTruthy();
    });

    it('should render correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('should compute cartPosition from first cart position', () => {
        expect(wrapper.vm.cartPosition).toEqual(defaultCart.positions[0]);
    });

    it('should compute isIncludedInPluginLicense as false by default', () => {
        expect(wrapper.vm.isIncludedInPluginLicense).toBe(false);
    });

    it('should compute isIncludedInPluginLicense as true when set', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    subscriptionChange: {
                        ...defaultCart.positions[0].subscriptionChange,
                        isIncludedInPluginLicense: true,
                    },
                }],
            },
        });

        expect(wrapper.vm.isIncludedInPluginLicense).toBe(true);
    });

    it('should compute getCurrentPrice from matching variant price model', () => {
        expect(wrapper.vm.getCurrentPrice).toContain('2.99');
    });

    it('should compute getCurrentPlanName from current feature', () => {
        expect(wrapper.vm.getCurrentPlanName).toBe('Basic Plan');
    });

    it('should compute formattedStartingDate from nextBookingDate', () => {
        expect(wrapper.vm.formattedStartingDate).toBeTruthy();
    });

    it('should not render access-grant-hint banner when not included in plugin license', () => {
        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__access-grant-hint').exists()).toBe(false);
    });

    it('should render access-grant-hint banner when included in plugin license', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    subscriptionChange: {
                        ...defaultCart.positions[0].subscriptionChange,
                        isIncludedInPluginLicense: true,
                    },
                }],
            },
        });

        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__access-grant-hint').exists()).toBe(true);
    });

    it('should render current plan and new plan sections', () => {
        const items = wrapper.findAll('.sw-in-app-purchase-checkout-subscription-change__item');
        expect(items).toHaveLength(3);
    });

    it('should render the divider', () => {
        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__divider').exists()).toBe(true);
    });

    it('should render the info hint', () => {
        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__info-hint').exists()).toBe(true);
        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__info-hint').text()).toBeTruthy();
    });
});
