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
        `${process.env.ADMIN_PATH}/test/_setup/prepare_environment.js`
    ],

    testMatch: [
        '<rootDir>/src/**/*.spec.js',
        '<rootDir>/src/**/*.spec.ts'
    ],

    collectCoverageFrom: [
        '<rootDir>/src/**/*.js',
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.spec.js',
        '!<rootDir>/src/**/*.spec.ts'
    ],

    transform: {
        '.*\\.svg': `${process.env.ADMIN_PATH}/test/transformer/svgStringifyTransformer.js`,
        '.*\\.(jpg|png)': '<rootDir>/test/transformer/imageMockTransformer.js'
    },

    transformIgnorePatterns: [
        '/node_modules/(?!(@shopware-ag/meteor-component-library|@shopware-ag/meteor-icon-kit|uuidv7|lodash-es)/)'
    ],

    moduleNameMapper: {
        '^SwagExtensionStore(.*)$': '<rootDir>src$1',
        '^src(.*)$': `${process.env.ADMIN_PATH}/src$1`,
        '^@shopware-ag/meteor-admin-sdk/es/(.*)': `${process.env.ADMIN_PATH}/node_modules/@shopware-ag/meteor-admin-sdk/umd/$1`,
        '^@shopware-ag/meteor-component-library$': `${process.env.ADMIN_PATH}/node_modules/@shopware-ag/meteor-component-library/dist/common/index.js`,
        vue$: `${process.env.ADMIN_PATH}/node_modules/vue/dist/vue.cjs.js`,
        '^@vue/test-utils$': `${process.env.ADMIN_PATH}/node_modules/@vue/test-utils/dist/vue-test-utils.cjs.js`,
        '^lodash-es/(.*)$': 'lodash/$1',
    },

    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    }
};
