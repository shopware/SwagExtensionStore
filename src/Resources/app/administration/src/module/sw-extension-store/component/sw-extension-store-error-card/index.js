import template from './sw-extension-store-error-card.html.twig';
import './sw-extension-store-error-card.scss';

const { Component } = Shopware;

/**
 * @private
 */
Component.register('sw-extension-store-error-card', {
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
                    return 'default-badge-error';
                case 'info':
                    return 'default-badge-info';
                case 'warning':
                    return 'default-badge-warning';
                case 'success':
                    return 'default-basic-checkmark-circle';
                default:
                    return 'default-badge-info';
            }
        },

        componentClasses() {
            return [
                `sw-extension-store-error-card--variant-${this.variant}`
            ];
        }
    }
});
