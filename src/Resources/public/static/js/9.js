(this["webpackJsonpPluginswag-extension-store"]=this["webpackJsonpPluginswag-extension-store"]||[]).push([[9],{Vzch:function(e,t,i){},"Z+Bn":function(e,t,i){"use strict";i.r(t);i("bW4G"),t.default={template:'{% block sw_extension_store_slider %}\n    <div class="sw-extension-store-slider sw-meteor-card"\n         :class="[\n             cardClasses,\n             `sw-extension-store-slider__slides-count-${usedSlideCount}`\n         ]">\n        {% block sw_extension_store_slider_slides %}\n            <div class="sw-extension-store-slider__slides" ref="movingImageWrapper">\n                {% block sw_extension_store_slider_loader %}\n                    <div v-if="!images" class="sw-extension-store-slider__loader">\n                        <sw-loader></sw-loader>\n                    </div>\n                {% endblock %}\n\n                <template v-else>\n                    {% block sw_extension_store_slider_slide_item %}\n                        <div v-for="img, key in images"\n                             class="sw-extension-store-slider__slide-item"\n                             :class="slideClasses(key)"\n                             :data-key="key"\n                             :style="getActiveStyle(key)"\n                             :key="key">\n                            <img :src="img">\n                        </div>\n                    {% endblock %}\n                </template>\n            </div>\n        {% endblock %}\n\n        {% block sw_extension_store_slider_navigation %}\n            <div class="sw-extension-store-slider__navigation" v-if="images.length > usedSlideCount">\n                {% block sw_extension_store_slider_navigation_inner %}\n                    <button class="sw-extension-store-slider__btn-back" @click="previous()" :disabled="isDisabledPrevious">\n                        {% block sw_extension_store_slider_navigation_inner_icon_left %}\n                            <sw-icon name="regular-chevron-left" size="20"></sw-icon>\n                        {% endblock %}\n                    </button>\n\n                    <button class="sw-extension-store-slider__btn-next" @click="next()" :disabled="isDisabledNext">\n                        {% block sw_extension_store_slider_navigation_inner_icon_right %}\n                            <sw-icon name="regular-chevron-right" size="20"></sw-icon>\n                        {% endblock %}\n                    </button>\n                {% endblock %}\n            </div>\n        {% endblock %}\n    </div>\n{% endblock %}\n',props:{images:{type:Array,required:!0},infinite:{type:Boolean,required:!1,default:!1},slideCount:{type:Number,required:!1,default:2},large:{type:Boolean,required:!1,default:!1}},data:function(){return{activeImgIndex:0,lastActiveImgIndex:null,isDirectionRight:null}},computed:{cardClasses:function(){return{"sw-card--large":this.large}},lastActive:function(){return this.activeImgIndex+this.usedSlideCount-1},isDisabledNext:function(){return!this.isInfinite&&this.lastActive===this.images.length-1},isDisabledPrevious:function(){return!this.isInfinite&&0===this.activeImgIndex},sliderHasOneImageMoreThanTheSlideCount:function(){return this.images.length===this.usedSlideCount+1},isInfinite:function(){return!this.sliderHasOneImageMoreThanTheSlideCount&&this.infinite},usedSlideCount:function(){return this.slideCount>3?3:this.slideCount<1?1:this.slideCount}},methods:{getActiveStyle:function(e){if(!this.isActive(e))return{};var t=100/this.usedSlideCount;return null===this.isDirectionRight?{left:"".concat(e*t,"%")}:this.moveActiveImage(e,t)},moveActiveImage:function(e,t){if(e===this.activeImgIndex)return{left:"0%"};if(!this.$refs.movingImageWrapper)return{};var i=this.$refs.movingImageWrapper.querySelector('[data-key="'.concat(e,'"]')),n=parseInt(i.style.left,10);return Number.isNaN(n)?{left:"".concat(100-t,"%")}:{left:this.isDirectionRight?"".concat(n-t,"%"):"".concat(n+t,"%")}},next:function(){this.isDirectionRight=!0,this.changeSlide(1)},previous:function(){this.isDirectionRight=!1,this.changeSlide(-1)},changeSlide:function(e){if(this.lastActiveImgIndex=this.activeImgIndex,this.isInfinite){if(0===this.activeImgIndex&&!this.isDirectionRight)return void(this.activeImgIndex=this.images.length-1);if(this.activeImgIndex===this.images.length-1&&this.isDirectionRight)return void(this.activeImgIndex=0)}this.activeImgIndex+=e},isActive:function(e){for(var t=!1,i=0;i<this.usedSlideCount;i+=1){if(t)return!0;t=this.activeImgIndex+i===e}return t||this.lastActive>this.images.length-1&&e<=this.lastActive-this.images.length},isNext:function(e){var t=this.activeImgIndex+this.usedSlideCount;return t===e||t>this.images.length-1&&t-this.images.length===e},slideClasses:function(e){return this.sliderHasOneImageMoreThanTheSlideCount?{"is--previous":0===e&&!this.isActive(e),"is--next":this.images.length-1===e&&!this.isActive(e),"is--active":this.isActive(e)}:{"is--previous":this.activeImgIndex-1===e||0===this.activeImgIndex&&e===this.images.length-1,"is--active":this.isActive(e),"is--next":this.isNext(e)}}}}},bW4G:function(e,t,i){var n=i("Vzch");n.__esModule&&(n=n.default),"string"==typeof n&&(n=[[e.i,n,""]]),n.locals&&(e.exports=n.locals);(0,i("ydqr").default)("17c83198",n,!0,{})},ydqr:function(e,t,i){"use strict";function n(e,t){for(var i=[],n={},s=0;s<t.length;s++){var r=t[s],o=r[0],a={id:e+":"+s,css:r[1],media:r[2],sourceMap:r[3]};n[o]?n[o].parts.push(a):i.push(n[o]={id:o,parts:[a]})}return i}i.r(t),i.d(t,"default",(function(){return f}));var s="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!s)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var r={},o=s&&(document.head||document.getElementsByTagName("head")[0]),a=null,l=0,d=!1,c=function(){},u=null,h="data-vue-ssr-id",g="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function f(e,t,i,s){d=i,u=s||{};var o=n(e,t);return v(o),function(t){for(var i=[],s=0;s<o.length;s++){var a=o[s];(l=r[a.id]).refs--,i.push(l)}t?v(o=n(e,t)):o=[];for(s=0;s<i.length;s++){var l;if(0===(l=i[s]).refs){for(var d=0;d<l.parts.length;d++)l.parts[d]();delete r[l.id]}}}}function v(e){for(var t=0;t<e.length;t++){var i=e[t],n=r[i.id];if(n){n.refs++;for(var s=0;s<n.parts.length;s++)n.parts[s](i.parts[s]);for(;s<i.parts.length;s++)n.parts.push(p(i.parts[s]));n.parts.length>i.parts.length&&(n.parts.length=i.parts.length)}else{var o=[];for(s=0;s<i.parts.length;s++)o.push(p(i.parts[s]));r[i.id]={id:i.id,refs:1,parts:o}}}}function m(){var e=document.createElement("style");return e.type="text/css",o.appendChild(e),e}function p(e){var t,i,n=document.querySelector("style["+h+'~="'+e.id+'"]');if(n){if(d)return c;n.parentNode.removeChild(n)}if(g){var s=l++;n=a||(a=m()),t=I.bind(null,n,s,!1),i=I.bind(null,n,s,!0)}else n=m(),t=b.bind(null,n),i=function(){n.parentNode.removeChild(n)};return t(e),function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap)return;t(e=n)}else i()}}var _,x=(_=[],function(e,t){return _[e]=t,_.filter(Boolean).join("\n")});function I(e,t,i,n){var s=i?"":n.css;if(e.styleSheet)e.styleSheet.cssText=x(t,s);else{var r=document.createTextNode(s),o=e.childNodes;o[t]&&e.removeChild(o[t]),o.length?e.insertBefore(r,o[t]):e.appendChild(r)}}function b(e,t){var i=t.css,n=t.media,s=t.sourceMap;if(n&&e.setAttribute("media",n),u.ssrId&&e.setAttribute(h,t.id),s&&(i+="\n/*# sourceURL="+s.sources[0]+" */",i+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(s))))+" */"),e.styleSheet)e.styleSheet.cssText=i;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(i))}}}}]);