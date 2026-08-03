import type { DemoShopStatus } from '../types/extension-store-demo-shop.types';

export type ExtensionStoreContextState = {
    licenseHost: string | null;
    skyBridgeStoreVersion: string | null;
    iframeUrl: string | null;
    demoShopStatus: DemoShopStatus | null;
};

const FALLBACK_IFRAME_URL = 'https://sky-bridge-store.production.shopware.in';

const isLoggedIn = () => Shopware.Store.get('shopwareExtensions').userInfo !== null;

let iframeUrlLoadPromise: Promise<string> | null = null;
let licenseHostLoadPromise: Promise<string | null> | null = null;
let demoShopStatusLoadPromise: Promise<DemoShopStatus> | null = null;

export default Shopware.Store.register('extensionStoreContext', {
    state: (): ExtensionStoreContextState => ({
        licenseHost: null,
        skyBridgeStoreVersion: null,
        iframeUrl: null,
        demoShopStatus: null,
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
        loadDemoShopStatus(): Promise<DemoShopStatus> {
            // The demo shop status cannot change during an admin session, so it is only requested once
            if (this.demoShopStatus) {
                return Promise.resolve(this.demoShopStatus);
            }

            if (demoShopStatusLoadPromise) {
                return demoShopStatusLoadPromise;
            }

            demoShopStatusLoadPromise = Shopware.Service('extensionStoreDemoShopService')
                .getDemoShopStatus()
                .then((demoShopStatus: DemoShopStatus) => {
                    this.demoShopStatus = demoShopStatus;

                    return demoShopStatus;
                })
                .catch((error: unknown) => {
                    console.warn('Failed to load the demo shop status. Assuming a regular shop.', error);
                    demoShopStatusLoadPromise = null;

                    return { isDemoShop: false as const, demoShopInformation: null };
                });

            return demoShopStatusLoadPromise;
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
