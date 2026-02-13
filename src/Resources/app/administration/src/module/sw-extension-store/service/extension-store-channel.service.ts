import { handle } from '@shopware-ag/meteor-admin-sdk/es/channel';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionStoreLicensesService from './extension-store-licenses.service';
import type { Router } from 'vue-router';
import type { ShopwareMessageTypes } from '@shopware-ag/meteor-admin-sdk/es/message-types';

type StoreChannelAction = 'handshake' | 'routeTo' | 'purchase' | 'routerUpdate' | 'copyToClipboard';

type StoreChannelActionData = {
    action: StoreChannelAction;
};

type HandshakeActionData = StoreChannelActionData & {
    sessionToken: string;
};

type RouteToActionData = StoreChannelActionData & {
    route: string;
};

type RouterUpdateActionData = StoreChannelActionData & {
    urlSegments: string[];
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
    isLoggedIn: boolean;
    success: boolean;
    currentRoute: string;
};

type PurchaseResponse = {
    sessionToken: string;
    success: boolean;
};

type CopyToClipboardActionData = StoreChannelActionData & {
    text: string;
};

export class ExtensionStoreChannelService {
    private unsubscribeFunction?: () => void;

    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        private readonly extensionStoreLicensesService: ExtensionStoreLicensesService,
        private readonly router: Router,
    ) {}

    register(): void {
        if (this.unsubscribeFunction) {
            return;
        }

        this.unsubscribeFunction = handle('swag-extension-store-channel' as keyof ShopwareMessageTypes, (data: unknown) => {
            try {
                return this.handleAction(data);
            } catch (err) {
                return {
                    success: false,
                };
            }
        });
    }

    unregister(): void {
        if (!this.unsubscribeFunction) {
            return;
        }

        this.unsubscribeFunction();
        this.unsubscribeFunction = undefined;
    }

    private handleAction(data: unknown): Promise<StoreContext|PurchaseResponse> | void {
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
      && typeof data.sessionToken === 'string'
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

    private isRouterUpdateActionData(data: unknown): data is RouterUpdateActionData {
        return (
            this.isStoreChannelActionData(data)
            && 'urlSegments' in data
            && Array.isArray((data as { urlSegments: unknown }).urlSegments)
            && (data as { urlSegments: unknown[] }).urlSegments.every((segment: unknown) => typeof segment === 'string')
        );
    }

    private async handleHandshake(data: HandshakeActionData): Promise<StoreContext> {
        const extensions = (await this.extensionStoreActionService.getMyExtensions()).map((extension) => extension.name);
        await this.shopwareExtensionService.checkLogin();
        const shopwareVersion = Shopware.Context.app.config.version ?? '';
        const rawLocale: unknown = Shopware.Store.get('session')?.currentLocale;
        const language: string = typeof rawLocale === 'string' ? rawLocale : 'en-GB';
        const isLoggedIn = Shopware.Store.get('shopwareExtensions').userInfo !== null;
        const currentRoute = Object.values(this.router.currentRoute.value.params.pathMatch || {}).join('/');

        return {
            shopwareVersion: shopwareVersion,
            owningExtensions: extensions,
            sessionToken: data.sessionToken,
            language: language,
            isLoggedIn: isLoggedIn,
            success: true,
            currentRoute: currentRoute,
        };
    }

    private handleRouteTo(data: RouteToActionData): void {
        this.router.push({ name: data.route });
    }

    private async handlePurchase(data: PurchaseActionData): Promise<PurchaseResponse> {
        const cartResponse = await this.extensionStoreLicensesService.newCart(
            data.productId,
            data.variantId,
        );

        await this.extensionStoreLicensesService.orderCart(cartResponse.data);

        return {
            sessionToken: data.sessionToken,
            success: true,
        };
    }

    private handleRouterUpdate(data: RouterUpdateActionData): void {
        const current = this.router.currentRoute.value;
        let newPath = current.path;
        if (current.params?.pathMatch?.length > 0) {
            newPath = newPath.split('/').filter(segment => !current.params.pathMatch.includes(segment)).join('/');
        }
        if (data.urlSegments.length > 0) {
            const segmentsToAdd = data.urlSegments.join('/');
            newPath += `/${segmentsToAdd}`;
        }

        if (newPath !== current.path) {
            this.router.replace({
                path: newPath,
                query: current.query,
                hash: current.hash,
            });
        }
    }

    private handleCopyToClipboard(data: StoreChannelActionData & { text: string }): void {
        navigator.clipboard.writeText(data.text).catch((err) => {
            console.error('Failed to copy text to clipboard', err);
        });
    }
}
