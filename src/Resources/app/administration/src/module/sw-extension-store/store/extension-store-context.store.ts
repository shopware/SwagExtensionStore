export type ExtensionStoreContextState = {
    licenseHost: string | null;
    skyBridgeStoreVersion: string | null;
    iframeUrl: string | null;
};

// TODO: Replace localhost with the actual prod URL.
const FALLBACK_IFRAME_URL = 'http://localhost:3000';

const isLoggedIn = () => Shopware.State.get('shopwareExtensions').userInfo !== null;

let iframeUrlLoadPromise: Promise<string> | null = null;
let licenseHostLoadPromise: Promise<string | null> | null = null;

export default Shopware.Store.register('extensionStoreContext', {
    state: (): ExtensionStoreContextState => ({
        licenseHost: null,
        skyBridgeStoreVersion: null,
        iframeUrl: null
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
        }
    }
});
