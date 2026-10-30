import { handle, publish, setExtensions } from '@shopware-ag/meteor-admin-sdk/es/channel';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type { StoreCheckout } from './extension-store-checkout.service';
import type { LocationQuery, RouteLocationNormalizedGeneric, RouteLocationNormalizedLoadedGeneric, Router } from 'vue-router';
import type { ShopwareMessageTypes } from '@shopware-ag/meteor-admin-sdk/es/message-types';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';
import type { TrackableType } from 'src/core/telemetry/types';
import type { UserInfo } from 'src/core/service/api/store.api.service';
import { hasDemoShopBundle } from 'SwagExtensionStore/util/demo-shop';

type StoreChannelAction = 'handshake' | 'routeTo' | 'purchase' | 'routerUpdate' | 'copyToClipboard' | 'trackEvent';

type StoreChannelActionData = {
    action: StoreChannelAction;
};

type HandshakeActionData = StoreChannelActionData & {
    sessionToken: string;
    version: string;
};

type RouteToActionData = StoreChannelActionData & {
    name: string;
    params?: Record<string, string>;
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
    isDemoShop: boolean;
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

type StoreChannelSource = {
    source: Window;
    origin: string;
    sdkVersion: string;
};

type CopyToClipboardActionData = StoreChannelActionData & {
    text: string;
};

type TrackActionData = StoreChannelActionData & {
    eventName: string;
    [key: string]: TrackableType;
};

export class ExtensionStoreChannelService {
    #storeCheckout: StoreCheckout;
    #channelSource?: StoreChannelSource;
    #getFrame?: () => HTMLIFrameElement | null;

    private removeRouterAfterEachHook?: () => void;
    private unsubscribeFunction?: () => void;
    private registeredAt?: number;
    private router!: Router;
    private readonly onPopState = (): void => this.publishRouterSync();

    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        storeCheckout: StoreCheckout,
    ) {
        this.#storeCheckout = storeCheckout;
    }

    register(getFrame: () => HTMLIFrameElement | null, router: Router): void {
        if (this.unsubscribeFunction) {
            return;
        }

        this.router = router;
        this.#getFrame = getFrame;
        this.registeredAt = performance.now();

        this.unsubscribeFunction = handle(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            (data: unknown, additionalInformation) => {
                try {
                    const event = additionalInformation._event_;
                    const frame = this.#getFrame?.();

                    if (!frame || !event.isTrusted || event.source !== frame.contentWindow || !this.isStoreOrigin(event.origin)) {
                        return { success: false };
                    }

                    if (this.isHandshakeActionData(data)) {
                        return this.#connect(data, event);
                    }

                    if (!this.#channelSource || this.#channelSource.source !== event.source || this.#channelSource.origin !== event.origin) {
                        return { success: false };
                    }

                    return this.#handleAction(data);
                } catch (err) {
                    return {
                        success: false,
                    };
                }
            },
        );

        this.removeRouterAfterEachHook = this.router.afterEach((to, from) => this.publishReturnToExtensionStore(to, from));

        window.addEventListener('popstate', this.onPopState);
    }

    unregister(): void {
        extensionStoreContextStore().resetSkyBridgeStoreVersion();
        this.#channelSource = undefined;

        this.unsubscribeFunction?.();
        this.unsubscribeFunction = undefined;

        this.removeRouterAfterEachHook?.();
        this.removeRouterAfterEachHook = undefined;

        window.removeEventListener('popstate', this.onPopState);

        this.registeredAt = undefined;
        this.#getFrame = undefined;
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

    #handleAction(data: unknown): Promise<StoreContext | PurchaseResponse> | void {
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
                return this.#handlePurchase(data);
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
            && 'name' in data
            && typeof data.name === 'string'
            && (!('params' in data) || this.isRouteParams(data.params))
        );
    }

    private isRouteParams(value: unknown): value is Record<string, string> {
        return typeof value === 'object'
            && value !== null
            && !Array.isArray(value)
            && Object.values(value).every((parameter) => typeof parameter === 'string');
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

    private isTrackActionData(data: unknown): data is TrackActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'eventName' in data
            && typeof data.eventName === 'string'
        );
    }

    private async handleHandshake(data: HandshakeActionData): Promise<StoreContext> {
        const extensions = await this.extensionStoreActionService.getMyExtensions();
        const owningExtensions = extensions.filter(extension => !!extension.storeLicense)
            .map((extension) => ({
                name: extension.name,
                version: extension.version ?? null,
            }));

        await this.shopwareExtensionService.checkLogin();

        const contextStore = extensionStoreContextStore();
        const licenseHost = await contextStore.loadLicenseHost();
        const shopwareVersion = Shopware.Context.app.config.version ?? '';
        const rawLocale: unknown = Shopware.Store.get('session')?.currentLocale;
        const language: string = typeof rawLocale === 'string' ? rawLocale : 'en-GB';
        const userInfo = Shopware.Store.get('shopwareExtensions').userInfo;
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();

        return {
            shopwareVersion: shopwareVersion,
            owningExtensions: owningExtensions,
            sessionToken: data.sessionToken,
            language: language,
            licenseHost,
            userInfo: userInfo,
            isDemoShop: hasDemoShopBundle(),
            success: true,
            currentRoute: currentRoute,
            currentRouteQuery: currentRouteQuery,
            navigateToExtension: this.getNavigateToExtension(),
        };
    }

    private handleRouteTo(data: RouteToActionData): void {
        this.router.push({ name: data.name, params: data.params });
    }

    #handlePurchase(data: PurchaseActionData): Promise<PurchaseResponse> {
        const source = this.#channelSource;
        void this.#storeCheckout({
            extensionId: data.productId,
            variantId: data.variantId,
        }, data.isCompatible).then((result) => {
            this.publishPurchaseResult(
                data.sessionToken,
                result.status === 'purchased',
                result.status === 'purchased' ? result.extensionVersion : undefined,
                source,
            );
        });

        // The final result is published separately so the iframe channel does not time out.
        return Promise.resolve({ sessionToken: data.sessionToken, success: true });
    }

    private publishPurchaseResult(
        sessionToken: string,
        success: boolean,
        extensionVersion?: string | null,
        source?: StoreChannelSource,
    ): void {
        const resultData: PurchaseResultData = {
            action: 'purchaseResult',
            sessionToken,
            success,
            ...(extensionVersion !== undefined ? { extensionVersion } : {}),
        };

        if (source && this.#channelSource === source) {
            this.publishToExtensionStore(resultData);
        }
    }

    private publishRouterSync(): void {
        const currentRoute = this.getCurrentRoute();
        const currentRouteQuery = this.getCurrentRouteQuery();
        const data: RouterSyncData = {
            action: 'routerSync',
            currentRoute,
            currentRouteQuery,
        };

        this.publishToExtensionStore(data);
    }

    async #connect(data: HandshakeActionData, event: MessageEvent<string>): Promise<StoreContext | { success: false }> {
        this.#channelSource = undefined;
        try {
            const context = await this.handleHandshake(data);
            if (!this.unsubscribeFunction || this.#getFrame?.()?.contentWindow !== event.source || !this.isStoreOrigin(event.origin)) {
                return { success: false };
            }
            this.#registerChannelSource(event, data.version);
            return context;
        } catch {
            return { success: false };
        }
    }

    #registerChannelSource(event: MessageEvent<string>, sdkVersion: string): void {
        if (!event.source || !this.isStoreOrigin(event.origin)) {
            return;
        }

        const source = event.source as Window;

        setExtensions({
            'swag-extension-store-sky-bridge': {
                baseUrl: event.origin,
                permissions: {},
            },
        });

        this.#channelSource = {
            source,
            origin: event.origin,
            sdkVersion,
        };
        extensionStoreContextStore().updateSkyBridgeStoreVersion(sdkVersion);
        trackExtensionStoreEvent('extension_store_connected', {
            loading_duration_ms: this.registeredAt ? performance.now() - this.registeredAt : -1,
        });
    }

    private isStoreOrigin(origin: string): boolean {
        const iframeUrl = extensionStoreContextStore().iframeUrl;

        if (!iframeUrl) {
            return false;
        }

        return new URL(iframeUrl).origin === origin;
    }

    private publishToExtensionStore(data: PurchaseResultData | RouterSyncData): void {
        if (!this.#channelSource) {
            return;
        }

        publish(
            'swag-extension-store-channel' as keyof ShopwareMessageTypes,
            data,
            [this.#channelSource],
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
            replace: data.replaced,
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

    private getCurrentRoute(): string {
        return Object.values(this.router.currentRoute.value.params.pathMatch || {}).join('/');
    }

    private getCurrentRouteQuery(): LocationQuery {
        return this.router.currentRoute.value.query || {};
    }

    private getNavigateToExtension(): string | number | undefined {
        const state = window.history.state as unknown;

        return state && typeof state === 'object' && 'extensionIdentifier' in state
            ? state.extensionIdentifier as string | number
            : undefined;
    }
}
