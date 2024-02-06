(()=>{var $e=Object.defineProperty;var i=(e,t)=>()=>(e&&(t=e(e=0)),t);var o=(e,t)=>{for(var s in t)$e(e,s,{get:t[s],enumerable:!0})};var g,u=i(()=>{g=`{% block sw_extension_store_index %}
    <sw-meteor-page class="sw-extension-store-index" hideIcon>
        {% block sw_extension_store_index_slots %}
            {% block sw_extension_store_index_slot_search_bar %}
                <template #search-bar>
                    {% block sw_extension_store_index_search_bar %}
                        <sw-search-bar
                            :key="storeSearchKey"
                            @search="updateSearch"
                            :initialSearch="searchValue"
                            initialSearchType="extension"
                            :placeholder="$tc('sw-extension-store.listing.placeholderSearchBar')"
                        />
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_index_slot_tabs %}
                <template #page-tabs>
                    {% block sw_extension_store_index_tabs %}
                        {% block sw_extension_store_index_tabs_extensions_app %}
                            <sw-tabs-item :route="{ name: 'sw.extension.store.listing.app' }" :disabled="!isAvailable">
                                {{ $tc('sw-extension-store.tabs.apps') }}
                            </sw-tabs-item>
                        {% endblock %}

                        {% block sw_extension_store_index_tabs_extensions_theme %}
                            <sw-tabs-item :route="{ name: 'sw.extension.store.listing.theme' }" :disabled="!isAvailable">
                                {{ $tc('sw-extension-store.tabs.themes') }}
                            </sw-tabs-item>
                        {% endblock %}
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_index_slot_default %}
                <template #default>

                    {% block sw_extension_store_index_loader %}
                        <sw-loader v-if="isLoading"></sw-loader>
                    {% endblock %}

                    <template v-else>
                        {% block sw_extension_store_index_content %}
                            {% block sw_extension_store_index_content_view %}
                                <router-view
                                    v-if="isAvailable"
                                    @extension-listing-errors="onExtensionListingError">
                                </router-view>
                            {% endblock %}

                            {% block sw_extension_store_index_content_offline_warning %}
                                <sw-extension-store-error-card
                                    v-else-if="failReason === 'offline'"
                                    :title="$tc('sw-extension-store.offline.headline')"
                                    variant="danger"
                                >
                                    {{ $tc('sw-extension-store.offline.description') }}
                                </sw-extension-store-error-card>
                            {% endblock %}

                            {% block sw_extension_store_index_content_update_warning %}
                                <sw-extension-store-update-warning v-else-if="failReason === 'outdated'">
                                </sw-extension-store-update-warning>
                            {% endblock %}

                            {% block sw_extension_store_index_content_listing_error %}
                                <sw-extension-store-error-card
                                    v-else
                                    :title="listingError && listingError.title"
                                    variant="danger"
                                >
                                    <template v-if="listingError">
                                        {{ listingError.message }}
                                    </template>
                                </sw-extension-store-error-card>
                            {% endblock %}
                        {% endblock %}
                    </template>
                </template>
            {% endblock %}
        {% endblock %}
    </sw-meteor-page>
{% endblock %}
`});var h=i(()=>{});var b={};o(b,{default:()=>Le});var Le,f=i(()=>{u();h();Le={template:g,inject:["extensionStoreActionService","shopwareExtensionService","feature"],props:{id:{type:String,required:!1,default:null}},data(){return{isAvailable:!1,failReason:"",listingError:null,isLoading:!1}},computed:{storeSearchKey(){return this.$route.name},activeFilters(){return Shopware.State.get("shopwareExtensions").search.filter},searchValue(){return Shopware.State.get("shopwareExtensions").search.term},isTheme(){return this.$route.name.includes("theme")?"themes":"apps"}},watch:{isTheme:{immediate:!0,handler(e){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"page",value:1}),this.feature.isActive("VUE3")?this.activeFilters.group=e:this.$set(this.activeFilters,"group",e)}}},created(){this.createdComponent()},methods:{createdComponent(){this.checkStoreUpdates()},async checkStoreUpdates(){this.isLoading=!0,this.shopwareExtensionService.updateExtensionData();let e=await this.getExtensionStore();if(!e){this.isLoading=!1;return}if(this.isUpdateable(e)){this.isAvailable=!1,this.failReason="outdated",this.isLoading=!1;return}this.isAvailable=!0,this.isLoading=!1},onExtensionListingError(e){let t=Shopware.Service("extensionErrorService").handleErrorResponse(e,this);this.isAvailable=!1,this.listingError=t&&t[0],this.failReason="listing_error"},getExtensionStore(){return this.extensionStoreActionService.getMyExtensions().then(e=>e.find(t=>t.name==="SwagExtensionStore"))},isUpdateable(e){return!e||e.latestVersion===null?!1:e.latestVersion!==e.version},updateSearch(e){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"term",value:e})}}}});var y,v=i(()=>{y=`{% block sw_extension_store_listing %}
    <div class="sw-extension-store-listing">
        {% block sw_extension_store_listing_loader %}
            <sw-loader v-if="isLoading"></sw-loader>
        {% endblock %}

        {% block sw_extension_store_listing_filter %}
            <sw-extension-store-listing-filter></sw-extension-store-listing-filter>
        {% endblock %}

        {% block sw_extension_store_listing_grid %}
            <div class="sw-extension-store-listing__listing-grid">
                <template v-for="extension in extensions">
                    {% block sw_extension_store_listing_card %}
                        <sw-extension-listing-card :extension="extension"></sw-extension-listing-card>
                    {% endblock %}
                </template>
            </div>
        {% endblock %}

        {% block sw_extension_store_listing_pagination %}
            <sw-pagination v-bind="{ total, page, limit }" @page-change="setPage"></sw-pagination>
        {% endblock %}
    </div>
{% endblock %}
`});var k=i(()=>{});var S={};o(S,{default:()=>Ve});var Ve,E=i(()=>{v();k();Ve={name:"sw-extension-store-listing",template:y,inject:["feature"],mixins:["sw-extension-error"],data(){return{isLoading:!1}},computed:{extensions(){return Shopware.State.get("shopwareExtensions").extensionListing},currentSearch(){return Shopware.State.get("shopwareExtensions").search},page(){return this.currentSearch.page},limit(){return this.currentSearch.limit},total(){return this.extensions.total||0},rating(){return this.currentSearch.rating},languageId(){return Shopware.State.get("session").languageId},assetFilter(){return Shopware.Filter.getByName("asset")},currentLocale(){return Shopware.State.get("session").currentLocale==="de-DE"?"de":"en"}},watch:{currentSearch:{deep:!0,immediate:!0,handler(){this.getList()}},languageId(e){e!==""&&this.getList()}},methods:{async getList(){if(this.isLoading=!0,this.languageId!=="")try{await this.search()}catch(e){this.showExtensionErrors(e),this.$emit("extension-listing-errors",e)}finally{this.isLoading=!1}},async search(){let t=await Shopware.Service("extensionStoreDataService").getExtensionList(Shopware.State.get("shopwareExtensions").search,{...Shopware.Context.api,languageId:Shopware.State.get("session").languageId});Shopware.State.commit("shopwareExtensions/setExtensionListing",t)},setPage({limit:e,page:t}){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"limit",value:e}),Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"page",value:t})}}}});var A,P=i(()=>{A=`{% block sw_extension_store_detail %}
    <sw-meteor-page
        v-if="fetchError"
        :hideIcon="true"
        class="sw-extension-store-detail"
    >
        <div class="sw-extension-store-detail__extension-unknown" >
            <sw-label
                appearance="pill"
                variant="danger"
            >
                <sw-icon
                    name="regular-times-circle"
                    size="30px"
                ></sw-icon>
            </sw-label>
            <h2>{{ fetchError.title }}</h2>
            <p>{{ fetchError.detail }}</p>
        </div>
    </sw-meteor-page>

    <sw-meteor-page
        v-else-if="suspended || isLoading"
        :hideIcon="suspended"
        class="sw-extension-store-detail"
    >
        {% block sw_extension_store_detail_loader %}<sw-loader></sw-loader>{% endblock %}
    </sw-meteor-page>

    <sw-meteor-page
        v-else
        :class="variantClass"
        class="sw-extension-store-detail"
    >
        {% block sw_extension_store_detail_smart_bar %}
            {% block sw_extension_store_detail_slot_icon %}
                <template #smart-bar-icon>
                    {% block sw_extension_store_detail_icon %}
                        <sw-extension-icon-polyfill
                            class="sw-extension-store-detail__extension-icon"
                            :src="extension.icon"
                        />
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_detail_slot_smart_bar_header %}
                <template #smart-bar-header>
                    {% block sw_extension_store_detail_smart_bar_title %}
                        {{ extension.label }}
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_detail_slot_smart_bar_header_meta %}
                <template #smart-bar-header-meta>
                    {% block sw_extension_store_detail_smart_bar_producer_name %}
                        <span v-if="extension.producerWebsite && extension.producerName">
                            {{ $tc('sw-extension-store.detail.labelBy') }}

                            <sw-external-link
                                small
                                :href="extension.producerWebsite"
                                class="link sw-extension-store-detail__producer-link"
                            >
                                {{ extension.producerName }}
                            </sw-external-link>
                        </span>

                        <span v-else-if="extension.producerName">
                            {{ $tc('sw-extension-store.detail.labelBy') }} {{ extension.producerName }}
                        </span>
                    {% endblock %}

                    {% block sw_extension_store_detail_slot_smart_bar_header_meta_extension_type_label %}
                        <sw-extension-type-label
                            :type="extension.type"
                            class="sw-extension-store-detail__extension-type-label"
                        ></sw-extension-type-label>
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_detail_slot_smart_bar_description %}
                <template #smart-bar-description>
                    {% block sw_extension_store_detail_smart_bar_description %}
                        {% block sw_extension_store_detail_label_and_rating_overview %}
                            <div class="sw-extension-store-detail__label-and-rating-overview">

                                {% block sw_extension_store_detail_rating_overview %}
                                    <div class="sw-extension-store-detail__rating-overview">
                                        {% block sw_extension_store_detail_rating_overview_content %}
                                            <template v-if="extension.numberOfRatings > 0">
                                                {% block sw_extension_store_detail_rating_overview_ratings %}
                                                    <sw-extension-rating-stars
                                                        :rating="extension.rating"
                                                        :size="12"
                                                    />

                                                    <router-link
                                                        class="sw-extension-store-detail__number-of-reviews"
                                                        :to="{ name: 'sw.extension.store.detail', params: { id: id }, hash: '#ratings-card'}"
                                                    >
                                                        {{ $tc('sw-extension-store.detail.numberOfRatings', extension.numberOfRatings)}}
                                                    </router-link>
                                                {% endblock %}

                                                {% block sw_extension_store_detail_label_display %}
                                                    <sw-extension-store-label-display
                                                        v-if="extension.labels.length > 0"
                                                        :labels="extension.labels"
                                                        class="sw-extension-store-detail__label-display"
                                                    />
                                                {% endblock %}
                                            </template>

                                            <template v-else>
                                                {% block sw_extension_store_detail_rating_overview_no_ratings %}
                                                    <sw-icon
                                                        name="solid-star"
                                                        size="12px"
                                                    ></sw-icon>

                                                    <span class="sw-extension-store-detail__no-ratings-text">{{ $tc('sw-extension-store.detail.noRatings') }}</span>
                                                {% endblock %}
                                            </template>
                                        {% endblock %}
                                    </div>
                                {% endblock %}
                            </div>
                        {% endblock %}
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_detail_slot_smart_bar_actions %}
                <template #smart-bar-actions>
                    {% block sw_extension_store_detail_smart_bar_actions %}
                        <template v-if="isPurchasable">
                            {% block sw_extension_store_detail_smart_bar_actions_add %}
                                {% block sw_extension_store_detail_smart_bar_actions_add_button %}
                                    <sw-button
                                        variant="primary"
                                        @click="onClickAddExtension"
                                        class="sw-extension-store-detail__action-add-extension"
                                    >
                                        <template v-if="extension && extension.isTheme">
                                            {{ $tc('sw-extension-store.detail.labelButtonAddTheme') }}
                                        </template>
                                        <template v-else>
                                            {{ $tc('sw-extension-store.detail.labelButtonAddExtension') }}
                                        </template>
                                    </sw-button>
                                {% endblock %}

                                {% block sw_extension_store_detail_smart_bar_price %}
                                    <template v-if="recommendedVariant && recommendedVariant.netPrice == 0">
                                        <span class="sw-extension-store-detail__price-free">
                                            {{ $tc('sw-extension-store.general.labelFree') }}
                                        </span>
                                    </template>
                                    <span
                                        v-else-if="recommendedVariant"
                                        :class="discountClass"
                                    >
                                        <span class="sw-extension-store-detail__net-price">
                                            {{ renderPrice(recommendedVariant.netPrice) }}
                                        </span>
                                        <span
                                            v-if="recommendedVariant.netPrice !== discountedPrice"
                                            class="sw-extension-store-detail__discounted-price"
                                        >
                                            {{ renderPrice(discountedPrice) }}
                                        </span>
                                        <span
                                            v-if="shopwareExtensionService.mapVariantToRecommendation(recommendedVariant) === 1"
                                            class="sw-extension-store-detail__rent-suffix"
                                        >
                                            {{ $tc('sw-extension-store.general.labelRentSuffix') }}
                                        </span>
                                    </span>
                                {% endblock %}

                                {% block sw_extension_store_detail_smart_bar_discounted_price_info %}
                                    <small
                                        v-if="hasActiveDiscount"
                                        class="sw-extension-store-detail__discounted-price-info"
                                    >
                                        <template v-if="!!discountAppliesForMonths">
                                            {{ $tc('sw-extension-store.detail.labelDiscountPeriod', discountAppliesForMonths, { months: discountAppliesForMonths }) }}
                                        </template>

                                        {{ $tc('sw-extension-store.detail.labelDiscountInfo', 0, { endDate: dateFilter(recommendedVariant.discountCampaign.endDate) }) }}
                                    </small>
                                {% endblock %}

                                {% block sw_extension_store_detail_smart_bar_actions_trial_info %}
                                    <sw-button
                                        v-if="recommendedVariant && recommendedVariant.trialPhaseIncluded"
                                        @click="onClickAddExtension"
                                        class="sw-extension-store-detail__trial-info"
                                    >
                                        {{ $tc('sw-extension-store.detail.hasTrialPhase') }}
                                    </sw-button>
                                {% endblock %}
                            {% endblock %}
                        </template>

                        <template v-else-if="isLicensed">
                            {% block sw_extension_store_detail_smart_bar_actions_install %}
                                <sw-button-process
                                    v-if="!isInstalled"
                                    variant="primary"
                                    @click.prevent="handleInstallWithPermissionsModal"
                                    :is-loading="isInstalling"
                                    :process-success="isInstallSuccessful"
                                    @process-finish="finishedInstall"
                                    class="sw-extension-store-detail__action-install-extension"
                                >
                                    <template v-if="extension && extension.isTheme">
                                        {{ $tc('sw-extension-store.detail.labelButtonInstallTheme') }}
                                    </template>
                                    <template v-else>
                                        {{ $tc('sw-extension-store.detail.labelButtonInstallExtension') }}
                                    </template>
                                </sw-button-process>
                            {% endblock %}

                            {% block sw_extension_store_detail_smart_bar_actions_already_installed %}
                                <sw-button
                                    v-else-if="!canBeOpened && !isConfigurable"
                                    variant="primary"
                                    @click="openListingPage"
                                    class="sw-extension-store-detail__action-open-listing"
                                >
                                    <template v-if="extension && extension.isTheme">
                                        {{ $tc('sw-extension-store.detail.themeIsAlreadyInstalled') }}
                                    </template>
                                    <template v-else>
                                        {{ $tc('sw-extension-store.detail.extensionIsAlreadyInstalled') }}
                                    </template>
                                </sw-button>
                            {% endblock %}

                            {% block sw_extension_store_detail_smart_bar_actions %}
                                <sw-button-group
                                    v-else-if="canBeOpened"
                                    splitButton
                                >
                                    {% block sw_extension_store_detail_smart_bar_actions_open_extension %}
                                        <sw-button
                                            @click="openExtension"
                                            variant="primary"
                                            class="sw-extension-store-detail__action-open-extension"
                                        >
                                            <template v-if="extension && extension.isTheme">
                                                {{ $tc('sw-extension-store.detail.labelButtonOpenTheme') }}
                                            </template>
                                            <template v-else>
                                                {{ $tc('sw-extension-store.detail.labelButtonOpenExtension') }}
                                            </template>
                                        </sw-button>
                                    {% endblock %}

                                    {% block sw_extension_store_detail_smart_bar_actions_open_extension_context %}
                                        <sw-context-button
                                            v-if="isConfigurable"
                                            class="sw-extension-store-detail__action-context"
                                        >
                                            <template #button>
                                                <sw-button
                                                    variant="primary"
                                                    square
                                                >
                                                    <sw-icon
                                                        name="regular-chevron-down-xs"
                                                        size="16"
                                                    ></sw-icon>
                                                </sw-button>
                                            </template>

                                            <sw-context-menu-item @click="openConfiguration">
                                                {{ $tc('sw-extension-store.detail.openConfiguration') }}
                                            </sw-context-menu-item>
                                        </sw-context-button>
                                    {% endblock %}
                                </sw-button-group>
                            {% endblock %}

                            {% block sw_extension_store_detail_smart_bar_actions_open_configuration %}
                                <sw-button
                                    v-else
                                    @click="openConfiguration"
                                    variant="primary"
                                    class="sw-extension-store-detail__action-open-configuration"
                                >
                                    {{ $tc('sw-extension-store.detail.openConfiguration') }}
                                </sw-button>
                            {% endblock %}
                        </template>

                        <template v-else-if="isEnterpriseFeature">
                            {% block sw_extension_store_detail_smart_bar_actions_enterprise_contact %}
                                <sw-button
                                    variant="primary"
                                    :link="$tc('sw-extension-store.detail.enterpriseContactUrl')"
                                    class="sw-extension-store-detail__action-enterprise-contact"
                                >
                                    {{ $tc('sw-extension-store.detail.enterpriseContactLinkText') }}
                                    <sw-icon
                                        name="regular-external-link"
                                        size="12"
                                    ></sw-icon>
                                </sw-button>
                            {% endblock %}
                        </template>

                        {% block sw_extension_store_detail_buy_modal %}
                            <sw-extension-buy-modal
                                v-if="showBuyModal"
                                :extension="extension"
                                @modal-close="closeBuyModal"
                            ></sw-extension-buy-modal>
                        {% endblock %}

                        {% block sw_extension_store_detail_installation_failed_modal %}
                            <sw-modal
                                v-if="showInstallationFailedModal"
                                :title="extension.label"
                                variant="small"
                                @modal-close="closeInstallationFailedModal"
                            >
                                {% block sw_extension_store_detail_installation_failed_modal_content %}
                                    <sw-extension-adding-failed
                                        :extensionName="extension.name"
                                        :title="installationError && installationError.title"
                                        :detail="installationError && installationError.detail"
                                        :documentationLink="installationErrorDocumentationLink"
                                        @close="closeInstallationFailedModal"
                                    ></sw-extension-adding-failed>
                                {% endblock %}
                            </sw-modal>
                        {% endblock %}
                    {% endblock %}
                </template>
            {% endblock %}

            {% block sw_extension_store_detail_slot_smart_bar_context_buttons %}
                <template #smart-bar-context-buttons>
                    {% block sw_extension_store_detail_show_permissions %}
                        <sw-button
                            v-if="hasPermissions"
                            variant="context"
                            @click="openPermissionsModal"
                            size="small"
                        >
                            <sw-icon
                                name="solid-shield"
                                size="16px"
                            ></sw-icon>
                            {{ $tc('sw-extension-store.detail.labelButtonShowPermissions') }}
                        </sw-button>
                    {% endblock %}
                </template>
            {% endblock %}
        {% endblock %}

        {% block sw_extension_store_detail_page_content %}
            {% block sw_extension_sote_detail_page_info_alerts %}
                <sw-alert
                    v-if="isEnterpriseFeature"
                    variant="info"
                    class="sw-extension-store-detail__alert"
                >
                    {{ $tc('sw-extension-store.detail.enterpriseFeatureAlertText') }}
                </sw-alert>
            {% endblock %}

            {% block sw_extension_store_detail_images %}
                <sw-extension-store-slider
                    :images="images"
                    :slideCount="1"
                ></sw-extension-store-slider>
            {% endblock %}

            {% block sw_extension_store_detail_card_info %}
                <sw-meteor-card
                    :title="$tc('sw-extension-store.detail.cardTitleInformation')"
                    class="sw-extension-store-detail--user-provided-data"
                >
                    {% block sw_extension_store_detail_card_info_content %}
                        <div
                            v-html="description"
                            :class="{ 'sw-extension-store-detail__description--collapsed': isDescriptionCollapsed }"
                            class="sw-extension-store-detail__description"
                        ></div>
                    {% endblock %}

                    {% block sw_extension_store_details_expand_description %}
                        <sw-button
                            v-if="isDescriptionCollapsed"
                            @click="expandDescription"
                            size="small"
                            class="sw-extension-store-detail__button-extend-description"
                        >
                            {{ $tc('sw-extension-store.detail.labelButtonReadMore') }}
                        </sw-button>
                    {% endblock %}
                </sw-meteor-card>
            {% endblock %}

            {% block sw_extension_store_detail_card_details %}
                <sw-meteor-card :title="$tc('sw-extension-store.detail.cardTitleDetails')">
                    {% block sw_extension_store_detail_card_details_content %}
                        <dl class="sw-extension-store-detail__details-list">
                            {% block sw_extension_store_detail_card_details_category %}
                                <dt>{{ $tc('sw-extension-store.detail.details.labelCategory', extension.categories.length ) }}</dt>
                                <dd>{{ extensionCategoryNames }}</dd>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_version %}
                                <dt>{{ $tc('sw-extension-store.detail.details.labelVersion') }}</dt>
                                <dd>{{ extension.latestVersion }}</dd>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_updated_at %}
                                <dt>{{ $tc('sw-extension-store.detail.details.labelUpdatedAt') }}</dt>
                                <dd>{{ dateFilter(extension.lastUpdateDate, { month: 'numeric', year: 'numeric', hour: undefined, minute: undefined }) }}</dd>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_languages %}
                                <dt v-if="extensionLanguages.length">{{ $tc('sw-extension-store.detail.details.labelLanguages') }}</dt>
                                <dd>{{ extensionLanguages }}</dd>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_producer_website %}
                                <template v-if="extension.producerWebsite">
                                    <dt>
                                        <sw-external-link :href="extension.producerWebsite">
                                            {{ $tc('sw-extension-store.detail.details.labelWebsite') }}
                                        </sw-external-link>
                                    </dt>
                                    <dd></dd>
                                </template>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_privacy_policy %}
                                <template v-if="extension.privacyPolicyLink">
                                    <dt>
                                        <sw-external-link :href="extension.privacyPolicyLink">
                                            {{ $tc('sw-extension-store.detail.details.labelPrivacy') }}
                                        </sw-external-link>
                                    </dt>
                                    <dd></dd>
                                </template>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_details_additional_entries %}{% endblock %}
                        </dl>
                    {% endblock %}
                </sw-meteor-card>
            {% endblock %}

            {% block sw_extension_store_detail_card_ratings %}
                <sw-extension-ratings-card
                    id="ratings-card"
                    :extension="extension"
                    :producerName="extension.producerName"
                    :isInstalledAndLicensed="isLicensed && isInstalled"
                    @update-extension="fetchExtensionAndScrollToRatings">
                </sw-extension-ratings-card>
            {% endblock %}

            {% block sw_extension_store_detail_card_faq %}
                <sw-meteor-card
                    v-if="extension.faq.length > 0"
                    :title="$tc('sw-extension-store.detail.cardTitleFAQ')"
                >
                    {% block sw_extension_store_detail_card_faq_questions %}
                        <section
                            v-for="(question, index) in extension.faq"
                            :key="\`sw-extension-store-detail__faq-question-\${index}\`"
                            class="sw-extension-store-detail__faq-question sw-extension-store-detail--user-provided-data"
                        >
                            {% block sw_extension_store_detail_card_faq_questions_question %}
                                <h4>{{ question.question }}</h4>
                            {% endblock %}

                            {% block sw_extension_store_detail_card_faq_questions_answer %}
                                <p v-html="question.answer"></p>
                            {% endblock %}
                        </section>
                    {% endblock %}
                </sw-meteor-card>
            {% endblock %}

            {% block sw_extension_store_detail_card_changelog %}
                <sw-meteor-card
                    v-if="orderedBinaries.length > 0"
                    :title="$tc('sw-extension-store.detail.cardTitleChangelog')"
                >
                    {% block sw_extension_store_detail_card_changelog_entries %}
                        <section
                            v-for="(binary, index) in orderedBinaries"
                            :key="\`sw-extension-store-detail__changelog-entry-\${index}\`"
                            class="sw-extension-store-detail__changelog-entry"
                        >
                                {% block sw_extension_store_detail_card_changelog_entries_version %}
                                    <div class="sw-extension-store-detail__changelog-version">{{ binary.version }}</div>
                                {% endblock %}

                                {% block sw_extension_store_detail_card_changelog_entries_creation_date %}
                                    <div class="sw-extension-store-detail__changelog-creation-date">
                                        {{ dateFilter(binary.creationDate, { month: 'numeric', year: 'numeric', hour: undefined, minute: undefined }) }}
                                    </div>
                                {% endblock %}

                                {% block sw_extension_store_detail_card_changelog_entries_changelog_text %}
                                    <p class="sw-extension-store-detail__changelog-text" v-html="binary.text"></p>
                                {% endblock %}
                        </section>
                    {% endblock %}
                </sw-meteor-card>
            {% endblock %}
        {% endblock %}

        {% block sw_extension_store_detail_page_modals %}
            {% block sw_extension_store_detail_page_permission %}
                <sw-extension-permissions-modal
                    v-if="showPermissionsModal"
                    :extensionLabel="extension.label"
                    :domains="extension.domains"
                    :permissions="extension.permissions"
                    @modal-close="closePermissionsModal"
                ></sw-extension-permissions-modal>
            {% endblock %}

            {% block sw_extension_store_detail_page_permission_accept %}
                <sw-extension-permissions-modal
                    v-if="showAcceptPermissionsModal"
                    :extensionLabel="extension.label"
                    :domains="extension.domains"
                    :permissions="extension.permissions"
                    :actionLabel="$tc('sw-extension-store.component.sw-extension-card-base.labelAcceptAndInstall')"
                    @modal-close="closeAcceptPermissionsModal"
                    @close-with-action="closePermissionsModalAndInstallExtension"
                ></sw-extension-permissions-modal>
            {% endblock %}

            {% block sw_extension_store_detail_page_account_modal %}
                <sw-modal
                    v-if="showAccountModal"
                    class="sw-extension-store-detail__account-modal"
                    variant="large"
                    @modal-close="closeAccountModal"
                >
                    <sw-extension-my-extensions-account @login-success="onLoginSuccess"></sw-extension-my-extensions-account>
                </sw-modal>
            {% endblock %}
        {% endblock %}
    </sw-meteor-page>
{% endblock %}
`});var C=i(()=>{});var M={};o(M,{default:()=>ze});var w,ze,T=i(()=>{P();C();({Utils:w}=Shopware),ze={template:A,inject:["extensionStoreDataService","shopwareExtensionService","extensionHelperService","cacheApiService"],mixins:["sw-extension-error"],props:{id:{type:String,required:!0}},data(){return{extension:null,isLoading:!1,showBuyModal:!1,showPermissionsModal:!1,showAcceptPermissionsModal:!1,showAccountModal:!1,showInstallationFailedModal:!1,isInstalling:!1,isInstallSuccessful:!1,permissionsAccepted:!1,isDescriptionCollapsed:!1,installationError:null,fetchError:!1,canBeOpened:!1}},computed:{suspended(){return this.extension===null},extensionMetaData(){return this.suspended?null:Shopware.State.get("shopwareExtensions").myExtensions.data.find(e=>e.id===this.extension.id)},isLicensed(){return this.extensionMetaData?!!this.extensionMetaData.storeLicense:!1},isInstalled(){return!!this.extensionMetaData&&!!this.extensionMetaData.installedAt},isConfigurable(){return!!this.extensionMetaData&&this.extensionMetaData.configurable},images(){return this.suspended?[]:this.extension.images.map(e=>e.remoteLink)},extensionCategoryNames(){return this.suspended?"":this.extension.categories.map(e=>e.details.name).join(", ")},extensionLanguages(){return this.suspended?"":this.extension.languages.join(", ")},isPurchasable(){return this.suspended||!this.extension.variants.length?!1:!this.isLicensed},languageId(){return Shopware.State.get("session").languageId},recommendedVariant(){return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants)[0]},dateFilter(){return Shopware.Filter.getByName("date")},hasActiveDiscount(){return this.shopwareExtensionService.isVariantDiscounted(this.recommendedVariant)},discountAppliesForMonths(){return this.hasActiveDiscount?this.recommendedVariant.discountCampaign.discountAppliesForMonths:null},discountClass(){return{"is--discounted":this.hasActiveDiscount}},discountedPrice(){return this.shopwareExtensionService.getPriceFromVariant(this.recommendedVariant)},variantClass(){return{"is--theme":this.extension&&this.extension.isTheme}},orderedBinaries(){return w.get(this.extension,"binaries",[]).slice().reverse()},description(){return w.get(this.extension,"description")},hasPermissions(){return Object.keys(this.extension.permissions).length},installationErrorDocumentationLink(){return w.get(this.installationError,"meta.documentationLink",null)},isEnterpriseFeature(){return this.suspended?!1:!!this.extension.addons.find(e=>e==="SW6_EnterpriseFeature")}},watch:{id:{immediate:!0,handler(){this.fetchExtension()}},"$route.hash"(){this.scrollToElementFromHash()},suspended(){this.suspended||this.$nextTick(()=>{this.scrollToElementFromHash()})},languageId(e){e!==""&&this.fetchExtension()},description(){this.isDescriptionCollapsed=!0,this.$nextTick(()=>{this.checkDescriptionCollapsed()})}},async created(){await this.shopwareExtensionService.updateExtensionData(),this.canBeOpened=!!this.shopwareExtensionService.getOpenLink(this.extension)},methods:{async fetchExtension(){if(this.isLoading=!0,this.languageId!=="")try{this.fetchError=!1,this.extension=await this.extensionStoreDataService.getDetail(this.id,{...Shopware.Context.api,languageId:this.languageId})}catch(e){let t=e.response.data.errors[0];if(t.code==="FRAMEWORK__STORE_ERROR"&&t.title==="Extension unknown"){this.fetchError=t;let s=this.$tc("sw-extension.errors.messageToTheShopwareDocumentation",0,t.meta);this.createNotificationError({title:t.title,message:`${t.detail} <br> ${s}`,autoClose:!1});return}this.showExtensionErrors(e)}finally{this.isLoading=!1}},async fetchExtensionAndScrollToRatings(){await this.fetchExtension(),this.$router.push({hash:"#ratings-card"})},scrollToElementFromHash(){if(!this.$route.hash)return;let e=this.$el.querySelector(this.$route.hash),t=document.querySelector("div.sw-meteor-page__body"),s=document.querySelector("header.sw-meteor-page__head-area"),n=e.offsetTop-s.getBoundingClientRect().height;t.scroll({top:n,behavior:"smooth"}),this.$router.push({...this.route,hash:null})},async onClickAddExtension(){if(await this.shopwareExtensionService.checkLogin(),!Shopware.State.get("shopwareExtensions").userInfo){this.openAccountModal();return}this.openBuyModal()},renderPrice(e){return w.format.currency(e,"EUR")},onLoginSuccess(){this.closeAccountModal(),this.openBuyModal()},openBuyModal(){this.showBuyModal=!0},closeBuyModal(){this.showBuyModal=!1},openAccountModal(){this.showAccountModal=!0},closeAccountModal(){this.showAccountModal=!1},openPermissionsModal(){this.showPermissionsModal=!0},closePermissionsModal(){this.showPermissionsModal=!1},openAcceptPermissionsModal(){this.showAcceptPermissionsModal=!0},closeAcceptPermissionsModal(){this.showAcceptPermissionsModal=!1},async closePermissionsModalAndInstallExtension(){this.permissionsAccepted=!0,this.closeAcceptPermissionsModal(),await this.installExtension()},async handleInstallWithPermissionsModal(){if(Object.keys(this.extension.permissions).length){this.openAcceptPermissionsModal();return}this.permissionsAccepted=!0,await this.installExtension()},async installExtension(){this.isInstalling=!0;try{await this.extensionHelperService.downloadAndActivateExtension(this.extension.name,this.extension.type),this.extension.type==="plugin"&&await this.clearCacheAndReloadPage(),this.isInstallSuccessful=!0}catch(e){this.showExtensionErrors(e),w.get(e,"response.data.errors[0]",null)&&(this.installationError=e.response.data.errors[0]),this.openInstallationFailedModal()}finally{this.isInstalling=!1}},async finishedInstall(){await this.shopwareExtensionService.updateExtensionData(),this.isInstallSuccessful=!1},async openExtension(){let e=await this.shopwareExtensionService.getOpenLink(this.extension);e&&this.$router.push(e)},openConfiguration(){this.$router.push({name:"sw.extension.config",params:{namespace:this.extension.name}})},openListingPage(){if(this.extension&&this.extension.isTheme){this.$router.push({name:"sw.extension.my-extensions.listing.theme"});return}this.$router.push({name:"sw.extension.my-extensions.listing.app"})},checkDescriptionCollapsed(){let e=this.$el.querySelector(".sw-extension-store-detail__description");e&&e.scrollHeight<=300&&this.expandDescription()},expandDescription(){this.isDescriptionCollapsed=!1},openInstallationFailedModal(){this.showInstallationFailedModal=!0},closeInstallationFailedModal(){this.showInstallationFailedModal=!1},async clearCacheAndReloadPage(){await this.cacheApiService.clear(),window.location.reload()}}}});var I,$=i(()=>{I=`{% block sw_extension_store_slider %}
    <div class="sw-extension-store-slider sw-meteor-card"
         :class="[
             cardClasses,
             \`sw-extension-store-slider__slides-count-\${usedSlideCount}\`
         ]">
        {% block sw_extension_store_slider_slides %}
            <div class="sw-extension-store-slider__slides" ref="movingImageWrapper">
                {% block sw_extension_store_slider_loader %}
                    <div v-if="!images" class="sw-extension-store-slider__loader">
                        <sw-loader></sw-loader>
                    </div>
                {% endblock %}

                <template v-else>
                    {% block sw_extension_store_slider_slide_item %}
                        <div v-for="img, key in images"
                             class="sw-extension-store-slider__slide-item"
                             :class="slideClasses(key)"
                             :data-key="key"
                             :style="getActiveStyle(key)"
                             :key="key">
                            <img :src="img">
                        </div>
                    {% endblock %}
                </template>
            </div>
        {% endblock %}

        {% block sw_extension_store_slider_navigation %}
            <div class="sw-extension-store-slider__navigation" v-if="images.length > usedSlideCount">
                {% block sw_extension_store_slider_navigation_inner %}
                    <button class="sw-extension-store-slider__btn-back" @click="previous()" :disabled="isDisabledPrevious">
                        {% block sw_extension_store_slider_navigation_inner_icon_left %}
                            <sw-icon name="regular-chevron-left" size="20"></sw-icon>
                        {% endblock %}
                    </button>

                    <button class="sw-extension-store-slider__btn-next" @click="next()" :disabled="isDisabledNext">
                        {% block sw_extension_store_slider_navigation_inner_icon_right %}
                            <sw-icon name="regular-chevron-right" size="20"></sw-icon>
                        {% endblock %}
                    </button>
                {% endblock %}
            </div>
        {% endblock %}
    </div>
{% endblock %}
`});var L=i(()=>{});var V={};o(V,{default:()=>Be});var D,Be,F=i(()=>{$();L();D=3,Be={template:I,props:{images:{type:Array,required:!0},infinite:{type:Boolean,required:!1,default:!1},slideCount:{type:Number,required:!1,default:2},large:{type:Boolean,required:!1,default:!1}},data(){return{activeImgIndex:0,lastActiveImgIndex:null,isDirectionRight:null}},computed:{cardClasses(){return{"sw-card--large":this.large}},lastActive(){return this.activeImgIndex+this.usedSlideCount-1},isDisabledNext(){return this.isInfinite?!1:this.lastActive===this.images.length-1},isDisabledPrevious(){return this.isInfinite?!1:this.activeImgIndex===0},sliderHasOneImageMoreThanTheSlideCount(){return this.images.length===this.usedSlideCount+1},isInfinite(){return this.sliderHasOneImageMoreThanTheSlideCount?!1:this.infinite},usedSlideCount(){return this.slideCount>D?D:this.slideCount<1?1:this.slideCount}},methods:{getActiveStyle(e){if(!this.isActive(e))return{};let t=100/this.usedSlideCount;return this.isDirectionRight===null?{left:`${e*t}%`}:this.moveActiveImage(e,t)},moveActiveImage(e,t){if(e===this.activeImgIndex)return{left:"0%"};if(!this.$refs.movingImageWrapper)return{};let s=this.$refs.movingImageWrapper.querySelector(`[data-key="${e}"]`),n=parseInt(s.style.left,10);return Number.isNaN(n)?{left:`${100-t}%`}:{left:this.isDirectionRight?`${n-t}%`:`${n+t}%`}},next(){this.isDirectionRight=!0,this.changeSlide(1)},previous(){this.isDirectionRight=!1,this.changeSlide(-1)},changeSlide(e){if(this.lastActiveImgIndex=this.activeImgIndex,this.isInfinite){if(this.activeImgIndex===0&&!this.isDirectionRight){this.activeImgIndex=this.images.length-1;return}if(this.activeImgIndex===this.images.length-1&&this.isDirectionRight){this.activeImgIndex=0;return}}this.activeImgIndex+=e},isActive(e){let t=!1;for(let s=0;s<this.usedSlideCount;s+=1){if(t)return!0;t=this.activeImgIndex+s===e}return t||this.lastActive>this.images.length-1&&e<=this.lastActive-this.images.length},isNext(e){let t=this.activeImgIndex+this.usedSlideCount;return t===e||t>this.images.length-1&&t-this.images.length===e},slideClasses(e){return this.sliderHasOneImageMoreThanTheSlideCount?{"is--previous":e===0&&!this.isActive(e),"is--next":this.images.length-1===e&&!this.isActive(e),"is--active":this.isActive(e)}:{"is--previous":this.activeImgIndex-1===e||this.activeImgIndex===0&&e===this.images.length-1,"is--active":this.isActive(e),"is--next":this.isNext(e)}}}}});var R,z=i(()=>{R=`{% block sw_extension_store_listing_filter %}
    <div class="sw-extension-store-listing-filter">
        <template v-if="!isLoading">
            {% block sw_extension_store_listing_filter_content %}
                {% block sw_extension_store_listing_filter_sorting %}
                    <sw-meteor-single-select
                        class="sw-extension-store-listing-filter__sorting"
                        size="small"
                        :label="$tc('sw-extension.store.listing.sort')"
                        :options="sortingOptions"
                        valueProperty="orderIdentifier"
                        :value="sortingValue"
                        {% if VUE3 %}
                        @update:value="setSelectedSorting"
                        {% else %}
                        @change="setSelectedSorting"
                        {% endif %}
                    >
                    </sw-meteor-single-select>
                {% endblock %}

                {% block sw_extension_store_listing_all_filters %}
                    <sw-meteor-single-select
                        v-for="filter in listingFiltersSorted"
                        class="sw-extension-store-listing-filter__filters"
                        :key="filter.name"
                        size="small"
                        :label="filter.label"
                        :options="getOptionsForFilter(filter)"
                        :value="getValueForFilter(filter)"
                        {% if VUE3 %}
                        @update:value="changeValueForFilter(filter, $event)"
                        {% else %}
                        @change="changeValueForFilter(filter, $event)"
                        {% endif %}
                    >
                        <template v-if="filter.type === 'category'"
                                  #result-label-property="{ item, valueProperty }">
                            {% block sw_extension_store_listing_filter_category_filter_result %}
                                <div v-if="item[valueProperty] !== null"
                                     :class="{ 'is--root-category': isRootCategory(item) }"
                                     :style="{ 'padding-left': isRootCategory(item) ? '0': \`\${categoryDepth(item)}em\` }">
                                    {{ item.label }}
                                </div>
                            {% endblock %}
                        </template>
                    </sw-meteor-single-select>
                {% endblock %}
            {% endblock %}
        </template>
        <template v-else>
            <sw-loader></sw-loader>
        </template>
    </div>
{% endblock %}
`});var B=i(()=>{});var q={};o(q,{default:()=>Ne});var Ge,Ne,G=i(()=>{z();B();({Criteria:Ge}=Shopware.Data),Ne={template:R,mixins:["notification"],inject:["extensionStoreDataService","feature"],data(){return{isLoading:!0,listingFilters:[],listingSorting:{}}},computed:{search(){return Shopware.State.get("shopwareExtensions").search},activeFilters:{get(){return Shopware.State.get("shopwareExtensions").search.filter},set(e){Shopware.State.get("shopwareExtensions").search.filter=e}},sortingOptions(){return this.listingSorting.options?this.listingSorting.options.map(e=>(e.orderIdentifier=`${e.orderBy}##${e.orderSequence}`,e)):[]},defaultSortingValue(){return this.listingSorting.default?`${this.listingSorting.default.orderBy}##${this.listingSorting.default.orderSequence}`:null},sortingValue(){let e=this.search.sorting&&this.search.sorting.field,t=this.search.sorting&&this.search.sorting.order;return!e||!t?this.defaultSortingValue:`${e}##${t}`},listingFiltersSorted(){let e=[...this.listingFilters];e.sort((s,n)=>s.position-n.position),e.forEach(s=>{s.options.sort((n,a)=>n.position-a.position)});let t=e.find(s=>s.type==="category");return t&&(t.options=this.getOrderedCategories(t.options)),e}},created(){this.createdComponent()},methods:{createdComponent(){this.fetchListingFilters()},fetchListingFilters(){return this.extensionStoreDataService.listingFilters().then(({filter:e,sorting:t})=>{this.listingFilters=e,this.listingSorting=t}).catch(e=>{this.createNotificationError({message:e})}).finally(()=>{this.isLoading=!1})},getValueForFilter(e){return this.activeFilters[e.name]||null},changeValueForFilter(e,t){if(!t){this.$delete(this.activeFilters,e.name);return}this.feature.isActive("VUE3")?this.activeFilters[e.name]=t:this.$set(this.activeFilters,e.name,t)},getOptionsForFilter(e){return[{label:this.$tc("sw-extension.store.listing.anyOption"),value:null},...e.options]},setSelectedSorting(e){let[t,s]=e.split("##");Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"sorting",value:Ge.sort(t,s)})},isRootCategory(e){return e.parent===null||typeof e.parent>"u"},categoryDepth(e){let t=0,s=this.getCategoryByName(e.parent);for(;s;)t+=1,s=this.getCategoryByName(s.parent)?this.getCategoryByName(s.parent):null;return t},getCategoryByName(e){return this.listingFilters.find(s=>s.type==="category").options.find(s=>s.label===e||s.value===e||s.name===e)},getOrderedCategories(e){let t=new Map;return t.set(null,{value:null,children:[]}),e.forEach(s=>{t.set(s.value,{value:s,children:[]})}),e.forEach(s=>{t.get(s.parent).children.push(t.get(s.value))}),this.flatTree(t.get(null))},flatTree(e){let t=e.value?[e.value]:[];return e.children.sort((s,n)=>s.value.position-n.value.position).forEach(s=>t.push(...this.flatTree(s))),t}}}});var O,N=i(()=>{O=`{% block sw_extension_buy_modal %}
    <sw-modal
        class="sw-extension-buy-modal"
        :title="$tc('sw-extension-store.component.sw-extension-buy-modal.title')"
        size="450px"
        :isLoading="isLoading"
        @modal-close="emitClose">

        {% block sw_extension_buy_modal_content %}
            <template v-if="checkoutStep === checkoutSteps.SUCCESS">
                {% block sw_extension_buy_modal_adding_success_content%}
                    <sw-extension-adding-success
                        @close="emitClose">
                    </sw-extension-adding-success>
                {% endblock %}
            </template>

            <template v-else-if="checkoutStep === checkoutSteps.FAILED">
                {% block sw_extension_buy_modal_adding_failed_content %}
                    <sw-extension-adding-failed
                        :extensionName="extension.name"
                        :title="checkoutError && checkoutError.title"
                        :detail="checkoutError && checkoutError.detail"
                        :documentationLink="checkoutErrorDocumentationLink"
                        @close="emitClose">
                    </sw-extension-adding-failed>
                {% endblock %}
            </template>

            <template v-else>
                {% block sw_extension_buy_modal_content_not_installed %}
                    {% block sw_extension_buy_modal_variant_selection %}
                        <div class="sw-extension-buy-modal__variants-selection" :class="{
                            'sw-extension-buy-modal__variants-selection-single-entry': recommendedVariants.length <= 1
                        }">
                            {% block sw_extension_buy_modal_variant_selection_content %}
                                {% block sw_extension_buy_modal_variant_selection_extension_preview %}
                                    <div class="sw-extension-buy-modal__extension-summary">
                                        {% block sw_extension_buy_modal_variant_selection_extension_preview_content %}
                                            {% block sw_extension_buy_modal_variant_selection_extension_icon %}
                                                <sw-extension-icon-polyfill :src="extension.icon" />
                                            {% endblock %}

                                            {% block sw_extension_buy_modal_variant_selection_extension_name %}
                                                <h4 class="sw-extension-buy-modal__extension-summary-name">
                                                    {{ extension.label }}
                                                </h4>
                                            {% endblock %}
                                        {% endblock %}
                                    </div>
                                {% endblock %}

                                {% block sw_extension_buy_modal_variant_selection_variant_list %}
                                    <ul>
                                        {% block sw_extension_buy_modal_variant_selection_variant_list_item %}
                                            <li v-for="variant in recommendedVariants"
                                                :key="variant.id"
                                                class="sw-extension-buy-modal__variants-card"
                                                :class="variantCardClass(variant)"
                                                @click="onChangeVariantSelection(variant)">

                                                {% block sw_extension_buy_modal_variant_selection_variant_list_item_radio_button %}
                                                    <div class="sw-extension-buy-modal__variants-card-input sw-field--radio">
                                                        <div class="sw-field__radio-input">
                                                            <input type="radio"
                                                                   name="variant-selection"
                                                                   :id="\`sw-extension-buy-modal__variant-\${variant.type}\`"
                                                                   :value="variant.id"
                                                                   :checked="variant.id === selectedVariantId"
                                                                   :disabled="isLoading"/>
                                                            <div class="sw-field__radio-state"></div>
                                                        </div>
                                                    </div>
                                                {% endblock %}

                                                {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label %}
                                                    {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_description %}
                                                        <label :for="\`sw-extension-buy-modal__variant-\${variant.type}\`"
                                                               class="sw-extension-buy-modal__variant-description">
                                                            {{ variant.label || variant.type }}
                                                        </label>
                                                    {% endblock %}

                                                    {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_rent %}
                                                        <div v-if="variant.type === 'rent'"
                                                             class="sw-extension-buy-modal__rent">

                                                            {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_rent_prices %}
                                                                {% if VUE3 %}
                                                                <i18n-t
                                                                    keypath="sw-extension-store.buy-modal.rent.priceDisplay"
                                                                    tag="span"
                                                                    :class="getDiscountClasses(variant)">
                                                                    <template #priceDisplay>
                                                                        <span class="sw-extension-buy-modal__list-price">{{ renderPrice(variant.netPrice) }}</span
                                                                        ><span v-if="hasDiscount(variant)"
                                                                              class="sw-extension-buy-modal__discounted-price">{{ getDiscountPrice(variant) }}</span>
                                                                    </template>
                                                                </i18n-t>
                                                                {% else %}
                                                                <i18n path="sw-extension-store.buy-modal.rent.priceDisplay"
                                                                      :class="getDiscountClasses(variant)">
                                                                    <template #priceDisplay>
                                                                        <span class="sw-extension-buy-modal__list-price">{{ renderPrice(variant.netPrice) }}</span
                                                                        ><span v-if="hasDiscount(variant)"
                                                                              class="sw-extension-buy-modal__discounted-price">{{ getDiscountPrice(variant) }}</span>
                                                                    </template>
                                                                </i18n>
                                                                {% endif %}
                                                            {% endblock %}

                                                            {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_rent_trial %}
                                                                <div v-if="variant.trialPhaseIncluded && firstMonthFree">{{ $tc('sw-extension-store.buy-modal.rent.freeTrial') }}</div>
                                                            {% endblock %}

                                                            {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_rent_disclaimer %}
                                                                <div>{{ $tc('sw-extension-store.buy-modal.rent.disclaimer') }}</div>
                                                            {% endblock %}

                                                        </div>
                                                    {% endblock %}

                                                    {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_buy %}
                                                        <div v-else-if="variant.type === 'buy'"
                                                             :class="getDiscountClasses(variant)">

                                                            {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_buy_prices %}
                                                                <span v-if="hasDiscount(variant)"
                                                                      class="sw-extension-buy-modal__list-price">{{ renderPrice(variant.netPrice) }}</span
                                                                ><span class="sw-extension-buy-modal__discounted-price">{{ renderBuyPrice(variant) }}</span>
                                                            {% endblock %}

                                                        </div>
                                                    {% endblock %}

                                                    {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_fallback %}
                                                        <span v-else
                                                              class="sw-extension-buy-modal__display-default-price">
                                                            {{ renderPrice(variant.netPrice) }}
                                                        </span>
                                                    {% endblock %}

                                                    {% block sw_extension_buy_modal_variant_selection_variant_list_item_variant_label_legal %}
                                                        <span v-if="variant.legalText"
                                                              v-html="legalTextForVariant(variant)"
                                                              class="sw-extension-buy-modal__variant-text-block"/>
                                                    {% endblock %}
                                                {% endblock %}
                                            </li>
                                        {% endblock %}
                                    </ul>
                                {% endblock %}
                            {% endblock %}
                        </div>
                    {% endblock %}

                    {% block sw_extension_buy_modal_summary %}
                        <div class="sw-extension-buy-modal__variant-summary">
                            {% block sw_extension_buy_modal_summary_content %}
                                {% block sw_extension_buy_modal_summary_price %}
                                    <p class="sw-extension-buy-modal__variant-summary-price">
                                        {% block sw_extension_buy_modal_summary_price_content %}
                                            {% block sw_extension_buy_modal_summary_label_price %}
                                                <span>
                                                    {{ $tc('sw-extension-store.component.sw-extension-buy-modal.variantSummary.labelPrice') }}
                                                </span>
                                            {% endblock %}

                                            {% block sw_extension_buy_modal_summary_actual_price %}
                                                <span v-if="!isLoading"
                                                      class="sw-extension-buy-modal__variant-summary-actual-price">
                                                    {{ $tc('sw-extension-store.general.labelPrice', variantRecommendation(selectedVariant), { price: formattedPrice }) }}
                                                </span>
                                            {% endblock %}
                                        {% endblock %}
                                    </p>
                                {% endblock %}

                                {% block sw_extension_buy_modal_summary_label_plus_vat %}
                                    <p class="sw-extension-buy-modal__variant-summary-price-subline" :class="vatIncludedClasses">
                                        {{ $tc('sw-extension-store.component.sw-extension-buy-modal.variantSummary.labelVat') }}
                                    </p>
                                {% endblock %}

                                {% block sw_extension_buy_modal_summary_renewal_date %}
                                    <p class="sw-extension-buy-modal__variant-summary-price-subline" :class="renewalDateClasses">
                                        {{ $tc('sw-extension-store.component.sw-extension-buy-modal.variantSummary.renewal', 0, { renewalDate: dateFilter(todayPlusOneMonth) }) }}
                                    </p>
                                {% endblock %}
                            {% endblock %}
                        </div>
                    {% endblock %}

                    {% block sw_extension_payment_selection %}
                        <sw-single-select
                            v-if="showPaymentSelection"
                            :options="paymentMeans"
                            :placeholder="$tc('sw-extension-store.buy-modal.paymentSelectionPlaceholder')"
                            valueProperty="id"
                            {% if VUE3 %}
                            v-model:value="selectedPaymentMean"
                            {% else %}
                            v-model="selectedPaymentMean"
                            {% endif %}
                        >
                        </sw-single-select>
                    {% endblock %}

                    {% block sw_extension_payment_general_text_block %}
                        <p class="sw-extension-buy-modal__general-text-block"
                           v-if="paymentText"
                           v-html="paymentText">
                        </p>
                    {% endblock %}

                    {% block sw_extension_buy_modal_accept_toc %}
                        <sw-gtc-checkbox
                            {% if VUE3 %}
                            v-model:value="tocAccepted"
                            {% else %}
                            v-model="tocAccepted"
                            {% endif %}
                        >
                        </sw-gtc-checkbox>
                    {% endblock %}

                    {% block sw_extension_buy_modal_accept_extension_permissions %}
                        <sw-checkbox-field
                            v-if="extensionHasPermissions"
                            class="sw-extension-buy-modal__checkbox sw-extension-buy-modal__checkbox-permissions"
                            :class="\`sw-extension-buy-modal__checkbox-permissions--\${extension.name}\`"
                            {% if VUE3 %}
                            v-model:value="permissionsAccepted"
                            {% else %}
                            v-model="permissionsAccepted"
                            {% endif %}

                        >
                            <template #label>
                                <span v-if="legalText">
                                    {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.introText') }}
                                    <a
                                        href="#"
                                        class="link permissions-modal-trigger"
                                        @click.prevent="openPermissionsModal"
                                    >
                                        {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.buttonPermissions') }}
                                    </a>
                                    {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.middleText') }}
                                    <a
                                        href="#"
                                        class="link legal-text-modal-trigger"
                                        @click.prevent="openLegalTextModal"
                                    >
                                        {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.buttonAppProvider') }}
                                    </a>
                                    {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.endText') }}
                                </span>

                                <span v-else>
                                    {{ $tc('sw-extension-store.component.sw-extension-buy-modal.labelAcceptPermissions') }}
                                    <a
                                        href="#"
                                        class="link permissions-modal-trigger"
                                        @click="openPermissionsModal"
                                    >
                                        {{ $tc('sw-extension-store.detail.labelButtonShowPermissions') }}
                                    </a>
                                </span>
                            </template>
                        </sw-checkbox-field>
                    {% endblock %}

                    {% block sw_extension_buy_modal_accept_extension_app_provider %}
                        <sw-checkbox-field
                            v-if="!extensionHasPermissions && legalText"
                            v-model="legalTextAccepted"
                            class="sw-extension-buy-modal__checkbox sw-extension-buy-modal__checkbox-app-provider"
                            :class="\`sw-extension-buy-modal__checkbox-app-provider--\${extension.name}\`"
                        >
                            <template #label>
                                {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.appProviderStartText') }}
                                <a
                                    @click.prevent="openLegalTextModal"
                                    class="link legal-text-modal-trigger"
                                    href="#"
                                >
                                    {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.buttonAppProvider') }}
                                </a>
                                {{ $t('sw-extension-store.buy-modal.checkboxes.permissionsAndAppProvider.endText') }}
                            </template>
                        </sw-checkbox-field>
                    {% endblock %}

                    {% block sw_extension_buy_modal_accept_extension_privacy_policy_extensions %}
                        <sw-checkbox-field
                            v-if="extension.privacyPolicyExtension"
                            v-model="privacyExtensionsAccepted"
                            class="sw-extension-buy-modal__checkbox-privacy-policy"
                            :class="\`sw-extension-buy-modal__checkbox-privacy-policy--\${extension.name}\`"
                        >
                            <template #label>
                                <span class="is--required">
                                    {{ $tc('sw-extension-store.component.sw-extension-buy-modal.labelAcceptPrivacyExtensions') }}
                                </span>
                                <a
                                    href="#"
                                    class="link privacy-policy-modal-trigger"
                                    @click.prevent="openPrivacyModal"
                                >
                                    {{ $tc('sw-extension-store.component.sw-extension-buy-modal.buttonShowPrivacyExtensions') }}
                                </a>
                            </template>
                        </sw-checkbox-field>
                    {% endblock %}

                    {% block sw_extension_buy_modal_alert_can_not_buy %}
                        <sw-alert v-if="!userCanBuyFromStore" variant="info">
                            {% block sw_extension_buy_modal_alert_can_not_buy_content %}
                                {{ $tc('sw-extension-store.component.sw-extension-buy-modal.alertCanNotBuy.text') }}
                            {% endblock %}
                        </sw-alert>
                    {% endblock %}

                    {% block sw_extension_buy_modal_alert_payment_means_required %}
                        <sw-alert v-if="showPaymentWarning" variant="warning">
                            {% block sw_extension_buy_modal_alert_payment_means_required_content %}
                                {{ $t('sw-extension-store.buy-modal.warnings.paymentMeansRequiredText') }}
                                <sw-external-link
                                    :href="cart && cart.payment && cart.payment.registrationUrl"
                                    class="sw-extension-buy-modal__external-link"
                                >
                                    {{ $t('sw-extension-store.buy-modal.warnings.paymentMeansRequiredLinkText') }}
                                    <sw-icon name="regular-long-arrow-right"></sw-icon>
                                </sw-external-link>
                            {% endblock %}
                        </sw-alert>
                    {% endblock %}

                    {% block sw_extension_buy_modal_button_purchase %}
                        <sw-button variant="primary"
                                   block
                                   :disabled="!canPurchaseExtension"
                                   @click="purchaseExtension">
                            {{ purchaseButtonLabel }}
                        </sw-button>
                    {% endblock %}
                {% endblock %}

                {% block sw_extension_buy_modal_permissions_modal %}
                    <sw-extension-permissions-modal
                        v-if="showPermissionsModal"
                        :extensionLabel="extension.label"
                        :domains="extension.domains"
                        :permissions="extension.permissions"
                        @modal-close="closePermissionsModal">
                    </sw-extension-permissions-modal>
                {% endblock %}

                {% block sw_extension_buy_modal_privacy_extensions_modal %}
                    <sw-extension-privacy-policy-extensions-modal
                        v-if="showPrivacyModal"
                        :extensionName="extension.label"
                        :privacyPolicyExtension="extension.privacyPolicyExtension"
                        @modal-close="closePrivacyModal">
                    </sw-extension-privacy-policy-extensions-modal>
                {% endblock %}

                {% block sw_extension_buy_modal_legal_text_modal %}
                    <sw-modal
                        v-if="showLegalTextModal"
                        @modal-close="closeLegalTextModal"
                        class="sw-extension-buy-modal__legal-text-modal"
                        :title="$t('sw-extension-store.buy-modal.legalTextModal.title')">
                        <div v-html="legalText"></div>

                        <template #modal-footer>
                            <sw-button
                                variant="primary"
                                size="small"
                                @click="closeLegalTextModal">
                                {{ $tc('global.default.close') }}
                            </sw-button>
                        </template>
                    </sw-modal>
                {% endblock %}
            </template>
        {% endblock %}
    </sw-modal>
{% endblock %}
`});var U=i(()=>{});var j={};o(j,{default:()=>Ue});var l,Ue,W=i(()=>{N();U();({Utils:l}=Shopware),Ue={template:O,inject:["shopwareExtensionService","extensionStoreLicensesService"],emits:["modal-close"],mixins:["sw-extension-error"],props:{extension:{type:Object,required:!0}},data(){return{tocAccepted:!1,selectedVariantId:null,isLoading:!1,permissionsAccepted:!1,legalTextAccepted:!1,showPermissionsModal:!1,showLegalTextModal:!1,privacyExtensionsAccepted:!1,showPrivacyModal:!1,checkoutStep:null,checkoutError:null,cart:null,paymentMeans:[]}},computed:{recommendedVariants(){return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants)},selectedVariant(){return this.extension.variants.find(e=>e.id===this.selectedVariantId)},todayPlusOneMonth(){let e=new Date;return e.setMonth(e.getMonth()+1),e},dateFilter(){return l.format.date},formattedPrice(){let e=this.cart&&this.cart.positions&&this.cart.positions[0],t=e&&e.netPrice;return t&&e&&e.firstMonthFree?l.format.currency(0,"EUR"):t?l.format.currency(t,"EUR",2):l.format.currency(this.shopwareExtensionService.getPriceFromVariant(this.selectedVariant),"EUR")},trialPrice(){return this.renderPrice(0)},purchaseButtonLabel(){switch(this.selectedVariant.type){case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.FREE:return this.$tc("sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.free");case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.RENT:return this.$tc("sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.rent");case this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.BUY:default:return this.$tc("sw-extension-store.component.sw-extension-buy-modal.purchaseButtonsLabels.buy")}},vatIncludedClasses(){return{"is--hidden":this.selectedVariant.type===this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.FREE}},renewalDateClasses(){return{"is--hidden":this.selectedVariant.type!==this.shopwareExtensionService.EXTENSION_VARIANT_TYPES.RENT}},extensionHasPermissions(){return!!Object.keys(this.extension.permissions).length},canPurchaseExtension(){return this.tocAccepted&&this.permissionsAccepted&&this.legalTextAccepted&&this.privacyExtensionsAccepted&&this.userCanBuyFromStore&&!this.showPaymentWarning},userCanBuyFromStore(){let e=this.tocAccepted;return Shopware.State.get("shopwareExtensions").userInfo!==null},showPaymentWarning(){return(this.paymentMeans||[]).length<=0&&this.cart&&this.cart.payment&&this.cart.payment.paymentMeanRequired},checkoutSteps(){return Object.freeze({CHECKOUT:null,SUCCESS:"checkout-success",FAILED:"checkout-failed"})},showPaymentSelection(){return(this.paymentMeans||[]).length>0&&this.cart&&this.cart.payment&&this.cart.payment.paymentMeanRequired},paymentText(){return!this.cart||!this.cart.payment||!this.cart.payment.paymentText?null:this.$sanitize(this.cart.payment.paymentText,{ALLOWED_TAGS:["a","b","i","u","br","strong","p","br"],ALLOWED_ATTR:["href","target","rel"]})},legalText(){return!this.cart||!this.cart.legalText?null:this.$sanitize(this.cart.legalText,{ALLOWED_TAGS:["a","b","i","u","br","strong","p","br"],ALLOWED_ATTR:["href","target","rel"]})},selectedPaymentMean:{get(){return this.cart&&this.cart.payment&&this.cart.payment.paymentMean&&this.cart.payment.paymentMean.id},set(e){this.cart&&this.cart.payment&&this.cart.payment.paymentMean&&(this.cart.payment.paymentMean.id=e),this.cart.payment.paymentMean={id:e}}},checkoutErrorDocumentationLink(){return l.get(this.checkoutError,"meta.documentationLink",null)},firstMonthFree(){return this.cart&&this.cart.positions[0]&&this.cart.positions[0].firstMonthFree===!0}},async created(){let e=this.recommendedVariants.length>0?this.recommendedVariants[0].id:null;this.setSelectedVariantId(e),this.permissionsAccepted=!this.extensionHasPermissions,this.privacyExtensionsAccepted=!this.extension.privacyPolicyExtension,await this.fetchPlan(),this.legalTextAccepted=!this.legalText},watch:{selectedVariantId(){this.getCart()},userCanBuyFromStore(e){e&&this.getCart()},permissionsAccepted(e){this.legalTextAccepted=e}},methods:{emitClose(){this.isLoading||this.$emit("modal-close")},setSelectedVariantId(e){this.isLoading||(this.selectedVariantId=e)},variantCardClass(e){return{"is--selected":e.id===this.selectedVariantId}},onChangeVariantSelection(e){this.setSelectedVariantId(e.id)},variantRecommendation(e){return this.shopwareExtensionService.mapVariantToRecommendation(e)},async purchaseExtension(){this.isLoading=!0;let e=null;try{await this.orderCart(),await this.shopwareExtensionService.updateExtensionData(),e=this.checkoutSteps.SUCCESS}catch(t){this.handleErrors(t),e=this.checkoutSteps.FAILED,l.get(t,"response.data.errors[0]",null)&&(this.checkoutError=t.response.data.errors[0])}finally{await this.shopwareExtensionService.updateExtensionData(),this.checkoutStep=e,this.isLoading=!1}},async orderCart(){await this.extensionStoreLicensesService.orderCart(this.cart)},async getCart(){if(this.userCanBuyFromStore){this.isLoading=!0;try{let e=await this.extensionStoreLicensesService.newCart(this.extension.id,this.selectedVariantId);this.cart=e.data}catch(e){this.handleErrors(e),this.isLoading=!1,this.emitClose()}finally{this.isLoading=!1}}},getDiscountClasses(e){return{"is--discounted":this.hasDiscount(e)}},hasDiscount(e){let t=e.discountCampaign;return t&&new Date(Date.parse(t.startDate))<new Date&&new Date(Date.parse(t.endDate))>=new Date},renderPrice(e){return l.format.currency(e,"EUR")},renderBuyPrice(e){return this.hasDiscount(e)?this.renderPrice(e.discountCampaign.discountedPrice):this.renderPrice(e.netPrice)},getDiscountPrice(e){return e.discountCampaign?this.renderPrice(e.discountCampaign.discountedPrice):this.trialPrice},getDiscountEnds(e){return l.format.date(e.discountCampaign?new Date(Date.parse(e.discountCampaign.endDate)):null)},handleErrors(e){this.showExtensionErrors(e)},openPermissionsModal(){this.showPermissionsModal=!0},closePermissionsModal(){this.showPermissionsModal=!1},openLegalTextModal(){this.showLegalTextModal=!0},closeLegalTextModal(){this.showLegalTextModal=!1},async fetchPlan(){this.isLoading=!0,await this.shopwareExtensionService.checkLogin(),await this.getPaymentMeans(),this.isLoading=!1},async getPaymentMeans(){this.extensionStoreLicensesService.getPaymentMeans().then(e=>{this.paymentMeans=e.data}).catch(e=>{let t=e.response&&e.response.data&&e.response.data.errors||[];if(!Array.isArray(t)){Shopware.Utils.debug.warn("Payment loading error",e);return}t.forEach(s=>{this.createNotificationError({system:!0,autoClose:!1,growl:!0,title:s.title,message:s.detail})})})},legalTextForVariant(e){return!e||!e.legalText?null:this.$sanitize(e.legalText,{ALLOWED_TAGS:["a","b","i","u","br","strong","p","br"],ALLOWED_ATTR:["href","target","rel"]})},openPrivacyModal(){this.showPrivacyModal=!0},closePrivacyModal(){this.showPrivacyModal=!1}}}});var Y,H=i(()=>{Y=`{% block sw_extension_listing_card %}
    <div class="sw-extension-listing-card" @click="openDetailPage">
        {% block sw_extension_listing_card_content %}
            {% block sw_extension_listing_card_preview %}
                <div class="sw-extension-listing-card__preview" :style="previewMedia">
                    {% block sw_extension_listing_card_preview_type_label %}
                        <sw-extension-type-label :type="extension.type"
                                                 class="sw-extension-listing-card__extension-type-label">
                        </sw-extension-type-label>
                    {% endblock %}
                </div>
            {% endblock %}

            {% block sw_extension_listing_card_info_grid %}
                <div class="sw-extension-listing-card__info-grid">
                    {% block sw_extension_listing_card_info_name %}
                        <p class="sw-extension-listing-card__info-name">{{ extension.label }}</p>
                    {% endblock %}

                    {% block sw_extension_listing_card_info_description %}
                        <p class="sw-extension-listing-card__info-description is--wrap-content">{{ extension.shortDescription }}</p>
                    {% endblock %}

                    {% block sw_extension_listing_card_info_rating %}
                        <div class="sw-extension-listing-card__info-rating">
                            <sw-extension-rating-stars class="sw-extension-listing-card__info-rating-stars"
                                                       :rating="extension.rating"
                                                       :size="12"/>

                            <span class="sw-extension-listing-card__info-rating-count">
                                {{ extension.numberOfRatings }}
                            </span>
                        </div>
                    {% endblock %}

                    {% block sw_extension_listing_card_info_price %}
                        <div class="sw-extension-listing-card__info-price">
                            <template v-if="isInstalled">
                                {{ $tc('sw-extension-store.component.sw-extension-listing-card.labelInstalled') }}
                            </template>

                            <template v-else-if="isLicensed">
                                {{ $tc('sw-extension-store.component.sw-extension-listing-card.labelLicensed') }}
                            </template>

                            <span v-else :class="discountClass">{{ calculatedPrice }}</span>
                        </div>
                    {% endblock %}

                    {% block sw_extension_listing_card_label_display %}
                        <sw-extension-store-label-display
                            v-if="extension.labels.length > 0"
                            :labels="extension.labels"
                            class="sw-extension-listing-card__label-display">
                        </sw-extension-store-label-display>
                    {% endblock %}
                </div>
            {% endblock %}
        {% endblock %}
    </div>
{% endblock %}
`});var X=i(()=>{});var Q={};o(Q,{default:()=>He});var K,We,He,J=i(()=>{H();X();({Utils:K,Filter:We}=Shopware),He={template:Y,inject:["shopwareExtensionService"],props:{extension:{type:Object,required:!0}},computed:{previewMedia(){let e=K.get(this.extension,"images[0]",null);return e?{"background-image":`url('${e.remoteLink}')`,"background-size":"cover"}:{"background-image":`url('${this.assetFilter("/administration/static/img/theme/default_theme_preview.jpg")}')`}},recommendedVariant(){return this.shopwareExtensionService.orderVariantsByRecommendation(this.extension.variants)[0]},hasActiveDiscount(){return this.shopwareExtensionService.isVariantDiscounted(this.recommendedVariant)},discountClass(){return{"sw-extension-listing-card__info-price-discounted":this.hasActiveDiscount}},calculatedPrice(){return this.recommendedVariant?this.$tc("sw-extension-store.general.labelPrice",this.shopwareExtensionService.mapVariantToRecommendation(this.recommendedVariant),{price:K.format.currency(this.shopwareExtensionService.getPriceFromVariant(this.recommendedVariant),"EUR")}):null},isInstalled(){return!!Shopware.State.get("shopwareExtensions").myExtensions.data.some(e=>e.installedAt&&e.name===this.extension.name)},isLicensed(){let e=Shopware.State.get("shopwareExtensions").myExtensions.data.find(t=>t.name===this.extension.name);return e===void 0?!1:!!e.storeLicense},assetFilter(){return We.getByName("asset")}},methods:{openDetailPage(){this.$router.push({name:"sw.extension.store.detail",params:{id:this.extension.id.toString()}})}}}});var ee,Z=i(()=>{ee=`{% block sw_extension_store_update_warning %}
    <sw-extension-store-error-card
        variant="info"
        class="sw-extension-store-update-warning"
        :title="$tc('sw-extension-store.updateWarning.headline')"
    >
        <template #default>
            {% block sw_extension_store_update_warning_description %}
                <p>
                    {{ $tc('sw-extension-store.updateWarning.description') }}
                </p>
                <p class="sw-extension-store-update-warning__strong-text">
                    {{ $tc('sw-extension-store.updateWarning.requestDescription') }}
                </p>
            {% endblock %}
        </template>

        <template #actions>
            {% block sw_extension_store_update_warning_actions %}
                <sw-button
                    variant="primary"
                    @click="updateExtension"
                    :isLoading="isUpdating"
                >
                    {{ $tc('sw-extension-store.updateWarning.update') }}
                </sw-button>
            {% endblock %}
        </template>
    </sw-extension-store-error-card>
{% endblock %}
`});var te=i(()=>{});var se={};o(se,{default:()=>Ke});var Xe,Ke,ie=i(()=>{Z();te();({Mixin:Xe}=Shopware),Ke={template:ee,inject:["shopwareExtensionService","extensionStoreActionService","cacheApiService"],mixins:[Xe.getByName("notification")],data(){return{isUpdating:!1}},computed:{},methods:{async updateExtension(){this.isUpdating=!0;try{await this.extensionStoreActionService.downloadExtension("SwagExtensionStore"),await this.shopwareExtensionService.updateExtension("SwagExtensionStore","plugin"),await this.clearCacheAndReloadPage()}catch(e){this.isUpdating=!1,Shopware.Utils.debug.error(e),this.createNotificationError({message:this.$tc("global.notification.unspecifiedSaveErrorMessage")})}},clearCacheAndReloadPage(){return this.cacheApiService.clear().then(()=>{window.location.reload()})}}}});var oe,ne=i(()=>{oe=`{% block sw_extension_label %}
    <div class="sw-extension-label" :style="{ 'background-color': backgroundColor, 'color': determineTextColor(backgroundColor) }">
        {% block sw_extension_label_slot %}
            <slot></slot>
        {% endblock %}
    </div>
{% endblock %}
`});var ae=i(()=>{});var re={};o(re,{default:()=>Je});var Je,le=i(()=>{ne();ae();Je={template:oe,props:{backgroundColor:{type:String,required:!1,default:"#29333dbf"}},methods:{determineTextColor(e){if(!e)return"#000";let t=e.charAt(0)==="#"?e.substring(1,7):e,s=parseInt(t.substring(0,2),16),n=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16);return s*.299+n*.587+a*.114>186?"#000":"#fff"}}}});var ce,de=i(()=>{ce=`{% block sw_extension_type_label %}
    <div>
        {% block sw_extension_type_label_self_hosted %}
            <sw-extension-label>
                {{ $tc('sw-extension-store.typeLabels.self-hosted') }}
            </sw-extension-label>
        {% endblock %}

        {% block sw_extension_type_label_cloud %}
            <sw-extension-label v-if="isApp"
                class="sw-extension-type-label__cloud-label">
                {{ $tc('sw-extension-store.typeLabels.cloud') }}
            </sw-extension-label>
        {% endblock %}
    </div>
{% endblock %}
`});var _e={};o(_e,{default:()=>et});var et,pe=i(()=>{de();et={template:ce,props:{type:{type:String,required:!0,validator(e){return["app","plugin"].includes(e)}}},computed:{isApp(){return this.type==="app"}}}});var we,xe=i(()=>{we=`{% block sw_extension_label_display %}
	<div class="sw-extension-store-label-display">
        {% block sw_extension_label_display_label %}
            <sw-extension-label v-for="item in labels"
                                :key="item.label"
                                :backgroundColor="item.color">
                {{ item.label }}
            </sw-extension-label>
        {% endblock %}
    </div>
{% endblock %}
`});var me=i(()=>{});var ue={};o(ue,{default:()=>st});var st,ge=i(()=>{xe();me();st={template:we,props:{labels:{type:Array,required:!0}}}});var be,he=i(()=>{be=`{% block sw_extension_store_error_card %}
    <sw-meteor-card
        class="sw-extension-store-error-card"
        :class="componentClasses"
    >
        {% block sw_extension_store_error_card_label %}
            <sw-label
                class="sw-extension-store-error-card__label"
                appearance="pill"
                :variant="variant"
            >
                <slot name="icon">
                    {% block sw_extension_store_error_card_icon %}
                        <sw-icon
                            :name="iconName"
                            size="30px"
                        />
                    {% endblock %}
                </slot>
            </sw-label>
        {% endblock %}

        {% block sw_extension_store_error_card_title %}
            <h2 v-if="title"
                v-html="title"
                class="sw-extension-store-error-card__title"
            >
            </h2>
        {% endblock %}

        {% block sw_extension_store_error_card_message %}
            <div class="sw-extension-store-error-card__message">
                <slot></slot>
            </div>
        {% endblock %}

        {% block sw_extension_store_error_card_actions %}
            <div class="sw-extension-store-error-card__actions">
                <slot name="actions"></slot>
            </div>
        {% endblock %}
    </sw-meteor-card>
{% endblock %}
`});var fe=i(()=>{});var ve={};o(ve,{default:()=>nt});var nt,ye=i(()=>{he();fe();nt={template:be,props:{title:{type:String,required:!1},variant:{type:String,required:!1,default:"neutral",validator(e){return["info","danger","success","warning","neutral"].includes(e)}}},computed:{iconName(){switch(this.variant){case"danger":return"regular-times-circle";case"info":return"regular-info-circle";case"warning":return"regular-exclamation-circle";case"success":return"regular-check-circle";default:return"regular-info-circle"}},componentClasses(){return[`sw-extension-store-error-card--variant-${this.variant}`]}}}});var Se,ke=i(()=>{Se=`<div class="sw-extension-icon-polyfill">
    <sw-extension-icon v-if="hasCoreComponent" v-bind="{ src, alt }"/>
    <div v-else class="sw-extension-icon sw-extension-icon-polyfill__root">
        <img class="sw-extension-icon-polyfill__icon"
             draggable="false"
             :src="src"
             :alt="alt"
        >
    </div>
</div>
`});var Ee=i(()=>{});var Pe={};o(Pe,{default:()=>at});var at,Ae=i(()=>{ke();Ee();at=Shopware.Component.wrapComponentConfig({template:Se,props:{src:{type:String,required:!0},alt:{type:String,required:!1,default:""}},computed:{hasCoreComponent(){return Shopware.Component.getComponentRegistry().has("sw-extension-icon")}}})});var{Criteria:d}=Shopware.Data,p=class extends Shopware.Classes.ApiService{constructor(t,s,n="extension-store"){super(t,s,n),this.name="extensionStoreDataService"}async listingFilters(t){return(await this.httpClient.get(`_action/${this.apiEndpoint}/store-filters`,{headers:this.basicHeaders(t),version:3})).data}async getExtensionList(t,s){let n=this._getCriteriaFromSearch(t),{data:a}=await this.httpClient.post(`_action/${this.apiEndpoint}/list`,n.parse(),{headers:this.basicHeaders(s),version:3}),r=[];return r.total=a.meta.total,r.push(...a.data),r}async getDetail(t,s){let{data:n}=await this.httpClient.get(`_action/${this.apiEndpoint}/detail/${t}`,{headers:this.basicHeaders(s),version:3});return n}async getReviews(t,s,n){let a=new d(t,s),{data:r}=await this.httpClient.get(`_action/${this.apiEndpoint}/${n}/reviews`,{headers:this.basicHeaders(),params:a.parse(),version:3});return r}basicHeaders(t=null){let s={"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${this.loginService.getToken()}`};return t&&t.languageId&&(s["sw-language-id"]=t.languageId),s}_getCriteriaFromSearch({page:t=1,limit:s=25,rating:n=null,category:a=null,term:r=null,sorting:m=null,filter:Ce={}}={}){let c=new d(t,s);r&&c.setTerm(r);let _=[];return n!==null&&_.push(d.equals("rating",n)),Object.entries(Ce).forEach(([Me,Te])=>{_.push(d.equals(Me,Te))}),a!==null&&_.push(d.equals("category",a)),_.length>0&&c.addFilter(d.multi("AND",_)),m&&(c.resetSorting(),c.addSorting(m)),c}};var x=class extends Shopware.Classes.ApiService{constructor(t,s,n="extension-store"){super(t,s,n),this.name="extensionStoreLicensesService"}newCart(t,s){return this.httpClient.post(`/_action/${this.apiEndpoint}/cart/new`,{extensionId:t,variantId:s},{headers:this.basicHeaders(),version:3})}orderCart(t){return this.httpClient.post(`/_action/${this.apiEndpoint}/cart/order`,t,{headers:this.basicHeaders(),version:3})}getPaymentMeans(){return this.httpClient.get(`/_action/${this.apiEndpoint}/cart/payment-means`,{headers:this.basicHeaders(),version:3})}basicHeaders(t=null){let s={"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${this.loginService.getToken()}`};return t&&t.languageId&&(s["sw-language-id"]=t.languageId),s}};Shopware.Component.register("sw-extension-store-index",()=>Promise.resolve().then(()=>(f(),b)));Shopware.Component.register("sw-extension-store-listing",()=>Promise.resolve().then(()=>(E(),S)));Shopware.Component.register("sw-extension-store-detail",()=>Promise.resolve().then(()=>(T(),M)));Shopware.Component.register("sw-extension-store-slider",()=>Promise.resolve().then(()=>(F(),V)));Shopware.Component.register("sw-extension-store-listing-filter",()=>Promise.resolve().then(()=>(G(),q)));Shopware.Component.register("sw-extension-buy-modal",()=>Promise.resolve().then(()=>(W(),j)));Shopware.Component.register("sw-extension-listing-card",()=>Promise.resolve().then(()=>(J(),Q)));Shopware.Component.register("sw-extension-store-update-warning",()=>Promise.resolve().then(()=>(ie(),se)));Shopware.Component.register("sw-extension-label",()=>Promise.resolve().then(()=>(le(),re)));Shopware.Component.register("sw-extension-type-label",()=>Promise.resolve().then(()=>(pe(),_e)));Shopware.Component.register("sw-extension-store-label-display",()=>Promise.resolve().then(()=>(ge(),ue)));Shopware.Component.register("sw-extension-store-error-card",()=>Promise.resolve().then(()=>(ye(),ve)));Shopware.Component.register("sw-extension-icon-polyfill",()=>Promise.resolve().then(()=>(Ae(),Pe)));Shopware.Application.addServiceProvider("extensionStoreDataService",()=>new p(Shopware.Application.getContainer("init").httpClient,Shopware.Service("loginService")));Shopware.Application.addServiceProvider("extensionStoreLicensesService",()=>new x(Shopware.Application.getContainer("init").httpClient,Shopware.Service("loginService")));Shopware.Module.register("sw-extension-store",{title:"sw-extension-store.general.title",name:"sw-extension-store.general.title",routePrefixName:"sw.extension",routePrefixPath:"sw/extension",routes:{store:{path:"store",redirect:{name:"sw.extension.store.listing"},meta:{privilege:"system.extension_store"},component:"sw-extension-store-index",children:{listing:{path:"listing",component:"sw-extension-store-listing",redirect:{name:"sw.extension.store.listing.app"},meta:{privilege:"system.extension_store"},children:{app:{path:"app",component:"sw-extension-store-listing",propsData:{isTheme:!1},meta:{privilege:"system.extension_store"}},theme:{path:"theme",component:"sw-extension-store-listing",propsData:{isTheme:!0},meta:{privilege:"system.extension_store"}}}}}},"store.detail":{component:"sw-extension-store-detail",path:"store/detail/:id",meta:{parentPath:"sw.extension.store",privilege:"system.extension_store"},props:{default:e=>({id:e.params.id})}}},routeMiddleware(e,t){t.name==="sw.extension.store.landing-page"&&(t.redirect={name:"sw.extension.store.listing"}),e(t)}});})();
