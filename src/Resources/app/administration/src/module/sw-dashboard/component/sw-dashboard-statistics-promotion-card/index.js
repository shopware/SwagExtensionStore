import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

const STATISTICS_APP_NAME = 'StatisticsService';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['extensionStoreDataService'],

    i18n: {
        messages: {
            'en-GB': {
                title: 'Begin your journey to data driven success',
                // eslint-disable-next-line max-len
                'promotion-text': 'Ready, set, analyze! Get access to powerful tools to understand customer behavior and enhance your shop\'s performance. Don\'t wait — start collecting essential data now to be ahead of the game.',
                cta: 'Get started with analytics'
            },
            'de-DE': {
                title: 'Beginne Deine Reise zum datengesteuerten Erfolg',
                // eslint-disable-next-line max-len
                'promotion-text': 'Auf die Plätze, fertig, analysieren! Erhalte Zugriff auf leistungsstarke Tools, um das Kundenverhalten zu verstehen und die Leistung Deines Shops zu verbessern. Warte nicht – beginne jetzt mit der Erfassung wichtiger Daten, um der Konkurrenz einen Schritt voraus zu sein.',
                cta: 'Beginne mit der Analyse'
            }
        }
    },

    data() {
        return {
            extension: null,
            isAppInstalled: false
        };
    },

    computed: {
        showBanner() {
            // If the app is installed and deactivated, we still want to not show the banner
            return !this.isAppInstalled;
        },

        linkToStatisticsAppExists() {
            return !!this.extension;
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.isAppInstalled = !!Shopware.Context.app.config.bundles[STATISTICS_APP_NAME];

            this.extension = await this.extensionStoreDataService.getExtensionByName(
                STATISTICS_APP_NAME,
                Shopware.Context.api
            );
        },

        goToStatisticsAppDetailPage() {
            if (!this.linkToStatisticsAppExists) {
                return;
            }

            this.$router.push({ name: 'sw.extension.store.detail', params: { id: this.extension.id } });
        }
    }
});
