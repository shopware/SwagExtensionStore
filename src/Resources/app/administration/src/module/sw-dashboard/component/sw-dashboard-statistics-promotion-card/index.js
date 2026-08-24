import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

const STATISTICS_APP_NAME = 'SwagAnalytics';
const BADGE_NEW_REMOVAL_DATE = '2025-01-01 00:00:00.000';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['acl'],

    i18n: {
        messages: {
            /* eslint-disable max-len */
            'en-GB': {
                'badge-new': 'Available now',
                'promotion-title': 'Shopware Analytics',
                'promotion-text': 'Discover the new suite of KPIs with your sales and performance metrics in Shopware. Get ready to benefit from an ever-expanding range of fresh insights to support your journey toward success!',
                'app-name': 'Shopware Analytics',
                'app-description': 'Unlock store performance metrics',
                'go-to-app': 'Try it out now'
            },
            'de-DE': {
                'badge-new': 'Jetzt verfügbar',
                'promotion-title': 'Shopware Analytics',
                'promotion-text': 'Entdecke die neue Suite an Kennzahlen mit Deinen Verkaufs- und Leistungsmetriken in Shopware. Mach Dich bereit, von einer ständig wachsenden Auswahl an Auswertungen zu profitieren, die Deine Reise zum Erfolg unterstützen!',
                'app-name': 'Shopware Analytics',
                'app-description': 'Erfasse wichtige Shop-Kennzahlen',
                'go-to-app': 'Jetzt ausprobieren'
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
        }
    }
});
