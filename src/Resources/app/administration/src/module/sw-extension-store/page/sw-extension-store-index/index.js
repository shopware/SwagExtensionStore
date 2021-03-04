import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

const { Component } = Shopware;

/**
 * @private
 */
Component.register('sw-extension-store-index', {
    template,

    inject: [
        'extensionStoreDataService'
    ],

    props: {
        id: {
            type: String,
            required: false,
            default: null
        }
    },

    data() {
        return {
            updateAvailable: false
        };
    },

    computed: {
        activeFilters() {
            return Shopware.State.get('shopwareExtensions').search.filter;
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
            const extensionStore = await this.getExtensionStore();

            if (!extensionStore) {
                return;
            }

            if (this.isUpdateable(extensionStore)) {
                this.updateAvailable = true;
                return;
            }

            this.updateAvailable = false;
        },

        getExtensionStore() {
            return this.extensionStoreDataService.getMyExtensions('SwagPayPal').then((extensions) => {
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
