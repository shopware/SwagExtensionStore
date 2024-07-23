"use strict";

module.exports = {
    create: function(context) {
        return {
            ImportDeclaration(node) {
                // allow src imports in tests
                if ((new RegExp('\\.spec\\.(vue3\\.)?[t|j]s')).test(context.getFilename())) {
                    return;
                }

                if (node.source.value.startsWith('src/') && node.source.parent.importKind !== 'type') {
                    context.report({
                        loc: node.source.loc.start,
                        message: 'Do not use imports from the Shopware Core'
                    })
                }
            }
        }
    }
}
