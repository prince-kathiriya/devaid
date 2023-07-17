const { Schema, model } = require('mongoose');

const { ENUM: { ROLE } } = require('../helpers/constant.helper');

let roleSchema = new Schema(
  {
    name: {
      type: String,
      enum: { values: [...Object.values(ROLE)], message: 'Invalid role' },
      unique: true,
      message: 'please enter valid role name or role already exist',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

let roleModel = model('role', roleSchema, 'role');

module.exports = roleModel;
