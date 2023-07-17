const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connect = new Promise((resolve, reject) =>
  mongoose
    .connect(require('./env.config').MONGODB_URI)
    .then(() => resolve(mongoose.connection))
    .catch((error) => reject(error))
);

module.exports = connect;
