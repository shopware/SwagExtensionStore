import template from './sw-extension-store-purchase-confirmation-checkout-overview.html.twig';
import './sw-extension-store-purchase-confirmation-checkout-overview.scss';

import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../../types/extension-store-basket.types';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        cart: {
            type: Object as PropType<ExtensionStoreBasket>,
            required: true,
        },
        defaultPaymentMean: {
            type: Object as PropType<ExtensionStorePaymentMean>,
            required: true,
        },
        editable: {
            type: Boolean,
            required: false,
            default: true,
        },
        hasPaymentMethodError: {
            type: Boolean,
            required: false,
            default: false,
        },
    },

    data() {
        return {
            showPaymentMethodBanner: this.hasPaymentMethodError,
        };
    },

    computed: {
        position() {
            return this.cart?.positions?.[0];
        },

        extension() {
            return this.position?.extension;
        },

        producer() {
            return this.extension?.producer;
        },

        bookingShop() {
            return this.cart?.bookingShop;
        },

        bookingShopDomain() {
            const domain = this.bookingShop?.domain ?? '';

            if (!domain) {
                return '';
            }

            // If the domain does not start with http:// or https://, prepend https://
            if (!/^https?:\/\//i.test(domain)) {
                return `https://${domain}`;
            }

            return domain;
        },

        billingAddress() {
            return this.cart?.billingAddress;
        },

        cartHasBillingAddress() {
            return this.billingAddress?.fullName
                && this.billingAddress.street
                && this.billingAddress.city
                && this.billingAddress.country
                && this.billingAddress.zip;
        },

        payment() {
            return this.cart?.payment;
        },
    },
});
