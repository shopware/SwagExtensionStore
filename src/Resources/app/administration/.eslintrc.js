const path = require('path');

// use ADMIN_PATH environment variable to change from default installation
process.env.ADMIN_PATH =
    process.env.ADMIN_PATH ??
    path.join(__dirname, '../../../../../../../src/Administration/Resources/app/administration/src');

module.exports = {
    extends: '@shopware-ag/eslint-config-base',
    env: {
        browser: true,
        'jest/globals': true
    },

    globals: {
        Shopware: true
    },

    plugins: [
        'jest',
        'internal-rules'
    ],

    settings: {
        'import/resolver': {
            node: {},
            webpack: {
                config: {
                    // Sync with webpack.config.js
                    resolve: {
                        extensions: ['.js', '.ts', '.vue', '.json', '.less', '.twig'],
                        alias: {
                            SwagExtensionStore: path.join(__dirname, 'src'),
                            src: process.env.ADMIN_PATH
                        }
                    }
                }
            }
        }
    },

    rules: {
        // Match the max line length with the phpstorm default settings
        'max-len': ['warn', 125, { ignoreRegExpLiterals: true }],
        // Warn about useless path segment in import statements
        'import/no-useless-path-segments': 0,
        // don't require .vue, .ts and .js extensions
        'import/extensions': ['error', 'always', {
            js: 'never',
            ts: 'never',
            vue: 'never'
        }],
        'internal-rules/no-src-imports': 'error',
        'import/no-extraneous-dependencies': ['error', { optionalDependencies: ['src/**/*.spec.[t|j]s'] }]
    }
};
