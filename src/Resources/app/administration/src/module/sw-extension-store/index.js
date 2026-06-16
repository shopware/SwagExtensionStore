import {
    ExtensionStoreChannelService
} from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import ExtensionLicenseService from './service/extension-store-licenses.service';
import ExtensionStorePreferencesService from './service/extension-store-preferences.service';
import extensionStoreContextStore from './store/extension-store-context.store';


Shopware.Component.register('sw-extension-store-index', () => import('./page/sw-extension-store-index'));
Shopware.Component.register(
    'sw-extension-store-purchase-confirmation-checkout',
    () => import('./component/sw-extension-store-purchase-confirmation-checkout')
);
Shopware.Component.register(
    'sw-extension-store-purchase-confirmation-checkout-overview',
    () => import('./component/sw-extension-store-purchase-confirmation-checkout-overview')
);
Shopware.Component.register(
    'sw-extension-store-purchase-confirmation-modal',
    () => import('./component/sw-extension-store-purchase-confirmation-modal')
);
Shopware.Component.register(
    'sw-extension-store-purchase-confirmation-permissions',
    () => import('./component/sw-extension-store-purchase-confirmation-permissions')
);
Shopware.Component.register(
    'sw-extension-store-in-app-purchases-listing-modal',
    () => import('./component/sw-extension-store-in-app-purchases-listing-modal')
);

Shopware.Application.addServiceProvider('extensionStoreChannelService', () => {
    return new ExtensionStoreChannelService(
        Shopware.Service('extensionStoreActionService'),
        Shopware.Service('shopwareExtensionService'),
        Shopware.Service('extensionStoreLicensesService'),
        Shopware.Service('extensionHelperService'),
        Shopware.Service('cacheApiService'),
        Shopware.Application.view.router,
        Shopware.Service('extensionStorePreferencesService')
    );
});

Shopware.Application.addServiceProvider('extensionStoreLicensesService', () => {
    return new ExtensionLicenseService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.Application.addServiceProvider('extensionStorePreferencesService', () => {
    return new ExtensionStorePreferencesService(
        Shopware.Service('userConfigService')
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
                privilege: 'system.extension_store'
            },
            component: 'sw-extension-store-index'
        },
        // The Shopware Admin requires this exact route name (sw.extension.store.detail)
        // to link to the details page in the Store.
        'store.detail': {
            path: 'store/detail/:id',
            meta: {
                parentPath: 'sw.extension.store',
                privilege: 'system.extension_store'
            },
            // TODO(ECTO-2679): Implement deep linking to PDP.
            component: 'sw-extension-store-index',
            props: {
                default: (route) => {
                    return { id: route.params.id };
                }
            }
        }
    },

    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.extension.store.landing-page') {
            currentRoute.redirect = {
                name: 'sw.extension.store'
            };
        }

        next(currentRoute);
    }
});

// Pre-fetch & cache iframe URL to speed up the initial loading of the admin store.
Shopware.Application.viewInitialized.then(() => {
    return extensionStoreContextStore().loadIframeUrl();
});
