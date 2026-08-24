import type { PropType as TPropType } from 'vue';
import type { AxiosError } from 'axios';
import type ExtensionStorePreferencesService
    from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-preferences.service';
import type {
    ExtensionStoreChannelService
} from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-channel.service';
import type InAppPurchasesService from 'SwagExtensionStore/module/sw-in-app-purchases/service/in-app-purchases.service';

declare global {
    type PropType<T> = TPropType<T>;

    interface ServiceContainer {
        inAppPurchasesService: InAppPurchasesService;
        extensionStoreChannelService: ExtensionStoreChannelService;
        extensionStorePreferencesService: ExtensionStorePreferencesService;
    }

    type ErrorResponse = AxiosError<{ errors: Array<ShopwareHttpError & { apiCode: string }> }>;
}
