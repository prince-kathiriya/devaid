const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { ENUM: { ROLE } } = require('../helpers/constant.helper');

const { ROLE: { VALIDATOR, APIS } } = require('../controllers');

router.post(
  '/',
  auth({ usersAllowed: [ROLE.ADMIN] }),
  VALIDATOR.create,
  APIS.create
);

module.exports = router;
