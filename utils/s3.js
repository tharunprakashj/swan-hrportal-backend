/* eslint-disable no-param-reassign */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
// For read and write the files in the directory
const fs = require('fs');

// Creating unique short id's
const shortid = require('shortid');

require('dotenv').config();

// For connecting Nodejs and AWS S3 Bucket
const AWS = require('aws-sdk');

// AWS Account Access Key Id
const KEY_ID = 'AKIAXGOLKYKGLY4C6M7D';

// AWS Account Secret Access Key
const SECRET_KEY = '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';

// AWS Region
const REGION = 'ap-south-1';

// S3 BUCKET
const BUCKET_NAME = 'myswan';
const logger = require('./winston');


// Endpoint
// const ENDPOINT = 's3.ap-south-1.amazonaws.com';

// Nodejs and S3 Bucket Connection
const s3 = new AWS.S3({
  region: REGION,
  accessKeyId: KEY_ID,
  secretAccessKey: SECRET_KEY,
  // endpoint: ENDPOINT,
});

const uploadFilesToS3 = async (file, nicNo) => {
  // Generate Unique ID
  const uniqueId = shortid.generate();

  // Get the image type(i.e., pdf,png,jpeg,etc...) from base64 image
  const [, type] = file.split(';')[0].split('/');

  // const nicNo = 12345;
  const todayDate = new Date().toISOString().slice(0, 10);

  // Generate File Name
  const filename = `${nicNo}_${todayDate}_${uniqueId}.${type}`;

  const APP_BASE_PATH = 'D:/myswan/myswan-backend/myswan-hr-portal';

  // Generate File Saving Path
  const destination = `${APP_BASE_PATH}/public/uploads/documents/${filename}`;

  // Removing the unwanted string(i.e.,data:image/png;base64) and get the base64 image
  file = file.substring(file.indexOf(',') + 1);

  // Write the files on public folder
  fs.writeFile(destination, file, { encoding: 'base64' }, async (err) => {
    if (err) {
      throw err;
    } else {
      logger.info('File created');
    }
  });
  const fileStream = fs.createReadStream(destination);
  const fileLocation = `uploads/documents/${filename}`;
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Body: fileStream,
    Key: fileLocation,
  };

  const response = s3.upload(uploadParams).promise();

  if (fs.existsSync(destination)) {
    fs.unlinkSync(destination);
  }
  return response;
};


// const s3Upload = async (fileName, fileStream) => {
//   const fileLocation = `uploads/documents/${fileName}`;
//   const uploadParams = {
//     Bucket: BUCKET_NAME,
//     Body: fileStream,
//     Key: fileLocation,
//   };
//   return s3.upload(uploadParams).promise();
// };

// const uploadFilesToS3 = async () => {
//   const testFolder = 'D:/myswan/myswan-backend/myswan-hr-portal/public/uploads/documents/';
//   let uploadResult;
//   fs.readdir(testFolder, async (err, files) => {
//     for (let i = 0; i < files.length; i++) {
//       const filePath = `${testFolder}${files[i]}`;
//       const fileStream = fs.createReadStream(filePath);
//       const fileName = files[i];
//       uploadResult = await s3Upload(fileName, fileStream);
//     }
//   });
//   return uploadResult.promise();
// };

// uploadFile();
module.exports = {
  uploadFilesToS3,
};
