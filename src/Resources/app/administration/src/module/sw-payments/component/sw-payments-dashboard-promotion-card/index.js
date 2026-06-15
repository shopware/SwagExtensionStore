import template from './sw-payments-dashboard-promotion-card.html.twig';
import './sw-payments-dashboard-promotion-card.scss';

const SHOPWARE_PAYMENTS_APP_NAME = 'ShopwarePayments';
const SHOPWARE_PAYMENTS_OVERVIEW_MODULE_NAME = 'sw-shopware-payments-overview';
const SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE = 'shopware-payments-merchant-onboarding-status';
const MINIMUM_SUPPORTED_VERSION = '6.5.7.0';
const DISMISSAL_STORAGE_KEY = 'shopware-payments.dashboard-promotion.dismissed';

export default Shopware.Component.wrapComponentConfig({
    template,

    data() {
        return {
            hasOnboardedMerchant: null,
            isDismissed: this.isDismissedInSession(),
            isInitialized: false,
        };
    },

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },

        shopwarePaymentsExtension() {
            return Shopware.Store.get('extensions').extensionsState?.[SHOPWARE_PAYMENTS_APP_NAME] ?? null;
        },

        isShopwarePaymentsInstalled() {
            return this.shopwarePaymentsExtension?.active === true;
        },

        shopwarePaymentsOrigin() {
            if (!this.shopwarePaymentsExtension?.baseUrl) {
                return null;
            }

            try {
                return new URL(this.shopwarePaymentsExtension.baseUrl).origin;
            } catch {
                return null;
            }
        },

        isSupportedShopwareVersion() {
            return this.compareVersions(Shopware.Context.app.config.version ?? '', MINIMUM_SUPPORTED_VERSION) >= 0;
        },

        showActivateButton() {
            return this.isShopwarePaymentsInstalled;
        },

        hasNoOnboardedMerchant() {
            return !this.isShopwarePaymentsInstalled || this.hasOnboardedMerchant === false;
        },

        showBanner() {
            return this.isInitialized
                && this.isSupportedShopwareVersion
                && !this.isDismissed
                && this.hasNoOnboardedMerchant;
        },
    },

    created() {
        this.createdComponent();
    },

    mounted() {
        window.addEventListener('message', this.onShopwarePaymentsMessage);
    },

    beforeUnmount() {
        window.removeEventListener('message', this.onShopwarePaymentsMessage);
    },

    methods: {
        createdComponent() {
            this.isInitialized = true;
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

        onShopwarePaymentsMessage(event) {
            if (!this.isShopwarePaymentsInstalled || !this.shopwarePaymentsOrigin) {
                return;
            }

            if (event.origin !== this.shopwarePaymentsOrigin) {
                return;
            }

            if (event.data?.type !== SHOPWARE_PAYMENTS_ONBOARDING_STATUS_MESSAGE) {
                return;
            }

            if (typeof event.data.hasOnboardedMerchant !== 'boolean') {
                return;
            }

            this.hasOnboardedMerchant = event.data.hasOnboardedMerchant;
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
