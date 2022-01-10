import { shallowMount } from '@vue/test-utils';
import 'SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-error-card';
import { activateFeature12608 } from "../../../_helper/activate-feature-12608";

function createWrapper(opts) {
    return shallowMount(Shopware.Component.build('sw-extension-store-error-card'), {
        stubs: {
            'sw-meteor-card': Shopware.Component.build('sw-meteor-card'),
            'sw-label': true,
            'sw-icon': true,
            'sw-button': true
        },
        ...opts
    });
}

describe('sw-extension-listing-card', () => {
    /** @type Wrapper */
    let wrapper;

    beforeAll(async () => {
        activateFeature12608();

        // import dependency async because the component is behind a feature flag prior 6.4.8.0
        await import('src/app/component/meteor/sw-meteor-card');
    });

    it('should be a Vue.js component', () => {
        wrapper = createWrapper();
        expect(wrapper.vm).toBeTruthy();
    });

    it('should render title', async () => {
        wrapper = createWrapper();

        await wrapper.setProps({
            title: 'Please update your plugin.'
        });

        expect(wrapper.find('.sw-extension-store-error-card__title').text()).toBe('Please update your plugin.');
    });

    it('should render message in main slot', () => {
        wrapper = createWrapper({
            slots: {
                default: 'A new version of the plugin is available.'
            }
        });

        expect(wrapper.find('.sw-extension-store-error-card__message').text()).toBe('A new version of the plugin is available.');
    });

    it('should render content in actions slot', () => {
        wrapper = createWrapper({
            slots: {
                actions: '<sw-button>Check for updates</sw-button>'
            }
        });

        expect(wrapper.find('.sw-extension-store-error-card__actions sw-button-stub').exists()).toBe(true);
        expect(wrapper.find('.sw-extension-store-error-card__actions sw-button-stub').text()).toBe('Check for updates');
    });

    describe('render correct icons and color variants', () => {
        const testCases = [
            {
                variant: undefined,
                expectedIcon: 'default-badge-info',
                expectedLabelVariant: 'neutral',
                expectedComponentClass: 'sw-extension-store-error-card--variant-neutral'
            },
            {
                variant: 'info',
                expectedIcon: 'default-badge-info',
                expectedLabelVariant: 'info',
                expectedComponentClass: 'sw-extension-store-error-card--variant-info'
            },
            {
                variant: 'danger',
                expectedIcon: 'default-badge-error',
                expectedLabelVariant: 'danger',
                expectedComponentClass: 'sw-extension-store-error-card--variant-danger'
            },
            {
                variant: 'success',
                expectedIcon: 'default-basic-checkmark-circle',
                expectedLabelVariant: 'success',
                expectedComponentClass: 'sw-extension-store-error-card--variant-success'
            },
            {
                variant: 'warning',
                expectedIcon: 'default-badge-warning',
                expectedLabelVariant: 'warning',
                expectedComponentClass: 'sw-extension-store-error-card--variant-warning'
            },
        ];

        it.each(testCases)('%p', async ({ variant, expectedIcon, expectedLabelVariant, expectedComponentClass }) => {
            wrapper = createWrapper();

            // Only set variant prop when defined
            if (variant) await wrapper.setProps({ variant });

            // Ensure correct label variant
            expect(wrapper.find('.sw-extension-store-error-card__label').attributes().variant).toBe(expectedLabelVariant);

            // Ensure correct icon for variant
            expect(wrapper.find('.sw-extension-store-error-card__label sw-icon-stub').attributes().name).toBe(expectedIcon);

            // Ensure correct component class
            expect(wrapper.classes()).toContain(expectedComponentClass);
        });
    });
});
