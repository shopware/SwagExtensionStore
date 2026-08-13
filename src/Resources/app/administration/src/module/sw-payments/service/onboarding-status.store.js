export const ONBOARDING_STATUS_STORE_ID = 'swPaymentsOnboardingStatus';

export function getOnboardingStatusStore() {
    return Shopware.Store.get(ONBOARDING_STATUS_STORE_ID);
}

export function registerOnboardingStatusStore() {
    try {
        return getOnboardingStatusStore();
    } catch {
        Shopware.Store.register({
            id: ONBOARDING_STATUS_STORE_ID,
            state: () => ({
                hasOnboardedMerchant: null,
            }),
            actions: {
                setHasOnboardedMerchant(hasOnboardedMerchant) {
                    this.hasOnboardedMerchant = hasOnboardedMerchant;
                },
            },
        });

        return getOnboardingStatusStore();
    }
}
