import template from './sw-in-app-purchase-checkout-state.html.twig';
import './sw-in-app-purchase-checkout-state.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        state: {
            type: String as PropType<'loading' | 'error' | 'success'>,
            required: true
        },
        errorSnippet: {
            type: String,
            required: false,
            default: 'errorSubtitle'
        }
    },

    computed: {
        classes() {
            return {
                'is--error': this.state === 'error',
                'is--success': this.state === 'success',
                'is--loading': this.state === 'loading'
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
                    return this.$tc('sw-in-app-purchase-checkout-state.errorTitle');
                case 'success':
                    return this.$tc('sw-in-app-purchase-checkout-state.successTitle');
                default:
                    return null;
            }
        },

        subtitle(): string | null {
            switch (this.state) {
                case 'error':
                    return this.$tc(`sw-in-app-purchase-checkout-state.${this.errorSnippet || 'errorSubtitle'}`);
                case 'success':
                    return this.$tc('sw-in-app-purchase-checkout-state.successSubtitle');
                default:
                    return null;
            }
        }
    }
});
