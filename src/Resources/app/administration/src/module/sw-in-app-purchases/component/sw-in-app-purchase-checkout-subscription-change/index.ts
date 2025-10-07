import type * as IAP from "SwagExtensionStore/module/sw-in-app-purchases/types";
import template from "./sw-in-app-purchase-checkout-subscription-change.html.twig";
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

        formattedStartingDate(): string {
            const date = new Date(this.cartPosition.nextBookingDate ?? '');
            return date.toLocaleDateString(this.locale, { month: "numeric", day: "numeric" });
        },

        infoHint(): string {
            const today = new Date().toLocaleDateString(this.locale, {
                month: 'long',
                day: 'numeric',
            });

            const nextBookingDate = this.cartPosition?.nextBookingDate
                ? new Date(this.cartPosition.nextBookingDate).toLocaleDateString(this.locale, {
                    month: 'long',
                    day: 'numeric',
                })
                : '';

            return this.$t('sw-in-app-purchase-checkout-subscription-change.info-lint', {
                today,
                price: this.currencyFilter(this.cartPosition?.proratedNetPrice, 'EUR', 2),
                variant: this.cartPosition?.variant ?? '',
                fee: this.currencyFilter(this.cart.netPrice, 'EUR', 2),
                start: nextBookingDate,
            });
        },

        cartPosition() {
            return this.cart.positions[0];
        },

        getCurrentPrice() {
            const price = this.cartPosition?.subscriptionChange?.currentFeature?.priceModels
                ?.find((priceModel) => priceModel.variant === this.cartPosition.variant)?.price;

            return String(this.currencyFilter(price, 'EUR', 2));
        },
    },
});
