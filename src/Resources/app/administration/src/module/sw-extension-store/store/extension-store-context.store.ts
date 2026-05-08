export type ExtensionStoreContextState = {
    licenseHost: string | null;
    skyBridgeStoreVersion: string | null;
};

export default Shopware.Store.register('extensionStoreContext', {
    state: (): ExtensionStoreContextState => ({
        licenseHost: null,
        skyBridgeStoreVersion: null,
    }),
    actions: {
        updateLicenseHost(host: string | null): void {
            this.licenseHost = host;
        },
        resetLicenseHost(): void {
            this.licenseHost = null;
        },
        updateSkyBridgeStoreVersion(version: string): void {
            this.skyBridgeStoreVersion = version;
        },
        resetSkyBridgeStoreVersion(): void {
            this.skyBridgeStoreVersion = null;
        },
    },
});
