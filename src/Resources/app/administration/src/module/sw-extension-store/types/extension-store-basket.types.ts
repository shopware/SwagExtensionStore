type ExtensionStoreBasketShop = {
    id: number;
    domain: string;
};

type ExtensionStoreBasketExtension = {
    id: number;
    name: string;
    type: 'app' | 'plugin';
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
    paymentMeanRequired: boolean;
    registrationUrl: string;
};

type ExtensionStoreBasket = {
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

export type {
    ExtensionStoreBasketShop,
    ExtensionStoreBasketExtension,
    ExtensionStoreBasketVariant,
    ExtensionStoreBasketPosition,
    ExtensionStoreBasketPayment,
    ExtensionStoreBasket,
};
