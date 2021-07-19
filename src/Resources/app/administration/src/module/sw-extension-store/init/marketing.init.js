export default function initMarketing() {
    Shopware.Service('extensionStoreMarketingService').getCampaigns()
        .then((campaigns) => {
            Shopware.State.commit('extensionStoreMarketing/addCampaigns', campaigns);
        })
        .catch((error) => {
            // TODO: add error handling
            Shopware.State.dispatch('notification/createNotification', {
                variant: 'error',
                title: error?.title, // TODO: add fallback error message
                message: error?.message`, // TODO: add fallback error message
            })
        })
}
