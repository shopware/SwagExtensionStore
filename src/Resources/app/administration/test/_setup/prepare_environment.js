import { config, enableAutoDestroy } from '@vue/test-utils';

// Setup Vue Test Utils configuration
config.showDeprecationWarnings = true;

// enable autoDestroy for wrapper after each test
enableAutoDestroy(afterEach);

// Provide all services
Shopware.Service().list().forEach(serviceKey => {
    config.provide[serviceKey] = Shopware.Service(serviceKey);
});
