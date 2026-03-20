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
        feature: {
            name: 'Pro Plan',
        },
        subscriptionChange: {
            type: 'upgrade',
            isIncludedInPluginLicense: false,
            currentFeatureVariant: 'monthly',
            currentNetPrice: 2.99,
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

    it('should compute currentPrice from current net price', () => {
        expect(wrapper.vm.currentPrice).toContain('2.99');
    });

    it('should compute currentPlanName from current feature', () => {
        expect(wrapper.vm.currentPlanName).toBe('Basic Plan');
    });

    it('should compute currentPlanDuration from currentFeatureVariant', () => {
        expect(wrapper.vm.currentPlanDuration).toBe('sw-in-app-purchase-price-box.duration.monthly');
    });

    it('should return null for currentPlanDuration when currentFeatureVariant is missing', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    subscriptionChange: {
                        ...defaultCart.positions[0].subscriptionChange,
                        currentFeatureVariant: undefined,
                    },
                }],
            },
        });

        expect(wrapper.vm.currentPlanDuration).toBeNull();
    });

    it('should compute newPlanName from feature name', () => {
        expect(wrapper.vm.newPlanName).toBe('Pro Plan');
    });

    it('should compute newPlanDuration from variant', () => {
        expect(wrapper.vm.newPlanDuration).toBe('sw-in-app-purchase-price-box.duration.monthly');
    });

    it('should return null for newPlanDuration when variant is missing', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    variant: undefined,
                }],
            },
        });

        expect(wrapper.vm.newPlanDuration).toBeNull();
    });

    it('should compute proratedNetPrice for upgrade', () => {
        expect(wrapper.vm.proratedNetPrice).toContain('3.50');
    });

    it('should return zero proratedNetPrice for downgrade', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    subscriptionChange: {
                        ...defaultCart.positions[0].subscriptionChange,
                        type: 'downgrade',
                    },
                }],
            },
        });

        expect(wrapper.vm.proratedNetPrice).toContain('0.00');
    });

    it('should compute isNextBookingDateInDifferentYear as false for same year', () => {
        expect(wrapper.vm.isNextBookingDateInDifferentYear).toBe(false);
    });

    it('should compute isNextBookingDateInDifferentYear as true for different year', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    nextBookingDate: '2099-01-01',
                }],
            },
        });

        expect(wrapper.vm.isNextBookingDateInDifferentYear).toBe(true);
    });

    it('should include year in yearFormat when next booking date is in different year', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    nextBookingDate: '2099-01-01',
                }],
            },
        });

        expect(wrapper.vm.yearFormat).toBe('numeric');
    });

    it('should return undefined yearFormat when next booking date is in same year', () => {
        expect(wrapper.vm.yearFormat).toBeUndefined();
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

    it('should render the info hint for upgrade', () => {
        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__info-hint').exists()).toBe(true);
        expect(wrapper.vm.infoHint).toBeTruthy();
    });

    it('should render the info hint for downgrade', async () => {
        wrapper = await createWrapper({
            cart: {
                ...defaultCart,
                positions: [{
                    ...defaultCart.positions[0],
                    subscriptionChange: {
                        ...defaultCart.positions[0].subscriptionChange,
                        type: 'downgrade',
                    },
                }],
            },
        });

        expect(wrapper.find('.sw-in-app-purchase-checkout-subscription-change__info-hint').exists()).toBe(true);
        expect(wrapper.vm.infoHint).toBeTruthy();
    });
});
