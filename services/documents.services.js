/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const {
  getDocumentswithTypesRecord,
  fetchingDocuments,
  fetchingQuestionDocumentByrequest,
  insertQuestionDocument,
  fetchingDocumentRecordsByRequestId,
} = require('../models/document.model');

const { deleteFiles } = require('./file.services');

// Import Winston Logger
const logger = require('../utils/winston');

// Import Document Model
const documentModel = require('../models/document.model');

// Import Message
const { Message } = require('../utils/message');
const { documentType } = require('../utils/role');

const checkDocument = async (request_id, member_id, types) => {
  for (let i = 0; i < types.length; i++) {
    const result = await getDocumentswithTypesRecord(request_id, member_id, types[i]);
    if (result.rowsAffected > 0) {
      if (types.length === i + 1) {
        return { status: true };
      }
    } else {
      const document = Object.keys(documentType).find((key) => documentType[key] === types[i]);
      return { status: false, documentType: types[i], document };
    }
  }
};

const fetchDocument = async (member_id, document_type) => {
  const data = await fetchingDocuments(member_id, document_type);
  if (data.recordset.length > 0) {
    return data.recordset;
  }

  return false;
};

const fetchDocumentRecords = async (request_id, member_id, document_type) => {
  const data = await fetchingDocumentRecordsByRequestId(request_id, member_id, document_type);
  if (data.recordset.length > 0) {
    return data.recordset;
  }

  return false;
};

const addDocumentRecords = async (data) => new Promise(async (resolve, reject) => {
  let memberDocuments = await documentModel.getMemberDocuments(data.member_id);
  await documentModel.deleteRecordDocumentByRequestId(data.request_id);
  memberDocuments = memberDocuments.recordset;
  if (memberDocuments.length > 0) {
    let insertDocumentRecord;
    for (let k = 0; k < memberDocuments.length; k++) {
      memberDocuments[k].request_id = data.request_id;
      insertDocumentRecord = await documentModel.insertDocumentRecord(memberDocuments[k]);
      if (insertDocumentRecord.rowsAffected[0] > 0) {
        if (memberDocuments.length === k + 1) {
          logger.info('Insert documents records success');
          resolve({
            status: true,
            message: Message.Common.FailureMessage.Creation('Documents Records'),
          });
        }
      } else {
        logger.info('Insert documents records failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Documents Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Get member documents failed');
    resolve({
      status: false,
      message: Message.Common.FailureMessage.Fetch('Member Documents'),
    });
  }
});

const insertDocumentRecords = async (data) => new Promise(async (resolve, reject) => {
  let memberDocuments = await documentModel.getUploadedDocumentsByRequestId(data.request_id);
  await documentModel.deleteRecordDocumentByRequestId(data.request_id);
  memberDocuments = memberDocuments.recordset;
  if (memberDocuments.length > 0) {
    let insertDocumentRecord;
    for (let k = 0; k < memberDocuments.length; k++) {
      insertDocumentRecord = await documentModel.insertDocumentRecord(memberDocuments[k]);
      if (insertDocumentRecord.rowsAffected[0] > 0) {
        if (memberDocuments.length === k + 1) {
          logger.info('Insert documents records success');
          resolve({
            status: true,
            message: Message.Common.FailureMessage.Creation('Documents Records'),
          });
        }
      } else {
        logger.info('Insert documents records failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Documents Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Get member documents failed');
    resolve({
      status: false,
      message: Message.Common.FailureMessage.Fetch('Member Documents'),
    });
  }
});

const addQuestionnarieDocumentsRecords = async (data) => new Promise(async (resolve, reject) => {
  let memberDocuments = await documentModel.getQuestionnarieDocumentByProfileId(data.member_id);
  memberDocuments = memberDocuments.recordset;
  if (memberDocuments.length > 0) {
    let insertDocumentRecord;
    await documentModel.deleteQuestionRecordDocumentByRequestId(data.request_id);
    for (let k = 0; k < memberDocuments.length; k++) {
      memberDocuments[k].request_id = data.request_id;
      insertDocumentRecord = await documentModel.insertQuestionDocumentRecords(memberDocuments[k]);
      if (insertDocumentRecord.rowsAffected[0] > 0) {
        if (memberDocuments.length === k + 1) {
          logger.info('Insert documents records success');
          resolve({
            status: true,
            message: Message.Common.FailureMessage.Creation('Documents Records'),
          });
        }
      } else {
        logger.info('Insert documents records failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Documents Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Get member documents failed');
    resolve({
      status: true,
      message: Message.Common.FailureMessage.Creation('Documents Records'),
    });
  }
});

const insertQuestionnarieDocumentsRecords = async (data) => new Promise(async (resolve, reject) => {
  let memberDocuments = await documentModel.getQuestionnarieDocumentByRequestId(data.request_id);
  memberDocuments = memberDocuments.recordset;
  if (memberDocuments.length > 0) {
    let insertDocumentRecord;
    await documentModel.deleteQuestionRecordDocumentByRequestId(data.request_id);
    for (let k = 0; k < memberDocuments.length; k++) {
      memberDocuments[k].request_id = data.request_id;
      insertDocumentRecord = await documentModel.insertQuestionDocumentRecords(memberDocuments[k]);
      if (insertDocumentRecord.rowsAffected[0] > 0) {
        if (memberDocuments.length === k + 1) {
          logger.info('Insert documents records success');
          resolve({
            status: true,
            message: Message.Common.FailureMessage.Creation('Documents Records'),
          });
        }
      } else {
        logger.info('Insert documents records failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Documents Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Get member documents failed');
    resolve({
      status: true,
      message: Message.Common.FailureMessage.Creation('Documents Records'),
    });
  }
});

const insertDocumentsFromRecords = async (request_id) => {
  const DocumentData = await fetchingQuestionDocumentByrequest(request_id);
  if (DocumentData.recordset.length > 0) {
    for (let i = 0; i < DocumentData.recordset.length; i++) {
      const docs = DocumentData.recordset[i];
      const insertDoc = await insertQuestionDocument(docs);
      if (i === DocumentData.recordset.length - 1) {
        if (insertDoc.rowsAffected[0] > 0) {
          return true;
        }

        return false;
      }
    }
  } else {
    return true;
  }
};

module.exports = {
  checkDocument,
  fetchDocument,
  insertDocumentsFromRecords,
  addDocumentRecords,
  addQuestionnarieDocumentsRecords,
  insertDocumentRecords,
  insertQuestionnarieDocumentsRecords,
  fetchDocumentRecords,
};
