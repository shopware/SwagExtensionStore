const { resolve, join } = require('path');

const adminPath = process.env.ADMIN_PATH ? process.env.ADMIN_PATH :
    resolve(join(__dirname, '../../../../../../../src/Administration/Resources/app/administration'));
process.env.ADMIN_PATH = adminPath;

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
    preset: '@shopware-ag/jest-preset-sw6-admin',
    globals: {
        // required, e.g. /www/sw6/platform/src/Administration/Resources/app/administration
        adminPath
    },

    setupFilesAfterEnv: [
        join(adminPath, '/test/_setup/prepare_vue3_environment.js')
    ],

    testMatch: [
        '<rootDir>/src/**/*.spec.vue3.js',
        '<rootDir>/src/**/*.spec.vue3.ts'
    ],

    collectCoverageFrom: [
        '<rootDir>/src/**/*.js',
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.spec.js',
        '!<rootDir>/src/**/*.spec.ts'
    ],

    moduleNameMapper: {
        '^SwagExtensionStore(.*)$': '<rootDir>src$1',
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports.
        // See https://github.com/uuidjs/uuid/issues/451
        '^uuid$': require.resolve('uuid'),
        '^\@shopware-ag\/admin-extension-sdk\/es\/(.*)':
            `${process.env.ADMIN_PATH}/node_modules/@shopware-ag/admin-extension-sdk/umd/$1`,
        vue$: '<rootDir>/node_modules/@vue/compat/dist/vue.cjs.js',
        '@vue/test-utils_v3': '<rootDir>/node_modules/@vue/test-utils_v3'
    },

    transformIgnorePatterns: [
        '/node_modules/(?!(uuidv7|other)/)'
    ]
};
