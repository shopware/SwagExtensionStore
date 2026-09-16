import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

const STATISTICS_APP_NAME = 'SwagAnalytics';
const BADGE_NEW_REMOVAL_DATE = '2025-01-01 00:00:00.000';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['acl'],

    data() {
        return {
            isAppInstalled: false,
            routeToApp: null,
        };
    },

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },

        showBanner() {
            // If the app is installed and deactivated, we still want to not show the banner
            return !this.isAppInstalled;
        },

        showBadge() {
            return (new Date()) < (new Date(BADGE_NEW_REMOVAL_DATE));
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.isAppInstalled = !!Shopware.Context.app.config.bundles[STATISTICS_APP_NAME];

            // Even if the user does not have permissions, take them to the extension store so that they see an
            // "Access denied" message.
            this.routeToApp = this.canAccessExtensionStore()
                ? { name: 'sw.extension.store.detail', params: { id: STATISTICS_APP_NAME } }
                : { name: 'sw.extension.store' };
        },

        goToStatisticsAppDetailPage() {
            this.$router.push(this.routeToApp);
        },

        canAccessExtensionStore() {
            return this.acl.can('system.plugin_maintain');
        },
    },
});
