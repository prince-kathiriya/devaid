const { Schema, model } = require("mongoose");

const {{{ crudNameCase.camelCase }}}Schema = new Schema(
  {{{ model }}},
  {
    timestamps: true,
    versionKey: false,
  }
);


const {{{ crudNameCase.camelCase }}}Model = model("{{{ crudNameCase.pascalCase }}}", {{{ crudNameCase.camelCase }}}Schema, "{{{ crudNameCase.pascalCase }}}");

{{{ crudNameCase.camelCase }}}Model.syncIndexes().catch((error) => console.log(error));

module.exports = {{{ crudNameCase.camelCase }}}Model;