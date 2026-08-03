import type { PropType as TPropType } from 'vue';
import type InAppPurchasesService from './module/sw-in-app-purchases/service/in-app-purchases.service';
import type { AxiosError } from 'axios';
import type ExtensionStorePreferencesService
    from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-preferences.service';
import type {
    ExtensionStoreChannelService,
} from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import type ExtensionStoreDemoShopService
    from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-demo-shop.service';

declare global {
    type PropType<T> = TPropType<T>;

    interface ServiceContainer {
        inAppPurchasesService: InAppPurchasesService;
        extensionStoreChannelService: ExtensionStoreChannelService;
        extensionStorePreferencesService: ExtensionStorePreferencesService;
        extensionStoreDemoShopService: ExtensionStoreDemoShopService;
    }

    type ErrorResponse = AxiosError<{ errors: Array<ShopwareHttpError & { apiCode: string }> }>;

    const __SWAG_EXTENSION_STORE_VERSION__: string;
}
