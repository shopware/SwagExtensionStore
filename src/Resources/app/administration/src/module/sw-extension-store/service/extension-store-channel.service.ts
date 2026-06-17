import { handle, publish } from '@shopware-ag/meteor-admin-sdk/es/channel';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionStoreLicensesService from './extension-store-licenses.service';
import type { LocationQuery, Router } from 'vue-router';
import type { ShopwareMessageTypes } from '@shopware-ag/meteor-admin-sdk/es/message-types';
import { purchaseConfirmationStore } from '../store/extension-store-purchase-confirmation.store';
import type ExtensionHelperService from 'src/app/service/extension-helper.service';
import type CacheApiService from 'src/core/service/api/cache.api.service';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';
import type { TrackableType } from 'src/core/telemetry/types';
import type ExtensionStorePreferencesService
    from 'SwagExtensionStore/module/sw-extension-store/service/extension-store-preferences.service';
import type { UserInfo } from 'src/core/service/api/store.api.service';

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
};

type RouterSyncData = {
    action: 'routerSync';
    currentRoute: string;
    currentRouteQuery: LocationQuery;
};

type PurchaseActionData = StoreChannelActionData & {
    productId: string;
    variantId: string;
    sessionToken: string;
};

type StoreContext = {
    shopwareVersion: string;
    owningExtensions: string[];
    sessionToken: string;
    language: string;
    licenseHost: string|null;
    userInfo: UserInfo | null;
    success: boolean;
    currentRoute: string;
    currentRouteQuery: LocationQuery;
};

type PurchaseResponse = {
    sessionToken: string;
    success: boolean;

};

type PurchaseResultData = {
    action: 'purchaseResult';
    sessionToken: string;
    success: boolean;
};

type CopyToClipboardActionData = StoreChannelActionData & {
    text: string;
};

type TrackActionData = StoreChannelActionData & {
    eventName: string;
    [key: string]: TrackableType;
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
    private unsubscribeFunction?: () => void;
    private registeredAt?: number;

    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        private readonly extensionStoreLicensesService: ExtensionStoreLicensesService,
        private readonly extensionHelperService: ExtensionHelperService,
        private readonly cacheApiService: CacheApiService,
        private readonly router: Router,
        private readonly extensionStorePreferencesService: ExtensionStorePreferencesService,
    ) {
    }

    register(): void {
        if (this.unsubscribeFunction) {
            return;
        }

        this.registeredAt = performance.now();

        this.unsubscribeFunction = handle('swag-extension-store-channel' as keyof ShopwareMessageTypes, (data: unknown) => {
            try {
                return this.handleAction(data);
            } catch (err) {
                return {
                    success: false,
                };
            }
        });

        window.addEventListener('popstate', () => this.publishRouterSync());
    }

    unregister(): void {
        extensionStoreContextStore().resetSkyBridgeStoreVersion();

        this.unsubscribeFunction?.();
        this.unsubscribeFunction = undefined;

        window.removeEventListener('popstate', () => this.publishRouterSync());

        this.registeredAt = undefined;
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
            case 'trackEvent':
                if (!this.isTrackActionData(data)) {
                    return;
                }
                return this.handleTrack(data);
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
            && 'sessionToken' in data
            && typeof data.productId === 'string'
            && typeof data.variantId === 'string'
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
            && Array.isArray((data as { urlSegments: unknown }).urlSegments)
            && (data as { urlSegments: unknown[] }).urlSegments.every((segment: unknown) => typeof segment === 'string')
            && this.isListingQuery((data as { listingQuery: unknown }).listingQuery)
            && Array.isArray((data as { queryProperties: unknown }).queryProperties)
            && (data as { queryProperties: unknown[] }).queryProperties.every((property: unknown) => typeof property === 'string')
        );
    }

    private isTrackActionData(data: unknown): data is TrackActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'eventName' in data
            && typeof data.eventName === 'string'
        );
    }

    private async handleHandshake(data: HandshakeActionData): Promise<StoreContext> {
        const extensions = (await this.extensionStoreActionService.getMyExtensions()).map((extension) => extension.name);
        await this.shopwareExtensionService.checkLogin();

        const contextStore = extensionStoreContextStore();
        const licenseHost = await contextStore.loadLicenseHost();
        const shopwareVersion = Shopware.Context.app.config.version ?? '';
        const rawLocale: unknown = Shopware.Store.get('session')?.currentLocale;
        const language: string = typeof rawLocale === 'string' ? rawLocale : 'en-GB';
        const userInfo = Shopware.Store.get('shopwareExtensions').userInfo;
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();

        extensionStoreContextStore().updateSkyBridgeStoreVersion(data.version);
        trackExtensionStoreEvent('extension_store_connected', {
            loading_duration_ms: this.registeredAt ? performance.now() - this.registeredAt : -1,
        });

        return {
            shopwareVersion: shopwareVersion,
            owningExtensions: extensions,
            sessionToken: data.sessionToken,
            language: language,
            licenseHost,
            userInfo: userInfo,
            success: true,
            currentRoute: currentRoute,
            currentRouteQuery: currentRouteQuery,
        };
    }

    private handleRouteTo(data: RouteToActionData): void {
        this.router.push({ name: data.route });
    }

    private async handlePurchase(data: PurchaseActionData): Promise<PurchaseResponse> {
        try {
            const [cartData, paymentMeansData] = await Promise.all([
                (await this.extensionStoreLicensesService.newCart(
                    data.productId,
                    data.variantId,
                )).data as ExtensionStoreBasket,
                (await this.extensionStoreLicensesService.getPaymentMeans()).data as ExtensionStorePaymentMean[],
            ]);

            purchaseConfirmationStore.openModal(
                cartData,
                paymentMeansData,
                async () => {
                    return await this.performPurchase(data, cartData);
                },
                () => {
                    this.publishPurchaseResult(data.sessionToken, false);
                },
            );
        } catch (error) {
            const errorDetails = this.getErrorDetails(error);
            purchaseConfirmationStore.openErrorModal(errorDetails.title, errorDetails.description, errorDetails.documentationLink, () => {
                this.publishPurchaseResult(data.sessionToken, false);
            });
        }

        // Respond immediately to the iframe so the channel does not time out.
        // The final purchase result is communicated via a separate published message.
        return {
            sessionToken: data.sessionToken,
            success: true,
        };
    }

    private publishPurchaseResult(
        sessionToken: string,
        success: boolean,
    ): void {
        const resultData: PurchaseResultData = {
            action: 'purchaseResult',
            sessionToken,
            success,
        };

        publish(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            resultData,
        );
    }

    private publishRouterSync(): void {
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();
        const data: RouterSyncData = {
            action: 'routerSync',
            currentRoute,
            currentRouteQuery,
        };

        publish(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            data,
        );
    }

    private handleRouterUpdate(data: RouterUpdateActionData): void {
        const current = this.router.currentRoute.value;
        const currentPath = current.path;
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
        }).then(() => {
            if (newPath === currentPath) {
                return;
            }

            // Currently, this is firing a separate page_viewed event to track our own route names & add our own source.
            // In the background, the Admin itself tracks every route change, so it's essentially duplicated.
            trackExtensionStoreEvent('page_viewed', {
                sw_route_from_href: currentPath,
                sw_route_to_href: newPath,
                ...(data.from ? { sw_route_from_name: `sw.extension.store.${data.from}` } : {}),
                ...(data.to ? { sw_route_to_name: `sw.extension.store.${data.to}` } : {}),
                ...(data.query ? { sw_route_to_query: data.query } : {}),
            });
        });
    }

    private handleCopyToClipboard(data: StoreChannelActionData & { text: string }): void {
        navigator.clipboard.writeText(data.text).catch((err) => {
            console.error('Failed to copy text to clipboard', err);
        });
    }

    private handleTrack({ action: _, eventName, ...data }: TrackActionData): void {
        trackExtensionStoreEvent(eventName, data);
    }

    private async performPurchase(data: PurchaseActionData, cartData: ExtensionStoreBasket): Promise<{ result: boolean; title?: string; description?: string; documentationLink?: string }> {
        try {
            await this.extensionStoreLicensesService.orderCart(cartData);
            this.publishPurchaseResult(data.sessionToken, true);
        } catch (e) {
            const errorDetails = this.getErrorDetails(e);
            this.publishPurchaseResult(data.sessionToken, false);
            return { result: false, ...errorDetails };
        }

        await this.shopwareExtensionService.updateExtensionData();

        if (this.extensionStorePreferencesService.state.installAfterPurchase) {
            await this.installExtension(cartData);
        }

        return { result: true };
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
            documentationLink: errorDetails?.meta?.documentationLink ?? '',
        };
    }

    private async installExtension(cartData: ExtensionStoreBasket): Promise<void> {
        const extension = cartData.positions[0].extension;
        const snippetService = Shopware.Snippet as unknown as {
            tc: (key: string, params?: Record<string, string>) => string;
        };

        try {
            await this.extensionHelperService.downloadAndActivateExtension(extension.name, extension.type);

            if (extension.type === 'plugin') {
                await this.cacheApiService.clear();
            }

            Shopware.Store.get('notification').createNotification({
                variant: 'positive',
                title: snippetService.tc('sw-extension-store.installation.successTitle'),
                message: snippetService.tc('sw-extension-store.installation.successMessage', { name: String(extension.name) }),
                growl: true,
            });
        } catch (error) {
            console.error('Failed to install extension after purchase', error);

            Shopware.Store.get('notification').createNotification({
                variant: 'critical',
                title: snippetService.tc('sw-extension-store.installation.errorTitle'),
                message: snippetService.tc('sw-extension-store.installation.errorMessage', { name: String(extension.name) }),
                growl: true,
            });
        }
    }
}
