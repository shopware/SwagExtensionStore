const MODULE_ID = 'sw-payments';

if (!Shopware.Module.getModuleRegistry().has(MODULE_ID)) {
    Shopware.Module.register(MODULE_ID, {
        type: 'core',
        name: 'payments',
        title: 'sw-payments.general.mainMenuItemGeneral',
        description: 'sw-payments.general.description',
        version: '1.0.0',
        targetVersion: '1.0.0',
        color: '#FFBC51',
        icon: 'solid-credit-card',

        routes: {
            index: {
                path: 'index',
            },
        },

        navigation: [
            {
                id: MODULE_ID,
                label: 'global.sw-admin-menu.navigation.mainMenuItemShopwarePayments',
                color: '#FFBC51',
                icon: 'regular-credit-card',
                position: 35,
            },
        ],
    });
}
