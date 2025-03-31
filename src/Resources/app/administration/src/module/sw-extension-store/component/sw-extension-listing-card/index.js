import template from './sw-extension-listing-card.html.twig';
import './sw-extension-listing-card.scss';

const { Utils } = Shopware;

/**
 * @private
 */
export default {
    template,

    inject: [
        'shopwareExtensionService',
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

        previewMedia() {
            const image = Utils.get(this.extension, 'images[0]', null);

            if (!image) {
                const previewImage = this.assetFilter('/swagextensionstore/administration/static/img/theme/default_theme_preview.jpg');
                return {
                    'background-image': `url('${previewImage}')`,
                };
            }

            return {
                'background-image': `url('${image.remoteLink}')`,
                'background-size': 'cover',
            };
        },

        recommendedVariant() {
            return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants)[0];
        },

        hasActiveDiscount() {
            return this.shopwareExtensionService.isVariantDiscounted(this.recommendedVariant);
        },

        discountClass() {
            return {
                'sw-extension-listing-card__info-price-discounted': this.hasActiveDiscount,
            };
        },

        calculatedPrice() {
            if (!this.recommendedVariant) {
                return null;
            }

            return this.$t(
                'sw-extension-store.general.labelPrice',
                {
                    price: Utils.format.currency(
                        this.shopwareExtensionService.getPriceFromVariant(this.recommendedVariant),
                        'EUR',
                    ),
                },
                this.shopwareExtensionService.mapVariantToRecommendation(this.recommendedVariant),
            );
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
