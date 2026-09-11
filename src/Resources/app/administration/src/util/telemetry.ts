import type { TrackableType } from 'src/core/telemetry/types';
import extensionStoreContextStore
    from 'SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store';

const collectDefaultEventData = async (): Promise<Record<string, TrackableType>> => {
    const eventData: Record<string, TrackableType> = {
        source: 'SwagExtensionStore',
        extension_store_version: __SWAG_EXTENSION_STORE_VERSION__,
    };

    const contextStore = extensionStoreContextStore();
    if (contextStore.skyBridgeStoreVersion !== null) {
        eventData['sky_bridge_store_version'] = contextStore.skyBridgeStoreVersion;
    }

    const licenseHost = await contextStore.loadLicenseHost();
    if (licenseHost !== null) {
        eventData['license_host'] = licenseHost;
    }

    return eventData;
};

/**
 * Resolves once the event has been handed over to the telemetry gateway. Callers that are
 * about to tear down the page (e.g. a reload) should await this, everyone else can ignore it.
 */
export const trackExtensionStoreEvent = async (
    eventName: string,
    data: Record<string, TrackableType> = {},
): Promise<void> => {
    if (!('Telemetry' in Shopware)) {
        return;
    }

    try {
        const defaultEventData = await collectDefaultEventData();

        Shopware.Telemetry.track({
            ...data,
            ...defaultEventData,
            eventName,
        });
    } catch (error) {
        console.error(`Failed to track the ${eventName} event`, error);
    }
};
