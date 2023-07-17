const { ENUM: { HTTP_CODES } } = require('../helpers/constant.helper');
const logger = require('./logger.helper');
const { formatTime } = require('./common.helper');

function responseLogger({ res, message, statusCode }) {
  const { method, originalUrl } = res;
  const responseTime = formatTime(Date.now() - res.reqReceiveTime);
  const log = `[RESPONSE] [ID: ${res.reqId}] [${method}] ${originalUrl} [STATUS: ${statusCode}] [RESPONSE TIME: '${responseTime}']\n[RESPONSE MESSAGE: '${message}']`;
  logger[statusCode >= 400 && statusCode < 500 ? 'warn' : statusCode >= 500 ? 'error' : 'info'](log);
}

const response = {
  BAD_REQUEST({ res, message = 'Bad request', payload = {} } = {}) {
    res.status(HTTP_CODES.BAD_REQUEST).json({
      success: false,
      message,
      payload,
    });
  },

  DUPLICATE_VALUE({ res, message = 'Duplicate value', payload = {} } = {}) {
    res.status(HTTP_CODES.DUPLICATE_VALUE).json({
      success: false,
      message,
      payload,
    });
  },

  FORBIDDEN({ res, message = 'Forbidden', payload = {} } = {}) {
    res.status(HTTP_CODES.FORBIDDEN).json({
      success: false,
      message,
      payload,
    });
  },

  INTERNAL_SERVER_ERROR({ res, message = 'Internal server error', payload = {} } = {}) {
    let responseCode = HTTP_CODES.INTERNAL_SERVER_ERROR;
    res.status(responseCode).json({
      success: false,
      message,
      payload,
    });
  },

  METHOD_NOT_ALLOWED({ res, message = 'Method not allowed', payload = {} } = {}) {
    res.status(HTTP_CODES.METHOD_NOT_ALLOWED).json({
      success: false,
      message,
      payload,
    });
  },

  MOVED_PERMANENTLY({ res, message = 'Moved permanently', payload = {} } = {}) {
    res.status(HTTP_CODES.MOVED_PERMANENTLY).json({
      success: false,
      message,
      payload,
    });
  },

  NOT_ACCEPTABLE({ res, message = 'Not acceptable', payload = {} } = {}) {
    res.status(HTTP_CODES.NOT_ACCEPTABLE).json({
      success: false,
      message,
      payload,
    });
  },

  NOT_FOUND({ res, message = 'Not found', payload = {} } = {}) {
    res.status(HTTP_CODES.NOT_FOUND).json({
      success: false,
      message,
      payload,
    });
  },

  NO_CONTENT_FOUND({ res, message = 'No content found', payload = {} } = {}) {
    res.status(HTTP_CODES.NO_CONTENT_FOUND).json({
      success: false,
      message,
      payload,
    });
  },

  OK({ res, message = 'OK', payload = {} } = {}) {
    res.status(HTTP_CODES.OK).json({
      success: true,
      message,
      payload,
    });
  },

  PERMANENT_REDIRECT({ res, message = 'Permanent redirect', payload = {} } = {}) {
    res.status(HTTP_CODES.PERMANENT_REDIRECT).json({
      success: false,
      message,
      payload,
    });
  },

  UNAUTHORIZED({ res, message = 'Unauthorized', payload = {} } = {}) {
    res.status(HTTP_CODES.UNAUTHORIZED).json({
      success: false,
      message,
      payload,
    });
  },

  UPGRADE_REQUIRED({ res, message = 'Upgrade required', payload = {} } = {}) {
    res.status(HTTP_CODES.UPGRADE_REQUIRED).json({
      success: false,
      message,
      payload,
    });
  },

  VALIDATION_ERROR({ res, message = 'Validation error', payload = {} } = {}) {
    res.status(HTTP_CODES.VALIDATION_ERROR).json({
      success: false,
      message,
      payload,
    });
  },
};

for (const key in response) {
  const fn = response[key];
  response[key] = (args) => {
    responseLogger({ ...args, statusCode: HTTP_CODES[key] })
    fn(args);
  }
}

module.exports = response;