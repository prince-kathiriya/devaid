const DB = require('../../models');
const { MESSAGE } = require('../../helpers/constant.helper');
const { response } = require('../../helpers');

const helpers = {};

const controllers = {
  create: async (req, res) => {
    //! check if role already exists by name
    const roleExists = await DB.ROLE.findOne({ name: req.body.name });
    if (roleExists) return response.DUPLICATE_VALUE({ res, message: MESSAGE.ALREADY_EXISTS, payload: { name: req.body.name } });
    
    //! create role
    await DB.ROLE.create(req.body);

    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: req.body,
    });
  },
};

module.exports = { helpers, controllers };