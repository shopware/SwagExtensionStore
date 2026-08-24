import template from './sw-in-app-purchase-checkout-state.html.twig';
import './sw-in-app-purchase-checkout-state.scss';

const SNIPPET_ROOT = 'sw-in-app-purchase-checkout-state';

/**
 * States that describe their reason with a snippet key, mapped to the namespace that key lives in.
 */
const REASON_NAMESPACES: Record<string, string> = {
    error: 'errors',
    info: 'infos'
};

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        state: {
            type: String as PropType<'loading' | 'error' | 'success' | 'info'>,
            required: true
        },
        reason: {
            type: String,
            required: false,
            default: null
        }
    },

    computed: {
        classes() {
            return {
                'is--error': this.state === 'error',
                'is--success': this.state === 'success',
                'is--loading': this.state === 'loading',
                'is--info': this.state === 'info'
            };
        },

        icon(): string | null {
            switch (this.state) {
                case 'error':
                    return 'solid-times';
                case 'success':
                    return 'solid-checkmark';
                case 'info':
                    return 'solid-info-circle';
                default:
                    return null;
            }
        },

        title(): string | null {
            switch (this.state) {
                case 'error':
                case 'success':
                case 'info':
                    return this.resolveSnippet('title');
                default:
                    return null;
            }
        },

        subtitle(): string | null {
            switch (this.state) {
                case 'error':
                case 'success':
                case 'info':
                    return this.resolveSnippet('subtitle');
                default:
                    return null;
            }
        }
    },

    methods: {
        resolveSnippet(part: 'title' | 'subtitle'): string {
            const fallback = `${SNIPPET_ROOT}.${this.state}${part === 'title' ? 'Title' : 'Subtitle'}`;
            const namespace = REASON_NAMESPACES[this.state];

            if (!namespace || !this.reason) {
                return this.$t(fallback);
            }

            const base = `${SNIPPET_ROOT}.${namespace}.${this.reason}`;

            if (this.$te(`${base}.${part}`)) {
                return this.$t(`${base}.${part}`);
            }

            if (part === 'subtitle' && this.$te(base)) {
                return this.$t(base);
            }

            return this.$t(fallback);
        }
    }
});
