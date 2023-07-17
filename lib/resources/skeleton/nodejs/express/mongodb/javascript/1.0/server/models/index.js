const path = require('path');
const fs = require('fs');

const { logger } = require('../helpers');
const DB = {};

const models = fs.readdirSync(__dirname).filter((file) => file.endsWith('.model.js'));

for (let _m_ = 0; _m_ < models.length; _m_++) {
  const model = require(path.join(__dirname, models[_m_]));
  DB[model.modelName.toUpperCase()] = model;
}

logger.info(`✔ MODELS LOADED: 
    ${Object.keys(DB).map((key) => `> ${key}`).join('\n    ')}
`);

module.exports = DB;
