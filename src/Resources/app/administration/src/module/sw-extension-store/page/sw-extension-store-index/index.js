import template from './sw-extension-store-index.html.twig';
import './sw-extension-store-index.scss';

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
        // returns the iframe DOM element, currently we can not select it by an ID because we are using the sw-iframe-renderer component
        getIframe() {
            return document.querySelector('iframe');
        }
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

        // register an event listener on initialization to listen for messages from the iframe
        window.addEventListener('message', this.checkout);
    },

    methods: {
        // proof of a working checkout with data from our extension store storefront
        async checkout(event) {
            // we only want to handle purchase messages from our iframe
            if (event.data.action === 'purchase-event') {
                // from the event we now get the uuid of the product and option id of the variant which is also a uuid
                console.log(event.data.optionId, event.data.productId);

                // card request and order request in a row, in a real world scenario you would probably want to handle errors and edge cases
                const cartResponse = await this.extensionStoreLicensesService.newCart(
                  event.data.productId,
                  event.data.optionId
                );

                const orderResponse = await this.extensionStoreLicensesService.orderCart(cartResponse.data);
                console.log(orderResponse);

                // respond back to the iframe that everything was successful - in a real world scenario you would also want to handle errors here
                this.getIframe.contentWindow.postMessage({
                    action: 'purchase-response',
                    success: true,
                }, '*')
            }
        },

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
