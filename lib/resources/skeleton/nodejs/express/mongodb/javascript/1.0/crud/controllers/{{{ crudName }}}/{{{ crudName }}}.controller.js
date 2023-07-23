const { constants: { MESSAGE, ENUM: { ROLE } }, response, controller: controllerHelpers } = require("../../helpers");
const DB = require("../../models");

const helper = {
  generateSearchQuery: async ({ req }) => {
    let { skip, limit, sortBy, sortOrder, search, ...findCriteria } =
      controllerHelpers.generateMatchFilter({
        query: req.query,
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
    const created{{{ crudNameCase.pascalCase }}} = await DB.{{{ crudNameCase.upperCase }}}.create(req.body);
    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: created{{{ crudNameCase.pascalCase }}},
    });
  },

  fetch: async (req, res) => {
    if (req?.user?.role) {
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
    }

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
    <% if (multiImagesNames.length) { %>const { <% for (let i = 0; i < multiImagesNames.length; i++) { %>{{{ multiImagesNames[i] }}}, <% } %> ...rest } = req.body;<% } %>
    const updated{{{ crudNameCase.pascalCase }}} = await DB.{{{ crudNameCase.upperCase }}}.findOneAndUpdate(
      { _id: req.params._id },
      <% if (multiImagesNames.length) { %>{ $push: { <% for (let i = 0; i < multiImagesNames.length; i++) { %>{{{ multiImagesNames[i] }}}: { $each: {{{ multiImagesNames[i] }}} }, <% } %>}, $set: rest },<% } else { %>{ $set: req.body },<% } %>
      { new: true, runValidators: true }
    );
    if (!updated{{{ crudNameCase.pascalCase }}})
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });

    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: updated{{{ crudNameCase.pascalCase }}},
    });
  },<% if (multiImagesNames.length) { %>{{{'\n\n'}}}
  pullImages: async (req, res) => {
    const { _ids } = req.body;
    const updated{{{ crudNameCase.pascalCase }}} = await DB.{{{ crudNameCase.upperCase }}}.updateMany(
      {
        $or: [
          <% for (let i = 0; i < multiImagesNames.length; i++) { %>{ {{{ multiImagesNames[i] }}}: { $elemMatch: { _id: { $in: _ids } } } },<% } %>],
      },
      { 
        $pull: { 
          <% for (let i = 0; i < multiImagesNames.length; i++) { %>{{{ multiImagesNames[i] }}}: { _id: { $in: _ids } },<% } %>
        },
      },
    );
    if (!updated{{{ crudNameCase.pascalCase }}})
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });
    return response.OK({ res, message: MESSAGE.SUCCESS });
  },<% } %>

  toggleActiveStatus: async (req, res) => {
    const updated{{{ crudNameCase.pascalCase }}} = await DB.{{{ crudNameCase.upperCase }}}.findOneAndUpdate(
      { _id: req.params._id },
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
    if (!updated{{{ crudNameCase.pascalCase }}})
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });
    return response.OK({
      res,
      message: MESSAGE.SUCCESS,
      payload: updated{{{ crudNameCase.pascalCase }}},
    });
  },

  delete: async (req, res) => {
    const deleted{{{ crudNameCase.pascalCase }}} = await DB.{{{ crudNameCase.upperCase }}}.findByIdAndDelete(req.params._id);
    if (!deleted{{{ crudNameCase.pascalCase }}})
      return response.NOT_FOUND({ res, message: MESSAGE.NOT_FOUND });
    return response.OK({ res, message: MESSAGE.SUCCESS });
  },
};

module.exports = { helper, controllers };