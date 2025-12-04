import { handle } from '@shopware-ag/meteor-admin-sdk/es/channel';
import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionStoreLicensesService from './extension-store-licenses.service';
import type { Router } from 'vue-router';
import type { ShopwareMessageTypes } from '@shopware-ag/meteor-admin-sdk/es/message-types';

type StoreChannelAction = 'handshake' | 'routeTo' | 'purchase';

type StoreChannelActionData = {
    action: StoreChannelAction;
};

type HandshakeActionData = StoreChannelActionData & {
    sessionToken: string;
};

type RouteToActionData = StoreChannelActionData & {
    route: string;
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
};

type PurchaseResponse = {
    sessionToken: string;
    success: boolean;
};

export class ExtensionStoreChannelService {
    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        private readonly extensionStoreLicensesService: ExtensionStoreLicensesService,
        private readonly router: Router,
    ) {}

    register(): void {
        handle('swag-extension-store-channel' as keyof ShopwareMessageTypes, (data: unknown) => {
            try {
                return this.handleAction(data);
            } catch (err) {
                return {
                    success: false,
                };
            }
        });
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

    private async handleHandshake(data: HandshakeActionData): Promise<StoreContext> {
        const extensions = (await this.extensionStoreActionService.getMyExtensions()).map((extension) => extension.name);
        await this.shopwareExtensionService.checkLogin();
        const shopwareVersion = Shopware.Context.app.config.version ?? '';
        const rawLocale: unknown = Shopware.Store.get('session')?.currentLocale;
        const language: string = typeof rawLocale === 'string' ? rawLocale : 'en-GB';
        const isLoggedIn = Shopware.Store.get('shopwareExtensions').userInfo !== null;

        return {
            shopwareVersion: shopwareVersion,
            owningExtensions: extensions,
            sessionToken: data.sessionToken,
            language: language,
            isLoggedIn: isLoggedIn,
            success: true,
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
}
