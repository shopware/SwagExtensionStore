import template from './sw-extension-store-listing.html.twig';
import './sw-extension-store-listing.scss';

/**
 * @private
 */
export default {
    name: 'sw-extension-store-listing',
    template,

    inject: ['feature'],

    emits: ['extension-listing-errors'],

    mixins: ['sw-extension-error'],

    data() {
        return {
            isLoading: false,
        };
    },

    computed: {
        extensions() {
            return Shopware.Store.get('shopwareExtensions').extensionListing;
        },

        currentSearch() {
            return Shopware.Store.get('shopwareExtensions').search;
        },

        page() {
            return this.currentSearch.page;
        },

        limit() {
            return this.currentSearch.limit;
        },

        total() {
            return this.extensions.total || 0;
        },

        rating() {
            return this.currentSearch.rating;
        },

        languageId() {
            return Shopware.Store.get('session').languageId;
        },

        currentLocale() {
            return Shopware.Store.get('session').currentLocale === 'de-DE' ? 'de' : 'en';
        },
    },

    watch: {
        currentSearch: {
            deep: true,
            immediate: true,
            handler() {
                this.getList();
            },
        },
        languageId(newValue) {
            if (newValue !== '') {
                this.getList();
            }
        },
    },

    methods: {
        async getList() {
            this.isLoading = true;

            if (this.languageId === '') {
                return;
            }

            try {
                await this.search();
            } catch (e) {
                this.showExtensionErrors(e);
                this.$emit('extension-listing-errors', e);
            } finally {
                this.isLoading = false;
            }
        },

        async search() {
            const extensionDataService = Shopware.Service('extensionStoreDataService');

            const page = await extensionDataService.getExtensionList(
                Shopware.Store.get('shopwareExtensions').search,
                { ...Shopware.Context.api, languageId: Shopware.Store.get('session').languageId },
            );

            Shopware.Store.get('shopwareExtensions').extensionListing = page;
        },

        setPage({ limit, page }) {
            Shopware.Store.get('shopwareExtensions').setSearchValue({ key: 'limit', value: limit });
            Shopware.Store.get('shopwareExtensions').setSearchValue({ key: 'page', value: page });
        },
    },
};
