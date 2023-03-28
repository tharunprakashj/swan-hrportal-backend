/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
// const { query } = require('express');
const { database } = require('../utils/database');

// Import Query generator
const QueryGenerator = require('../generators/query.generate');

const getDocumentTypeId = async (type) => {
  const query = `SELECT document_type_id FROM tbl_document_type WHERE document_type = '${type}'`;
  return await database.request().query(query);
};

const deleteDocumentByKey = async (key) => {
  const query = `DELETE FROM tbl_uploaded_documents WHERE document_key='${key}'`;
  return await database.request().query(query);
};

const deleteQuestionnarieDocumentByKey = async (key) => {
  const query = `DELETE FROM tbl_questionnarie_documents WHERE document_key='${key}'`;
  return await database.request().query(query);
};

const deleteQuestionnarieDocumentByKeyRecords = async (key) => {
  const query = `DELETE FROM tbl_questionnarie_document_records WHERE document_key='${key}'`;
  return await database.request().query(query);
};

const updateDocumentByKey = async (file, key) => {
  file.document_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_uploaded_documents', file, key);
  return await database.request().query(query);
};

const updateDocumentRecordsByKey = async (file, key) => {
  file.document_record_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_uploaded_document_records', file, key);
  return await database.request().query(query);
};

module.exports = {
  getDocumentTypeId,
  deleteDocumentByKey,
  updateDocumentByKey,
  deleteQuestionnarieDocumentByKey,
  deleteQuestionnarieDocumentByKeyRecords,
  updateDocumentRecordsByKey,
};
