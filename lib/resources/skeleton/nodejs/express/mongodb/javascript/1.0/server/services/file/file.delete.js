const { HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const env = require('../../config/env.config');
const s3 =  require('../../config/s3.config');


//! delete file from local
//! filePath format: /public/project-name/node-env/file-name
//! filePath format: /full/path/to/file/from/root
const deleteLocalFile = ({ filePath }) => {
    try {
        filePath = filePath.startsWith('/public') ? path.join(__dirname, '../', filePath) : filePath;
        const isFileExists = fs.existsSync(filePath);
        if (!isFileExists) return null;
        fs.unlinkSync(filePath);
        return true;
    } catch (error) {
        return null;
    }
};

//! check if file exists in s3
//! Key format one: https://bucket-name.s3.region.amazonaws.com/project-name/node-env/file-name
//! Key format two: project-name/node-env/file-name
const doesS3FileExists = async ({ Key, Bucket = env.BUCKET } = {}) => {
    try {
        if (Key.startsWith('http')) Key = Key.split('.com')[1].substr(1);
        const data = await s3.send(new HeadObjectCommand({ Key, Bucket }));
        return data;
    } catch (error) {
        return null;
    }
};

//! delete file from s3
//! Key format one: https://bucket-name.s3.region.amazonaws.com/project-name/node-env/file-name
//! Key format two: project-name/node-env/file-name
const deleteS3File = async({ Key, Bucket = env.BUCKET } = {}) => {
    try {
        if (Key.startsWith('http')) Key = Key.split('.com')[1].substr(1);
        const doesFileExists = await doesS3FileExists({ Key, Bucket });
        if (!doesFileExists) return null;
        const data = await s3.send(new DeleteObjectCommand({ Key, Bucket }));
        return data;
    } catch (error) {
        return null;
    }
};

module.exports = {
    deleteLocalFile,
    deleteS3File,
    doesS3FileExists,
};