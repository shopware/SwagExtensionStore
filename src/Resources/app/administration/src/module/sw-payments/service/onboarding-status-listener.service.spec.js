import { registerOnboardingStatusStore } from './onboarding-status.store';
import {
    handleShopwarePaymentsOnboardingStatusMessage,
    registerShopwarePaymentsOnboardingStatusListener,
    SHOPWARE_PAYMENTS_APP_NAME,
    SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE,
} from './onboarding-status-listener.service';

const SHOPWARE_PAYMENTS_ORIGIN = 'https://payments.example.test';

function setShopwarePaymentsExtension(extension = {}) {
    Shopware.Store.get('extensions').extensionsState = {
        [SHOPWARE_PAYMENTS_APP_NAME]: {
            name: SHOPWARE_PAYMENTS_APP_NAME,
            baseUrl: `${SHOPWARE_PAYMENTS_ORIGIN}/admin`,
            permissions: {},
            type: 'app',
            active: true,
            ...extension,
        },
    };
}

function createOnboardingStatusMessage(hasOnboardedMerchant, origin = SHOPWARE_PAYMENTS_ORIGIN) {
    return new MessageEvent('message', {
        origin,
        data: {
            type: SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE,
            hasOnboardedMerchant,
        },
    });
}

describe('src/module/sw-payments/service/onboarding-status-listener.service', () => {
    beforeEach(() => {
        Shopware.Store.get('extensions').extensionsState = {};
        registerOnboardingStatusStore().setHasOnboardedMerchant(null);
        delete window.shopwarePaymentsOnboardingStatusListenerRegistered;
    });

    it('stores the onboarding status from a trusted Shopware Payments message', () => {
        setShopwarePaymentsExtension();

        handleShopwarePaymentsOnboardingStatusMessage(createOnboardingStatusMessage(false));

        expect(registerOnboardingStatusStore().hasOnboardedMerchant).toBe(false);

        handleShopwarePaymentsOnboardingStatusMessage(createOnboardingStatusMessage(true));

        expect(registerOnboardingStatusStore().hasOnboardedMerchant).toBe(true);
    });

    it('ignores onboarding status messages from another origin', () => {
        setShopwarePaymentsExtension();

        handleShopwarePaymentsOnboardingStatusMessage(createOnboardingStatusMessage(false, 'https://example.com'));

        expect(registerOnboardingStatusStore().hasOnboardedMerchant).toBeNull();
    });

    it('ignores onboarding status messages without a boolean status', () => {
        setShopwarePaymentsExtension();

        handleShopwarePaymentsOnboardingStatusMessage(new MessageEvent('message', {
            origin: SHOPWARE_PAYMENTS_ORIGIN,
            data: {
                type: SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE,
            },
        }));

        expect(registerOnboardingStatusStore().hasOnboardedMerchant).toBeNull();
    });

    it('ignores onboarding status messages when Shopware Payments is inactive', () => {
        setShopwarePaymentsExtension({ active: false });

        handleShopwarePaymentsOnboardingStatusMessage(createOnboardingStatusMessage(false));

        expect(registerOnboardingStatusStore().hasOnboardedMerchant).toBeNull();
    });

    it('registers the window message listener only once', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

        registerShopwarePaymentsOnboardingStatusListener();
        registerShopwarePaymentsOnboardingStatusListener();

        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(addEventListenerSpy).toHaveBeenCalledWith('message', handleShopwarePaymentsOnboardingStatusMessage);
    });
});
