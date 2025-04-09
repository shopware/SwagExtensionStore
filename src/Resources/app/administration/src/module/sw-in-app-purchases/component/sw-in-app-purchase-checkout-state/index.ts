import template from './sw-in-app-purchase-checkout-state.html.twig';
import './sw-in-app-purchase-checkout-state.scss';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        state: {
            type: String as PropType<'loading' | 'error' | 'success'>,
            required: true,
        },
        error: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            allowedErrors: [
                'The requested in-app feature has already been purchased',
                'Das angefragte In-App Feature wurde bereits erworben',
            ],
        };
    },

    computed: {
        classes() {
            return {
                'is--error': this.state === 'error',
                'is--success': this.state === 'success',
                'is--loading': this.state === 'loading',
            };
        },

        icon(): string | null {
            switch (this.state) {
                case 'error':
                    return 'solid-times';
                case 'success':
                    return 'solid-checkmark';
                default:
                    return null;
            }
        },

        title(): string | null {
            switch (this.state) {
                case 'error':
                    return this.$t('sw-in-app-purchase-checkout-state.errorTitle');
                case 'success':
                    return this.$t('sw-in-app-purchase-checkout-state.successTitle');
                default:
                    return null;
            }
        },

        subtitle(): string | null {
            switch (this.state) {
                case 'error':
                    return this.errorSnippet;
                case 'success':
                    return this.$t('sw-in-app-purchase-checkout-state.successSubtitle');
                default:
                    return null;
            }
        },

        errorSnippet(): string {
            // if snippet is null, return the default error message
            if (!this.error) {
                return this.$t('sw-in-app-purchase-checkout-state.errorSubtitle');
            }

            const slugifiedSnippet = 'errors.' + this.error
                .toLowerCase()
                .replace(/[^a-zA-Z0-9_ -]/g, '') // remove all non-alphanumeric characters except underscores and spaces
                .replace(/[\s_]+/g, '-'); // replace spaces and underscores with hyphens

            // if snippet slug exists in translation file, it comes from the extension store and must be translated
            if (this.$te(`sw-in-app-purchase-checkout-state.${slugifiedSnippet}`)) {
                return this.$t(`sw-in-app-purchase-checkout-state.${slugifiedSnippet}`);
            }

            // if it does not exist in the allowedErrors return the default error message
            if (!this.allowedErrors.includes(this.error)) {
                return this.$t('sw-in-app-purchase-checkout-state.errorSubtitle');
            }

            // if it exists in the allowedErrors it comes from SBP and is already translated
            return this.error;
        },
    },
});
