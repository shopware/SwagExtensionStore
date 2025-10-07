export type { Extension } from 'src/module/sw-extension/service/extension-store-action.service';

export type InAppPurchasePriceModel<Type extends 'rent' | 'buy' = 'rent' | 'buy'> = {
    type: Type;
    price: number;
    duration: Type extends 'rent' ? number : undefined | null;
    oneTimeOnly: null;
    variant: 'non-consumable' | 'service' | 'monthly' | 'yearly';
    conditionsType: Type extends 'buy' ? string : undefined | null;
};

export type InAppPurchase = {
    identifier: string;
    name: string;
    description?: string | null;
    price: number;
    serviceConditions?: string | null;
    websiteGtc?: string | null;
    priceModels: Array<InAppPurchasePriceModel>;
    priceModel: InAppPurchasePriceModel;
    preselectedVariant: string;
};

export type InAppSubscriptionChange = {
    id: string;
    type: 'upgrade' | 'downgrade';
    currentNetPrice: number;
    currentFeatureVariant: string;
    currentFeature: InAppPurchase;
    pendingDowngrade: string;
};

export type InAppPurchaseCartPosition = {
    feature: InAppPurchase;
    priceModel: InAppPurchasePriceModel;
    netPrice: number;
    grossPrice: number;
    taxRate: number;
    taxValue: number;
    nextBookingDate: null | Date;
    subscriptionChange: null | InAppSubscriptionChange;
    proratedNetPrice: null | number;
    variant: 'non-consumable' | 'service' | 'monthly' | 'yearly';
};

export type InAppPurchaseCart = {
    netPrice: number;
    grossPrice: number;
    taxRate: number;
    taxValue: number;
    positions: Array<InAppPurchaseCartPosition>;
};

export type InAppPurchaseCollection = Array<InAppPurchase>;
