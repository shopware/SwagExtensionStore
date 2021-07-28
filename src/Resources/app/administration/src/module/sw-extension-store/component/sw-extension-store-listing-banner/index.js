import template from './sw-extension-store-listing-banner.html.twig';
import './sw-extension-store-listing-banner.scss';

Shopware.Component.register('sw-extension-store-listing-banner', {
    template,

    props: {
        campaignName: {
            type: String,
            required: true
        },
        headline: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        textAction: {
            type: String,
            required: true
        },
        toBeOpenedCategory: {
            type: String,
            required: true
        },
        textColor: {
            type: String,
            required: false,
            default: '#52667a'
        },
        bgColor: {
            type: String,
            required: false,
            default: '#fff'
        },
        bgImage: {
            type: String,
            required: false,
            default: null
        },
        bgPosition: {
            type: String,
            required: false,
            default: '50% 50%'
        }
    },

    computed: {
        containerStyles() {
            if (this.bgImage) {
                return {
                    backgroundImage: `url('${this.bgImage}')`,
                    backgroundPosition: this.bgPosition,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: this.bgColor,
                    backgroundSize: 'cover'
                };
            }

            return {
                backgroundColor: this.bgColor
            };
        }
    },

    methods: {
        onClickBanner() {
            // set category filter value
            Shopware.State.get('shopwareExtensions').search.filter = {
                category: this.toBeOpenedCategory
            };
        }
    }
});
