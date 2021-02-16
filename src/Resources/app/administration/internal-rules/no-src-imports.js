"use strict";

module.exports = {
    create: function(context) {
        return {
            ImportDeclaration(node) {
                if (node.source.value.startsWith('src/')) {
                    context.report({
                        loc: node.source.loc.start,
                        message: 'Do not use imports from the Shopware Core'
                    })
                }
            }
        }
    }
}
