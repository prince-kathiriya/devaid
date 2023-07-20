const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const Joi = require('joi');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const { MESSAGE } = require('../../helpers/constant.helper');
const { response, logger } = require('../../helpers');
const env = require('../../config/env.config');

const BASE_DIR = `${env.PROJECT_NAME}/${env.NODE_ENV}`;

const s3 = new S3Client({
  region: env.REGION,
  credentials: {
    secretAccessKey: env.SECRET_KEY,
    accessKeyId: env.ACCESSKEYID,
  },
});


// verify s3 connection
;(async function() {
  try {
    const buckets = (await s3.send(new ListBucketsCommand({}))).Buckets;

    if (!buckets.find(_b_ => _b_.Name === env.BUCKET)) 
      logger.error(`✘ BUCKET NOT FOUND, BUCKET NAME: '${env.BUCKET}'`);
    else logger.info(`✔ CONNECTED TO S3, READY TO UPLOAD FILES TO BUCKET: '${env.BUCKET}'`);
    
  } catch (error) {
    logger.error(`✘ UNABLE TO CONNECT TO S3`);
    logger.error(error);
  }
})();


const dirMap = {
  /* 
  //! example for uploading files to different directories
  //! if fieldName is categoryImage, file will be uploaded to /category directory
  //! if fieldName is designImage, file will be uploaded to /mix/design directory
  
  categoryImage: 'category',
  designImage: 'mix/design',
  zip: '', */
};
const getDirectory = ({ fieldName }) => {
  return typeof dirMap[fieldName] === 'string' ? dirMap[fieldName] : 'others';
};

const uploadMethods = {};

//! only used if req.headers['local-upload'] is true
uploadMethods.multerLocal = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(
        null,
        //! make sure to create required directories in public/uploads
        path.join(
          __dirname,
          `../../public/uploads/${BASE_DIR}/${getDirectory({ fieldName: file.fieldname })}`
        )
      );
    },
    filename: (req, file, cb) => {
      //! file name will be generated from following
      cb(null, `${new Date().getTime()}-${(new Date().getTime()) * Math.random()}-${file.originalname}`);
    },
  }),
});

//! used by default
uploadMethods.multerS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: env.BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const dir = getDirectory({ fieldName: file.fieldname });

      //! file name will be generated from following
      const fileName = `${new Date().getTime()}-${(new Date().getTime()) * Math.random()}-${file.originalname}`;
      cb(null, `${BASE_DIR}/${dir}/${fileName}`);
    },
  }),
});

const errorHandler = ({ req, res, error }) => response.BAD_REQUEST({
  res, message: MESSAGE.FILE_UPLOAD_FAILED, payload: error,
});

//! upload functions for different types of files
//! if local-upload is true, multerLocal will be used, else multerS3 will be used
const upload = {

  //! for single file upload
  //! fieldName is the name of the field in form-data from request
  //! reqBodyFieldName is the name of the field in req.body where file path will be stored
  single({ fieldName, reqBodyFieldName = 'image' } = {}) {
    return async (req, res, next) => {
      const multerUploadMethod = req.headers['local-upload'] === 'true' ? 'multerLocal' : 'multerS3';

      uploadMethods[multerUploadMethod].single(fieldName)(req, res, (error) => {
        if (error) return errorHandler({ req, res, error });
        req.body[reqBodyFieldName] = req?.file?.location || req?.file?.path;
        next();
      });
    };
  },


  //! for multiple file upload
  //! fieldName is the name of the field in form-data from request
  //! reqBodyFieldName is the name of the field in req.body where file path will be stored
  //! maxCount is the maximum number of files allowed to upload
  //! isSRCFormat is true if you want to store file path in src format eg. [{ src: 'path/to/file' }]
  array({
    fieldName, maxCount = 10, reqBodyFieldName = 'images', isSRCFormat = true,
  } = {}) {
    return async (req, res, next) => {
      const multerUploadMethod = req.headers['local-upload'] === 'true' ? 'multerLocal' : 'multerS3';

      uploadMethods[multerUploadMethod].array(fieldName, maxCount)(
        req, res, (error) => {
          if (error) return errorHandler({ req, res, error });
          req.body[reqBodyFieldName] = isSRCFormat
            ? req?.files?.map((item) => ({
                src: item.location || req?.file?.path,
              }))
            : req?.files?.map((file) => file?.location || req?.file?.path);
          next();
        }
      );
    };
  },


  //! for multiple file upload
  //! fieldName is the name of the field in form-data from request
  //! reqBodyFieldName is the name of the field in req.body where file path will be stored
  //! maxCount is the maximum number of files allowed to upload
  //! isSRCFormat is true if you want to store file path in src format eg. [{ src: 'path/to/file' }]
  fields(
    { fields } = {
      fields: [
        { name: 'image', maxCount: 1, reqBodyFieldName: 'image', isArray: true, isSRCFormat: true },
      ],
    }
  ) {
    return async (req, res, next) => {
      const multerUploadMethod = req.headers['local-upload'] === 'true' ? 'multerLocal' : 'multerS3';

      uploadMethods[multerUploadMethod].fields(fields)(req, res, (error) => {
        if (error) return errorHandler({ req, res, error });
        for (let i = 0; i < fields.length; i++) {
          const fieldName = fields[i].name;
          req.body[fields[i].reqBodyFieldName] = fields[i].isArray
            ? isSRCFormat
              ? req?.files?.[fieldName]?.map((item) => ({ src: item.location || req?.file?.path }))
              : req?.files?.[fieldName]?.map((file) => file?.location || req?.file?.path)
            : req?.files?.[fieldName]?.[0]?.location || req?.file?.path;
        }
        next();
      });
    };
  },
};

module.exports = upload;
