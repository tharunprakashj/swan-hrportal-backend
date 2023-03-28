/* eslint-disable no-use-before-define */
/* eslint-disable no-async-promise-executor */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */

const { reject } = require('lodash');
// Import File Controller

const AWS = require('aws-sdk');

// const fileController = require('../controllers/file.controller');

// Import File Model
const fileModel = require('../models/file.model');

// Import Document Model
const documentModel = require('../models/document.model');

// Import Message
const { Message } = require('../utils/message');

const logger = require('../utils/winston');

const deleteDocuments = async (member_id) => new Promise(async (resolve, reject) => {
  const checkUpload = await documentModel.getUploadedDocumentByMemberId(member_id);
  if (checkUpload.recordset.length > 0) {
    await deleteFiles(checkUpload.recordset).then(async (data) => {
      if (data === true) {
        const checkQuestionDocuments = await documentModel.getQuestionnarieDocumentByMemberId(member_id);
        if (checkQuestionDocuments.recordset.length > 0) {
          await deleteFiles(checkQuestionDocuments.recordset).then(async (data) => {
            if (data === true) {
              resolve(true);
            } else if (data === false) {
              resolve(false);
            }
          }).catch((err) => {
            logger.info('Delete Question Documents', err);
          });
        } else {
          resolve(true);
        }
      } else if (data === false) {
        resolve(false);
      }
    }).catch((err) => {
      logger.info('Delete Uploaded Documents', err);
    });
  } else {
    resolve(true);
  }
});

const deleteQuestionaryDocuments = async (member_id, question_id) => {
  const checkQuestionDocuments = await documentModel.getQuestionnarieDocument(member_id, question_id);
  if (checkQuestionDocuments.recordset.length > 0) {
    const data = await deleteFiles(checkQuestionDocuments.recordset);
    return data;
  }
  return true;
};

const deleteQuestionaryDocumentsRecords = async (request_id, member_id, question_id) => {
  const checkQuestionDocuments = await documentModel.getQuestionnarieDocumentRecords(request_id, member_id, question_id);
  if (checkQuestionDocuments.recordset.length > 0) {
    const data = await deleteFilesRecords(checkQuestionDocuments.recordset);
    return data;
  }
  return true;
};

const deleteFiles = async (file) => new Promise(async (resolve, reject) => {
  let deleteDbKey;
  if (file.length > 0) {
    for (let i = 0; i < file.length; i++) {
      const { document_key, question_id } = file[i];
      await deleteFile(document_key).then(async (data) => {
        logger.info('Delete Response fron S3--->', data);
        if (question_id) {
          deleteDbKey = await fileModel.deleteQuestionnarieDocumentByKey(document_key);
        } else {
          deleteDbKey = await fileModel.deleteDocumentByKey(document_key);
        }
        if (deleteDbKey.rowsAffected[0] > 0) {
          if (i + 1 === file.length) {
            resolve(true);
          }
        } else {
          resolve(true);
        }
      }).catch((err) => {
        logger.error('CATCH ERR--->', err);
        resolve(false);
      });
    }
  }
});

const deleteFilesRecords = async (file) => new Promise(async (resolve, reject) => {
  let deleteDbKey;
  if (file.length > 0) {
    for (let i = 0; i < file.length; i++) {
      const { document_key, question_id } = file[i];
      await deleteFile(document_key).then(async (data) => {
        logger.info('Delete Response fron S3--->', data);
        if (question_id) {
          deleteDbKey = await fileModel.deleteQuestionnarieDocumentByKeyRecords(document_key);
        } else {
          deleteDbKey = await fileModel.deleteDocumentByKey(document_key);
        }
        if (deleteDbKey.rowsAffected[0] > 0) {
          if (i + 1 === file.length) {
            resolve(true);
          }
        } else {
          resolve(true);
        }
      }).catch((err) => {
        logger.error('CATCH ERR--->', err);
        resolve(false);
      });
    }
  }
});

const deleteFile = async (key) => new Promise(async (resolve, reject) => {
  logger.info('delete uploaded file');
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // endpoint: ENDPOINT,
  });
  const deleteParams = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  await s3.deleteObject(deleteParams, (err, data) => {
    if (err) {
      logger.error('while deleting file', err);
      reject(err);
    } else {
      logger.info('deleted the file', data);
      resolve(data);
    }
  }).promise();
});

module.exports = {
  deleteFiles, deleteDocuments, deleteQuestionaryDocuments, deleteFile, deleteQuestionaryDocumentsRecords,
};
