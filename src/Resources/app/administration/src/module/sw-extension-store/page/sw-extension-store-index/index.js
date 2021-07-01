import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

const { Component } = Shopware;

/**
 * @private
 */
Component.register('sw-extension-store-index', {
    template,

    inject: ['extensionStoreActionService', 'shopwareExtensionService', 'storeService'],

    props: {
        id: {
            type: String,
            required: false,
            default: null
        }
    },

    data() {
        return {
            isAvailable: true,
            failReason: ''
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
                this.$set(this.activeFilters, 'group', newValue);
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
            try {
                await this.storeService.ping();
            } catch (err) {
                this.failReason = 'offline';
                this.isAvailable = false;
                return;
            }

            this.shopwareExtensionService.updateExtensionData();

            const extensionStore = await this.getExtensionStore();

            if (!extensionStore) {
                return;
            }

            if (this.isUpdateable(extensionStore)) {
                this.isAvailable = false;
                this.failReason = 'outdated';
                return;
            }

            this.isAvailable = true;
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
            Shopware.State.commit('shopwareExtensions/setSearchValue', { key: 'term', value: term });
        }
    }
});
