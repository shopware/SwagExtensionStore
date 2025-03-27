import InAppPurchases from './service/in-app-purchases.service';

Shopware.Component.override(
    'sw-in-app-purchase-checkout',
    () => import('./component/sw-in-app-purchase-checkout'),
);
Shopware.Component.register(
    'sw-in-app-purchase-checkout-button',
    () => import('./component/sw-in-app-purchase-checkout-button'),
);
Shopware.Component.register(
    'sw-in-app-purchase-checkout-overview',
    () => import('./component/sw-in-app-purchase-checkout-overview'),
);
Shopware.Component.register(
    'sw-in-app-purchase-checkout-state',
    () => import('./component/sw-in-app-purchase-checkout-state'),
);
Shopware.Component.register(
    'sw-in-app-purchase-price-box',
    () => import('./component/sw-in-app-purchase-price-box'),
);

Shopware.Application.addServiceProvider('inAppPurchasesService', () => {
    return new InAppPurchases(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService'),
    );
});
