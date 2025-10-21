import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';
import { handle } from '@shopware-ag/meteor-admin-sdk/es/channel';

/**
 * @private
 */
export default {
    template,

    // we have to add the extensionStoreLicensesService for the checkout example
    inject: ['extensionStoreActionService', 'shopwareExtensionService', 'feature', 'extensionStoreLicensesService'],

    props: {
        id: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            isAvailable: false,
            failReason: '',
            listingError: null,
            isLoading: false,
        };
    },

    computed: {
        storeSearchKey() {
            return this.$route.name;
        },

        activeFilters() {
            return Shopware.Store.get('shopwareExtensions').search.filter;
        },

        searchValue() {
            return Shopware.Store.get('shopwareExtensions').search.term;
        },

        isTheme() {
            const isTheme = this.$route.name.includes('theme');

            return isTheme ? 'themes' : 'apps';
        },
    },

    watch: {
        isTheme: {
            immediate: true,
            handler(newValue) {
                Shopware.Store.get('shopwareExtensions').setSearchValue({
                    key: 'page',
                    value: this.isTheme === this.activeFilters.group ? Shopware.Store.get('shopwareExtensions').search.page : 1,
                });
                this.activeFilters.group = newValue;
            },
        },
    },

    created() {
        this.createdComponent();

        handle('swag-extension-store-channel', async (data) => {
            if (data.action === 'handshake') {
                const extensions = (await this.extensionStoreActionService.getMyExtensions()).map((extension) => extension.name);
                await this.shopwareExtensionService.checkLogin();
                const shopwareVersion = Shopware.Context.app.config.version;
                const language = Shopware.Context.app.fallbackLocale;
                const isLoggedIn = Shopware.Store.get('shopwareExtensions').userInfo !== null;


                return {
                    shopwareVersion: shopwareVersion,
                    owningExtensions: extensions,
                    sessionToken: data.sessionToken,
                    language: language,
                    isLoggedIn: isLoggedIn,
                    success: true,
                };
            }
            if (data.action === 'routeTo') {
                this.$router.push({ name: data.route });
            }
            if (data.action === 'purchase') {
                const cartResponse = await this.extensionStoreLicensesService.newCart(
                  data.productId,
                  data.variantId
                );

                await this.extensionStoreLicensesService.orderCart(cartResponse.data);

                return {
                    sessionToken: data.sessionToken,
                    success: true,
                }
            }
        });
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
            Shopware.Store.get('shopwareExtensions').setSearchValue({
                key: 'term',
                value: term,
            });
        },
    },
};
