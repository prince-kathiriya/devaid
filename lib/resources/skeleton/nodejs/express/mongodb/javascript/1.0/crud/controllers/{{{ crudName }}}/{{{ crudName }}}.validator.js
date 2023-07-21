const Joi = require("joi");
const validator = require("../../middleware/validator").validator;
module.exports = {
  create: validator({
    body: Joi.object({ {{{ joiSchemaWithRequired }}}
      isActive: Joi.boolean().default(true),
    }),
  }),

  update: validator({
    body: Joi.object({ {{{ joiSchemaWithoutRequired }}}
    }).min(1),
    params: Joi.object({
      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message("Invalid ID")
        .required(),
    }),
  }),

  fetch: validator({
    query: Joi.object({ {{{ joiSchemaWithoutRequired }}}

      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message("Invalid ID"),
      isAll: Joi.boolean(),
      isActive: Joi.boolean(),
      search: Joi.string()
        .allow("")
        .custom((value, helpers) => {
          const regexEscapeCharacter = /[\[\]\\()^$.\-|?*+{}]/g;
          if (regexEscapeCharacter.test(value))
            value = value.replace(regexEscapeCharacter, "\\$&");
          return value;
        }),
      page: Joi.number().default(1),
      limit: Joi.number().default(10),
      sortBy: Joi.string().default("createdAt"),
      sortOrder: Joi.string().default("desc"),
    }),
  }),

  toggleActiveStatus: validator({
    params: Joi.object({
      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message("Invalid ID")
        .required(),
    }),
  }),

  delete: validator({
    params: Joi.object({
      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message("Invalid ID")
        .required(),
    }),
  }),
};
