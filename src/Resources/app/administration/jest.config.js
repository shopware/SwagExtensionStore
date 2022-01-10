// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
    preset: '@shopware-ag/jest-preset-sw6-admin',
    globals: {
        // required, e.g. /www/sw6/platform/src/Administration/Resources/app/administration
        adminPath: process.env.ADMIN_PATH
    },

    collectCoverageFrom: [
        '<rootDir>/src/**/*.{js,ts}'
    ],

    moduleNameMapper: {
        '^SwagExtensionStore(.*)$': '<rootDir>/src$1'
    }
};
