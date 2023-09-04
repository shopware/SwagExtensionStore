import { config, enableAutoDestroy } from '@vue/test-utils';

import feature from './_mocks_/feature.service.mock';

// Setup Vue Test Utils configuration
config.showDeprecationWarnings = true;

// enable autoDestroy for wrapper after each test
enableAutoDestroy(afterEach);

// Add services
Shopware.Service().register('feature', () => feature);
Shopware.Feature = Shopware.Service('feature');

// Provide all services
Shopware.Service().list().forEach(serviceKey => {
    config.provide[serviceKey] = Shopware.Service(serviceKey);
});

// Add global mocks
config.mocks = {
    $tc: v => v,
    $t: v => v,
    $te: () => true,
    $sanitize: key => key,
    $device: {
        onResize: jest.fn(),
        removeResizeListener: jest.fn(),
        getSystemKey: jest.fn(() => 'CTRL'),
        getViewportWidth: jest.fn(() => 1920)
    },
    $router: {
        replace: jest.fn(),
        push: jest.fn(),
        go: jest.fn(),
        resolve: jest.fn(() => {
            return {
                resolved: {
                    matched: []
                }
            };
        })
    },
    $route: {
        params: {}
    },
    $store: Shopware.State._store
};
