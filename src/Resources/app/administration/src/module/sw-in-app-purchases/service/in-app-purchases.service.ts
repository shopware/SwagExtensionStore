import type * as IAP from 'src/module/sw-in-app-purchases/types';
import type { LoginService } from 'src/core/service/login.service';
import type { AxiosInstance } from 'axios';

const { ApiService } = Shopware.Classes;

export default class InAppPurchasesService extends ApiService {
    constructor(httpClient: AxiosInstance, loginService: LoginService, apiEndpoint = 'in-app-purchases') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'inAppPurchasesService';
    }

    async getExtension(technicalName: string) {
        return this.httpClient.get<IAP.Extension>(
            `_action/${this.apiEndpoint}/${technicalName}/details`,
            { headers: this.getBasicHeaders() }
        ).then(ApiService.handleResponse.bind(this));
    }

    async createCart(name: string, feature: string) {
        return this.httpClient.post<IAP.InAppPurchaseCart>(
            `_action/${this.apiEndpoint}/cart/new`,
            { name, feature },
            { headers: this.getBasicHeaders() }
        ).then(ApiService.handleResponse.bind(this));
    }

    async orderCart(taxRate: number, positions: IAP.InAppPurchaseCartPositions, name: string) {
        return this.httpClient.post<IAP.InAppPurchase>(
            `_action/${this.apiEndpoint}/cart/order`,
            { taxRate, positions, name },
            { headers: this.getBasicHeaders() }
        ).then(ApiService.handleResponse.bind(this));
    }

    async getAvailablePurchases(name: string) {
        return this.httpClient.get<IAP.InAppPurchaseCollection>(
            `_action/${this.apiEndpoint}/${name}/list`,
            { headers: this.getBasicHeaders() }
        ).then(ApiService.handleResponse.bind(this));
    }

    async refreshInAppPurchases() {
        return this.httpClient.get(
            `_action/${this.apiEndpoint}/refresh`,
            { headers: this.getBasicHeaders() }
        ).then(ApiService.handleResponse.bind(this));
    }
}
