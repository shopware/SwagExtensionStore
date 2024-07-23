const path = require('path');

// use ADMIN_PATH environment variable to change from default installation
process.env.ADMIN_PATH =
    process.env.ADMIN_PATH ??
    path.join(__dirname, '../../../../../../../src/Administration/Resources/app/administration');


const baseRules = {
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
    'import/no-extraneous-dependencies': ['error', {
        optionalDependencies: ['src/**/*.spec.[t|j]s', 'src/**/*.spec.vue3.[t|j]s']
    }]
};

module.exports = {
    extends: '@shopware-ag/eslint-config-base',
    env: {
        browser: true,
        'jest/globals': true
    },

    globals: {
        Shopware: true,
        flushPromises: true,
        wrapTestComponent: true
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
                            src: path.join(process.env.ADMIN_PATH, 'src')
                        }
                    }
                }
            }
        }
    },

    rules: baseRules,

    overrides: [{
        files: ['**/*.ts'],
        extends: [
            '@shopware-ag/eslint-config-base',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:@typescript-eslint/recommended-requiring-type-checking',
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
            tsconfigRootDir: __dirname,
            project: ['./tsconfig.json']
        },
        plugins: ['@typescript-eslint'],
        rules: {
            ...baseRules,
            indent: 'off',
            'no-void': 'off',
            'no-unused-vars': 'off',
            'no-shadow': 'off',

            '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
            '@typescript-eslint/ban-ts-comment': 0,
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 0,
            '@typescript-eslint/prefer-ts-expect-error': 'error',
            '@typescript-eslint/no-floating-promises': 0,
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/member-delimiter-style': 'error'
        }
    }]
};
