/*! For license information please see 13.js.LICENSE.txt */
(this["webpackJsonpPluginswag-extension-store"]=this["webpackJsonpPluginswag-extension-store"]||[]).push([[13],{"0ziJ":function(e,t,n){},WH0r:function(e,t,n){var r=n("0ziJ");r.__esModule&&(r=r.default),"string"==typeof r&&(r=[[e.i,r,""]]),r.locals&&(e.exports=r.locals);(0,n("ydqr").default)("35fc8d66",r,!0,{})},b0cO:function(e,t,n){"use strict";n.r(t);n("WH0r");function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(){o=function(){return e};var e={},t=Object.prototype,n=t.hasOwnProperty,i=Object.defineProperty||function(e,t,n){e[t]=n.value},a="function"==typeof Symbol?Symbol:{},s=a.iterator||"@@iterator",c=a.asyncIterator||"@@asyncIterator",l=a.toStringTag||"@@toStringTag";function u(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{u({},"")}catch(e){u=function(e,t,n){return e[t]=n}}function f(e,t,n,r){var o=t&&t.prototype instanceof p?t:p,a=Object.create(o.prototype),s=new j(r||[]);return i(a,"_invoke",{value:E(e,n,s)}),a}function h(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}e.wrap=f;var d={};function p(){}function v(){}function g(){}var m={};u(m,s,(function(){return this}));var y=Object.getPrototypeOf,w=y&&y(y(O([])));w&&w!==t&&n.call(w,s)&&(m=w);var b=g.prototype=p.prototype=Object.create(m);function x(e){["next","throw","return"].forEach((function(t){u(e,t,(function(e){return this._invoke(t,e)}))}))}function _(e,t){function o(i,a,s,c){var l=h(e[i],e,a);if("throw"!==l.type){var u=l.arg,f=u.value;return f&&"object"==r(f)&&n.call(f,"__await")?t.resolve(f.__await).then((function(e){o("next",e,s,c)}),(function(e){o("throw",e,s,c)})):t.resolve(f).then((function(e){u.value=e,s(u)}),(function(e){return o("throw",e,s,c)}))}c(l.arg)}var a;i(this,"_invoke",{value:function(e,n){function r(){return new t((function(t,r){o(e,n,t,r)}))}return a=a?a.then(r,r):r()}})}function E(e,t,n){var r="suspendedStart";return function(o,i){if("executing"===r)throw new Error("Generator is already running");if("completed"===r){if("throw"===o)throw i;return A()}for(n.method=o,n.arg=i;;){var a=n.delegate;if(a){var s=S(a,n);if(s){if(s===d)continue;return s}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===r)throw r="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r="executing";var c=h(e,t,n);if("normal"===c.type){if(r=n.done?"completed":"suspendedYield",c.arg===d)continue;return{value:c.arg,done:n.done}}"throw"===c.type&&(r="completed",n.method="throw",n.arg=c.arg)}}}function S(e,t){var n=t.method,r=e.iterator[n];if(void 0===r)return t.delegate=null,"throw"===n&&e.iterator.return&&(t.method="return",t.arg=void 0,S(e,t),"throw"===t.method)||"return"!==n&&(t.method="throw",t.arg=new TypeError("The iterator does not provide a '"+n+"' method")),d;var o=h(r,e.iterator,t.arg);if("throw"===o.type)return t.method="throw",t.arg=o.arg,t.delegate=null,d;var i=o.arg;return i?i.done?(t[e.resultName]=i.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=void 0),t.delegate=null,d):i:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,d)}function k(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function L(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function j(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(k,this),this.reset(!0)}function O(e){if(e){var t=e[s];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var r=-1,o=function t(){for(;++r<e.length;)if(n.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=void 0,t.done=!0,t};return o.next=o}}return{next:A}}function A(){return{value:void 0,done:!0}}return v.prototype=g,i(b,"constructor",{value:g,configurable:!0}),i(g,"constructor",{value:v,configurable:!0}),v.displayName=u(g,l,"GeneratorFunction"),e.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===v||"GeneratorFunction"===(t.displayName||t.name))},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,g):(e.__proto__=g,u(e,l,"GeneratorFunction")),e.prototype=Object.create(b),e},e.awrap=function(e){return{__await:e}},x(_.prototype),u(_.prototype,c,(function(){return this})),e.AsyncIterator=_,e.async=function(t,n,r,o,i){void 0===i&&(i=Promise);var a=new _(f(t,n,r,o),i);return e.isGeneratorFunction(n)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},x(b),u(b,l,"Generator"),u(b,s,(function(){return this})),u(b,"toString",(function(){return"[object Generator]"})),e.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}},e.values=O,j.prototype={constructor:j,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(L),!e)for(var t in this)"t"===t.charAt(0)&&n.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(n,r){return a.type="throw",a.arg=e,t.next=n,r&&(t.method="next",t.arg=void 0),!!r}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return r("end");if(i.tryLoc<=this.prev){var s=n.call(i,"catchLoc"),c=n.call(i,"finallyLoc");if(s&&c){if(this.prev<i.catchLoc)return r(i.catchLoc,!0);if(this.prev<i.finallyLoc)return r(i.finallyLoc)}else if(s){if(this.prev<i.catchLoc)return r(i.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return r(i.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===e||"continue"===e)&&i.tryLoc<=t&&t<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=e,a.arg=t,i?(this.method="next",this.next=i.finallyLoc,d):this.complete(a)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),d},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),L(n),d}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if("throw"===r.type){var o=r.arg;L(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(e,t,n){return this.delegate={iterator:O(e),resultName:t,nextLoc:n},"next"===this.method&&(this.arg=void 0),d}},e}function i(e,t,n,r,o,i,a){try{var s=e[i](a),c=s.value}catch(e){return void n(e)}s.done?t(c):Promise.resolve(c).then(r,o)}t.default={template:'{% block sw_extension_store_index %}\n    <sw-meteor-page class="sw-extension-store-index" hideIcon>\n        {% block sw_extension_store_index_slots %}\n            {% block sw_extension_store_index_slot_search_bar %}\n                <template #search-bar>\n                    {% block sw_extension_store_index_search_bar %}\n                        <sw-search-bar\n                            :key="storeSearchKey"\n                            @search="updateSearch"\n                            :initialSearch="searchValue"\n                            initialSearchType="extension"\n                            :placeholder="$tc(\'sw-extension-store.listing.placeholderSearchBar\')"\n                        />\n                    {% endblock %}\n                </template>\n            {% endblock %}\n\n            {% block sw_extension_store_index_slot_tabs %}\n                <template #page-tabs>\n                    {% block sw_extension_store_index_tabs %}\n                        {% block sw_extension_store_index_tabs_extensions_app %}\n                            <sw-tabs-item :route="{ name: \'sw.extension.store.listing.app\' }" :disabled="!isAvailable">\n                                {{ $tc(\'sw-extension-store.tabs.apps\') }}\n                            </sw-tabs-item>\n                        {% endblock %}\n\n                        {% block sw_extension_store_index_tabs_extensions_theme %}\n                            <sw-tabs-item :route="{ name: \'sw.extension.store.listing.theme\' }" :disabled="!isAvailable">\n                                {{ $tc(\'sw-extension-store.tabs.themes\') }}\n                            </sw-tabs-item>\n                        {% endblock %}\n                    {% endblock %}\n                </template>\n            {% endblock %}\n\n            {% block sw_extension_store_index_slot_default %}\n                <template #default>\n\n                    {% block sw_extension_store_index_loader %}\n                        <sw-loader v-if="isLoading"></sw-loader>\n                    {% endblock %}\n\n                    <template v-else>\n                        {% block sw_extension_store_index_content %}\n                            {% block sw_extension_store_index_content_view %}\n                                <router-view\n                                    v-if="isAvailable"\n                                    @extension-listing-errors="onExtensionListingError">\n                                </router-view>\n                            {% endblock %}\n\n                            {% block sw_extension_store_index_content_offline_warning %}\n                                <sw-extension-store-error-card\n                                    v-else-if="failReason === \'offline\'"\n                                    :title="$tc(\'sw-extension-store.offline.headline\')"\n                                    variant="danger"\n                                >\n                                    {{ $tc(\'sw-extension-store.offline.description\') }}\n                                </sw-extension-store-error-card>\n                            {% endblock %}\n\n                            {% block sw_extension_store_index_content_update_warning %}\n                                <sw-extension-store-update-warning v-else-if="failReason === \'outdated\'">\n                                </sw-extension-store-update-warning>\n                            {% endblock %}\n\n                            {% block sw_extension_store_index_content_listing_error %}\n                                <sw-extension-store-error-card\n                                    v-else\n                                    :title="listingError && listingError.title"\n                                    variant="danger"\n                                >\n                                    <template v-if="listingError">\n                                        {{ listingError.message }}\n                                    </template>\n                                </sw-extension-store-error-card>\n                            {% endblock %}\n                        {% endblock %}\n                    </template>\n                </template>\n            {% endblock %}\n        {% endblock %}\n    </sw-meteor-page>\n{% endblock %}\n',inject:["extensionStoreActionService","shopwareExtensionService","feature"],props:{id:{type:String,required:!1,default:null}},data:function(){return{isAvailable:!1,failReason:"",listingError:null,isLoading:!1}},computed:{storeSearchKey:function(){return this.$route.name},activeFilters:function(){return Shopware.State.get("shopwareExtensions").search.filter},searchValue:function(){return Shopware.State.get("shopwareExtensions").search.term},isTheme:function(){var e=this.$route.name.includes("theme");return e?"themes":"apps"}},watch:{isTheme:{immediate:!0,handler:function(e){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"page",value:1}),this.feature.isActive("VUE3")?this.activeFilters.group=e:this.$set(this.activeFilters,"group",e)}}},created:function(){this.createdComponent()},methods:{createdComponent:function(){this.checkStoreUpdates()},checkStoreUpdates:function(){var e,t=this;return(e=o().mark((function e(){var n;return o().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t.isLoading=!0,t.shopwareExtensionService.updateExtensionData(),e.next=4,t.getExtensionStore();case 4:if(n=e.sent){e.next=8;break}return t.isLoading=!1,e.abrupt("return");case 8:if(!t.isUpdateable(n)){e.next=13;break}return t.isAvailable=!1,t.failReason="outdated",t.isLoading=!1,e.abrupt("return");case 13:t.isAvailable=!0,t.isLoading=!1;case 15:case"end":return e.stop()}}),e)})),function(){var t=this,n=arguments;return new Promise((function(r,o){var a=e.apply(t,n);function s(e){i(a,r,o,s,c,"next",e)}function c(e){i(a,r,o,s,c,"throw",e)}s(void 0)}))})()},onExtensionListingError:function(e){var t=Shopware.Service("extensionErrorService").handleErrorResponse(e,this);this.isAvailable=!1,this.listingError=t&&t[0],this.failReason="listing_error"},getExtensionStore:function(){return this.extensionStoreActionService.getMyExtensions().then((function(e){return e.find((function(e){return"SwagExtensionStore"===e.name}))}))},isUpdateable:function(e){return!(!e||null===e.latestVersion)&&e.latestVersion!==e.version},updateSearch:function(e){Shopware.State.commit("shopwareExtensions/setSearchValue",{key:"term",value:e})}}}},ydqr:function(e,t,n){"use strict";function r(e,t){for(var n=[],r={},o=0;o<t.length;o++){var i=t[o],a=i[0],s={id:e+":"+o,css:i[1],media:i[2],sourceMap:i[3]};r[a]?r[a].parts.push(s):n.push(r[a]={id:a,parts:[s]})}return n}n.r(t),n.d(t,"default",(function(){return p}));var o="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!o)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var i={},a=o&&(document.head||document.getElementsByTagName("head")[0]),s=null,c=0,l=!1,u=function(){},f=null,h="data-vue-ssr-id",d="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function p(e,t,n,o){l=n,f=o||{};var a=r(e,t);return v(a),function(t){for(var n=[],o=0;o<a.length;o++){var s=a[o];(c=i[s.id]).refs--,n.push(c)}t?v(a=r(e,t)):a=[];for(o=0;o<n.length;o++){var c;if(0===(c=n[o]).refs){for(var l=0;l<c.parts.length;l++)c.parts[l]();delete i[c.id]}}}}function v(e){for(var t=0;t<e.length;t++){var n=e[t],r=i[n.id];if(r){r.refs++;for(var o=0;o<r.parts.length;o++)r.parts[o](n.parts[o]);for(;o<n.parts.length;o++)r.parts.push(m(n.parts[o]));r.parts.length>n.parts.length&&(r.parts.length=n.parts.length)}else{var a=[];for(o=0;o<n.parts.length;o++)a.push(m(n.parts[o]));i[n.id]={id:n.id,refs:1,parts:a}}}}function g(){var e=document.createElement("style");return e.type="text/css",a.appendChild(e),e}function m(e){var t,n,r=document.querySelector("style["+h+'~="'+e.id+'"]');if(r){if(l)return u;r.parentNode.removeChild(r)}if(d){var o=c++;r=s||(s=g()),t=b.bind(null,r,o,!1),n=b.bind(null,r,o,!0)}else r=g(),t=x.bind(null,r),n=function(){r.parentNode.removeChild(r)};return t(e),function(r){if(r){if(r.css===e.css&&r.media===e.media&&r.sourceMap===e.sourceMap)return;t(e=r)}else n()}}var y,w=(y=[],function(e,t){return y[e]=t,y.filter(Boolean).join("\n")});function b(e,t,n,r){var o=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=w(t,o);else{var i=document.createTextNode(o),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(i,a[t]):e.appendChild(i)}}function x(e,t){var n=t.css,r=t.media,o=t.sourceMap;if(r&&e.setAttribute("media",r),f.ssrId&&e.setAttribute(h,t.id),o&&(n+="\n/*# sourceURL="+o.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}}}]);
//# sourceMappingURL=13.js.map