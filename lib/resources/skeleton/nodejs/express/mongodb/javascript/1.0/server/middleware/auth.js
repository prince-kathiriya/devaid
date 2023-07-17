const jwt = require('jsonwebtoken');

const DB = require('../models');
const { MESSAGE, ENUM: { ROLE } } = require('../helpers/constant.helper');
const { response } = require('../helpers');
const env = require('../config/env.config');
const { logger } = require('../helpers');

module.exports = {
  auth: ({ isTokenRequired = true, usersAllowed = [] } = {}) => {
    return async (req, res, next) => {
      //! get token from request header and remove Bearer from it
      let token = (req.header('x-auth-token') || req.header('Authorization'))?.replace(/Bearer +/g, '');
      
      //! check if token is required and token is present in the request header or not
      if (isTokenRequired && !token)
        return response.BAD_REQUEST({
          res,
          message: MESSAGE.TOKEN_REQUIRED,
        });
      if (!isTokenRequired && !token) return next();

      //! decode token and get user details from it
      let decoded = jwt.verify(token, env.JWT_SECRET);
      
      //! log decoded token details
      logger.info(`[DECODED] [ID: ${res.reqId}] [${res.method}] ${res.originalUrl} [CONTENT: ${JSON.stringify(decoded)}]`);

      //! check if token is valid or not
      if (!decoded?._id && !decoded.email) {
        return response.UNAUTHORIZED({
          res,
          message: MESSAGE.INVALID_TOKEN,
        });
      }

      //! get user details from database
      let user = await DB.USER.findOne({
        ...(decoded._id && { _id: decoded._id }),
        ...(decoded.email && { email: decoded.email }),
      }).populate('roleId').lean();

      //! check if user is deleted or not
      if (!user)
        return response.UNAUTHORIZED({ res, message: MESSAGE.INVALID_TOKEN });
      
      //! check if user is active or not
      if (!user.isActive)
        return response.UNAUTHORIZED({ res, message: MESSAGE.ACCOUNT_DISABLED });

      //! set user details in request object
      req.user = { ...decoded, _id: user._id.toString(), role: user.roleId.name };

      //! check if user is allowed to access the route or not
      if (req.user.role === ROLE.ADMIN || usersAllowed.includes('*')) return next()
      if (usersAllowed.includes(req.user.role)) return next();
      return response.UNAUTHORIZED({ res, message: MESSAGE.UNAUTHORIZED });
    };
  },
};
