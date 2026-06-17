const MINIMUM_SERVICES_VERSION = '6.7.0.0';

const LEGACY_SERVICES_EXTENSIONS = {
    ShopwarePayments: {
        route: {
            name: 'sw.extension.module',
            params: {
                appName: 'ShopwarePayments',
                moduleName: 'sw-shopware-payments-overview',
            },
        },
    },
};

type LegacyServicesExtensionName = keyof typeof LEGACY_SERVICES_EXTENSIONS;

function getCleanShopwareVersion(): string {
    return (Shopware.Context.app.config.version ?? '').replace(/-.*/, '');
}

export function isAtLeastShopware67(): boolean {
    return getCleanShopwareVersion()
        .localeCompare(MINIMUM_SERVICES_VERSION, undefined, { numeric: true }) >= 0;
}

export function isLegacyServicesExtension(extensionName?: string): boolean {
    if (!extensionName) {
        return false;
    }

    return isAtLeastShopware67() && extensionName in LEGACY_SERVICES_EXTENSIONS;
}

export function getLegacyServicesExtensionRoute(extensionName?: string) {
    if (!isLegacyServicesExtension(extensionName)) {
        return null;
    }

    return LEGACY_SERVICES_EXTENSIONS[extensionName as LegacyServicesExtensionName].route;
}
