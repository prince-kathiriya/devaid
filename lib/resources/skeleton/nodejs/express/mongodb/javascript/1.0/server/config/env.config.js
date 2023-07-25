const Joi = require('joi');
require('dotenv').config();

const { logger } = require('../helpers');

const envschema = Joi.object({
  PROJECT_NAME: Joi.string().trim().required(),
  NODE_ENV: Joi.string().trim().required(),
  LOG_REQUEST_DATA: Joi.boolean(),
  PORT: Joi.number().required(),

  JSON_BODY_LIMIT: Joi.string().trim().required(),
  
  MONGODB_URI: Joi.string().trim().required(),
  BASE_URL: Joi.string().trim().default(`/${process.env.NODE_ENV === 'development' ? `${process.env.PROJECT_NAME}/` : ''}api/v1`),
  
  JWT_SECRET: Joi.string().trim().required(),
  JWT_EXPIRES_IN: Joi.string().trim().required().custom((value, helpers) => {
    //! return value in seconds [number]
    if (!isNaN(value)) return value;
    if (value.includes('d')) return +value.replace('d', '') * 24 * 60 * 60;
    if (value.includes('h')) return +value.replace('h', '') * 60 * 60;
    if (value.includes('m')) return +value.replace('m', '') * 60;
    if (value.includes('s')) return +value.replace('s', '');
    return helpers.error('any.invalid');
  }, 'custom validation'),
  
  EMAIL_USER: Joi.string().trim().required(),
  EMAIL_PASSWORD: Joi.string().trim().required(),
  EMAIL_HOST: Joi.string().trim().required(),
  EMAIL_PORT: Joi.number().required(),
  
  ACCESSKEYID: Joi.string().trim(),
  SECRET_KEY: Joi.string().trim(),
  REGION: Joi.string().trim(),
  BUCKET: Joi.string().trim(),
});

const { value: vars, error } = envschema.validate(process.env, { allowUnknown: false, stripUnknown: true, abortEarly: false });

if (error) {
  logger.error('✘ ENV VARIABLE(S) MISSING');
  throw new Error(error); //! this will stop the server if any env variable is missing
}
else logger.info(`✔ ENV VARIABLES LOADED`);

module.exports = vars;