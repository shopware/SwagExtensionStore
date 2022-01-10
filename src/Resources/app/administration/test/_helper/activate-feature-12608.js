/**
 * This function activates FEATURE_NEXT_12608 for jest tests.
 * It is necessary for all shopware versions prior 6.4.8.0
 *
 * @deprecated tag:v2.0.0 - Will be removed
 */
export function activateFeature12608() {
    // Workaround to activate FEATURE_NEXT_12608 for sw-meteor-* components in versions prior 6.4.8.0
    // global.activeFeatureFlags is currently not available within plugins
    jest.spyOn(Shopware.Feature, 'isActive').mockImplementation((flag) => {
        return flag === 'FEATURE_NEXT_12608';
    });
}
