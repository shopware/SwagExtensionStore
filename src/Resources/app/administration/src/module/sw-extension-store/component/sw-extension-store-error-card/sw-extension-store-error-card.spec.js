import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-extension-store-error-card',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-error-card')
);

async function createWrapper(opts) {
    return mount(await Shopware.Component.build('sw-extension-store-error-card'), {
        ...opts,
        global: {
            renderStubDefaultSlot: true,
            stubs: {
                'sw-meteor-card': await wrapTestComponent('sw-meteor-card', { sync: true }),
                'sw-button': await wrapTestComponent('sw-button', { sync: true }),
                'sw-button-deprecated': await wrapTestComponent('sw-button-deprecated', { sync: true }),
                'sw-label': true,
                'sw-icon': true
            }
        }
    });
}

describe('sw-extension-store-error-card', () => {
    it('should render title', async () => {
        const wrapper = await createWrapper({
            props: {
                title: 'Please update your plugin.'
            }
        });

        expect(wrapper.get('.sw-extension-store-error-card__title').text()).toBe('Please update your plugin.');
    });

    it('should render message in main slot', async () => {
        const wrapper = await createWrapper({
            slots: {
                default: 'A new version of the plugin is available.'
            }
        });

        expect(wrapper.get('.sw-extension-store-error-card__message').text())
            .toBe('A new version of the plugin is available.');
    });

    it('should render content in actions slot', async () => {
        const wrapper = await createWrapper({
            slots: {
                actions: '<sw-button>Check for updates</sw-button>'
            }
        });

        expect(wrapper.get('.sw-extension-store-error-card__actions .sw-button').exists()).toBe(true);
        expect(wrapper.get('.sw-extension-store-error-card__actions .sw-button').text()).toBe('Check for updates');
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
            const wrapper = await createWrapper({
                props: {
                    variant
                }
            });

            // Ensure correct label variant
            expect(wrapper.get('.sw-extension-store-error-card__label').attributes().variant).toBe(expectedLabelVariant);

            // Ensure correct icon for variant
            expect(wrapper.get('.sw-extension-store-error-card__label sw-icon-stub').attributes().name).toBe(expectedIcon);

            // Ensure correct component class
            expect(wrapper.classes()).toContain(expectedComponentClass);
        });
    });
});
