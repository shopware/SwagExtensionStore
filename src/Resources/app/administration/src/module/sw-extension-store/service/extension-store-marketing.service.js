const { Criteria } = Shopware.Data;

export default class ExtensionStoreMarketingState extends Shopware.Classes.ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'extension-store') {
        super(httpClient, loginService, apiEndpoint);
        this.name = 'extensionStoreMarketingService';
    }

    getCampaigns(context) {
        // TODO: this needs to be removed when using the correct api
        return this._getCampaignsMock();

        return this.httpClient.get(`_action/${this.apiEndpoint}/marketing/campaigns`, {
            headers: this.basicHeaders(context)
        }).then((response) => {
            return response.data;
        }).catch((error) =>{
            throw error;
        })
    }

    /**
     * TODO: this needs to be removed when using the correct api
     * @private
     */
    _getCampaignsMock() {
        return new Promise(resolve => {
            // simulate request which takes 800ms to complete
            setTimeout(() => {
                resolve([
                    {
                        name: "string",
                        title: "string",
                        phase: "comingSoonPhase",
                        comingSoonStartDate: "2005-08-15T15:52:01",
                        startDate: "2005-08-15T15:52:01",
                        lastCallStartDate: "2005-08-15T15:52:01",
                        endDate: "2005-08-15T15:52:01",
                        components: "{storeBanner: 'https://s3.aws.com/bla/bla', dashboardBanner: https://s3.aws.com/bla/bla2',})"
                    }
                ])
            }, 800);
        })
    }

}
