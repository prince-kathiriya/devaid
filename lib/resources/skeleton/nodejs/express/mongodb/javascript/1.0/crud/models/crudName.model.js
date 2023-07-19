const { Schema, model } = require("mongoose");

const {{{ crudNameCase.camelCase }}}Schema = new Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const {{{ crudNameCase.camelCase }}}Model = model("{{{ crudNameCase.camelCase }}}", {{{ crudNameCase.camelCase }}}Schema, "{{{ crudNameCase.camelCase }}}");

{{{ crudNameCase.camelCase }}}Model.syncIndexes().catch((error) => console.log(error));

module.exports = {{{ crudNameCase.camelCase }}}Model;