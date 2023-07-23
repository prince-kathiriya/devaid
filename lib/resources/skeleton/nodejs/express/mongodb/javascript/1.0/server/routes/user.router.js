const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { USER: { VALIDATOR, APIS } } = require('../controllers');
const upload = require('../services/file/file.upload');

router.get('/', auth({ usersAllowed: ['*'] }), VALIDATOR.fetch, APIS.fetch);

router.post('/signup', VALIDATOR.signup, APIS.signup);
router.post('/signin', VALIDATOR.signin, APIS.signin);
router.post('/send-otp', VALIDATOR.sendOTP, APIS.sendOTP);
router.post('/verify-otp', VALIDATOR.verifyOTP, APIS.verifyOTP);

router.put(
  '/reset-password',
  auth({ usersAllowed: ['*'] }),
  VALIDATOR.resetPassword,
  APIS.resetPassword
);

router.put(
  '/forgot-password',
  auth({ usersAllowed: ['*'] }),
  VALIDATOR.forgotPassword,
  APIS.forgotPassword
);

router.put(
  '/update-profile',
  auth({ usersAllowed: ['*'] }),
  VALIDATOR.updateProfile,
  APIS.updateProfile
);

router.patch(
  '/:_id',
  auth({}),
  VALIDATOR.toggleActiveStatus,
  APIS.toggleActiveStatus
);

module.exports = router;
