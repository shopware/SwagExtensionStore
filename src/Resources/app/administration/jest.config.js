// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
module.exports = {
    preset: '@shopware-ag/jest-preset-sw6-admin',
    globals: {
        adminPath: process.env.ADMIN_PATH // required, e.g. /www/sw6/platform/src/Administration/Resources/app/administration
    },

    moduleNameMapper: {
        '^SwagExtensionStore(.*)$': '<rootDir>/src$1'
    }
};
