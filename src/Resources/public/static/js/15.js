(this["webpackJsonpPluginswag-extension-store"]=this["webpackJsonpPluginswag-extension-store"]||[]).push([[15],{unAY:function(e,n,s){"use strict";s.r(n);n.default={template:"{% block sw_extension_type_label %}\n    <div>\n        {% block sw_extension_type_label_self_hosted %}\n            <sw-extension-label>\n                {{ $tc('sw-extension-store.typeLabels.self-hosted') }}\n            </sw-extension-label>\n        {% endblock %}\n\n        {% block sw_extension_type_label_cloud %}\n            <sw-extension-label v-if=\"isApp\"\n                class=\"sw-extension-type-label__cloud-label\">\n                {{ $tc('sw-extension-store.typeLabels.cloud') }}\n            </sw-extension-label>\n        {% endblock %}\n    </div>\n{% endblock %}\n",props:{type:{type:String,required:!0,validator:function(e){return["app","plugin"].includes(e)}}},computed:{isApp:function(){return"app"===this.type}}}}}]);