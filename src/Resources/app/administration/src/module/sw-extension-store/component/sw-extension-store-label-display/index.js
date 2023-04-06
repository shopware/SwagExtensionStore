import template from './sw-extension-store-label-display.html.twig';
import './sw-extension-store-label-display.scss';

/**
 * @private
 */
export default {
    template,

    props: {
        labels: {
            type: Array,
            required: true
        }
    }
};
