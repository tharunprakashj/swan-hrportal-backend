/* eslint-disable no-trailing-spaces */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const fs = require('fs');

// Creating unique short id's
const shortid = require('shortid');

// Import S3 Bucket File for saving the file to bucket
const { uploadFilesToS3 } = require('./s3');

// For getting values from .ENV File
require('dotenv').config();

const uploadDocuments = async (file, nicNo) => {
  for (let i = 0; i < file.length; i++) {
    // Generate Unique ID
    const uniqueId = shortid.generate();

    // Get the image type(i.e., pdf,png,jpeg,etc...) from base64 image 
    const [, type] = file[i].split(';')[0].split('/');

    // const nicNo = 12345;
    const todayDate = new Date().toISOString().slice(0, 10);

    // Generate File Name
    const filename = `${nicNo}_${todayDate}_${uniqueId}.${type}`;

    const APP_BASE_PATH = 'D:/myswan/myswan-backend/myswan-hr-portal';
    
    // Generate File Saving Path
    const destination = `${APP_BASE_PATH}/public/uploads/documents/${filename}`;

    // Removing the unwanted string(i.e.,data:image/png;base64) and get the base64 image
    file[i] = file[i].substring(file[i].indexOf(',') + 1);

    // Write the files on public folder 
    fs.writeFile(destination, file[i], { encoding: 'base64' }, async (err) => {
      if (err) {
        throw err;
      } else {
        logger.info('File created');
        // return true;
        const uploads = await uploadFilesToS3();
        logger.info('Final Upload');
        return uploads.promise();
      }
    });
  }
};

module.exports = {
  uploadDocuments,
};
