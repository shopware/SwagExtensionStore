export default class ExtensionLicenseService extends Shopware.Classes.ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'plugin') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'extensionStoreLicensesService';
    }

    async purchaseExtension(extensionId, variantId, tocAccepted, permissionsAccepted) {
        await this.httpClient.post(
            '_action/extension-store/purchase',
            { extensionId, variantId, tocAccepted, permissionsAccepted },
            {
                headers: this.basicHeaders(),
                version: 3
            }
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
