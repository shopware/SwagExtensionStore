import type ExtensionStoreActionService from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';
import type ExtensionHelperService from 'src/app/service/extension-helper.service';
import type CacheApiService from 'src/core/service/api/cache.api.service';
import type ExtensionStoreLicensesService from './extension-store-licenses.service';
import type ExtensionStorePreferencesService from './extension-store-preferences.service';
import type { ExtensionStoreBasket, ExtensionStorePaymentMean } from '../types/extension-store-basket.types';
import extensionStorePurchaseConfirmationStore, { type PurchaseConfirmationOnConfirmCallbackResult } from '../store/extension-store-purchase-confirmation.store';

export type ExtensionStoreCheckoutRequest = {
    sourceExtensionName: string;
    extensionId: string;
    variantId: string;
};

export type ExtensionStoreCheckoutResult =
    | { status: 'purchased'; installed: boolean; extensionVersion: string | null }
    | { status: 'cancelled' }
    | { status: 'failed'; code: 'invalid_request' | 'forbidden' | 'login_required' | 'checkout_failed' | 'busy' };

export type StoreCheckout = (request: Omit<ExtensionStoreCheckoutRequest, 'sourceExtensionName'>, isCompatible: boolean) => Promise<ExtensionStoreCheckoutResult>;

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

/** Experimental checkout API for Administration plugins. */
export default class ExtensionStoreCheckoutService {
    #pending = false;

    constructor(
        private readonly extensionStoreActionService: ExtensionStoreActionService,
        private readonly shopwareExtensionService: ShopwareExtensionService,
        private readonly extensionStoreLicensesService: ExtensionStoreLicensesService,
        private readonly extensionHelperService: ExtensionHelperService,
        private readonly cacheApiService: CacheApiService,
        private readonly extensionStorePreferencesService: ExtensionStorePreferencesService,
        private readonly acl: { can: (privilege: string) => boolean },
        registerStoreCheckout: (checkout: StoreCheckout) => void,
    ) {
        registerStoreCheckout((request, isCompatible) => this.#start(request, isCompatible, false));
    }

    open(request: ExtensionStoreCheckoutRequest): Promise<ExtensionStoreCheckoutResult> {
        // TODO: Compatibility is only known by the Store today. External callers purchase a license only.
        return this.#start(request, null, true);
    }

    async #start(
        request: Omit<ExtensionStoreCheckoutRequest, 'sourceExtensionName'> & { sourceExtensionName?: string },
        isCompatible: boolean | null,
        checkLogin: boolean,
    ): Promise<ExtensionStoreCheckoutResult> {
        const store = extensionStorePurchaseConfirmationStore();
        if (this.#pending || store.isOpen) {
            return { status: 'failed', code: 'busy' };
        }

        if (!request || typeof request.extensionId !== 'string' || !request.extensionId.trim()
            || typeof request.variantId !== 'string' || !request.variantId.trim()) {
            return { status: 'failed', code: 'invalid_request' };
        }

        if (checkLogin && (typeof request.sourceExtensionName !== 'string'
            || !request.sourceExtensionName.trim())) {
            return { status: 'failed', code: 'invalid_request' };
        }

        if (!this.acl.can('system.plugin_maintain')) {
            return { status: 'failed', code: 'forbidden' };
        }

        this.#pending = true;
        try {
            if (checkLogin) {
                await this.shopwareExtensionService.checkLogin();
                if (!Shopware.Store.get('shopwareExtensions').userInfo) {
                    return { status: 'failed', code: 'login_required' };
                }
            }

            return await new Promise<ExtensionStoreCheckoutResult>((resolve) => {
                void this.#prepare(request, isCompatible, resolve);
            });
        } catch {
            return { status: 'failed', code: 'checkout_failed' };
        } finally {
            this.#pending = false;
        }
    }

    async #prepare(
        request: Omit<ExtensionStoreCheckoutRequest, 'sourceExtensionName'> & { sourceExtensionName?: string },
        isCompatible: boolean | null,
        resolve: (result: ExtensionStoreCheckoutResult) => void,
    ): Promise<void> {
        const store = extensionStorePurchaseConfirmationStore();
        try {
            const [cartResponse, paymentMeansResponse] = await Promise.all([
                this.extensionStoreLicensesService.newCart(request.extensionId, request.variantId, request.sourceExtensionName),
                this.extensionStoreLicensesService.getPaymentMeans(),
            ]);
            const cart = cartResponse.data as ExtensionStoreBasket;
            const paymentMeans = paymentMeansResponse.data as ExtensionStorePaymentMean[];

            store.openModal({
                cart,
                paymentMeans,
                isCompatible,
                onConfirm: async () => {
                    try {
                        return await this.#performPurchase(isCompatible, cart, resolve);
                    } catch (error) {
                        resolve({ status: 'failed', code: 'checkout_failed' });
                        return { success: false, ...this.#getErrorDetails(error) };
                    }
                },
                onCancel: () => resolve({ status: 'cancelled' }),
            });
        } catch (error) {
            const details = this.#getErrorDetails(error);
            store.openErrorModal(details.title, details.description, details.documentationLink, () => {});
            resolve({ status: 'failed', code: 'checkout_failed' });
        }
    }

    async #performPurchase(
        isCompatible: boolean | null,
        cart: ExtensionStoreBasket,
        resolve: (result: ExtensionStoreCheckoutResult) => void,
    ): Promise<PurchaseConfirmationOnConfirmCallbackResult> {
        const store = extensionStorePurchaseConfirmationStore();
        store.checkoutStep = 'order';
        try {
            await this.extensionStoreLicensesService.orderCart(cart);
        } catch (error) {
            resolve({ status: 'failed', code: 'checkout_failed' });
            return { success: false, ...this.#getErrorDetails(error) };
        }

        store.checkoutStep = 'update';
        await this.#updateExtensionData();

        let installed = false;
        if (isCompatible && this.extensionStorePreferencesService.state.installAfterPurchase) {
            store.checkoutStep = 'install';
            installed = await this.#installExtension(cart);
        }

        let extensionVersion: string | null = null;
        if (installed) {
            store.checkoutStep = 'reload';
            extensionVersion = await this.#getInstalledExtensionVersion(cart.positions[0].extension.name);
        }

        resolve({ status: 'purchased', installed, extensionVersion });
        return { success: true, requiresReload: installed };
    }

    async #getInstalledExtensionVersion(extensionName: string): Promise<string | null> {
        try {
            const extensions = await this.extensionStoreActionService.getMyExtensions();

            return extensions.find((extension) => extension.name === extensionName)?.version ?? null;
        } catch (error) {
            console.error('Failed to get installed extension version after purchase', error);

            return null;
        }
    }

    #getErrorDetails(error: unknown): { title: string; description: string; documentationLink: string } {
        const maybeError = error as StoreApiErrorResponse | null | undefined;
        const errorDetails = maybeError?.response?.data?.errors?.at(-1);

        return {
            title: errorDetails?.title ?? '',
            description: errorDetails?.description ?? '',
            documentationLink: errorDetails?.meta?.documentationLink ?? '',
        };
    }

    async #updateExtensionData(): Promise<void> {
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
    async #clearCache(): Promise<void> {
        try {
            await this.cacheApiService.clear();
        } catch (error) {
            console.error('Failed to clear the cache after installing an extension', error);
        }
    }

    async #installExtension(cartData: ExtensionStoreBasket): Promise<boolean> {
        const extension = cartData.positions[0].extension;
        const snippetService = Shopware.Snippet as unknown as {
            tc: (key: string, params?: Record<string, string>) => string;
        };

        try {
            await this.extensionHelperService.downloadAndActivateExtension(extension.name, extension.type);
            await this.#clearCache();

            Shopware.Store.get('notification').createNotification({
                variant: 'positive',
                title: snippetService.tc('sw-extension-store.installation.successTitle'),
                message: snippetService.tc('sw-extension-store.installation.successMessage', { name: String(extension.name) }),
                growl: true,
            });

            return true;
        } catch (error) {
            console.error('Failed to install extension after purchase', error);

            Shopware.Store.get('notification').createNotification({
                variant: 'critical',
                title: snippetService.tc('sw-extension-store.installation.errorTitle'),
                message: snippetService.tc('sw-extension-store.installation.errorMessage', { name: String(extension.name) }),
                growl: true,
            });

            return false;
        }
    }
}
