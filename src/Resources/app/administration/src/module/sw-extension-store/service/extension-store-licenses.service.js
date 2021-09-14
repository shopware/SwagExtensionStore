export default class ExtensionLicenseService extends Shopware.Classes.ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'extension-store') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'extensionStoreLicensesService';
    }

    newCart(extensionId, variantId) {
        return this.httpClient.post(
            `/_action/${this.apiEndpoint}/cart/new`,
            { extensionId, variantId },
            { headers: this.basicHeaders(), version: 3 }
        );
    }

    orderCart(payload) {
        return this.httpClient.post(
            `/_action/${this.apiEndpoint}/cart/order`,
            payload,
            { headers: this.basicHeaders(), version: 3 }
        );
    }

    getPaymentMeans() {
        return this.httpClient.get(
            `/_action/${this.apiEndpoint}/cart/payment-means`,
            { headers: this.basicHeaders(), version: 3 }
        );
    }

    basicHeaders(context = null) {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.loginService.getToken()}`
        };

        if (context && context.languageId) {
            headers['sw-language-id'] = context.languageId;
        }

        return headers;
    }
}
