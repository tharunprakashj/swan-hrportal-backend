/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generate');

const insertAnswers = async ({
  userId,
  member_id,
  question_id,
  first_consulting,
  specify,
  illness_duration,
  doctor_name,
  doctor_number,
  doctor_address1,
  doctor_address2,
  expected_delivery_date,
  answer_status,
}) => {
  const result = await database.request()
    .input('family_id', userId)
    .input('member_id', member_id)
    .input('question_id', question_id)
    .input('first_consulting', first_consulting)
    .input('specify', specify)
    .input('illness_duration', illness_duration)
    .input('doctor_name', doctor_name)
    .input('doctor_number', doctor_number)
    .input('doctor_address1', doctor_address1)
    .input('doctor_address2', doctor_address2)
    .input('expected_delivery_date', expected_delivery_date)
    .input('answer_status', answer_status)
    .execute('insertHealthAnswers');
  return result;
};

const getAnswersById = async (profileId) => {
  const query = `SELECT health.*, profile.surname, profile.forename 
  FROM tbl_questionnarie_answers health 
  JOIN tbl_profiles profile ON profile.profile_id = health.member_id
  WHERE health.member_id=${profileId}`;
  return await database.request().query(query);
};

const getAnswerRequestId = async (request_id) => {
  const query = `SELECT forms.request_id,health.*
  FROM tbl_request_forms forms
  JOIN tbl_questionnarie_answers health ON health.member_id = forms.member_id
  WHERE forms.request_id=${request_id}`;
  return await database.request().query(query);
};

const getAnswersByUserId = async (family_id) => {
  const query = `SELECT health.answer_id, health.member_id,health.family_id, profile.surname, profile.forename, health.question_id, health.first_consulting, health.specify, health.illness_duration, health.doctor_name, health.doctor_number, health.doctor_address1, health.doctor_address2, health.expected_delivery_date ,health.answer_status,
  doc.document_key,doc.document_format,docType.document_type
  FROM tbl_questionnarie_answers health 
  LEFT JOIN tbl_questionnarie_documents doc ON doc.member_id = health.member_id AND doc.question_id = health.question_id
  JOIN tbl_profiles profile ON profile.profile_id = health.member_id
  LEFT JOIN tbl_document_type docType ON docType.document_type_id = doc.document_type
  WHERE health.family_id=${family_id}`;
  return await database.request().query(query);
};

const deleteAnswerById = async (answerId) => {
  const query = `DELETE FROM tbl_questionnarie_answers WHERE answer_id = ${answerId}`;
  return await database.request().query(query);
};

const insertQuestionnarieAnswers = async ({
  request_id,
  family_id,
  member_id,
  question_id,
  first_consulting,
  specify,
  illness_duration,
  doctor_name,
  doctor_number,
  doctor_address1,
  doctor_address2,
  expected_delivery_date,
  answer_status,
}) => {
  const result = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .input('member_id', member_id)
    .input('question_id', question_id)
    .input('first_consulting', first_consulting)
    .input('specify', specify)
    .input('illness_duration', illness_duration)
    .input('doctor_name', doctor_name)
    .input('doctor_number', doctor_number)
    .input('doctor_address1', doctor_address1)
    .input('doctor_address2', doctor_address2)
    .input('expected_delivery_date', expected_delivery_date)
    .input('answer_status', answer_status)
    .execute('insertHealthAnswersTemp');
  return result;
};

const getAnswersByRequestId = async (request_id) => {
  const query = `SELECT health.answer_id, health.member_id,health.family_id, profile.surname, profile.forename, health.question_id, health.first_consulting, health.specify, health.illness_duration, health.doctor_name, health.doctor_number, health.doctor_address1, health.doctor_address2 , health.expected_delivery_date ,health.answer_status,
  doc.document_key,doc.document_format,docType.document_type
  FROM tbl_questionnarie_answers_temp health
  LEFT JOIN tbl_questionnarie_document_records doc ON doc.member_id = health.member_id AND doc.question_id = health.question_id AND doc.request_id = ${request_id}
  JOIN tbl_profiles profile ON profile.profile_id = health.member_id
  LEFT JOIN tbl_document_type docType ON docType.document_type_id = doc.document_type
  WHERE health.request_id=${request_id}`;
  return await database.request().query(query);
};

const resetAnswers = async (family_id) => {
  const query = `DELETE FROM tbl_questionnarie_answers WHERE family_id = ${family_id};
  DELETE FROM tbl_questionnarie_documents WHERE family_id = ${family_id};`;
  return await database.request().query(query);
};

const deleteByMemberId = async (members) => {
  const query = `DELETE FROM tbl_questionnarie_answers WHERE member_id IN (${members});
  DELETE FROM tbl_questionnarie_documents WHERE member_id IN (${members});`;
  return await database.request().query(query);
};

const insertQuestionAnswersStatus = async (data) => {
  const query = await QueryGenerator.insert('tbl_question_answers_status', data);
  return await database.request().query(query);
};

const insertQuestionAnswersStatusRecords = async (data) => {
  const query = await QueryGenerator.insert('tbl_question_answers_status_records', data);
  return await database.request().query(query);
};

const insertQuestionAnswersRecords = async (data) => {
  const result = await database.request()
    .input('answer_status_id', data.answer_status_id)
    .input('family_id', data.family_id)
    .input('member_id', data.member_id)
    .input('question_id', data.question_id)
    .input('first_consulting', data.first_consulting)
    .input('specify', data.specify)
    .input('illness_duration', data.illness_duration)
    .input('doctor_name', data.doctor_name)
    .input('doctor_number', data.doctor_number)
    .input('doctor_address1', data.doctor_address1)
    .input('doctor_address2', data.doctor_address2)
    .input('expected_delivery_date', data.expected_delivery_date)
    .execute('insertAnswersRecords');
  return result;
};

module.exports = {
  insertAnswers,
  getAnswersById,
  getAnswersByUserId,
  deleteAnswerById,
  insertQuestionnarieAnswers,
  getAnswersByRequestId,
  resetAnswers,
  getAnswerRequestId,
  deleteByMemberId,
  insertQuestionAnswersStatus,
  insertQuestionAnswersStatusRecords,
  insertQuestionAnswersRecords,
};
