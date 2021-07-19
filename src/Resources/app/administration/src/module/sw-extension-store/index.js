import './page/sw-extension-store-index';
import './page/sw-extension-store-listing';
import './page/sw-extension-store-detail';
import './component/sw-extension-store-slider';
import './component/sw-extension-store-listing-filter';
import './component/sw-extension-buy-modal';
import './component/sw-extension-listing-card';
import './component/sw-extension-store-update-warning';
import './component/sw-extension-store-offline-error';
import './component/sw-extension-store-label';
import './component/sw-extension-store-type-label';
import './component/sw-extension-store-label-display';

import ExtensionStoreDataService from './service/extension-store-data.service';
import ExtensionLicenseService from './service/extension-store-licenses.service';
import ExtensionStoreMarketingService from './service/extension-store-marketing.service';

import MarketingState from './state/marketing.state';

import initMarketing from './init/marketing.init';

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

Shopware.Application.addServiceProvider('extensionStoreMarketingService', () => {
    return new ExtensionStoreMarketingService(
        Shopware.Application.getContainer('init').httpClient,
        Shopware.Service('loginService')
    );
});

Shopware.State.registerModule('extensionStoreMarketing', MarketingState)

// initialize marketing campaigns directly
initMarketing();

Shopware.Module.register('sw-extension-store', {
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
