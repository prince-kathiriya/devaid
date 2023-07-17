const { logger } = require('../helpers');
const { randomBytes} = require('crypto');

module.exports = (req, res, next) => {
    res.reqId = randomBytes(4).toString('hex');
    res.reqReceiveTime = Date.now();
    const { method, originalUrl } = req;
    res.originalUrl = originalUrl;
    res.method = method;
    logger.info(`[REQUEST] [ID: ${res.reqId}] [${method}] ${originalUrl}`);
    next();
};