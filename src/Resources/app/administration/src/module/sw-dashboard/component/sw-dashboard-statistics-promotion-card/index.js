import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

import '@shopware-ag/meteor-tokens/administration/light.css';
import '@shopware-ag/meteor-tokens/administration/dark.css';

const STATISTICS_APP_NAME = 'StatisticsService';
const BADGE_NEW_REMOVAL_DATE = '2025-01-01';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['extensionStoreDataService', 'acl'],

    i18n: {
        messages: {
            /* eslint-disable max-len */
            'en-GB': {
                'badge-new': 'Available now',
                'promotion-title': 'Shopware Analytics',
                'promotion-text': 'Discover the new growing suite of KPI dashboards in Shopware, providing you with the first essential sales and performance metrics. Look forward to new and continuously expanding insights!',
                'app-name': 'Shopware Analytics',
                'app-description': 'Get insights into your store.',
                'go-to-app': 'Try it out now'
            },
            'de-DE': {
                'badge-new': 'Available now',
                'promotion-title': 'Shopware Analytics',
                'promotion-text': 'Discover the new growing suite of KPI dashboards in Shopware, providing you with the first essential sales and performance metrics. Look forward to new and continuously expanding insights!',
                'app-name': 'Shopware Analytics',
                'app-description': 'Get insights into your store.',
                'go-to-app': 'Try it out now'
            }
            /* eslint-enable max-len */
        }
    },

    data() {
        return {
            isAppInstalled: false,
            routeToApp: null
        };
    },

    computed: {
        showBanner() {
            // If the app is installed and deactivated, we still want to not show the banner
            return !this.isAppInstalled;
        },

        showBadge() {
            return (new Date()) < (new Date(BADGE_NEW_REMOVAL_DATE));
        },

        linkToStatisticsAppExists() {
            return !!this.routeToApp;
        },

        assetFilter() {
            return Shopware.Filter.getByName('asset');
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.isAppInstalled = !!Shopware.Context.app.config.bundles[STATISTICS_APP_NAME];

            if (!this.canAccessExtensionStore()) {
                this.routeToApp = { name: 'sw.extension.store' };
            } else {
                const extension = await this.extensionStoreDataService.getExtensionByName(
                    STATISTICS_APP_NAME,
                    Shopware.Context.api
                );

                this.routeToApp = { name: 'sw.extension.store.detail', params: { id: extension.id } };
            }
        },

        goToStatisticsAppDetailPage() {
            if (!this.linkToStatisticsAppExists) {
                return;
            }

            this.$router.push(this.routeToApp);
        },

        canAccessExtensionStore() {
            return this.acl.can('system.plugin_maintain');
        }
    }
});
