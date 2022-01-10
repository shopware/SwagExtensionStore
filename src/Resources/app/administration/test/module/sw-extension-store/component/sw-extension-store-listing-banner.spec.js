import { mount, createLocalVue } from '@vue/test-utils';
import VueI18n from 'vue-i18n';
import 'src/app/component/campaign/sw-campaign-property-mapping';
import 'SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-listing-banner';
import ShopwareDiscountCampaignService from 'src/app/service/discount-campaign.service';
import extensionStore from 'src/module/sw-extension/store/extensions.store';
import marketingStore from 'src/app/state/marketing.store';
import { activateFeature12608 } from "../../../_helper/activate-feature-12608";

let i18n;

/**
 * This test is in integrative test which combines
 * - sw-campaign-banner
 * - sw-campaign-property-mapping
 * - marketing.store
 */

function createWrapper() {
    return mount({
        template: `
<div>
    <sw-campaign-property-mapping component-name="storeBanner">
        <template #default="{ mappedProperties }">
            <div v-if="mappedProperties">
                <sw-extension-store-listing-banner
                    v-bind="mappedProperties"
                ></sw-extension-store-listing-banner>
            </div>
        </template>
    </sw-campaign-property-mapping>
</div>
        `
    }, {
        stubs: {
            'sw-campaign-property-mapping': Shopware.Component.build('sw-campaign-property-mapping'),
            'sw-extension-store-listing-banner': Shopware.Component.build('sw-extension-store-listing-banner'),
            'sw-meteor-card': Shopware.Component.build('sw-meteor-card'),
            'sw-icon': true
        },
        mocks: {
            $sanitize: (text) => text
        }
    });
}

function createExampleCampaign() {
    return {
        name: 'string',
        title: 'string',
        phase: 'comingSoonPhase',
        comingSoonStartDate: '2005-08-15T15:52:01',
        startDate: '2005-08-15T15:52:01',
        lastCallStartDate: '2005-08-15T15:52:01',
        endDate: '2025-08-15T15:52:01',
        components: {
            storeBanner: {
                background: {
                    color: '#ffffff',
                    // eslint-disable-next-line max-len
                    image: 'https://images.background.com/the-background-image',
                    position: '50% 70%',
                },
                content: {
                    textColor: 'rgb(244,244,244)',
                    headline: {
                        'de-DE': 'Super Angebot',
                        'en-GB': 'Amazing offer',
                    },
                    description: {
                        'de-DE': 'Günstiger geht es nicht',
                        'en-GB': 'It will not get cheaper',
                    },
                    cta: {
                        category: 'GitHub',
                        text: {
                            'de-DE': 'Zeige GitHub',
                            'en-GB': 'Show GitHub',
                        },
                    },
                },
            }
        }
    };
}

describe('src/module/component/sw-extension-store-listing-banner', () => {
    /** @type Wrapper */
    let wrapper;

    beforeAll(async () => {
        activateFeature12608();

        // import dependency async because the component is behind a feature flag prrior 6.4.8.0
        await import('src/app/component/meteor/sw-meteor-card');

        Shopware.Service().register('shopwareDiscountCampaignService', () => {
            return new ShopwareDiscountCampaignService();
        });

        // add extensionsStore
        Shopware.State.registerModule('shopwareExtensions', extensionStore);
    });

    beforeEach(() => {
        // reset campaign
        Shopware.State.commit('marketing/setCampaign', {});
        Shopware.Application.view = {
            i18n: jest.fn()
        };
        // reset extensionsStore search
        Shopware.State.get('shopwareExtensions').search = extensionStore.state().search;
    });

    afterEach(async () => {
        if (wrapper) await wrapper.destroy();
    });

    it('should not be visible when no marketing campaign exists', async () => {
        wrapper = createWrapper();

        expect(wrapper.find('.sw-extension-store-listing-banner').exists()).toBe(false);
    });

    it('should be visible when marketing campaign exists', async () => {
        Shopware.State.commit('marketing/setCampaign', createExampleCampaign());

        wrapper = createWrapper();

        expect(wrapper.find('.sw-extension-store-listing-banner').exists()).toBe(true);
    });

    it('should map the values correctly', async () => {
        Shopware.State.commit('marketing/setCampaign', createExampleCampaign());

        wrapper = createWrapper();

        // headline
        expect(wrapper.find('h3').text()).toEqual('Amazing offer')
        // description
        expect(wrapper.find('.sw-extension-store-listing-banner__description').text()).toEqual('It will not get cheaper')
        // bgImage
        const containerStyles = wrapper.find('.sw-extension-store-listing-banner__container').attributes().style;
        expect(containerStyles).toContain('background-image: url(https://images.background.com/the-background-image);')
        expect(containerStyles).toContain('background-position: 50% 70%;')
        expect(containerStyles).toContain('background-repeat: no-repeat;')
        expect(containerStyles).toContain('background-color: rgb(255, 255, 255);')
        expect(containerStyles).toContain('background-size: cover;')
        // text color
        expect(wrapper.find('h3').attributes().style).toContain('color: rgb(244, 244, 244);')
        expect(wrapper.find('.sw-extension-store-listing-banner__description').attributes().style).toContain('color: rgb(244, 244, 244);')
        expect(wrapper.find('.sw-extension-store-listing-banner__cta').attributes().style).toContain('color: rgb(244, 244, 244);')
        // action text
        expect(wrapper.find('.sw-extension-store-listing-banner__cta').text()).toContain('Show GitHub')
    });

    it('should trigger the correct action', async () => {
        Shopware.State.commit('marketing/setCampaign', createExampleCampaign());

        wrapper = createWrapper();

        expect(Shopware.State.get('shopwareExtensions').search.filter).toEqual({});

        await wrapper.find('.sw-extension-store-listing-banner').trigger('click');

        expect(Shopware.State.get('shopwareExtensions').search.filter).toEqual({
            category: 'GitHub'
        });
    });
});
