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

    data() {
        return {
            extension: null,
            isAppInstalled: false,
            isLoading: true
        };
    },

    computed: {
        showBanner() {
            if (this.isLoading) {
                return false;
            }

            return !this.isAppInstalled;
        },

        linkToStatisticsAppExists() {
            return !!this.extension;
        }
    },

    created() {
        this.isLoading = true;
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            const loaded = this.shopwareExtensionService.updateExtensionData().then(() => {
                this.isAppInstalled = Shopware.State.get('shopwareExtensions').myExtensions.data.some(
                    // We will show it as long as it is installed. It does not matter if it is active or not.
                    (extension) => (extension.name === STATISTICS_APP_NAME) && extension.installedAt
                );

                this.isLoading = false;
            });
            this.$emit('component-loaded', {
                componentName: 'sw-extension-store-statistics-promotion',
                loadedPromise: loaded
            });

            // Let us not wait extra time just for the link to the detail page
            this.extension = await this.extensionStoreDataService.getExtensionByName(
                STATISTICS_APP_NAME,
                Shopware.Context.api
            );

            await loaded;
        },

        goToStatisticsAppDetailPage() {
            if (!this.linkToStatisticsAppExists) {
                return;
            }

            this.$router.push({ name: 'sw.extension.store.detail', params: { id: this.extension.id } });
        }
    }
});
