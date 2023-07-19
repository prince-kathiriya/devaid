const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const upload = require("../services/upload/file.upload");

const upload = upload.single({ fieldName: "categoryImage", reqBodyFieldName: "image" });

const { {{{ crudNameCase.upperCase }}}: { VALIDATOR, APIS } } = require("../controllers");

router.get(
  "/",
  auth({ usersAllowed: ["*"], isTokenRequired: false }),
  VALIDATOR.fetch,
  APIS.fetch
);

router.post(
  "/", 
  auth({}), 
  upload, 
  VALIDATOR.create, 
  APIS.create
);

router.patch(
  "/:_id",
  auth({}),
  VALIDATOR.toggleActiveStatus,
  APIS.toggleActiveStatus
);

router.put(
  "/:_id", 
  auth({}), 
  upload, 
  VALIDATOR.update, 
  APIS.update
);

router.delete(
  "/:_id",
  auth({}),
  VALIDATOR.delete,
  APIS.delete
);

module.exports = router;