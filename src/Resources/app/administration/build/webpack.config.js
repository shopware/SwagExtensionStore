const path = require('path');

module.exports = () => {
    return {
        optimization: {
            moduleIds: 'named',
        },
        resolve: {
            alias: {
                SwagExtensionStore: path.join(__dirname, '..', 'src')
            }
        }
    };
};
