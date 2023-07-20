const app = require('express')();
const path = require('path');
const fs = require('fs');
const env = require('../config/env.config');
const { response, logger } = require('../helpers');

app.get('/', (req, res) => response.OK({ res, message: `Welcome to ${env.PROJECT_NAME} backend APIz.`}));

const routes = fs.readdirSync(__dirname).filter((file) => file.endsWith('.router.js'));
const _routes = [];
for (let _r_ = 0; _r_ < routes.length; _r_++) {
  const route = `/${routes[_r_].split('.router.js')[0]}`.replace(/[a-z][A-Z]/g, (m) => `${m[0]}-${m[1]}`).replace('.', '-').toLowerCase();
  app.use(route, require(path.join(__dirname, routes[_r_])));
  _routes.push(route);
}

logger.info(`✔ ROUTES LOADED:
    ${_routes.map((route) => `> ${env.BASE_URL}${route}`).join('\n    ')}
`);

module.exports = app;
