export default {
    namespaced: true,

    state() {
        return {
            campaigns: []
        };
    },

    getters: {
        getCampaigns(state) {
            return state.campaigns;
        }
    },

    mutations: {
        addCampaigns(state, newCampaigns) {
            state.campaigns.push(...newCampaigns);
        },

        resetCampaigns(state) {
            state.campaigns = [];
        }
    },
};
