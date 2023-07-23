const { hash } = require('bcryptjs');
const { Schema, model } = require('mongoose');
const { MESSAGE } = require('../helpers/constant.helper');
const env = require('../config/env.config');
const { logger } = require('../helpers');

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    firstName: String,
    lastName: String,
    mobile: String,
    password: String,
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') || this.isNew) 
      this.password = await hash(this.password,  10);
      
    next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const user = this;
    if (user._update && user._update.password) 
      user._update.password = await hash(user._update.password, (env.NODE_ENV === 'development' ? 1 : 10));
      next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

let userModel = model('User', userSchema, 'User');
module.exports = userModel;
