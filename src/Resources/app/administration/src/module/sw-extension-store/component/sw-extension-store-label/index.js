import template from './sw-extension-store-label.html.twig';
import './sw-extension-store-label.scss';

/**
 * @private
 */
export default {
    template,

    props: {
        backgroundColor: {
            type: String,
            required: false,
            // matches sass variable $color-darkgray-600
            default: '#29333dbf'
        }
    },

    methods: {
        determineTextColor(backgroundColor) {
            if (!backgroundColor) {
                return '#000';
            }

            const hexColor = backgroundColor.charAt(0) === '#' ? backgroundColor.substring(1, 7) : backgroundColor;

            const r = parseInt(hexColor.substring(0, 2), 16); // hexToR
            const g = parseInt(hexColor.substring(2, 4), 16); // hexToG
            const b = parseInt(hexColor.substring(4, 6), 16); // hexToB

            return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';
        }
    }
};
