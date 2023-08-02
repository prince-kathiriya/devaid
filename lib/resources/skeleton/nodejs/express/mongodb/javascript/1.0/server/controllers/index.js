const path = require('path');
const fs = require('fs');

const { logger } = require('../helpers');
const _exports = {};

const dirs = fs.readdirSync(__dirname).filter((file) => file !== 'index.js');
for (let _d_ = 0; _d_ < dirs.length; _d_++) {
  const dir = dirs[_d_];
  _exports[dir.replace(/[a-z][A-Z]/g, (m) => `${m[0]}_${m[1]}`).replace(/\./g, '_').toUpperCase()]
  = {
    APIS: require(path.join(__dirname, dir, `${dir}.controller`)).controllers,
    VALIDATOR: require(path.join(__dirname, dir, `${dir}.validator`)),
  };
}
logger.info(`✔ CONTROLLER AND VALIDATOR LOADED: 
    ${Object.keys(_exports).map((key) => `> ${key}`).join('\n    ')}
`);

module.exports = _exports;