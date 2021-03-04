import './page/sw-extension-store-index';
import './page/sw-extension-store-listing';
import './page/sw-extension-store-detail';
import './component/sw-extensions-store-slider';
import './component/sw-extension-store-listing-filter';
import './component/sw-extension-buy-modal';
import './component/sw-extension-permissions-modal';
import './component/sw-extension-privacy-policy-extensions-modal';
import './component/sw-extension-listing-card';
import './component/sw-extension-deactivation-modal';
import './component/sw-extension-removal-modal';
import './component/sw-extension-uninstall-modal';
import './component/sw-extension-store-update-warning';
import './component/sw-ratings/sw-extension-rating-stars';
import './component/sw-ratings/sw-extension-ratings-card';
import './component/sw-ratings/sw-extension-ratings-summary';
import './component/sw-ratings/sw-extension-review';
import './component/sw-ratings/sw-extension-review-creation';
import './component/sw-ratings/sw-extension-review-creation-inputs';
import './component/sw-ratings/sw-extension-review-reply';
import './component/sw-ratings/sw-extension-select-rating';
import './component/sw-ratings/sw-extension-rating-modal';

Shopware.Module.register('sw-extension-store', {
    routePrefixName: 'sw.extension',
    routePrefixPath: 'sw/extension',
    routes: {
        store: {
            path: 'store',
            redirect: {
                name: 'sw.extension.store.listing'
            },
            component: 'sw-extension-store-index',
            children: {
                listing: {
                    path: 'listing',
                    component: 'sw-extension-store-listing',
                    redirect: {
                        name: 'sw.extension.store.listing.app'
                    },
                    children: {
                        app: {
                            path: 'app',
                            component: 'sw-extension-store-listing',
                            propsData: {
                                isTheme: false
                            }
                        },
                        theme: {
                            path: 'theme',
                            component: 'sw-extension-store-listing',
                            propsData: {
                                isTheme: true
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
                parentPath: 'sw.extension.store'
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
    }
});
