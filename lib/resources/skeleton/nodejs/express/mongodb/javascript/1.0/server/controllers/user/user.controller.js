const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { response, controller: controllerHelpers } = require('../../helpers');
const { MESSAGE, ENUM: { ROLE } } = require('../../helpers/constant.helper');
const mailService = require('../../services/mail/mail.service');
const env = require('../../config/env.config');
const DB = require('../../models');

const helpers = {
  generateToken: ({ data, expiresIn = env.JWT_EXPIRES_IN }) => {
    return jwt.sign(data, env.JWT_SECRET, { expiresIn });
  },

  decodeToken: ({ token }) => {
    return jwt.verify(token, env.JWT_SECRET);
  },

  comparePassword: async ({ password, hash }) => {
    return await bcrypt.compare(password, hash);
  },

  generateSearchQuery: async ({ req }) => {
    //* search by role name if role is passed in query
    if (req.query.role) {
      const { _id } = await DB.ROLE.findOne({ name: req.query.role }).lean() || {};
      req.query.roleId = _id;
      delete req.query.role;
    }

    //* generate search query from query params
    let { skip, limit, sortBy, sortOrder, ...findCriteria } =
      controllerHelpers.generateMatchFilter({
        query: req.query,
        regexFields: ['email', 'firstName', 'lastName', 'mobile'],
        searchFields: ['email', 'firstName', 'lastName', 'mobile'],
      });
    
    //* role based filters to be applied here
    switch (req?.user?.role) {
      case ROLE.ADMIN:
        findCriteria['$and'] = [
          ...(findCriteria['$and'] ? findCriteria['$and'] : []),
          { _id: { $ne: req.user._id } },
        ];
        break;

      case ROLE.USER:
        findCriteria['$and'] = [
          ...(findCriteria['$and'] ? findCriteria['$and'] : []),
          { _id: req.user._id },
        ];
        break;

      default: break;
    }
    
    return { skip, limit, sortBy, sortOrder, findCriteria };
  },
};

const controllers = {

  signup: async (req, res) => {
    //* check if email already exists
    if (await DB.USER.findOne({ email: req.body.email }))
      return response.BAD_REQUEST({
        res,
        message: MESSAGE.ALREADY_EXISTS,
        payload: { email: req.body.email },
      });


    //* check if mobile already exists
    if (await DB.USER.findOne({ mobile: req.body.mobile }))
      return response.BAD_REQUEST({
        res,
        message: MESSAGE.ALREADY_EXISTS,
        payload: { mobile: req.body.mobile },
      });


    //* check if role exists 
    const role = await DB.ROLE.findOne({ name: req.body.role }).lean();
    if (!role)
      return response.NOT_FOUND({ res, message: MESSAGE.INVALID_ROLE });
    req.body.roleId = role._id;


    //* create user
    await DB.USER.create(req.body);


    //* call signin controller which will return token
    return await controllers.signin(req, res);
  },

  signin: async (req, res) => {
    //* check if user exists by email
    const user = await DB.USER.findOne({ email: req.body.email })
      .populate('roleId')
      .lean();
    if (!user)
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });


    //* check if user is active or not
    if (!user.isActive)
      return response.BAD_REQUEST({ res, message: MESSAGE.NOT_ACTIVE });


    //* check if password is correct
    const isPasswordMatch = await helpers.comparePassword({
      password: req.body.password,
      hash: user.password,
    });
    if (!isPasswordMatch)
      return response.BAD_REQUEST({
        res,
        message: MESSAGE.INVALID_PASSWORD,
      });


    //* generate token
    const token = helpers.generateToken({
      data: { _id: user._id, role: user.roleId.name },
    });


    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
        role: user.roleId.name,
        token,
      },
    });
  },

  sendOTP: async (req, res) => {
    //* check if user exists by email
    const user = await DB.USER.findOne({ email: req.body.email });


    let name = null;
    //* if user does not exist, then get name from email
    if (!user) 
      name = `${req.body.email.split('@')[0]}`;
    //* if user exists, then get name from user
    else 
      name = `${user.firstName || ''} ${user.lastName || ''}`;


    let otp = null;
    //* check if otp already exists
    const otpExists = await DB.OTP.findOne({ email: req.body.email, expiryDate: { $gt: new Date() } });

    if (otpExists) {
      //* if otp exists and is not expired, then use that same otp
      otp = otpExists.otp;

      //* update expiry date of otp
      otpExists.expiryDate = new Date(Date.now() + req.body.expiryInMinutes * 60 * 1000);
      await otpExists.save();

    } else {
      //* generate random otp of 6 digits
      otp = Math.floor(100000 + Math.random() * 900000);


      //* delete all old otps for this email
      await DB.OTP.deleteMany({ email: req.body.email });


      //* create new otp
      await DB.OTP.create({
        email: req.body.email,
        otp,
        expiryDate: new Date(Date.now() + req.body.expiryInMinutes * 60 * 1000),
      });
    }

    //* send otp to email
    await mailService.sendOTP({
      email: req.body.email,
      name,
      otp,
    });

    return response.OK({ res, message: MESSAGE.SUCCESS });
  },

  verifyOTP: async (req, res) => {
    //* check if otp exists by email
    const otp = await DB.OTP.findOne({ email: req.body.email }).lean();
    if (!otp)
      return response.BAD_REQUEST({ res, message: MESSAGE.NOT_FOUND });


    //* check if otp is expired or not
    if (otp.expiryDate < new Date())
      return response.BAD_REQUEST({ res, message: MESSAGE.OTP_EXPIRED });


    //* check if otp is correct or not
    if (otp.otp !== req.body.otp)
      return response.BAD_REQUEST({ res, message: MESSAGE.INVALID_OTP });


    //* generate verification token
    const token = helpers.generateToken({
      data: { email: req.body.email, otp: req.body.otp },
      expiresIn: '5m',
    });


    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: { token },
    });
  },

  forgotPassword: async (req, res) => {
  //* this controller is used to set password after verifying otp
  //* it should be passed with token generated in verifyOTP controller


    //* check if user exists in req.user
    if (!req.user.email)
      return response.BAD_REQUEST({ res, message: MESSAGE.INVALID_TOKEN });


    //* check if otp exists by email
    const user = await DB.OTP.findOne({ email: req.user.email });
    if (!user)
      return response.BAD_REQUEST({ res, message: MESSAGE.TOKEN_ALREADY_USED });


    //* when updating password, make sure to use findOneAndUpdate
    //* as pre save hook used to hash password will not work with other methods
    await DB.USER.findOneAndUpdate(
      { _id: req.user._id },
      { password: req.body.password }
    );


    //* delete all otps for this email after setting password
    await DB.OTP.deleteMany({ email: req.user.email });


    return response.OK({ res, message: MESSAGE.SUCCESS });
  },

  updateProfile: async (req, res) => {
    //* update user profile
    const user = await DB.USER.findOneAndUpdate(
      { _id: req.user._id }, req.body,
      { new: true, runValidators: true }
    );
    return response.OK({ res, message: MESSAGE.SUCCESS, payload: user });
  },

  resetPassword: async (req, res) => {
  //* this controller is used to reset password after verifying current password
  
    //* check if current password is correct for logged in user
    const user = await DB.USER.findById(req.user._id).lean();
    if (
      !(await helpers.comparePassword({
        password: req.body.currentPassword,
        hash: user.password,
      }))
    )
      return response.BAD_REQUEST({
        res,
        message: MESSAGE.INVALID_PASSWORD,
      });


    await DB.USER.findOneAndUpdate(
      { _id: req.user._id },
      { password: req.body.password }
    );


    return response.OK({ res, message: MESSAGE.SUCCESS });
  },

  fetch: async (req, res) => {
    const isValidFilter = controllerHelpers.checkFilterPermission({ 
      role: req.user.role, 
      filtersApplied: req.query,
      filtersNotAllowed: {
        [ROLE.ADMIN]: [],
        [ROLE.USER]: ['role', '_id', 'isActive', 'isAll'],
      }
    });
    if (!isValidFilter.isSuccess)
      return response.UNAUTHORIZED({ res, message: MESSAGE.UNAUTHORIZED, payload: { context: isValidFilter.message } });


    let { skip, limit, sortBy, sortOrder, findCriteria } = 
      await helpers.generateSearchQuery({ req });


    const data = await DB.USER.find(findCriteria)
      .select({ password: 0, roleId: 0, __v: 0, ...(!findCriteria.isAll && { isActive: 0 }) })
      .sort({ [sortBy]: sortOrder })
      .skip(skip).limit(limit)
      .lean();
    const count = await DB.USER.countDocuments(findCriteria);


    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: { count, data },
    });
  },

  toggleActiveStatus: async (req, res) => {
    //* if user is active, make it inactive and vice versa
    const updatedItem = await DB.USER.findOneAndUpdate(
      { _id: req.params._id },
      [{ $set: { isActive: { $not: '$isActive' } } }],
      { new: true }
    );

    if (!updatedItem)
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND, payload: { _id: req.params._id } });


    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: updatedItem,
    });
  },
};

module.exports = {
  helpers,
  controllers,
};
