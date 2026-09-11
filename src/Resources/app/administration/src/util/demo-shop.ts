const DEMO_SHOP_BUNDLE_NAME = 'SwagDemoEnvironment';

/**
 * Demo shops ship the `SwagDemoEnvironment` bundle. They cannot purchase extensions or in-app
 * purchases, so actions that would inevitably fail server-side are blocked up front.
 */
export function hasDemoShopBundle(): boolean {
    const bundles = Shopware.Context.app.config.bundles;

    return !!bundles && DEMO_SHOP_BUNDLE_NAME in bundles;
}
