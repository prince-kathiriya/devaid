const { MulterError } = require('multer');
const { JsonWebTokenError, NotBeforeError, TokenExpiredError } = require('jsonwebtoken');
const {
  Error: {
    CastError,               StrictModeError,                OverwriteModelError,
    DivergentArrayError,     VersionError,                   ValidationError,
    DocumentNotFoundError,   MongooseServerSelectionError,   ValidatorError,
    MissingSchemaError,      StrictPopulateError,            ParallelSaveError,
  },
} = require('mongoose');

const { response, logger } = require('../helpers');
const { MESSAGE } = require('../helpers/constant.helper');

module.exports = async (error, req, res, next) => {
  if (error instanceof JsonWebTokenError || error instanceof NotBeforeError || error instanceof TokenExpiredError)
    response.UNAUTHORIZED({
      res,
      message: MESSAGE.UNAUTHORIZED,
      payload: { context: error.message },
    });

  else if (error instanceof MulterError)
    response.BAD_REQUEST({
      res,
      message: MESSAGE.FILE_UPLOAD_FAILED,
      payload: { context: error.code },
    });

  else if (
    error instanceof DivergentArrayError ||      error instanceof VersionError ||
    error instanceof DocumentNotFoundError ||    error instanceof MongooseServerSelectionError ||
    error instanceof MissingSchemaError ||       error instanceof StrictPopulateError ||
    error instanceof OverwriteModelError ||      error instanceof ValidationError ||
    error instanceof ParallelSaveError ||        error instanceof ValidatorError ||
    error instanceof StrictModeError ||          error instanceof CastError ||
    /Mongo/gi.test(error.name)
  ) {
    response.BAD_REQUEST({
      res,
      message: MESSAGE.FAILED,
      payload: { context: error.message },
    });
  }

  else if (/Stripe/gi.test(error.type))
    response.BAD_REQUEST({
      res,
      message: MESSAGE.FAILED,
      payload: { context: error.message },
    });

  else if (/entity.parse.failed/gi.test(error.type))
    response.BAD_REQUEST({
      res,
      message: MESSAGE.FAILED,
      payload: { context: error.message, error },
    });

  else  
    response.INTERNAL_SERVER_ERROR({
      res,
      message: MESSAGE.INTERNAL_SERVER_ERROR,
      payload: { context: error.message, error },
    });
  
  return logger.error(error);
};
