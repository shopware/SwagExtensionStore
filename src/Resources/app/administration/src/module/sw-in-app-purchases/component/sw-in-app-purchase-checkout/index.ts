import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout.html.twig';
import './sw-in-app-purchase-checkout.scss';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    inject: [
        'inAppPurchasesService',
    ],

    mixins: [
        Shopware.Mixin.getByName('notification'),
    ],

    data() {
        return {
            state: 'loading' as 'loading' | 'purchase' | 'error' | 'success',
            store: Shopware.Store.get('inAppPurchaseCheckout'),
            inAppPurchaseCart: null as IAP.InAppPurchaseCart | null,
            extension: null as IAP.Extension | null,
            purchase: null as IAP.InAppPurchase | null,
            tosAccepted: false,
            gtcAccepted: false,
            variant: null as string | null,
            errorMessage: null as string | null,
        };
    },

    created() {
        this.createdComponent();
    },

    computed: {
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

            return this.assetFilter('/swagextensionstore/administration/static/img/theme/default_theme_preview.jpg');
        },
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
                this.inAppPurchasesService.getExtension(this.store.extension),
                this.inAppPurchasesService.getPriceModels(this.store.extension, this.store.entry.identifier),
            ]).then(([extension, purchase]) => {
                this.purchase = purchase;
                this.extension = extension;
                this.state = 'purchase';
            }).catch((errorResponse: ErrorResponse) => {
                Shopware.Utils.debug.error(errorResponse);
                this.errorMessage = this.getError(errorResponse);
                this.state = 'error';
            });
        },

        onPurchaseFeature() {
            if (!this.store.extension || !this.store.entry || !this.variant) {
                this.reset();

                return;
            }

            this.inAppPurchasesService.createCart(
                this.store.extension,
                this.store.entry.identifier,
                this.variant,
            ).then((inAppPurchaseCart) => {
                return this.inAppPurchasesService.orderCart(
                    inAppPurchaseCart?.taxRate,
                    inAppPurchaseCart?.positions,
                    this.extension?.name,
                );
            }).then(() => {
                this.state = 'success';
            }).catch((errorResponse: ErrorResponse) => {
                Shopware.Utils.debug.error(errorResponse);
                this.errorMessage = this.getError(errorResponse);
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

        getError(errorResponse: ErrorResponse): string | null {
            return errorResponse?.response?.data.errors[0]?.detail ?? null;
        },

        reset() {
            this.store.dismiss();
            this.inAppPurchaseCart = null;
            this.extension = null;
            this.errorMessage = null;
            this.state = 'loading';
            this.purchase = null;
            this.variant = null;
            this.tosAccepted = false;
            this.gtcAccepted = false;
        },
    },
});
