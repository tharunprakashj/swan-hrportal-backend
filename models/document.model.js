/* eslint-disable camelcase */
/* eslint-disable no-return-await */
// const { query } = require('mssql');
const { database } = require('../utils/database');

// Insert the Uploaded Document details and S3 Reponse
const insertDocument = async (document) => {
  const query = `INSERT INTO tbl_uploaded_documents 
  (
    member_id,
    family_id,
    document_key,
    location,
    document_type,
    document_format
  ) 
  VALUES(
    ${document.member_id},
    ${document.family_id},
    '${document.document_key}',
    '${document.location}',
    ${document.document_type},
    '${document.document_format}'
  )`;
  return await database.request().query(query);
};

// Insert the Uploaded Document Records details and S3 Reponse
const insertDocumentRecords = async (document) => {
  const query = `INSERT INTO tbl_uploaded_document_records 
  (
    request_id,
    member_id,
    family_id,
    document_key,
    location,
    document_type,
    document_format
  ) 
  VALUES(
    ${document.request_id},
    ${document.member_id},
    ${document.family_id},
    '${document.document_key}',
    '${document.location}',
    ${document.document_type},
    '${document.document_format}'
  )`;
  return await database.request().query(query);
};

// Insert the Document Records
const insertDocumentRecord = async (document) => {
  const query = `INSERT INTO tbl_uploaded_document_records 
  (
    request_id,
    member_id,
    family_id,
    document_key,
    location,
    document_type,
    document_format
  ) 
  VALUES(
    ${document.request_id},
    ${document.member_id},
    ${document.family_id},
    '${document.document_key}',
    '${document.location}',
    ${document.document_type},
    '${document.document_format}'
  )`;
  return await database.request().query(query);
};

// Insert the Uploaded Document details and S3 Reponse
const insertQuestionDocument = async (document) => {
  const query = `INSERT INTO tbl_questionnarie_documents 
  (
    question_id,
    member_id,
    family_id,
    document_key,
    location,
    document_type,
    document_format
  ) 
  VALUES(
    ${document.question_id},
    ${document.member_id},
    ${document.family_id},
    '${document.document_key}',
    '${document.location}',
    ${document.document_type},
    '${document.document_format}'
  )`;

  return await database.request().query(query);
};

// Insert the Uploaded Document details and S3 Reponse
const insertQuestionDocumentRecords = async (document) => {
  const query = `INSERT INTO tbl_questionnarie_document_records 
  (
    request_id,
    question_id,
    member_id,
    family_id,
    document_key,
    location,
    document_type,
    document_format
  ) 
  VALUES(
    ${document.request_id},
    ${document.question_id},
    ${document.member_id},
    ${document.family_id},
    '${document.document_key}',
    '${document.location}',
    ${document.document_type},
    '${document.document_format}'
  )`;
  return await database.request().query(query);
};

const insertCompanyImages = async (companyFiles) => {
  const query = `INSERT INTO tbl_company_images
  (
    company_branch_id,
    company_image_key,
    company_image_format,
    company_image_location
  )
  VALUES
  (
    ${companyFiles.company_branch_id},
    '${companyFiles.company_image_key}',
    '${companyFiles.company_image_format}',
    '${companyFiles.company_image_location}'
  )
  `;
  return await database.request().query(query);
};

// Get document types
const getAllDocumentTypes = async () => {
  const query = 'SELECT * FROM tbl_document_type';
  return await database.request().query(query);
};

// Get documents
const getDocuments = async (docs) => {
  let cond = '';
  if (docs.types) {
    cond = `AND docs.document_type IN (${docs.types})`;
  }
  if (docs.member_id) {
    cond = `AND docs.member_id = ${docs.member_id}`;
  }
  const query = `SELECT docs.document_key,type.document_type,docs.document_format,
  prof.forename,prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship
  FROM tbl_uploaded_documents docs
  JOIN tbl_document_type type ON type.document_type_id = docs.document_type 
  JOIN tbl_profiles prof ON prof.profile_id = docs.member_id
  where docs.family_id=${docs.family_id} ${cond}`;

  return await database.request().query(query);
};

// Get documents records
const getDocumentRecords = async (docs) => {
  let cond = '';
  if (docs.types) {
    cond = `AND docs.document_type IN (${docs.types})`;
  }
  if (docs.member_id) {
    cond = `AND docs.member_id = ${docs.member_id}`;
  }
  const query = `SELECT docs.document_key,type.document_type,docs.document_format,
  prof.forename,prof.surname,prof.family_id,prof.member_id,prof.relationship
  FROM tbl_uploaded_document_records docs
  JOIN tbl_document_type type ON type.document_type_id = docs.document_type 
  JOIN tbl_profile_records prof ON prof.member_id = docs.member_id
  where docs.request_id=${docs.request_id} ${cond}`;
  console.log(query);
  return await database.request().query(query);
};

// Get Memebr documents
const getMemberDocuments = async (member_id) => {
  const query = `SELECT * FROM tbl_uploaded_documents where member_id = ${member_id}`;
  return await database.request().query(query);
};

// Get Memebr documents
const getMemberDocumentRecords = async (member_id) => {
  const query = `SELECT * FROM tbl_uploaded_document_records where member_id IN (${member_id})`;
  return await database.request().query(query);
};

// Get documents
const getDocumentswithTypes = async (member_id, types) => {
  const query = `SELECT *
  FROM tbl_uploaded_documents docs
  where docs.member_id=${member_id} AND docs.document_type IN (${types})`;
  return await database.request().query(query);
};

// Get document records
const getDocumentswithTypesRecord = async (request_id, member_id, types) => {
  const query = `SELECT *
  FROM tbl_uploaded_document_records docs
  where docs.request_id = ${request_id} AND docs.member_id=${member_id} AND docs.document_type IN (${types})`;
  return await database.request().query(query);
};

// Get documents
const fetchingDocuments = async (member_id, document_type) => {
  const query = `SELECT *
  FROM tbl_uploaded_documents docs
  where docs.member_id=${member_id} AND docs.document_type = ${document_type}`;
  return await database.request().query(query);
};

// Get documents records
const fetchingDocumentRecordsByRequestId = async (request_id, member_id, document_type) => {
  const query = `SELECT *
  FROM tbl_uploaded_document_records docs
  where docs.member_id=${member_id} AND docs.document_type = ${document_type} AND docs.request_id = ${request_id}`;
  return await database.request().query(query);
};

// Get documents
const fetchingDocumentRecords = async (family_id) => {
  const query = `SELECT *
  FROM tbl_uploaded_document_records docs
  where docs.family_id = ${family_id}`;
  return await database.request().query(query);
};

// Get documents
const fetchingQuestionDocumentByrequest = async (request_id) => {
  const query = `SELECT *
  FROM tbl_questionnarie_document_records docs
  where docs.request_id = ${request_id}`;
  return await database.request().query(query);
};

// Get documents
const fetchingQuestionDocumentRecords = async (family_id) => {
  const query = `SELECT *
  FROM tbl_questionnarie_document_records docs
  where docs.family_id = ${family_id}`;
  return await database.request().query(query);
};

// const insertCompanyImage = async () => {
//   const query = 'INSERT INTO tbl_company_images ';
//   return await database.request().query(query);
// };

const insertBankList = async ({ bank_code, bank_name, account_no_length }) => {
  const query = `INSERT INTO tbl_bank_list(bank_code,bank_name,account_no_length) VALUES(${bank_code},'${bank_name}',${account_no_length})`;
  return await database.request().query(query);
};

const getUploadedDocumentByMemberId = async (member_id) => {
  const query = `SELECT * FROM tbl_uploaded_documents where member_id = ${member_id}`;
  return await database.request().query(query);
};

const getQuestionnarieDocumentByMemberId = async (member_id) => {
  const query = `SELECT * FROM tbl_uploaded_documents where member_id = ${member_id}`;
  return await database.request().query(query);
};

const getUploadedDocumentsByRequestId = async (request_id) => {
  const query = `SELECT forms.request_id,docs.* FROM tbl_request_forms forms 
  JOIN tbl_uploaded_documents docs ON docs.member_id = forms.member_id where request_id = ${request_id}`;
  return await database.request().query(query);
};

// SELECT forms.*,prof.* FROM tbl_request_forms forms
//   JOIN tbl_profiles profile ON prof.profile_id = forms.member_id where request_id=${request_id}

const getQuestionnarieDocument = async (member_id, question_id) => {
  const query = `SELECT * FROM tbl_questionnarie_documents where member_id = ${member_id} AND question_id = ${question_id}`;
  return await database.request().query(query);
};

const getQuestionnarieDocumentByProfileId = async (member_id) => {
  const query = `SELECT * FROM tbl_questionnarie_documents where member_id = ${member_id}`;
  return await database.request().query(query);
};

const getQuestionnarieDocumentByRequestId = async (request_id) => {
  const query = `SELECT forms.request_id,docs.* FROM tbl_request_forms forms 
  JOIN tbl_questionnarie_documents docs ON docs.member_id = forms.member_id where request_id = ${request_id}`;
  return await database.request().query(query);
};

const getQuestionnarieDocumentRecords = async (request_id, member_id, question_id) => {
  const query = `SELECT * FROM tbl_questionnarie_document_records where request_id =${request_id} AND member_id = ${member_id} AND question_id = ${question_id}`;
  return await database.request().query(query);
};

const deleteQuestionRecordDocumentByRequestId = async (request_id) => {
  const query = `DELETE FROM tbl_questionnarie_document_records WHERE request_id = ${request_id}`;
  return await database.request().query(query);
};

const deleteRecordDocumentByRequestId = async (request_id) => {
  const query = `DELETE FROM tbl_uploaded_document_records WHERE request_id = ${request_id}`;

  return await database.request().query(query);
};

module.exports = {
  insertDocument,
  getAllDocumentTypes,
  getDocuments,
  // insertCompanyImage,
  insertCompanyImages,
  insertBankList,
  getDocumentswithTypes,
  insertQuestionDocument,
  fetchingDocuments,
  getUploadedDocumentByMemberId,
  getQuestionnarieDocumentByMemberId,
  getQuestionnarieDocument,
  insertDocumentRecord,
  getMemberDocuments,
  getMemberDocumentRecords,
  getQuestionnarieDocumentByProfileId,
  insertQuestionDocumentRecords,
  getQuestionnarieDocumentRecords,
  fetchingDocumentRecords,
  fetchingQuestionDocumentRecords,
  deleteQuestionRecordDocumentByRequestId,
  deleteRecordDocumentByRequestId,
  getUploadedDocumentsByRequestId,
  getQuestionnarieDocumentByRequestId,
  fetchingQuestionDocumentByrequest,
  fetchingDocumentRecordsByRequestId,
  insertDocumentRecords,
  getDocumentswithTypesRecord,
  getDocumentRecords,
};
