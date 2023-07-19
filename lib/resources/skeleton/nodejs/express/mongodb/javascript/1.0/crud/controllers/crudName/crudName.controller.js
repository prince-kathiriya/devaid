const { constants: { MESSAGE }, response, controller: controllerHelpers } = require("../../helpers");
const DB = require("../../models");

const helper = {
  generateSearchQuery: async ({ req }) => {
    let { skip, limit, sortBy, sortOrder, search, ...findCriteria } =
      controllerHelpers.generateMatchFilter({
        query: req.query,
        isPermanentDelete: false,
        regexFields: [],
        searchFields: ["name", "description"],
      });

    //! role based filters to be applied here
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
  create: async (req, res) => {
    const itemCreated = await DB.{{{ crudNameCase.upperCase }}}.create(req.body);
    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: itemCreated,
    });
  },

  fetch: async (req, res) => {
    const isValidFilter = controllerHelpers.checkFilterPermission({ 
      role: req.user.role, 
      filtersApplied: req.query,
      filtersNotAllowed: {
        [ROLE.ADMIN]: [],
        [ROLE.USER]: ['isActive', 'isAll'],
      }
    });
    if (!isValidFilter.isSuccess)
      return response.UNAUTHORIZED({ res, message: MESSAGE.UNAUTHORIZED, payload: { context: isValidFilter.message } });

    let { skip, limit, sortBy, sortOrder, findCriteria } =
      await helper.generateSearchQuery({ req });
    const data = await DB.{{{ crudNameCase.upperCase }}}.find(findCriteria)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });
    const count = await DB.{{{ crudNameCase.upperCase }}}.countDocuments(findCriteria);

    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: { count, data },
    });
  },

  update: async (req, res) => {
    const updatedItem = await DB.{{{ crudNameCase.upperCase }}}.findOneAndUpdate(
      { _id: req.params._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedItem)
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });

    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: updatedItem,
    });
  },

  toggleActiveStatus: async (req, res) => {
    const updatedItem = await DB.{{{ crudNameCase.upperCase }}}.findOneAndUpdate(
      { _id: req.params._id },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
    if (!updatedItem)
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });
    await DB.DESIGN.updateMany(
      { {{{ crudNameCase.upperCase }}}Id: req.params._id },
      { $set: { isActive: updatedItem.isActive } }
    );
    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: updatedItem,
    });
  },

  delete: async (req, res) => {
    const deletedItem = await DB.{{{ crudNameCase.upperCase }}}.findByIdAndDelete(req.params._id);
    if (!deletedItem)
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });
    await DB.DESIGN.deleteMany({ {{{ crudNameCase.upperCase }}}Id: req.params._id });
    return response.OK({ res, message: MESSAGE.SUCCESS });
  },
};

module.exports = { helper, controllers };