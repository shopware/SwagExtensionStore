import { mount } from '@vue/test-utils';
import ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import ShopwareDiscountCampaignService from 'src/app/service/discount-campaign.service';

Shopware.Component.register(
    'sw-extension-listing-card',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-listing-card')
);

async function createWrapper(extension) {
    return mount(await Shopware.Component.build('sw-extension-listing-card'), {
        props: {
            extension
        },
        global: {
            stubs: {
                'sw-icon': true,
                'sw-extension-rating-stars': true,
                'router-link': true,
                'sw-extension-type-label': true,
                'sw-extension-store-label-display': true
            },
            provide: {
                repositoryFactory: {
                    create: () => {
                        return {};
                    }
                },
                systemConfigApiService: {
                    getValues: () => {
                        return Promise.resolve({
                            'core.store.apiUri': 'https://api.shopware.com',
                            'core.store.licenseHost': 'sw6.test.shopware.in',
                            'core.store.shopSecret': 'very.s3cret',
                            'core.store.shopwareId': 'max@muster.com'
                        });
                    }
                },
                shopwareExtensionService: new ShopwareExtensionService(
                    undefined,
                    undefined,
                    new ShopwareDiscountCampaignService()
                )
            },
            mocks: {
                $tc: (key, recommendation, price) => JSON.stringify({ key, recommendation, price })
            }
        }
    });
}

describe('sw-extension-listing-card', () => {
    /** @type Wrapper */
    let wrapper;

    beforeAll(() => {
        Shopware.State.registerModule('shopwareExtensions', {
            namespaced: true,
            state: {
                myExtensions: {
                    data: [
                        {
                            name: 'Test',
                            installedAt: null
                        }
                    ]
                }
            },
            mutations: {
                setExtension(state, extension) {
                    state.myExtensions.data = [extension];
                }
            }
        });
    });

    beforeEach(() => {
        Shopware.State.commit('shopwareExtensions/setExtension', {
            name: 'Test',
            installedAt: null
        });
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
                    trialPhaseIncluded: true
                }
            ]
        });

        expect(wrapper.vm).toBeTruthy();
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
                    trialPhaseIncluded: true
                }
            ]
        });

        expect(wrapper.vm.isInstalled).toBe(false);
    });

    it('isInstalled should be true when extension is in store', async () => {
        Shopware.State.commit('shopwareExtensions/setExtension', {
            name: 'Test',
            installedAt: 'some date'
        });

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
                    trialPhaseIncluded: true
                }
            ]
        });

        expect(wrapper.vm.isInstalled).toBe(true);
    });

    it('previewMedia with no image', async () => {
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
                    trialPhaseIncluded: true
                }
            ]
        });

        expect(wrapper.vm.previewMedia).toStrictEqual({
            'background-image': 'url(\'administration/static/img/theme/default_theme_preview.jpg\')'
        });
    });

    it('previewMedia gives image when set', async () => {
        wrapper = await createWrapper({
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: [
                {
                    id: 79102,
                    type: 'free',
                    netPrice: 0,
                    trialPhaseIncluded: true
                }
            ],
            images: [
                {
                    remoteLink: 'a'
                }
            ]
        });

        expect(wrapper.vm.previewMedia).toStrictEqual({
            'background-image': 'url(\'a\')',
            'background-size': 'cover'
        });
    });

    it('calculatedPrice should be null when no variant given', async () => {
        wrapper = await createWrapper({
            label: 'Test',
            name: 'Test',
            labels: [],
            variants: []
        });

        expect(wrapper.vm.calculatedPrice).toBe(null);
    });

    it('isLicense should be undefined when not found', async () => {
        wrapper = await createWrapper({
            label: 'Test',
            name: 'Test2',
            labels: [],
            variants: []
        });

        expect(wrapper.vm.isLicensed).toBe(false);
    });

    it('openDetailPage calls router', async () => {
        wrapper = await createWrapper({
            id: 1,
            label: 'Test',
            name: 'Test2',
            labels: [],
            variants: [{
                id: 10,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                extensions: []
            }]
        });

        wrapper.vm.$router = {
            push: jest.fn()
        };

        wrapper.vm.openDetailPage();

        expect(wrapper.vm.$router.push).toBeCalled();
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
                trialPhaseIncluded: true,
                extensions: []
            }],
            rating: 4,
            numberOfRatings: 10
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('A Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('A short description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__preview').attributes().style)
            .toBe('background-image: url(administration/static/img/theme/default_theme_preview.jpg);');
        expect(wrapper.find('.sw-extension-listing-card__info-price').text())
            .toBe(JSON.stringify({
                key: 'sw-extension-store.general.labelPrice',
                recommendation: 1,
                price: { price: '€19.00' }
            }));
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
                id: 10,
                type: 'buy',
                netPrice: 149,
                trialPhaseIncluded: false,
                discountCampaign: {
                    name: 'Einführungspreis',
                    discount: 15,
                    discountedPrice: 126.65,
                    startDate: '',
                    discountAppliesForMonths: null
                },
                extensions: []
            }, {
                id: 11,
                type: 'rent',
                netPrice: 19,
                trialPhaseIncluded: true,
                discountCampaign: {
                    name: 'Einführungspreis',
                    discount: 15,
                    discountedPrice: 16.15,
                    startDate: '2021-01-27T00:01:00+01:00',
                    discountAppliesForMonths: null
                },
                extensions: []
            }],
            images: [{
                remoteLink: 'https://example.com',
                raw: null,
                extensions: []
            }],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin',
            isTheme: false,
            extensions: []
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__preview').attributes().style)
            .toBe('background-image: url(https://example.com); background-size: cover;');
        expect(wrapper.find('.sw-extension-listing-card__info-price').text())
            .toBe(JSON.stringify({
                key: 'sw-extension-store.general.labelPrice',
                recommendation: 1,
                price: { price: '€16.15' }
            }));
    });

    it('should display normal prices for buying', async () => {
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
                id: 10,
                type: 'buy',
                netPrice: 25,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            },
            {
                id: 11,
                type: 'test',
                netPrice: 0,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],

            images: [{
                remoteLink: 'https://example.com',
                raw: null,
                extensions: []
            }],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin',
            isTheme: false,
            extensions: []
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__preview').attributes().style)
            .toBe('background-image: url(https://example.com); background-size: cover;');
        expect(wrapper.find('.sw-extension-listing-card__info-price').text())
            .toBe(JSON.stringify({
                key: 'sw-extension-store.general.labelPrice',
                recommendation: 2,
                price: { price: '€25.00' }
            }));
    });

    it('should display discounted prices for buying', async () => {
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
                id: 10,
                type: 'buy',
                netPrice: 497,
                trialPhaseIncluded: false,
                discountCampaign: {
                    name: 'Sale',
                    discount: 20.12072372,
                    discountedPrice: 397,
                    startDate: '2021-01-27T00:01:00+01:00',
                    discountAppliesForMonths: null
                },
                extensions: []
            }, {
                id: 80843,
                type: 'test',
                netPrice: 0,
                trialPhaseIncluded: false,
                discountCampaign: null,
                extensions: []
            }],
            images: [{
                remoteLink: 'https://example.com',
                raw: null,
                extensions: []
            }],
            icon: null,
            iconRaw: null,
            active: false,
            type: 'plugin',
            isTheme: true,
            extensions: []
        });

        expect(wrapper.find('.sw-extension-listing-card__info-name').text()).toBe('Sample Extension Label');
        expect(wrapper.find('.sw-extension-listing-card__info-description').text()).toBe('Sample Extension description');
        expect(wrapper.find('.sw-extension-listing-card__info-rating-count').text()).toBe('10');
        expect(wrapper.find('.sw-extension-listing-card__preview').attributes().style)
            .toBe('background-image: url(https://example.com); background-size: cover;');
        expect(wrapper.find('.sw-extension-listing-card__info-price').text())
            .toBe(JSON.stringify({
                key: 'sw-extension-store.general.labelPrice',
                recommendation: 2,
                price: { price: '€397.00' }
            }));
    });
});
