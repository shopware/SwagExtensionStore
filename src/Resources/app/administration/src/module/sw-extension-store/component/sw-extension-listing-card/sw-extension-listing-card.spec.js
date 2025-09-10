import { mount } from '@vue/test-utils';
import ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import ShopwareDiscountCampaignService from 'src/app/service/discount-campaign.service';
import ExtensionStoreService from 'SwagExtensionStore/module/sw-extension-store/service/extension-store.service';
import 'src/module/sw-extension/store/extensions.store';

Shopware.Component.register(
    'sw-extension-listing-card',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-listing-card'),
);

async function createWrapper(extension) {
    return mount(await Shopware.Component.build('sw-extension-listing-card'), {
        props: {
            extension,
        },
        global: {
            stubs: {
                'sw-extension-icon': true,
                'sw-extension-rating-stars': true,
                'router-link': true,
                'sw-extension-type-label': true,
                'sw-extension-store-label-display': true,
            },
            provide: {
                repositoryFactory: {
                    create: () => {
                        return {};
                    },
                },
                systemConfigApiService: {
                    getValues: () => {
                        return Promise.resolve({
                            'core.store.apiUri': 'https://api.shopware.com',
                            'core.store.licenseHost': 'sw6.test.shopware.in',
                            'core.store.shopSecret': 'very.s3cret',
                            'core.store.shopwareId': 'max@muster.com',
                        });
                    },
                },
                extensionStoreService: new ExtensionStoreService(
                    new ShopwareDiscountCampaignService(),
                    new ShopwareExtensionService(
                        undefined,
                        undefined,
                        new ShopwareDiscountCampaignService(),
                    ),
                ),
            },
        },
    });
}

describe('sw-extension-listing-card', () => {
    /** @type Wrapper */
    let wrapper;

    beforeEach(() => {
        Shopware.Store.get('shopwareExtensions').setMyExtensions([{
            name: 'Test',
            installedAt: null,
        }]);
    });

    it('should be a Vue.JS component', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'free',
                    netPrice: 0,
                    netPricePerMonth: 0,
                    trialPhaseIncluded: true,
                },
            ],
        });

        expect(wrapper.vm).toBeTruthy();
    });

    it('isFree should be false when extension is not free', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'rent',
                    netPrice: 19,
                    netPricePerMonth: 19,
                    trialPhaseIncluded: true,
                },
            ],
        });

        expect(wrapper.vm.isFree).toBe(false);
    });

    it('isFree should be true when extension is free', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'free',
                    netPrice: 0,
                    netPricePerMonth: 0,
                    trialPhaseIncluded: true,
                },
            ],
        });

        expect(wrapper.vm.isFree).toBe(true);
    });

    it('isInstalled should be false when extension is not in store', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'free',
                    netPrice: 0,
                    netPricePerMonth: 0,
                    trialPhaseIncluded: true,
                },
            ],
        });

        expect(wrapper.vm.isInstalled).toBe(false);
    });

    it('isInstalled should be true when extension is in store', async () => {
        Shopware.Store.get('shopwareExtensions').setMyExtensions([{
            name: 'Test',
            installedAt: 'some date',
        }]);

        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'free',
                    netPrice: 0,
                    netPricePerMonth: 0,
                    trialPhaseIncluded: true,
                },
            ],
        });

        expect(wrapper.vm.isInstalled).toBe(true);
    });

    it('isLicense should be undefined when not found', async () => {
        wrapper = await createWrapper({
            label: 'Test',
            name: 'Test2',
            labels: [],
            variants: [],
        });

        expect(wrapper.vm.isLicensed).toBe(false);
    });

    it('recommendedVariant should be the one with the lowest price per month when multiple variants given', async () => {
        const expectedVariant = {
            id: 79102,
            type: 'rent',
            netPrice: 199,
            netPricePerMonth: 16.58,
            duration: 12,
            trialPhaseIncluded: true,
        };

        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79101,
                    type: 'rent',
                    netPrice: 19,
                    netPricePerMonth: 19,
                    duration: 1,
                    trialPhaseIncluded: true,
                },
                expectedVariant,
            ],
        });

        expect(wrapper.vm.recommendedVariant).toEqual(expectedVariant);
    });

    it('openDetailPage calls router', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test2',
            labels: [],
            variants: [{
                id: 10,
                type: 'rent',
                netPrice: 19,
                netPricePerMonth: 19,
                duration: 1,
                trialPhaseIncluded: true,
                extensions: [],
            }],
        });

        wrapper.vm.$router = {
            push: jest.fn(),
        };

        wrapper.vm.openDetailPage();

        expect(wrapper.vm.$router.push).toHaveBeenCalled();
    });

    it('should display one-time price for buying', async () => {
        wrapper = await createWrapper({
            label: 'A Label',
            shortDescription: 'A short description',
            labels: [],
            variants: [{
                id: 11,
                type: 'buy',
                netPrice: 19,
                netPricePerMonth: null,
                duration: null,
                trialPhaseIncluded: true,
                extensions: [],
            }],
            rating: 4,
            numberOfRatings: 10,
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('A Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('A short description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__info-price span').text())
            .toBe('sw-extension-store.general.labelPriceOneTime');
    });

    it('should display normal prices for renting', async () => {
        wrapper = await createWrapper({
            label: 'A Label',
            shortDescription: 'A short description',
            labels: [],
            variants: [{
                id: 11,
                type: 'rent',
                netPrice: 19,
                netPricePerMonth: 19,
                duration: 1,
                trialPhaseIncluded: true,
                extensions: [],
            }],
            rating: 4,
            numberOfRatings: 10,
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('A Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('A short description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__info-price span').text())
            .toBe('sw-extension-store.general.labelPricePerMonth');
    });

    it('should display a discount for renting', async () => {
        wrapper = await createWrapper({
            id: 1,
            localId: null,
            name: 'Sample Extension',
            label: 'Sample Extension Label',
            description: null,
            shortDescription: 'Sample Extension description',
            producerName: null,
            license: null,
            version: null,
            latestVersion: null,
            privacyPolicyLink: null,
            languages: [],
            rating: 3,
            numberOfRatings: 10,
            labels: [],
            variants: [{
                id: 11,
                type: 'rent',
                netPrice: 19,
                netPricePerMonth: 19,
                duration: 1,
                trialPhaseIncluded: true,
                discountCampaign: {
                    name: 'Einführungspreis',
                    discount: 15,
                    discountedPrice: 16.15,
                    discountedPricePerMonth: 16.15,
                    startDate: '2021-01-27T00:01:00+01:00',
                    discountAppliesForMonths: null,
                },
                extensions: [],
            }],
            images: [{
                remoteLink: 'https://example.com',
                raw: null,
                extensions: [],
            }],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin',
            isTheme: false,
            extensions: [],
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__info-price-badge-sale').text())
            .toBe('sw-extension-store.general.labelSale');
        expect(wrapper.find('.sw-extension-listing-card__info-price-discounted').text())
            .toBe('sw-extension-store.general.labelPricePerMonth');
    });
});
