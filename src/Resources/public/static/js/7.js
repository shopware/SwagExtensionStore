(this["webpackJsonpPluginswag-extension-store"]=this["webpackJsonpPluginswag-extension-store"]||[]).push([[7],{"77t3":function(e,t,n){"use strict";n.r(t);n("RWFN"),t.default={template:"{% block sw_extension_label %}\n    <div class=\"sw-extension-label\" :style=\"{ 'background-color': backgroundColor, 'color': determineTextColor(backgroundColor) }\">\n        {% block sw_extension_label_slot %}\n            <slot></slot>\n        {% endblock %}\n    </div>\n{% endblock %}\n",props:{backgroundColor:{type:String,required:!1,default:"#29333dbf"}},methods:{determineTextColor:function(e){if(!e)return"#000";var t="#"===e.charAt(0)?e.substring(1,7):e;return.299*parseInt(t.substring(0,2),16)+.587*parseInt(t.substring(2,4),16)+.114*parseInt(t.substring(4,6),16)>186?"#000":"#fff"}}}},"P+7J":function(e,t,n){},RWFN:function(e,t,n){var r=n("P+7J");r.__esModule&&(r=r.default),"string"==typeof r&&(r=[[e.i,r,""]]),r.locals&&(e.exports=r.locals);(0,n("ydqr").default)("0c92cfdc",r,!0,{})},ydqr:function(e,t,n){"use strict";function r(e,t){for(var n=[],r={},s=0;s<t.length;s++){var o=t[s],a=o[0],i={id:e+":"+s,css:o[1],media:o[2],sourceMap:o[3]};r[a]?r[a].parts.push(i):n.push(r[a]={id:a,parts:[i]})}return n}n.r(t),n.d(t,"default",(function(){return h}));var s="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!s)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var o={},a=s&&(document.head||document.getElementsByTagName("head")[0]),i=null,l=0,d=!1,u=function(){},c=null,f="data-vue-ssr-id",p="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function h(e,t,n,s){d=n,c=s||{};var a=r(e,t);return g(a),function(t){for(var n=[],s=0;s<a.length;s++){var i=a[s];(l=o[i.id]).refs--,n.push(l)}t?g(a=r(e,t)):a=[];for(s=0;s<n.length;s++){var l;if(0===(l=n[s]).refs){for(var d=0;d<l.parts.length;d++)l.parts[d]();delete o[l.id]}}}}function g(e){for(var t=0;t<e.length;t++){var n=e[t],r=o[n.id];if(r){r.refs++;for(var s=0;s<r.parts.length;s++)r.parts[s](n.parts[s]);for(;s<n.parts.length;s++)r.parts.push(b(n.parts[s]));r.parts.length>n.parts.length&&(r.parts.length=n.parts.length)}else{var a=[];for(s=0;s<n.parts.length;s++)a.push(b(n.parts[s]));o[n.id]={id:n.id,refs:1,parts:a}}}}function v(){var e=document.createElement("style");return e.type="text/css",a.appendChild(e),e}function b(e){var t,n,r=document.querySelector("style["+f+'~="'+e.id+'"]');if(r){if(d)return u;r.parentNode.removeChild(r)}if(p){var s=l++;r=i||(i=v()),t=C.bind(null,r,s,!1),n=C.bind(null,r,s,!0)}else r=v(),t=x.bind(null,r),n=function(){r.parentNode.removeChild(r)};return t(e),function(r){if(r){if(r.css===e.css&&r.media===e.media&&r.sourceMap===e.sourceMap)return;t(e=r)}else n()}}var m,y=(m=[],function(e,t){return m[e]=t,m.filter(Boolean).join("\n")});function C(e,t,n,r){var s=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=y(t,s);else{var o=document.createTextNode(s),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(o,a[t]):e.appendChild(o)}}function x(e,t){var n=t.css,r=t.media,s=t.sourceMap;if(r&&e.setAttribute("media",r),c.ssrId&&e.setAttribute(f,t.id),s&&(n+="\n/*# sourceURL="+s.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(s))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}}}]);