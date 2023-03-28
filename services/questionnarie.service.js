/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-async-promise-executor */
const { reject } = require('lodash');
const logger = require('../utils/winston');

const { Message } = require('../utils/message');

// Import Questionnarie Model

const questionnarieModel = require('../models/questionnarie.model');

const addQuestionnarieAnswerRecords = async (data) => new Promise(async (resolve, reject) => {
  const { request_id, member_id } = data;
  let answers = await questionnarieModel.getAnswersById(member_id);
  answers = answers.recordset;
  if (answers.length > 0) {
    for (let i = 0; i < answers.length; i++) {
      const {
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
      } = answers[i];
      const data = await questionnarieModel.insertQuestionnarieAnswers({
        request_id,
        user_id: family_id,
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
      });
      logger.info('Added health answers', data);
      if (data.rowsAffected[0] > 0) {
        if (i === answers.length - 1) {
          logger.info('All the answers added successfully');
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.Creation('Answers Records'),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Answers Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Received empty answers array');
    resolve({
      status: true,
      message: Message.Common.FailureMessage.Empty,
    });
  }
});

const insertQuestionnarieAnswerRecords = async (data) => new Promise(async (resolve, reject) => {
  const { request_id, member_id } = data;
  let answers = await questionnarieModel.getAnswerRequestId(request_id);
  answers = answers.recordset;
  if (answers.length > 0) {
    for (let i = 0; i < answers.length; i++) {
      const {
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
      } = answers[i];
      const data = await questionnarieModel.insertQuestionnarieAnswers({
        request_id,
        user_id: family_id,
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
      });
      logger.info('Added health answers', data);
      if (data.rowsAffected[0] > 0) {
        if (i === answers.length - 1) {
          logger.info('All the answers added successfully');
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.Creation('Answers Records'),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Answers Records'),
        });
        break;
      }
    }
  } else {
    logger.info('Received empty answers array');
    resolve({
      status: true,
      message: Message.Common.FailureMessage.Empty,
    });
  }
});

module.exports = {
  addQuestionnarieAnswerRecords,
  insertQuestionnarieAnswerRecords,
};
