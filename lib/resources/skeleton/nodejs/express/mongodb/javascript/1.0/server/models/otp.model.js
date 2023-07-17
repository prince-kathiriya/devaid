const { Schema, model } = require('mongoose');

const { ENUM: { ROLE } } = require('../helpers/constant.helper');

let otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

let otpModel = model('otp', otpSchema, 'otp');

module.exports = otpModel;
