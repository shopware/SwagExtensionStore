import template from './sw-extension-store-statistics-promotion.html.twig';
import './sw-extension-store-statistics-promotion.scss';

const STATISTICS_APP_NAME = 'SwagBraintreeApp'; // TODO: change to statistics app name

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['shopwareExtensionService', 'extensionStoreDataService'],

    i18n: {
        messages: {
            'en-GB': {
                title: 'Begin your journey to data driven success',
                cta: 'Get started with analytics'
            }
        }
    },

    computed: {
        showBanner() {
            if (Shopware.State.get('shopwareExtensions').myExtensions.loading) {
                return false;
            }

            const isAppInstalled = Shopware.State.get('shopwareExtensions').myExtensions.data.some(
                // We will show it as long as it is installed. It does not matter if it is active or not.
                (extension) => (extension.name === STATISTICS_APP_NAME) && extension.installedAt
            );

            return !isAppInstalled && this.linkToStatisticsAppExists;
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
            this.shopwareExtensionService.updateExtensionData();

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
