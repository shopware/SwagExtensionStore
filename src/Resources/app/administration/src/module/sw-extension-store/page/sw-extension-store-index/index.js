import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

/**
 * @private
 */
export default {
    template,

    inject: ['extensionStoreActionService', 'shopwareExtensionService', 'feature'],

    props: {
        id: {
            type: String,
            required: false,
            default: null
        }
    },

    data() {
        return {
            isAvailable: false,
            failReason: '',
            listingError: null,
            isLoading: false
        };
    },

    computed: {
        storeSearchKey() {
            return this.$route.name;
        },

        activeFilters() {
            return Shopware.State.get('shopwareExtensions').search.filter;
        },

        searchValue() {
            return Shopware.State.get('shopwareExtensions').search.term;
        },

        isTheme() {
            const isTheme = this.$route.name.includes('theme');

            return isTheme ? 'themes' : 'apps';
        }
    },

    watch: {
        isTheme: {
            immediate: true,
            handler(newValue) {
                Shopware.State.commit('shopwareExtensions/setSearchValue', {
                    key: 'page',
                    value: 1
                });
                this.activeFilters.group = newValue;
            }
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.checkStoreUpdates();
        },

        async checkStoreUpdates() {
            this.isLoading = true;

            this.shopwareExtensionService.updateExtensionData();

            const extensionStore = await this.getExtensionStore();

            if (!extensionStore) {
                this.isLoading = false;
                return;
            }

            if (this.isUpdateable(extensionStore)) {
                this.isAvailable = false;
                this.failReason = 'outdated';
                this.isLoading = false;
                return;
            }

            this.isAvailable = true;
            this.isLoading = false;
        },

        onExtensionListingError(e) {
            const errors = Shopware.Service('extensionErrorService').handleErrorResponse(e, this);

            this.isAvailable = false;
            this.listingError = errors && errors[0];
            this.failReason = 'listing_error';
        },

        getExtensionStore() {
            return this.extensionStoreActionService.getMyExtensions().then((extensions) => {
                return extensions.find(extension => extension.name === 'SwagExtensionStore');
            });
        },

        isUpdateable(extension) {
            if (!extension || extension.latestVersion === null) {
                return false;
            }

            return extension.latestVersion !== extension.version;
        },

        updateSearch(term) {
            Shopware.State.commit('shopwareExtensions/setSearchValue', {
                key: 'term',
                value: term
            });
        }
    }
};
