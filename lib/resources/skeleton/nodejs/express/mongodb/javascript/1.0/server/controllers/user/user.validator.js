const Joi = require('joi');
const ObjectId = require('mongoose').Types.ObjectId;

const validator = require('../../middleware/validator').validator;
const { ENUM: { ROLE } } = require('../../helpers/constant.helper');

module.exports = {
  signup: validator({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      mobile: Joi.string()
        .pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
        .message('Invalid mobile number')
        .required(),
      role: Joi.string().valid(...Object.values(ROLE)).default(ROLE.USER),
    }),
  }),

  signin: validator({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),

  sendOTP: validator({
    body: Joi.object({
      email: Joi.string().email().required(),
      expiryInMinutes: Joi.number().default(5),
    }),
  }),

  verifyOTP: validator({
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().required(),
    }),
  }),

  forgotPassword: validator({
    body: Joi.object({
      password: Joi.string().required(),
    }),
  }),

  updateProfile: validator({
    body: Joi.object({
      email: Joi.string().email(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      mobile: Joi.string()
        .pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
        .message('Invalid mobile number'),
    }).min(1),
  }),

  resetPassword: validator({
    body: Joi.object({
      currentPassword: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),

  fetch: validator({
    query: Joi.object({
      role: Joi.string().valid(...Object.values(ROLE)),
      email: Joi.string().email(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      mobile: Joi.string()
        .pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
        .message('Invalid mobile number'),

      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('Invalid ID')
        .custom((value, helpers) => new ObjectId(value)),
      isAll: Joi.boolean(),
      search: Joi.string(),
      page: Joi.number().default(1),
      limit: Joi.number().default(100),
      sortBy: Joi.string().default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    }),
  }),

  toggleActiveStatus: validator({
    params: Joi.object({
      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('Invalid ID')
        .required(),
    }),
  }),
};
