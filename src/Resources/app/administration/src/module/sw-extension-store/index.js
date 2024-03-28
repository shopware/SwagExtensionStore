import ExtensionStoreDataService from './service/extension-store-data.service';
import ExtensionLicenseService from './service/extension-store-licenses.service';

/* eslint-disable max-len */
Shopware.Component.register('sw-extension-store-index', () => import('./page/sw-extension-store-index'));
Shopware.Component.register('sw-extension-store-listing', () => import('./page/sw-extension-store-listing'));
Shopware.Component.register('sw-extension-store-detail', () => import('./page/sw-extension-store-detail'));
Shopware.Component.register('sw-extension-store-slider', () => import('./component/sw-extension-store-slider'));
Shopware.Component.register('sw-extension-store-listing-filter', () => import('./component/sw-extension-store-listing-filter'));
Shopware.Component.register('sw-extension-buy-modal', () => import('./component/sw-extension-buy-modal'));
Shopware.Component.register('sw-extension-listing-card', () => import('./component/sw-extension-listing-card'));
Shopware.Component.register('sw-extension-store-update-warning', () => import('./component/sw-extension-store-update-warning'));
Shopware.Component.register('sw-extension-label', () => import('./component/sw-extension-store-label'));
Shopware.Component.register('sw-extension-type-label', () => import('./component/sw-extension-store-type-label'));
Shopware.Component.register('sw-extension-store-label-display', () => import('./component/sw-extension-store-label-display'));
Shopware.Component.register('sw-extension-store-error-card', () => import('./component/sw-extension-store-error-card'));
Shopware.Component.register('sw-extension-store-statistics-promotion', () => import('./component/sw-extension-store-statistics-promotion'));
/* eslint-enable max-len */

Shopware.Application.addServiceProvider('extensionStoreDataService', () => {
    return new ExtensionStoreDataService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.Application.addServiceProvider('extensionStoreLicensesService', () => {
    return new ExtensionLicenseService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.Module.register('sw-extension-store', {
    title: 'sw-extension-store.general.title',
    name: 'sw-extension-store.general.title',
    routePrefixName: 'sw.extension',
    routePrefixPath: 'sw/extension',
    routes: {
        store: {
            path: 'store',
            redirect: {
                name: 'sw.extension.store.listing'
            },
            meta: {
                privilege: 'system.extension_store'
            },
            component: 'sw-extension-store-index',
            children: {
                listing: {
                    path: 'listing',
                    component: 'sw-extension-store-listing',
                    redirect: {
                        name: 'sw.extension.store.listing.app'
                    },
                    meta: {
                        privilege: 'system.extension_store'
                    },
                    children: {
                        app: {
                            path: 'app',
                            component: 'sw-extension-store-listing',
                            propsData: {
                                isTheme: false
                            },
                            meta: {
                                privilege: 'system.extension_store'
                            }
                        },
                        theme: {
                            path: 'theme',
                            component: 'sw-extension-store-listing',
                            propsData: {
                                isTheme: true
                            },
                            meta: {
                                privilege: 'system.extension_store'
                            }
                        }
                    }
                }
            }
        },
        'store.detail': {
            component: 'sw-extension-store-detail',
            path: 'store/detail/:id',
            meta: {
                parentPath: 'sw.extension.store',
                privilege: 'system.extension_store'
            },
            props: {
                default: (route) => {
                    return { id: route.params.id };
                }
            }
        }
    },

    /**
     * Add routeMiddleware to add a redirect to the landing page
     */
    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.extension.store.landing-page') {
            currentRoute.redirect = {
                name: 'sw.extension.store.listing'
            };
        }

        next(currentRoute);
    }
});
