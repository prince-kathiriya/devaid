const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");<% if (images.length > 18) { %>{{{'\n'}}}const upload = require("../services/upload/file.upload");{{{'\n'}}}const uploadMiddleware = upload.fields({{{ images }}}); <% } %>
const { {{{ crudNameCase.upperCase }}}: { VALIDATOR, APIS } } = require("../controllers");


router.get(
  "/",
  auth({ usersAllowed: ["*"], isTokenRequired: false }),
  VALIDATOR.fetch,
  APIS.fetch
);

router.post(
  "/", 
  auth({ usersAllowed: ["*"] }), <% if (images.length > 18) { %>{{{ '\n  ' }}}uploadMiddleware, <% } %>
  VALIDATOR.create, 
  APIS.create
);<% if (multiImagesNames.length) { %>{{{'\n'}}}
router.put(
  "/pull-images",
  auth({ usersAllowed: ["*"] }), 
  VALIDATOR.pullImages,
  APIS.pullImages
);<% } %>

router.put(
  "/:_id", 
  auth({ usersAllowed: ["*"] }),  <% if (images.length > 18) { %>{{{ '\n  ' }}}uploadMiddleware, <% } %>
  VALIDATOR.update, 
  APIS.update
);

router.patch(
  "/:_id",
  auth({ usersAllowed: ["*"] }), 
  VALIDATOR.toggleActiveStatus,
  APIS.toggleActiveStatus
);

router.delete(
  "/:_id",
  auth({ usersAllowed: ["*"] }), 
  VALIDATOR.delete,
  APIS.delete
);

module.exports = router;
