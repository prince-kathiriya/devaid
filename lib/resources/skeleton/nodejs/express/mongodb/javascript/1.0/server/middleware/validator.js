const { response, logger } = require('../helpers');
const env = require('../config/env.config');

const validator = (schema) => (req, res, next) => {
  const paths = Object.keys(schema);
  if (!paths.length) return next();
  if (!['body', 'query', 'params'].some(path => paths.includes(path)))
    return next();

  for (let path of paths) {
    const dataForValidation = req[path];
    const { value, error } = schema[path].validate(dataForValidation, {
      allowUnknown: false,
      stripUnknown: true,
      abortEarly: false,
    });
    if (error) {
      const context = error?.details;
      return response.BAD_REQUEST({
        res,
        message: `Validation failed for ${path}.`,
        payload: {
          context,
          fieldsAccepted: Object.keys(schema[path].describe().keys),
        },
      });
    }
    req[path] = value;
  }

  //! log params, query, body
  if (env.NODE_ENV === 'development' || env.LOG_REQUEST_DATA)
    logger.info(`[REQUEST-DATA] [ID: ${res.reqId}] [${res.method}] ${res.originalUrl} [CONTENT: ${JSON.stringify({ 
      params: req.params,
      query: req.query,
      body: req.body,
    }, null, 2)}]`);

  next();
};

const parseArray = (value, helper) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value === '') return [];
  if (Array.isArray(value)) return value;
  try {
    if (!Array.isArray(JSON.parse(value))) return helper.error('any.invalid');
    return JSON.parse(value);
  } catch (error) {
    return helper.error('any.invalid');
  }
};

const delimiterArray =
  ({
    delimiter = ',',
    pattern,
    isUnique = false,
    isRequired = false,
    length,
  } = {}) =>
  (value, helper) => {
    try {
      if (value === undefined || value === null || value === '')
        return helper.error('any.invalid');

      if (!Array.isArray(value)) value = value.split(delimiter);

      if (isUnique && new Set(value).size !== value.length)
        return helper.error('any.invalid');

      let i = 0;
      if (pattern) {
        const regex = new RegExp(pattern);
        if (value.some((item) => !regex.test(item)))
          return helper.error('any.invalid');
      }
      if (isRequired && value.length === 0) return helper.error('any.required');
      if (length && value.length !== length)
        return helper.message(`must have ${length} items`);
      return value;
    } catch (error) {
      return helper.error('any.invalid');
    }
  };

module.exports = {
  validator,
  parseArray,
  delimiterArray,
};
