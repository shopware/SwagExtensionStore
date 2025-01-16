import type * as IAP from 'src/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout.html.twig';
import './sw-in-app-purchase-checkout.scss';

interface ErrorResponse {
    errors: Array<ShopwareHttpError>;
}

interface StoreExtension {
    name: string;
}

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: [
        'inAppPurchasesService'
    ],

    mixins: [
        Shopware.Mixin.getByName('notification')
    ],

    data() {
        return {
            state: 'loading' as 'loading' | 'purchase' | 'error' | 'success',
            store: Shopware.Store.get('inAppPurchaseCheckout'),
            inAppPurchaseCart: null as IAP.InAppPurchaseCart | null,
            extension: null as IAP.Extension | null,
            tosAccepted: false,
            errorSnippet: null as string | null,
            storeExtension: '' as string
        };
    },

    created() {
        // @deprecated tag:v4.0.0 - Will be removed as this.store.extension will be only a string in shopware 6.7
        const extension = this.store.extension as StoreExtension | string;
        this.storeExtension = Shopware.Utils.types.isObject(extension)
            ? extension.name
            : extension;
        this.createdComponent();
    },

    computed: {
        priceModel(): IAP.InAppPurchasePriceModel | null {
            return this.inAppPurchaseCart?.positions?.[0].feature.priceModel || null;
        },
        purchase(): IAP.InAppPurchase | null {
            return this.inAppPurchaseCart?.positions?.[0].feature || null;
        },
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },
        extensionIcon() {
            if (this.extension?.icon) {
                return this.extension.icon;
            }

            if (this.extension?.iconRaw) {
                return `data:image/png;base64, ${this.extension.iconRaw}`;
            }

            return this.assetFilter('administration/static/img/theme/default_theme_preview.jpg');
        }
    },

    methods: {
        createdComponent() {
            this.store.$subscribe(() => {
                this.requestFeature();
            });
        },

        async requestFeature() {
            if (!this.store.extension || !this.store.entry) {
                this.reset();

                return;
            }

            this.state = 'loading';

            await Promise.all([
                this.cart = this.inAppPurchasesService.createCart(
                    this.storeExtension,
                    this.store.entry.identifier
                ),
                this.inAppPurchasesService.getExtension(this.storeExtension)
            ]).then(([inAppPurchaseCart, extension]) => {
                this.inAppPurchaseCart = inAppPurchaseCart;
                this.extension = extension;
                this.state = 'purchase';
            }).catch((errorResponse: ErrorResponse) => {
                Shopware.Utils.debug.error(errorResponse);
                this.state = 'error';
            });
        },

        onPurchaseFeature() {
            if (!this.store.extension || !this.store.entry) {
                this.reset();

                return;
            }

            this.inAppPurchasesService.orderCart(
                this.inAppPurchaseCart?.taxRate,
                this.inAppPurchaseCart?.positions,
                this.extension?.name
            ).then(() => {
                this.state = 'success';
            }).catch((errorResponse: ErrorResponse) => {
                Shopware.Utils.debug.error(errorResponse);
                this.state = 'error';
            });
        },

        handleStateActions(isButton: boolean) {
            switch (this.state) {
                case 'purchase':
                    if (isButton) {
                        this.onPurchaseFeature();
                    } else {
                        this.reset();
                    }
                    break;
                case 'error':
                    if (isButton) {
                        this.requestFeature();
                    } else {
                        this.reset();
                    }
                    break;
                case 'success':
                    this.reset();
                    this.inAppPurchasesService.refreshInAppPurchases()
                        .then(() => {
                            window.location.reload();
                        });
                    break;
                default:
                    this.reset();
                    break;
            }
        },

        reset() {
            this.store.dismiss();
            this.inAppPurchaseCart = null;
            this.extension = null;
            this.errorSnippet = null;
            this.state = 'loading';
        }
    }
});
