import type { TrackableType } from 'src/core/telemetry/types';

const collectDefaultEventData = (): Record<string, TrackableType> => {
    return {
        source: 'SwagExtensionStore',
        extension_store_version: __SWAG_EXTENSION_STORE_VERSION__,
    };
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
