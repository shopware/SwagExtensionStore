import type { PropType as TPropType } from 'vue';
import type InAppPurchasesService from './module/sw-in-app-purchases/service/in-app-purchases.service';

declare global {
    type PropType<T> = TPropType<T>;

    interface ServiceContainer {
        inAppPurchasesService: InAppPurchasesService;
    }
}
