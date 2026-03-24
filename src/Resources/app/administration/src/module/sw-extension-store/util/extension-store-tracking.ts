import type { TrackableType } from 'src/core/telemetry/types';

export const trackExtensionStoreEvent = (eventName: string, data: Record<string, TrackableType> = {}): void => {
    Shopware.Telemetry.track({
        ...data,
        eventName,
        source: 'extension_store',
    });
};