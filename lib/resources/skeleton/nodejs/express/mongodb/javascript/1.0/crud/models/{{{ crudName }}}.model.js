const { Schema, model } = require("mongoose");

const {{{ crudNameCase.camelCase }}}Schema = new Schema(
  {{{ model }}},
  {
    timestamps: true,
    versionKey: false,
  }
);


const {{{ crudNameCase.camelCase }}}Model = model("{{{ crudNameCase.pascalCase }}}", {{{ crudNameCase.camelCase }}}Schema, "{{{ crudNameCase.pascalCase }}}");

module.exports = {{{ crudNameCase.camelCase }}}Model;