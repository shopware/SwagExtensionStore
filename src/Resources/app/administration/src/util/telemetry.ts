import type { TrackableType } from 'src/core/telemetry/types';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';

const collectDefaultEventData = (): Record<string, TrackableType> => {
    const eventData: Record<string, TrackableType> = {
        source: 'SwagExtensionStore',
        extension_store_version: __SWAG_EXTENSION_STORE_VERSION__,
    };

    const contextStore = extensionStoreContextStore();
    if (contextStore.skyBridgeStoreVersion !== null) {
        eventData['sky_bridge_store_version'] = contextStore.skyBridgeStoreVersion;
    }

    if (contextStore.licenseHost !== null) {
        eventData['license_host'] = contextStore.licenseHost;
    }

    return eventData;
};

export const trackExtensionStoreEvent = (eventName: string, data: Record<string, TrackableType> = {}): void => {
    if (!('Telemetry' in Shopware)) {
        return;
    }

    Shopware.Telemetry.track({
        ...data,
        ...collectDefaultEventData(),
        eventName,
    });
};
