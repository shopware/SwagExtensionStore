import { flushPromises } from '@vue/test-utils';
import { trackExtensionStoreEvent } from 'SwagExtensionStore/util/telemetry';

const mockLoadLicenseHost = jest.fn().mockImplementation(() => {
    const { userInfo } = Shopware.Store.get('shopwareExtensions');
    return Promise.resolve(userInfo !== null ? 'license.host.example.com' : null);
});

const mockStore = {
    skyBridgeStoreVersion: null,
    loadLicenseHost: mockLoadLicenseHost,
};

jest.mock('SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store', () => jest.fn(() => mockStore));

describe('SwagExtensionStore/util/telemetry', () => {
    let mockTrack;

    beforeEach(() => {
        mockTrack = jest.fn();
        Shopware.Telemetry = { track: mockTrack };
        jest.spyOn(Shopware.Store, 'get').mockReturnValue({ userInfo: null });
    });

    afterEach(() => {
        delete Shopware.Telemetry;
        mockStore.skyBridgeStoreVersion = null;
        jest.restoreAllMocks();
    });

    it('should not track if Telemetry is not available in Shopware', () => {
        delete Shopware.Telemetry;

        trackExtensionStoreEvent('test_event');

        expect(mockTrack).not.toHaveBeenCalled();
    });

    it('should track with event name and default data', async () => {
        trackExtensionStoreEvent('test_event');
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({
            eventName: 'test_event',
            source: 'SwagExtensionStore',
            extension_store_version: '0.0.0',
        }));
    });

    it('should include sky_bridge_store_version when set', async () => {
        mockStore.skyBridgeStoreVersion = '1.2.3';

        trackExtensionStoreEvent('test_event');
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({
            sky_bridge_store_version: '1.2.3',
        }));
    });

    it('should not include sky_bridge_store_version when null', async () => {
        trackExtensionStoreEvent('test_event');
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.not.objectContaining({
            sky_bridge_store_version: expect.anything(),
        }));
    });

    it('should include license_host when the user is logged in', async () => {
        Shopware.Store.get.mockReturnValue({ userInfo: { email: 'user@example.com' } });

        trackExtensionStoreEvent('test_event');
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({
            license_host: 'license.host.example.com',
        }));
    });

    it('should not include license_host when the user is not logged in', async () => {
        trackExtensionStoreEvent('test_event');
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.not.objectContaining({
            license_host: expect.anything(),
        }));
    });

    it('should merge custom data with default event data', async () => {
        trackExtensionStoreEvent('test_event', { custom_field: 'value' });
        await flushPromises();

        expect(mockTrack).toHaveBeenCalledWith(expect.objectContaining({
            eventName: 'test_event',
            custom_field: 'value',
            source: 'SwagExtensionStore',
        }));
    });
});
