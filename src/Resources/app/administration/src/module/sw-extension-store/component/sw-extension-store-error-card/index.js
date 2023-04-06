import template from './sw-extension-store-error-card.html.twig';
import './sw-extension-store-error-card.scss';

/**
 * @private
 */
export default {
    template,

    props: {
        title: {
            type: String,
            required: false
        },
        variant: {
            type: String,
            required: false,
            default: 'neutral',
            validator(value) {
                return ['info', 'danger', 'success', 'warning', 'neutral'].includes(value);
            }
        }
    },

    computed: {
        iconName() {
            switch (this.variant) {
                case 'danger':
                    return 'regular-times-circle';
                case 'info':
                    return 'regular-info-circle';
                case 'warning':
                    return 'regular-exclamation-circle';
                case 'success':
                    return 'regular-check-circle';
                default:
                    return 'regular-info-circle';
            }
        },

        componentClasses() {
            return [
                `sw-extension-store-error-card--variant-${this.variant}`
            ];
        }
    }
};
