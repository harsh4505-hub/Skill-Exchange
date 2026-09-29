const server = require('../server');

module.exports = async (req, res) => {
    if (server.requestHandler) {
        return server.requestHandler(req, res);
    }
    return server.emit('request', req, res);
};
