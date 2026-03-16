type ExtensionStoreBasketBillingAddress = {
    companyName: string;
    fullName?: string;
    street: string;
    zip: string;
    city: string;
    country: string;
};

type ExtensionStoreBasketShop = {
    id: number;
    domain: string;
};

type ExtensionStoreBasketExtensionProducer = {
    id: number;
    name: string;
    storeLink?: string;
};

type ExtensionStoreBasketExtensionPermission = {
    entity: string;
    operation: string;
};

type ExtensionStoreBasketExtension = {
    id: number;
    name: string;
    type: 'app' | 'plugin';
    icon: string;
    label: string;
    producer: ExtensionStoreBasketExtensionProducer;
    permissions: Record<string, ExtensionStoreBasketExtensionPermission[]>;
    domains: string[];
};

type ExtensionStoreBasketVariant = {
    id: number;
    name: string;
    label: string | null;
    duration: number | null;
};

type ExtensionStoreBasketPosition = {
    extension: ExtensionStoreBasketExtension;
    variant: ExtensionStoreBasketVariant;
    taxRate: number | null;
    netPrice: number;
    taxValue: number;
    grossPrice: number;
    firstMonthFree: boolean;
    pseudoPrice: number | null;
    discountAppliesForMonths: number | null;
    legalText: string | null;
};

type ExtensionStoreBasketPayment = {
    chargingAmount: number;
    paymentMean: { id: number } | null;
    paymentText: string | null;
    paymentTextLabel: string | null;
    paymentMeanRequired: boolean;
    registrationUrl: string;
};

type ExtensionStoreBasket = {
    billingAddress: ExtensionStoreBasketBillingAddress;
    bookingShop: ExtensionStoreBasketShop & { balance: number };
    licenseShop: ExtensionStoreBasketShop;
    /** @deprecated use licenseShop - kept for backwards compatibility */
    shop: ExtensionStoreBasketShop;
    positions: ExtensionStoreBasketPosition[];
    netPrice: number;
    taxRate: number;
    taxValue: number;
    grossPrice: number;
    payment: ExtensionStoreBasketPayment;
    legalText: string | null;
};

type ExtensionStorePaymentMean = {
    id: number;
    type: string;
    label: string;
    default: boolean;
};

export type {
    ExtensionStoreBasketShop,
    ExtensionStoreBasketExtension,
    ExtensionStoreBasketVariant,
    ExtensionStoreBasketPosition,
    ExtensionStoreBasketPayment,
    ExtensionStoreBasket,
    ExtensionStorePaymentMean,
};
