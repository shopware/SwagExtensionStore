import template from './sw-payments-dashboard-promotion-card.html.twig';
import './sw-payments-dashboard-promotion-card.scss';
import { registerOnboardingStatusStore } from '../../service/onboarding-status.store';

const SHOPWARE_PAYMENTS_APP_NAME = 'ShopwarePayments';
const SHOPWARE_PAYMENTS_OVERVIEW_MODULE_NAME = 'sw-shopware-payments-overview';
const MINIMUM_SUPPORTED_VERSION = '6.5.7.0';
const DISMISSAL_STORAGE_KEY = 'shopware-payments.dashboard-promotion.dismissed';

export default Shopware.Component.wrapComponentConfig({
    template,

    data() {
        return {
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

        onboardingStatusStore() {
            return registerOnboardingStatusStore();
        },

        isShopwarePaymentsInstalled() {
            return this.shopwarePaymentsExtension?.active === true;
        },

        isSupportedShopwareVersion() {
            return (Shopware.Context.app.config.version ?? '')
                .replace(/-.*/, '')
                .localeCompare(MINIMUM_SUPPORTED_VERSION, undefined, { numeric: true }) >= 0;
        },

        showActivateButton() {
            return this.isShopwarePaymentsInstalled;
        },

        hasNoOnboardedMerchant() {
            return !this.isShopwarePaymentsInstalled || this.onboardingStatusStore.hasOnboardedMerchant === false;
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

    methods: {
        createdComponent() {
            this.isInitialized = true;
        },

        dismiss() {
            localStorage.setItem(DISMISSAL_STORAGE_KEY, 'true');
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
            return localStorage.getItem(DISMISSAL_STORAGE_KEY) === 'true';
        },
    },
});
