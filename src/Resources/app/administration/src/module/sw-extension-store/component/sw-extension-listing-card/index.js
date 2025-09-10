import template from './sw-extension-listing-card.html.twig';
import './sw-extension-listing-card.scss';

/**
 * @private
 */
export default {
    template,

    inject: [
        'extensionStoreService',
    ],

    props: {
        extension: {
            type: Object,
            required: true,
        },
    },

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },

        calculatedPrice() {
            return this.extensionStoreService.getCalculatedPrice(this.recommendedVariant);
        },

        calculatedPriceSnippet() {
            return this.extensionStoreService.getCalculatedPriceSnippet(this.extension.variants);
        },

        hasActiveDiscount() {
            return this.extensionStoreService.isExtensionDiscounted(this.extension.variants);
        },

        isFree() {
            return this.extensionStoreService.isVariantOfTypeFree(this.recommendedVariant);
        },

        isInstalled() {
            return !!Shopware.Store.get('shopwareExtensions').myExtensions.data.some((installedExtension) => {
                return installedExtension.installedAt && installedExtension.name === this.extension.name;
            });
        },

        isLicensed() {
            const extension = Shopware.Store.get('shopwareExtensions').myExtensions.data
                .find((installedExtension) => installedExtension.name === this.extension.name);

            if (extension === undefined) {
                return false;
            }

            return !!extension.storeLicense;
        },

        priceClass() {
            return {
                'sw-extension-listing-card__info-price-discounted': this.hasActiveDiscount,
            };
        },

        recommendedVariant() {
            return this.extensionStoreService.getRecommendedVariant(this.extension.variants);
        },
    },

    methods: {
        openDetailPage() {
            this.$router.push({
                name: 'sw.extension.store.detail',
                params: { id: this.extension.id.toString() },
            });
        },
    },
};
