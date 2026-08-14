import { registerOnboardingStatusStore } from './onboarding-status.store';

export const SHOPWARE_PAYMENTS_APP_NAME = 'ShopwarePayments';
export const SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE = 'shopware-payments-merchant-onboarding-status';

function getShopwarePaymentsExtension() {
    return Shopware.Store.get('extensions').extensionsState?.[SHOPWARE_PAYMENTS_APP_NAME] ?? null;
}

function getShopwarePaymentsOrigin() {
    const baseUrl = getShopwarePaymentsExtension()?.baseUrl;

    if (!baseUrl) {
        return null;
    }

    try {
        return new URL(baseUrl).origin;
    } catch {
        return null;
    }
}

function isShopwarePaymentsInstalled() {
    return getShopwarePaymentsExtension()?.active === true;
}

export function handleShopwarePaymentsOnboardingStatusMessage(event) {
    if (!isShopwarePaymentsInstalled()) {
        return;
    }

    const shopwarePaymentsOrigin = getShopwarePaymentsOrigin();
    if (!shopwarePaymentsOrigin || event.origin !== shopwarePaymentsOrigin) {
        return;
    }

    if (event.data?.type !== SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE) {
        return;
    }

    if (typeof event.data.hasOnboardedMerchant !== 'boolean') {
        return;
    }

    registerOnboardingStatusStore().setHasOnboardedMerchant(event.data.hasOnboardedMerchant);
}

export function registerShopwarePaymentsOnboardingStatusListener() {
    registerOnboardingStatusStore();

    if (window.shopwarePaymentsOnboardingStatusListenerRegistered) {
        return;
    }

    window.addEventListener('message', handleShopwarePaymentsOnboardingStatusMessage);
    window.shopwarePaymentsOnboardingStatusListenerRegistered = true;
}
