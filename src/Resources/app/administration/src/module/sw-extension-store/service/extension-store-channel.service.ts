import { handle, publish } from '@shopware-ag/meteor-admin-sdk/es/channel';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionStoreLicensesService from './extension-store-licenses.service';
import type { LocationQuery, RouteLocationNormalizedGeneric, RouteLocationNormalizedLoadedGeneric, Router } from 'vue-router';
import type { ShopwareMessageTypes } from '@shopware-ag/meteor-admin-sdk/es/message-types';
import extensionStorePurchaseConfirmationStore, { type PurchaseConfirmationOnConfirmCallbackResult } from '../store/extension-store-purchase-confirmation.store';
import type ExtensionHelperService from 'src/app/service/extension-helper.service';
import type CacheApiService from 'src/core/service/api/cache.api.service';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import type ExtensionStorePreferencesService
    from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-preferences.service';
import type { UserInfo } from 'src/core/service/api/store.api.service';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';

type StoreChannelAction = 'handshake' | 'routeTo' | 'purchase' | 'routerUpdate' | 'copyToClipboard' | 'trackEvent';

type StoreChannelActionData = {
    action: StoreChannelAction;
};

type HandshakeActionData = StoreChannelActionData & {
    sessionToken: string;
    version: string;
};

type RouteToActionData = StoreChannelActionData & {
    route: string;
};

type RouterUpdateActionData = StoreChannelActionData & {
    urlSegments: string[];
    from: string | null;
    to: string | null;
    query: string | null;
    listingQuery: Record<string, string | string[] | null | undefined>;
    queryProperties: string[];
    replaced: boolean;
};

type RouterSyncData = {
    action: 'routerSync';
    currentRoute: string;
    currentRouteQuery: LocationQuery;
};

type PurchaseActionData = StoreChannelActionData & {
    productId: string;
    variantId: string;
    isCompatible: boolean;
    sessionToken: string;
};

type StoreContextOwnedExtension = {
    name: string;
    version: string | null;
};

type StoreContext = {
    shopwareVersion: string;
    owningExtensions: StoreContextOwnedExtension[];
    sessionToken: string;
    language: string;
    licenseHost: string | null;
    userInfo: UserInfo | null;
    success: boolean;
    currentRoute: string;
    currentRouteQuery: LocationQuery;
    navigateToExtension?: string | number;
};

type PurchaseResponse = {
    sessionToken: string;
    success: boolean;
};

type PurchaseResultData = {
    action: 'purchaseResult';
    sessionToken: string;
    success: boolean;
    extensionVersion?: string | null;
};

type CopyToClipboardActionData = StoreChannelActionData & {
    text: string;
};

type StoreApiErrorItem = {
    title?: string;
    description?: string;
    meta?: {
        documentationLink?: string;
    };
};

type StoreApiErrorResponse = {
    response?: {
        data?: {
            errors?: StoreApiErrorItem[];
        };
    };
};

export class ExtensionStoreChannelService {
    private removeRouterAfterEachHook?: () => void;
    private unsubscribeFunction?: () => void;

    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        private readonly extensionStoreLicensesService: ExtensionStoreLicensesService,
        private readonly extensionHelperService: ExtensionHelperService,
        private readonly cacheApiService: CacheApiService,
        private readonly router: Router,
        private readonly extensionStorePreferencesService: ExtensionStorePreferencesService
    ) {
    }

    register(): void {
        if (this.unsubscribeFunction) {
            return;
        }

        this.unsubscribeFunction = handle('swag-extension-store-channel' as keyof ShopwareMessageTypes, (data: unknown) => {
            try {
                return this.handleAction(data);
            } catch (err) {
                return {
                    success: false
                };
            }
        });

        this.removeRouterAfterEachHook = this.router.afterEach((to, from) => this.publishReturnToExtensionStore(to, from));

        window.addEventListener('popstate', () => this.publishRouterSync());
    }

    unregister(): void {
        extensionStoreContextStore().resetSkyBridgeStoreVersion();

        this.unsubscribeFunction?.();
        this.unsubscribeFunction = undefined;

        this.removeRouterAfterEachHook?.();
        this.removeRouterAfterEachHook = undefined;

        window.removeEventListener('popstate', () => this.publishRouterSync());
    }

    private publishReturnToExtensionStore(to: RouteLocationNormalizedGeneric, from: RouteLocationNormalizedLoadedGeneric): void {
        const isFromExtensionStore = from.name?.toString() === 'sw.extension.store';
        const isToExtensionStore = to.name?.toString() === 'sw.extension.store';
        const isFullPathEqual = from.fullPath === to.fullPath;

        if (!isFromExtensionStore || !isToExtensionStore || isFullPathEqual) {
            return;
        }

        this.publishRouterSync();
    }

    private handleAction(data: unknown): Promise<StoreContext | PurchaseResponse> | void {
        if (!this.isStoreChannelActionData(data)) {
            return;
        }
        switch (data.action) {
            case 'handshake':
                if (!this.isHandshakeActionData(data)) {
                    return;
                }
                return this.handleHandshake(data);
            case 'routeTo':
                if (!this.isRouteToActionData(data)) {
                    return;
                }
                return this.handleRouteTo(data);
            case 'purchase':
                if (!this.isPurchaseActionData(data)) {
                    return;
                }
                return this.handlePurchase(data);
            case 'routerUpdate':
                if (!this.isRouterUpdateActionData(data)) {
                    return;
                }
                return this.handleRouterUpdate(data);
            case 'copyToClipboard':
                if ((!this.isCopyToClipboardActionData(data))) {
                    return;
                }
                return this.handleCopyToClipboard(data);
        }
    }

    private isStoreChannelActionData(data: unknown): data is StoreChannelActionData {
        return (
            data !== null
            && typeof data === 'object'
            && 'action' in data
            && typeof data.action === 'string'
        );
    }

    private isHandshakeActionData(data: unknown): data is HandshakeActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'sessionToken' in data
            && 'version' in data
            && typeof data.sessionToken === 'string'
            && typeof data.version === 'string'
        );
    }

    private isRouteToActionData(data: unknown): data is RouteToActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'route' in data
            && typeof data.route === 'string'
        );
    }

    private isCopyToClipboardActionData(data: unknown): data is CopyToClipboardActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'text' in data
            && typeof data.text === 'string'
        );
    }

    private isPurchaseActionData(data: unknown): data is PurchaseActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'productId' in data
            && 'variantId' in data
            && 'isCompatible' in data
            && 'sessionToken' in data
            && typeof data.productId === 'string'
            && typeof data.variantId === 'string'
            && typeof data.isCompatible === 'boolean'
            && typeof data.sessionToken === 'string'
        );
    }

    private isListingQueryValue(value: unknown): value is string | string[] | null | undefined {
        return value === null
      || value === undefined
      || typeof value === 'string'
      || (Array.isArray(value) && value.every((item: unknown) => typeof item === 'string'));
    }

    private isListingQuery(value: unknown): value is Record<string, string | string[] | null | undefined> {
        return typeof value === 'object'
      && value !== null
      && !Array.isArray(value)
      && Object.values(value).every((entry: unknown) => this.isListingQueryValue(entry));
    }

    private isRouterUpdateActionData(data: unknown): data is RouterUpdateActionData {
        return (
            this.isStoreChannelActionData(data) && 'urlSegments' in data
            && 'from' in data
            && 'to' in data
            && 'query' in data
            && 'listingQuery' in data
            && 'queryProperties' in data
            && 'replaced' in data
            && Array.isArray((data as { urlSegments: unknown }).urlSegments)
            && (data as { urlSegments: unknown[] }).urlSegments.every((segment: unknown) => typeof segment === 'string')
            && this.isListingQuery((data as { listingQuery: unknown }).listingQuery)
            && Array.isArray((data as { queryProperties: unknown }).queryProperties)
            && (data as { queryProperties: unknown[] }).queryProperties.every((property: unknown) => typeof property === 'string')
        );
    }

    private async handleHandshake(data: HandshakeActionData): Promise<StoreContext> {
        const extensions = await this.extensionStoreActionService.getMyExtensions();
        const owningExtensions = extensions.filter(extension => !!extension.storeLicense)
            .map((extension) => ({
                name: extension.name,
                version: extension.version ?? null
            }));

        await this.shopwareExtensionService.checkLogin();

        const contextStore = extensionStoreContextStore();
        const licenseHost = await contextStore.loadLicenseHost();
        const shopwareVersion = Shopware.Context.app.config.version ?? '';
        const rawLocale: unknown = Shopware.State.get('session')?.currentLocale;
        const language: string = typeof rawLocale === 'string' ? rawLocale : 'en-GB';
        const userInfo = Shopware.State.get('shopwareExtensions').userInfo;
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();

        extensionStoreContextStore().updateSkyBridgeStoreVersion(data.version);

        return {
            shopwareVersion: shopwareVersion,
            owningExtensions: owningExtensions,
            sessionToken: data.sessionToken,
            language: language,
            licenseHost,
            userInfo: userInfo,
            success: true,
            currentRoute: currentRoute,
            currentRouteQuery: currentRouteQuery,
            navigateToExtension: this.getNavigateToExtension()
        };
    }

    private handleRouteTo(data: RouteToActionData): void {
        this.router.push({ name: data.route });
    }

    private async handlePurchase(data: PurchaseActionData): Promise<PurchaseResponse> {
        try {
            const [cart, paymentMeans] = await Promise.all([
                (await this.extensionStoreLicensesService.newCart(
                    data.productId,
                    data.variantId
                )).data as ExtensionStoreBasket,
                (await this.extensionStoreLicensesService.getPaymentMeans()).data as ExtensionStorePaymentMean[]
            ]);

            extensionStorePurchaseConfirmationStore().openModal({
                cart,
                paymentMeans,
                isCompatible: data.isCompatible,
                onConfirm: () => this.performPurchase(data, cart),
                onCancel: () => this.publishPurchaseResult(data.sessionToken, false)
            });
        } catch (error) {
            const errorDetails = this.getErrorDetails(error);
            extensionStorePurchaseConfirmationStore().openErrorModal(errorDetails.title, errorDetails.description, errorDetails.documentationLink, () => {
                this.publishPurchaseResult(data.sessionToken, false);
            });
        }

        // Respond immediately to the iframe so the channel does not time out.
        // The final purchase result is communicated via a separate published message.
        return {
            sessionToken: data.sessionToken,
            success: true
        };
    }

    private publishPurchaseResult(
        sessionToken: string,
        success: boolean,
        extensionVersion?: string | null
    ): void {
        const resultData: PurchaseResultData = {
            action: 'purchaseResult',
            sessionToken,
            success,
            ...(extensionVersion !== undefined ? { extensionVersion } : {})
        };

        publish(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            resultData
        );
    }

    private publishRouterSync(): void {
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();
        const data: RouterSyncData = {
            action: 'routerSync',
            currentRoute,
            currentRouteQuery
        };

        publish(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            data
        );
    }

    private handleRouterUpdate(data: RouterUpdateActionData): void {
        const current = this.router.currentRoute.value;
        let newPath = current.path;

        if (current.params?.pathMatch?.length > 0) {
            newPath = newPath
                .split('/')
                .filter(segment => !current.params.pathMatch.includes(segment))
                .join('/');
        }

        if (data.urlSegments.length > 0) {
            newPath += `/${data.urlSegments.join('/')}`;
        }

        const newQuery: LocationQuery = { ...current.query };

        for (const key of data.queryProperties) {
            const listingQueryValue = data.listingQuery[key];
            if (listingQueryValue !== undefined && listingQueryValue !== null) {
                newQuery[key] = listingQueryValue;
            } else {
                delete newQuery[key];
            }
        }

        this.router.push({
            path: newPath,
            query: newQuery,
            hash: current.hash,
            replace: data.replaced
        });
    }

    private handleCopyToClipboard(data: StoreChannelActionData & { text: string }): void {
        navigator.clipboard.writeText(data.text).catch((err) => {
            console.error('Failed to copy text to clipboard', err);
        });
    }

    private async performPurchase(data: PurchaseActionData, cartData: ExtensionStoreBasket): Promise<PurchaseConfirmationOnConfirmCallbackResult> {
        extensionStorePurchaseConfirmationStore().checkoutStep = 'order';

        try {
            await this.extensionStoreLicensesService.orderCart(cartData);
        } catch (e) {
            const errorDetails = this.getErrorDetails(e);
            this.publishPurchaseResult(data.sessionToken, false);
            return { success: false, ...errorDetails };
        }

        extensionStorePurchaseConfirmationStore().checkoutStep = 'update';
        await this.updateExtensionData();

        let isInstalled = false;
        if (data.isCompatible && this.extensionStorePreferencesService.state.installAfterPurchase) {
            extensionStorePurchaseConfirmationStore().checkoutStep = 'install';
            isInstalled = await this.installExtension(cartData);
        }

        let extensionVersion: string | null = null;
        if (isInstalled) {
            extensionStorePurchaseConfirmationStore().checkoutStep = 'reload';
            extensionVersion = await this.getInstalledExtensionVersion(cartData.positions[0].extension.name);
        }

        this.publishPurchaseResult(data.sessionToken, true, extensionVersion);

        return { success: true, requiresReload: isInstalled };
    }

    private async getInstalledExtensionVersion(extensionName: string): Promise<string | null> {
        try {
            const extensions = await this.extensionStoreActionService.getMyExtensions();

            return extensions.find((extension) => extension.name === extensionName)?.version ?? null;
        } catch (error) {
            console.error('Failed to get installed extension version after purchase', error);

            return null;
        }
    }

    private getCurrentRoute(): string {
        return Object.values(this.router.currentRoute.value.params.pathMatch || {}).join('/');
    }

    private getCurrentRouteQuery(): LocationQuery {
        return this.router.currentRoute.value.query || {};
    }

    private getErrorDetails(error: unknown): { title: string; description: string; documentationLink: string } {
        const maybeError = error as StoreApiErrorResponse;
        const errorDetails = maybeError.response?.data?.errors?.at(-1);

        return {
            title: errorDetails?.title ?? '',
            description: errorDetails?.description ?? '',
            documentationLink: errorDetails?.meta?.documentationLink ?? ''
        };
    }

    private getNavigateToExtension(): string | number | undefined {
        const state = window.history.state as unknown;

        return state && typeof state === 'object' && 'extensionIdentifier' in state
            ? state.extensionIdentifier as string | number
            : undefined;
    }

    private async updateExtensionData(): Promise<void> {
        try {
            await this.shopwareExtensionService.updateExtensionData();
        } catch (error) {
            console.error('Failed to update extension data', error);
        }
    }

    /**
     * A failing cache clear must not be reported as a failed installation, the extension is
     * installed at this point either way and the following reload picks it up.
     */
    private async clearCache(): Promise<void> {
        try {
            await this.cacheApiService.clear();
        } catch (error) {
            console.error('Failed to clear the cache after installing an extension', error);
        }
    }

    private async installExtension(cartData: ExtensionStoreBasket): Promise<boolean> {
        const extension = cartData.positions[0].extension;
        const snippetService = Shopware.Snippet as unknown as {
            tc: (key: string, params?: Record<string, string>) => string;
        };

        try {
            await this.extensionHelperService.downloadAndActivateExtension(extension.name, extension.type);
            await this.clearCache();

            Shopware.State.commit('notification/createNotification', {
                variant: 'positive',
                title: snippetService.tc('sw-extension-store.installation.successTitle'),
                message: snippetService.tc('sw-extension-store.installation.successMessage', { name: String(extension.name) }),
                growl: true
            });

            return true;
        } catch (error) {
            console.error('Failed to install extension after purchase', error);

            Shopware.State.commit('notification/createNotification', {
                variant: 'critical',
                title: snippetService.tc('sw-extension-store.installation.errorTitle'),
                message: snippetService.tc('sw-extension-store.installation.errorMessage', { name: String(extension.name) }),
                growl: true
            });

            return false;
        }
    }
}
