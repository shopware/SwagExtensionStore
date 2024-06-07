import template from './sw-extension-store-statistics-promotion.html.twig';
import './sw-extension-store-statistics-promotion.scss';

const STATISTICS_APP_NAME = 'SwagAnalytics';

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['extensionStoreDataService'],

    i18n: {
        messages: {
            'en-GB': {
                'app-name': 'Shopware Analytics',
                'app-description': 'Unlock store performance metrics',
                'go-to-app': 'Try it out now'
            },
            'de-DE': {
                'app-name': 'Shopware Analytics',
                'app-description': 'Erfasse wichtige Shop-Kennzahlen',
                'go-to-app': 'Jetzt ausprobieren'
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
