import { reactive } from 'vue';
import type UserConfigService from 'src/core/service/api/user-config.api.service';

export interface ExtensionStorePreferences {
    installAfterPurchase: boolean;
}

const DEFAULTS: ExtensionStorePreferences = {
    installAfterPurchase: true
};

class ExtensionStorePreferencesService {
    static USER_CONFIG_KEY = 'SwagExtensionStore.preferences';

    private _state = reactive<ExtensionStorePreferences>({ ...DEFAULTS });

    private loadPromise: Promise<void> | null = null;

    constructor(private readonly userConfigService: UserConfigService) {
        void this.load();
    }

    get state(): Readonly<ExtensionStorePreferences> {
        return this._state;
    }

    load(): Promise<void> {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = (this.userConfigService
            .search([ExtensionStorePreferencesService.USER_CONFIG_KEY]) as Promise<{ data: Record<string, unknown[]> }>)
            .then((response) => {
                if (!response) {
                    return;
                }

                const config = response.data[ExtensionStorePreferencesService.USER_CONFIG_KEY];
                if (!config) {
                    return;
                }

                const [stored] = config as [Partial<ExtensionStorePreferences> | undefined];
                if (!stored) {
                    return;
                }

                Object.assign(this._state, stored);
            })
            .catch(() => {
                // Reset in case the API call failed.
                this.loadPromise = null;
            });

        return this.loadPromise;
    }

    async update(partial: Partial<ExtensionStorePreferences>): Promise<void> {
        const previous = { ...this._state };

        Object.assign(this._state, partial);

        try {
            // @ts-expect-error - The signature of the UserConfigService.upsert method isn't correct.
            await this.userConfigService.upsert({
                [ExtensionStorePreferencesService.USER_CONFIG_KEY]: [{ ...this._state }]
            });
        } catch {
            Object.assign(this._state, previous);
        }
    }
}

export default ExtensionStorePreferencesService;
