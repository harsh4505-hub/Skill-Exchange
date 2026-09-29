const server = require('../server');

module.exports = async (req, res) => {
    // Normalise Vercel URL when routed to this serverless function
    const originalUrl = (req.headers && (req.headers['x-forwarded-uri'] || req.headers['x-matched-path'])) || req.url;
    if (originalUrl === '/api/index.js' || originalUrl === '/api/index' || originalUrl === '/api') {
        req.url = '/';
    } else if (originalUrl) {
        req.url = originalUrl;
    }

    if (server.requestHandler) {
        return server.requestHandler(req, res);
    }
    return server.emit('request', req, res);
};
