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

export function isLegacyServicesExtension(extensionName?: string): boolean {
    if (!extensionName) {
        return false;
    }

    return extensionName in LEGACY_SERVICES_EXTENSIONS;
}

export function getLegacyServicesExtensionRoute(extensionName?: string) {
    if (!isLegacyServicesExtension(extensionName)) {
        return null;
    }

    return LEGACY_SERVICES_EXTENSIONS[extensionName as LegacyServicesExtensionName].route;
}
