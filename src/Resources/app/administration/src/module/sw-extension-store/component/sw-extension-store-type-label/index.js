import template from './sw-extension-store-type-label.html.twig';

/**
 * @private
 */
Shopware.Component.register('sw-extension-type-label', {
    template,

    props: {
        type: {
            type: String,
            required: true,
            validator(value) {
                const validTypes = ['app', 'plugin'];

                return validTypes.includes(value);
            }
        }
    },

    computed: {
        isApp() {
            return this.type === 'app';
        }
    }
});
