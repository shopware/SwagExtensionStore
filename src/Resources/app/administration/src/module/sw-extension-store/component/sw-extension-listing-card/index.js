import template from './sw-extension-listing-card.html.twig';
import './sw-extension-listing-card.scss';

const { Utils } = Shopware;

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
            if (!this.recommendedVariant) {
                return null;
            }

            return Utils.format.currency(
                this.pricePerMonth,
                'EUR',
                2,
            );
        },

        calculatedPriceSnippet() {
            if (this.extensionStoreService.isVariantOfTypeBuy(this.recommendedVariant)) {
                return 'sw-extension-store.general.labelPriceOneTime';
            }

            if (this.extension.variants.length > 1) {
                return 'sw-extension-store.general.labelFromPricePerMonth';
            }

            return 'sw-extension-store.general.labelPricePerMonth';
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

        pricePerMonth() {
            if (!this.recommendedVariant) {
                return null;
            }

            const perMonth = this.extensionStoreService.isVariantOfTypeRent(this.recommendedVariant);

            return this.extensionStoreService.getPriceFromVariant(this.recommendedVariant, perMonth);
        },

        recommendedVariant() {
            const variants = this.extension.variants;

            if (variants.length === 1) {
                return variants[0];
            }

            const variant = this.extensionStoreService.orderVariantsByPricePerMonth(variants)[0];

            if (!variant) {
                return null;
            }

            return variant;
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
