import type { DemoShopStatus } from '../service/extension-store-demo-shop.service';

export type ExtensionStoreContextState = {
    licenseHost: string | null;
    skyBridgeStoreVersion: string | null;
    iframeUrl: string | null;
    isDemoShop: boolean | null;
};

const FALLBACK_IFRAME_URL = 'https://sky-bridge-store.production.shopware.in';

const isLoggedIn = () => Shopware.Store.get('shopwareExtensions').userInfo !== null;

let iframeUrlLoadPromise: Promise<string> | null = null;
let licenseHostLoadPromise: Promise<string | null> | null = null;
let isDemoShopLoadPromise: Promise<boolean> | null = null;

export default Shopware.Store.register('extensionStoreContext', {
    state: (): ExtensionStoreContextState => ({
        licenseHost: null,
        skyBridgeStoreVersion: null,
        iframeUrl: null,
        isDemoShop: null,
    }),
    actions: {
        loadLicenseHost(): Promise<string | null> {
            // The license host is only valid for logged-in users.
            if (!isLoggedIn()) {
                this.licenseHost = null;
                licenseHostLoadPromise = null;

                return Promise.resolve(null);
            }

            if (this.licenseHost) {
                return Promise.resolve(this.licenseHost);
            }

            if (licenseHostLoadPromise) {
                return licenseHostLoadPromise;
            }

            licenseHostLoadPromise = Shopware.Service('systemConfigApiService')
                .getValues('core.store')
                .then((config: Record<string, string>) => {
                    this.licenseHost = config['core.store.licenseHost'] ?? null;

                    return this.licenseHost;
                })
                .catch(() => {
                    licenseHostLoadPromise = null;

                    return null;
                });

            return licenseHostLoadPromise;
        },
        loadIsDemoShop(): Promise<boolean> {
            // Bundles cannot change while the admin is open, so it is only requested once
            if (this.isDemoShop !== null) {
                return Promise.resolve(this.isDemoShop);
            }

            if (isDemoShopLoadPromise) {
                return isDemoShopLoadPromise;
            }

            isDemoShopLoadPromise = Shopware.Service('extensionStoreDemoShopService')
                .getDemoShopStatus()
                .then(({ isDemoShop }: DemoShopStatus) => {
                    this.isDemoShop = isDemoShop;

                    return isDemoShop;
                })
                .catch((error: unknown) => {
                    console.warn('Failed to load the demo shop status. Assuming a regular shop.', error);
                    isDemoShopLoadPromise = null;

                    return false;
                });

            return isDemoShopLoadPromise;
        },
        updateSkyBridgeStoreVersion(version: string): void {
            this.skyBridgeStoreVersion = version;
        },
        resetSkyBridgeStoreVersion(): void {
            this.skyBridgeStoreVersion = null;
        },
        loadIframeUrl(): Promise<string> {
            if (this.iframeUrl) {
                return Promise.resolve(this.iframeUrl);
            }

            if (iframeUrlLoadPromise) {
                return iframeUrlLoadPromise;
            }

            iframeUrlLoadPromise = Shopware.Service('systemConfigApiService')
                .getValues('SwagExtensionStore.config')
                .then((config: Record<string, string>) => {
                    this.iframeUrl = config['SwagExtensionStore.config.iframeUrl'] ?? FALLBACK_IFRAME_URL;

                    return this.iframeUrl;
                })
                .catch(() => {
                    this.iframeUrl = FALLBACK_IFRAME_URL;
                    iframeUrlLoadPromise = null;

                    return this.iframeUrl;
                });

            return iframeUrlLoadPromise;
        },
    },
});
