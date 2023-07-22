//! This is used so that you don't have to use try catch in every controller
//! It will catch all the errors and pass it to the error handler middleware
require('express-async-errors');

const express = require('express');
const path = require('path');

const env = require('./config/env.config')
const app = express();

app.use(require('./middleware/request.logger'));
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(require('cors')({ origin: '*' }));
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: false }));

app.use(env.BASE_URL, require('./routes/index'));

app.use((req, res) =>
  require('./helpers').response.NOT_FOUND({ res, message: require('./helpers/constant.helper').MESSAGE.INVALID_ROUTE })
);

//! This is used to handle all the errors that are thrown
app.use(require('./middleware/error.handler'));

module.exports = app;