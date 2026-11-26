const BACKEND_DATA_CONSENT = 'backend_data';

type ConsentStores = {
    get(name: 'usageData'): { isConsentGiven: boolean };
    get(name: 'consent'): {
        consents: Record<string, unknown>;
        update(): Promise<void>;
        isAccepted(name: string): boolean;
    };
};

/**
 * Shop-wide "Share store data (anonymous)" consent.
 */
export async function isShopDataSharingEnabled(shopwareVersion: string): Promise<boolean> {
    const version = /^v?(\d+\.\d+)\.(\d+)(?:[.+-]|$)/.exec(shopwareVersion);
    if (!version) {
        return false;
    }

    const [, series, patch] = version;
    const stores = Shopware.Store as unknown as ConsentStores;

    try {
        // Both stores existed in 6.7.8. The settings and existing decisions moved to backend_data in 6.7.9.
        if (series === '6.7' && patch.localeCompare('9', undefined, { numeric: true }) < 0) {
            return stores.get('usageData').isConsentGiven === true;
        }

        const consentStore = stores.get('consent');
        if (!consentStore.consents[BACKEND_DATA_CONSENT]) {
            await consentStore.update();
        }

        return !!consentStore.consents[BACKEND_DATA_CONSENT] && consentStore.isAccepted(BACKEND_DATA_CONSENT);
    } catch {
        return false;
    }
}
