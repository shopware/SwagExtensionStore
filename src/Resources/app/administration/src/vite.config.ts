import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type ComposerManifest = {
    version?: string;
};

const isComposerManifest = (data: unknown): data is ComposerManifest => {
    if (data === null || typeof data !== 'object') {
        return false;
    }

    const version = (data as { version?: unknown }).version;

    return version === undefined || typeof version === 'string';
};

const composerJsonPath = resolve(__dirname, '../../../../../composer.json');

const parsedComposerJson: unknown = JSON.parse(
    readFileSync(composerJsonPath, { encoding: 'utf8' }),
);

const composerJson: ComposerManifest = isComposerManifest(parsedComposerJson) ? parsedComposerJson : {};

export default {
    resolve: {
        alias: {
            SwagExtensionStore: __dirname,
        },
    },
    define: {
        __SWAG_EXTENSION_STORE_VERSION__: JSON.stringify(composerJson.version ?? ''),
    },
};
