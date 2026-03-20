import type * as IAP from 'SwagExtensionStore/module/sw-in-app-purchases/types';
import template from './sw-in-app-purchase-checkout-subscription-change.html.twig';
import './sw-in-app-purchase-checkout-subscription-change.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        purchase: {
            type: Object as PropType<IAP.InAppPurchase>,
            required: true,
        },
        cart: {
            type: Object as PropType<IAP.InAppPurchaseCart>,
            required: true,
        },
    },

    computed: {
        locale() {
            const local = String(Shopware.Store.get('session').currentLocale ??
                Shopware.Store.get('context').app?.fallbackLocale ?? 'en-GB');

            return new Intl.Locale(local);
        },

        currencyFilter() {
            return Shopware.Filter.getByName('currency');
        },

        isNextBookingDateInDifferentYear(): boolean {
            const today = new Date();
            const nextBookingDate = this.cartPosition?.nextBookingDate;
            return nextBookingDate !== null && new Date(nextBookingDate).getFullYear() !== today.getFullYear();
        },

        yearFormat(): 'numeric' | '2-digit' | undefined {
            return this.isNextBookingDateInDifferentYear ? 'numeric' : undefined;
        },

        infoHint(): string | null {
            if (!this.cartPosition) {
                return null;
            }

            const variant = this.$t(`sw-in-app-purchase-checkout-subscription-change.variant.${this.cartPosition.variant}`);

            const nextBookingDate = this.cartPosition.nextBookingDate
                ? new Date(this.cartPosition.nextBookingDate).toLocaleDateString(this.locale, {
                    month: 'long',
                    day: 'numeric',
                    year: this.yearFormat,
                })
                : '';

            if (this.cartPosition.subscriptionChange?.type === 'downgrade') {
                return this.$t('sw-in-app-purchase-checkout-subscription-change.downgrade-hint', {
                    variant,
                    fee: this.currencyFilter(this.cart.netPrice, 'EUR', 2),
                    start: nextBookingDate,
                });
            }

            const today = new Date().toLocaleDateString(this.locale, {
                month: 'long',
                day: 'numeric',
                year: this.yearFormat,
            });

            return this.$t('sw-in-app-purchase-checkout-subscription-change.upgrade-hint', {
                today,
                price: this.currencyFilter(this.cartPosition.proratedNetPrice, 'EUR', 2),
                variant,
                fee: this.currencyFilter(this.cart.netPrice, 'EUR', 2),
                start: nextBookingDate,
            });
        },

        cartPosition(): IAP.InAppPurchaseCartPosition {
            return this.cart.positions[0];
        },

        isIncludedInPluginLicense(): boolean {
            return this.cartPosition?.subscriptionChange?.isIncludedInPluginLicense ?? false;
        },

        currentPrice(): string {
            return String(this.currencyFilter(this.cartPosition?.subscriptionChange?.currentNetPrice, 'EUR', 2));
        },

        currentPlanName(): string {
            return this.cartPosition?.subscriptionChange?.currentFeature.name ?? '';
        },

        currentPlanDuration(): string | null {
            if (!this.cartPosition?.subscriptionChange?.currentFeatureVariant) {
                return null;
            }

            return this.$t(`sw-in-app-purchase-price-box.duration.${this.cartPosition?.subscriptionChange?.currentFeatureVariant}`);
        },

        newPlanName(): string {
            return this.cartPosition?.feature.name ?? '';
        },

        newPlanDuration(): string | null {
            if (!this.cartPosition?.variant) {
                return null;
            }

            return this.$t(`sw-in-app-purchase-price-box.duration.${this.cartPosition?.variant}`);
        },

        proratedNetPrice(): string {
            if (this.cartPosition?.subscriptionChange?.type === 'downgrade') {
                return String(this.currencyFilter(0.0, 'EUR', 2));
            }

            return String(this.currencyFilter(this.cartPosition?.proratedNetPrice, 'EUR', 2));
        },
    },
});
