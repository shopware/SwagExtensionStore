import type { LoginService } from 'src/core/service/login.service';
import type { AxiosInstance } from 'axios';

const { ApiService } = Shopware.Classes;

export interface DemoShopStatus {
    isDemoShop: boolean;
}

export default class ExtensionStoreDemoShopService extends ApiService {
    constructor(httpClient: AxiosInstance, loginService: LoginService, apiEndpoint = 'extension-store') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'extensionStoreDemoShopService';
    }

    async getDemoShopStatus() {
        return this.httpClient.get<DemoShopStatus>(
            `_action/${this.apiEndpoint}/demo-shop-status`,
            { headers: this.getBasicHeaders() },
        ).then(ApiService.handleResponse.bind(this));
    }
}
