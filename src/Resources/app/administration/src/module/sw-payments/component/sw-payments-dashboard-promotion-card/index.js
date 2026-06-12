import template from './sw-payments-dashboard-promotion-card.html.twig';
import './sw-payments-dashboard-promotion-card.scss';

const SHOPWARE_PAYMENTS_APP_NAME = 'ShopwarePayments';
const SHOPWARE_PAYMENTS_OVERVIEW_MODULE_NAME = 'sw-shopware-payments-overview';
const SANDBOX_TRACKING_ID = '00000000-0000-0000-0000-000000000000';
const MINIMUM_SUPPORTED_VERSION = '6.5.7.0';
const DISMISSAL_STORAGE_KEY = 'shopware-payments.dashboard-promotion.dismissed';

export default Shopware.Component.wrapComponentConfig({
    template,

    data() {
        return {
            hasOnboardedAccount: false,
            isDismissed: this.isDismissedInSession(),
            isInitialized: false,
        };
    },

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },

        isShopwarePaymentsInstalled() {
            return !!Shopware.Context.app.config.bundles?.[SHOPWARE_PAYMENTS_APP_NAME];
        },

        isSupportedShopwareVersion() {
            return this.compareVersions(Shopware.Context.app.config.version ?? '', MINIMUM_SUPPORTED_VERSION) >= 0;
        },

        showActivateButton() {
            return this.isShopwarePaymentsInstalled;
        },

        showBanner() {
            return this.isInitialized
                && this.isSupportedShopwareVersion
                && !this.isDismissed
                && !this.hasOnboardedAccount;
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        async createdComponent() {
            if (!this.isSupportedShopwareVersion || this.isDismissed || !this.isShopwarePaymentsInstalled) {
                this.isInitialized = true;

                return;
            }

            try {
                const merchants = await this.fetchMerchants();
                this.hasOnboardedAccount = merchants.some((merchant) => {
                    return merchant.trackingId !== SANDBOX_TRACKING_ID
                        && typeof merchant.merchantId === 'string'
                        && merchant.merchantId.trim() !== '';
                });
            } catch {
                this.hasOnboardedAccount = false;
            } finally {
                this.isInitialized = true;
            }
        },

        async fetchMerchants() {
            const response = await fetch('/api/admin/shop-information/merchants', {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load Shopware Payments merchants');
            }

            return response.json();
        },

        dismiss() {
            sessionStorage.setItem(DISMISSAL_STORAGE_KEY, 'true');
            this.isDismissed = true;
        },

        activateNow() {
            if (!this.isShopwarePaymentsInstalled) {
                return;
            }

            this.$router.push({
                name: 'sw.extension.module',
                params: {
                    appName: SHOPWARE_PAYMENTS_APP_NAME,
                    moduleName: SHOPWARE_PAYMENTS_OVERVIEW_MODULE_NAME,
                },
            });
        },

        learnMore() {
            window.open(this.$t('sw-payments.dashboardPromotion.learnMoreUrl'), '_blank');
        },

        isDismissedInSession() {
            return sessionStorage.getItem(DISMISSAL_STORAGE_KEY) === 'true';
        },

        compareVersions(version, minimumVersion) {
            const normalizedVersion = this.normalizeVersion(version);
            const normalizedMinimumVersion = this.normalizeVersion(minimumVersion);

            for (let i = 0; i < normalizedMinimumVersion.length; i += 1) {
                if (normalizedVersion[i] > normalizedMinimumVersion[i]) {
                    return 1;
                }

                if (normalizedVersion[i] < normalizedMinimumVersion[i]) {
                    return -1;
                }
            }

            return 0;
        },

        normalizeVersion(version) {
            return version
                .replace(/-.*/, '')
                .split('.')
                .map((part) => Number.parseInt(part, 10))
                .map((part) => (Number.isNaN(part) ? 0 : part))
                .concat([0, 0, 0, 0])
                .slice(0, 4);
        },
    },
});
