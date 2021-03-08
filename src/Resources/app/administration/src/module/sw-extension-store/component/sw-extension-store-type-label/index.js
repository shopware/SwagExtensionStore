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
                const validTypes = ['app', 'extension'];

                return validTypes.includes(value);
            }
        }
    },

    computed: {
        labelPath() {
            return `sw-extension-store.entityTypes.${this.type}`;
        }
    }
});
