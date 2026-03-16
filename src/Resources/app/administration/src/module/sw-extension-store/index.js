import ExtensionStoreService from './service/extension-store.service';
import ExtensionStoreDataService from './service/extension-store-data.service';
import ExtensionLicenseService from './service/extension-store-licenses.service';
import {
    ExtensionStoreChannelService,
} from "SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service";


Shopware.Component.register('sw-extension-store-index', () => import('./page/sw-extension-store-index'));
Shopware.Component.register('sw-extension-store-slider', () => import('./component/sw-extension-store-slider'));
Shopware.Component.register('sw-extension-store-listing-filter', () => import('./component/sw-extension-store-listing-filter'));
Shopware.Component.register('sw-extension-buy-modal', () => import('./component/sw-extension-buy-modal'));
Shopware.Component.register('sw-extension-store-purchase-confirmation-checkout', () => import('./component/sw-extension-store-purchase-confirmation-checkout'));
Shopware.Component.register('sw-extension-store-purchase-confirmation-checkout-overview', () => import('./component/sw-extension-store-purchase-confirmation-checkout-overview'));
Shopware.Component.register('sw-extension-store-purchase-confirmation-modal', () => import('./component/sw-extension-store-purchase-confirmation-modal'));
Shopware.Component.register('sw-extension-store-purchase-confirmation-permissions', () => import('./component/sw-extension-store-purchase-confirmation-permissions'));
Shopware.Component.register('sw-extension-listing-card', () => import('./component/sw-extension-listing-card'));
Shopware.Component.register('sw-extension-store-update-warning', () => import('./component/sw-extension-store-update-warning'));
Shopware.Component.register('sw-extension-label', () => import('./component/sw-extension-store-label'));
Shopware.Component.register('sw-extension-type-label', () => import('./component/sw-extension-store-type-label'));
Shopware.Component.register('sw-extension-store-label-display', () => import('./component/sw-extension-store-label-display'));
Shopware.Component.register('sw-extension-store-error-card', () => import('./component/sw-extension-store-error-card'));
Shopware.Component.register('sw-extension-store-accessibility', () => import('./component/sw-extension-store-accessibility'));
Shopware.Component.register('sw-extension-store-statistics-promotion', () => import('./component/sw-extension-store-statistics-promotion'));
Shopware.Component.register('sw-extension-store-in-app-purchases-listing-modal', () => import('./component/sw-extension-store-in-app-purchases-listing-modal'));


Shopware.Application.addServiceProvider('extensionStoreService', () => {
    return new ExtensionStoreService(
        Shopware.Service('shopwareDiscountCampaignService'),
        Shopware.Service('shopwareExtensionService'),
    );
});

Shopware.Application.addServiceProvider('extensionStoreChannelService', () => {
    return new ExtensionStoreChannelService(
        Shopware.Service('extensionStoreActionService'),
        Shopware.Service('shopwareExtensionService'),
        Shopware.Service('extensionStoreLicensesService'),
        Shopware.Service('extensionHelperService'),
        Shopware.Service('cacheApiService'),
        Shopware.Application.view.router,
    );
});

Shopware.Application.addServiceProvider('extensionStoreDataService', () => {
    return new ExtensionStoreDataService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService'),
    );
});

Shopware.Application.addServiceProvider('extensionStoreLicensesService', () => {
    return new ExtensionLicenseService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService'),
    );
});

Shopware.Module.register('sw-extension-store', {
    title: 'sw-extension-store.general.title',
    name: 'sw-extension-store.general.title',
    routePrefixName: 'sw.extension',
    routePrefixPath: 'sw/extension',
    routes: {
        store: {
            path: 'store/:pathMatch(.*)*',
            name: 'Store',
            meta: {
                privilege: 'system.extension_store',
            },
            component: 'sw-extension-store-index',
        },
    },

    /**
     * Add routeMiddleware to add a redirect to the landing page
     */
    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.extension.store.landing-page') {
            currentRoute.redirect = {
                name: 'sw.extension.store.listing',
            };
        }

        next(currentRoute);
    },
});
