import { shallowMount } from '@vue/test-utils';
import 'src/app/component/meteor/sw-meteor-card';

Shopware.Component.register(
    'sw-extension-store-error-card',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-error-card')
);

async function createWrapper(opts) {
    return shallowMount(await Shopware.Component.build('sw-extension-store-error-card'), {
        stubs: {
            'sw-meteor-card': await Shopware.Component.build('sw-meteor-card'),
            'sw-label': true,
            'sw-icon': true,
            'sw-button': true
        },
        ...opts
    });
}

describe('sw-extension-store-error-card', () => {
    /** @type Wrapper */
    let wrapper;

    it('should render title', async () => {
        wrapper = await createWrapper();

        await wrapper.setProps({
            title: 'Please update your plugin.'
        });

        expect(wrapper.find('.sw-extension-store-error-card__title').text()).toBe('Please update your plugin.');
    });

    it('should render message in main slot', async () => {
        wrapper = await createWrapper({
            slots: {
                default: 'A new version of the plugin is available.'
            }
        });

        expect(wrapper.find('.sw-extension-store-error-card__message').text())
            .toBe('A new version of the plugin is available.');
    });

    it('should render content in actions slot', async () => {
        wrapper = await createWrapper({
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
                expectedIcon: 'regular-info-circle',
                expectedLabelVariant: 'neutral',
                expectedComponentClass: 'sw-extension-store-error-card--variant-neutral'
            },
            {
                variant: 'info',
                expectedIcon: 'regular-info-circle',
                expectedLabelVariant: 'info',
                expectedComponentClass: 'sw-extension-store-error-card--variant-info'
            },
            {
                variant: 'danger',
                expectedIcon: 'regular-times-circle',
                expectedLabelVariant: 'danger',
                expectedComponentClass: 'sw-extension-store-error-card--variant-danger'
            },
            {
                variant: 'success',
                expectedIcon: 'regular-check-circle',
                expectedLabelVariant: 'success',
                expectedComponentClass: 'sw-extension-store-error-card--variant-success'
            },
            {
                variant: 'warning',
                expectedIcon: 'regular-exclamation-circle',
                expectedLabelVariant: 'warning',
                expectedComponentClass: 'sw-extension-store-error-card--variant-warning'
            }
        ];

        it.each(testCases)('%p', async ({ variant, expectedIcon, expectedLabelVariant, expectedComponentClass }) => {
            wrapper = await createWrapper();

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
