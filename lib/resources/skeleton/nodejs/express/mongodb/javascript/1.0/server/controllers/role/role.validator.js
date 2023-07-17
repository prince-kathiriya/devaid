const Joi = require('joi');

const validator = require('../../middleware/validator').validator;

module.exports = {
  create: validator({
    body: Joi.object({
      name: Joi.string().lowercase().trim().required(),
      description: Joi.string().trim(),
    }),
  }),
};
