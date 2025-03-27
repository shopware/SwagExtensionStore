import analyticsPromotionIcon from 'SwagExtensionStore/../static/img/analytics/extension/icon.svg?url';
import analyticsPromotionGraphic from 'SwagExtensionStore/../static/img/analytics/promotion/graphic.svg?url';
import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

const STATISTICS_APP_NAME = 'SwagAnalytics';
const BADGE_NEW_REMOVAL_DATE = '2025-01-01 00:00:00.000';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['extensionStoreDataService', 'acl'],

    data() {
        return {
            analyticsPromotionIcon,
            analyticsPromotionGraphic,
            isAppInstalled: false,
            routeToApp: null,
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
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.isAppInstalled = !!Shopware.Context.app.config.bundles[STATISTICS_APP_NAME];

            if (!this.canAccessExtensionStore()) {
                // Take the user to the extension store so that they see an "Access denied" message
                this.routeToApp = { name: 'sw.extension.store' };

                return;
            }

            this.extensionStoreDataService.getExtensionByName(
                STATISTICS_APP_NAME,
                Shopware.Context.api,
            ).then((extension) => {
                if (extension) {
                    this.routeToApp = { name: 'sw.extension.store.detail', params: { id: extension.id } };
                }
            });
        },

        goToStatisticsAppDetailPage() {
            if (!this.linkToStatisticsAppExists) {
                return;
            }

            this.$router.push(this.routeToApp);
        },

        canAccessExtensionStore() {
            return this.acl.can('system.plugin_maintain');
        },
    },
});
