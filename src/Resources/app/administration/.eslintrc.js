const path = require('path');

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
                        extensions: ['.js', '.vue', '.json', '.less', '.twig'],
                        alias: {
                            SwagExtensionStore: path.join(__dirname, 'src')
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
        // don't require .vue and .js extensions
        'import/extensions': ['error', 'always', {
            js: 'never',
            vue: 'never'
        }],
        'internal-rules/no-src-imports': 'error'
    }
};
