const path = require('path');

module.exports = () => {
    return {
        resolve: {
            alias: {
                SwagExtensionStore: path.join(__dirname, '..', 'src')
            }
        }
    };
};
