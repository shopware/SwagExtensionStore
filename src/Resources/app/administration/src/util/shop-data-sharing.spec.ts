import { isShopDataSharingEnabled } from 'SwagExtensionStore/util/shop-data-sharing';

describe('SwagExtensionStore/util/shop-data-sharing', () => {
    let consentStore: {
        consents: Record<string, unknown>;
        update: jest.Mock;
        isAccepted: jest.Mock;
    };
    let usageDataStore: { isConsentGiven: boolean };

    beforeEach(() => {
        consentStore = {
            consents: {},
            update: jest.fn().mockResolvedValue(undefined),
            isAccepted: jest.fn(),
        };
        usageDataStore = { isConsentGiven: false };
        const originalGet = Shopware.Store.get.bind(Shopware.Store);
        jest.spyOn(Shopware.Store, 'get').mockImplementation((name: string) => {
            if (name === 'consent') {
                return consentStore as never;
            }

            if (name === 'usageData') {
                return usageDataStore as never;
            }

            return originalGet(name as keyof PiniaRootState);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each(['6.7.0.0', '6.7.7.1', '6.7.8.2'])('should read the legacy decision on Shopware %s', async (version) => {
        usageDataStore.isConsentGiven = true;

        await expect(isShopDataSharingEnabled(version)).resolves.toBe(true);
        expect(consentStore.update).not.toHaveBeenCalled();
    });

    it('should report a revoked legacy consent even if backend_data is accepted', async () => {
        consentStore.consents.backend_data = { status: 'accepted' };
        consentStore.isAccepted.mockReturnValue(true);

        await expect(isShopDataSharingEnabled('6.7.8.0')).resolves.toBe(false);
    });

    it.each(['6.7.9.0', '6.7.10.1', 'v6.8.0.0-dev', '7.0.0'])('should read backend_data consent on Shopware %s', async (version) => {
        consentStore.consents.backend_data = { status: 'accepted' };
        consentStore.isAccepted.mockReturnValue(true);

        await expect(isShopDataSharingEnabled(version)).resolves.toBe(true);
        expect(consentStore.update).not.toHaveBeenCalled();
        expect(consentStore.isAccepted).toHaveBeenCalledWith('backend_data');
    });

    it('should return false when backend_data consent is not accepted', async () => {
        usageDataStore.isConsentGiven = true;
        consentStore.consents.backend_data = { status: 'revoked' };
        consentStore.isAccepted.mockReturnValue(false);

        await expect(isShopDataSharingEnabled('6.7.9.0')).resolves.toBe(false);
    });

    it('should load consents when backend_data is missing and then report accepted', async () => {
        consentStore.update.mockImplementation(() => {
            consentStore.consents.backend_data = { status: 'accepted' };
            return Promise.resolve();
        });
        consentStore.isAccepted.mockReturnValue(true);

        await expect(isShopDataSharingEnabled('6.7.9.0')).resolves.toBe(true);
        expect(consentStore.update).toHaveBeenCalledTimes(1);
    });

    it('should return false when backend_data is still missing after update', async () => {
        await expect(isShopDataSharingEnabled('6.7.9.0')).resolves.toBe(false);
        expect(consentStore.update).toHaveBeenCalledTimes(1);
        expect(consentStore.isAccepted).not.toHaveBeenCalled();
    });

    it('should return false when the Shopware version is unavailable', async () => {
        usageDataStore.isConsentGiven = true;

        await expect(isShopDataSharingEnabled('')).resolves.toBe(false);
    });
});
