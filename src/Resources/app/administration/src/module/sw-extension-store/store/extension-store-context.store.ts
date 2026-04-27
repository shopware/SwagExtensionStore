export type ExtensionStoreContextState = {
    skyBridgeStoreVersion: string | null;
};

export default Shopware.Store.register('extensionStoreContext', {
    state: (): ExtensionStoreContextState => ({
        skyBridgeStoreVersion: null,
    }),
    actions: {
        updateSkyBridgeStoreVersion(version: string): void {
            this.skyBridgeStoreVersion = version;
        },
        resetSkyBridgeStoreVersion(): void {
            this.skyBridgeStoreVersion = null;
        },
    },
});
