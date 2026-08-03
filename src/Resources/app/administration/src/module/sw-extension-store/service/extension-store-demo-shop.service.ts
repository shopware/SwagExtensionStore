import type { LoginService } from 'src/core/service/login.service';
import type { AxiosInstance } from 'axios';
import type { DemoShopStatus } from '../types/extension-store-demo-shop.types';

const { ApiService } = Shopware.Classes;

export default class ExtensionStoreDemoShopService extends ApiService {
    constructor(httpClient: AxiosInstance, loginService: LoginService, apiEndpoint = 'extension-store') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'extensionStoreDemoShopService';
    }

    async getDemoShopStatus() {
        return this.httpClient.get<DemoShopStatus>(
            `_action/${this.apiEndpoint}/demo-shop-information`,
            { headers: this.getBasicHeaders() },
        ).then(ApiService.handleResponse.bind(this));
    }
}
