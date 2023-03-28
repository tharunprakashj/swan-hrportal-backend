/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const clone = require('clone');
const Response = require('../utils/response');
const { Message } = require('../utils/message');
const { Questionnaire, doctorQuestions } = require('../utils/questionnaire');
const questionnarieModel = require('../models/questionnarie.model');

const companyBranchModel = require('../models/company-branch.model');
const logger = require('../utils/winston');

const {
  fetchRequestType,
} = require('../services/request.service');

const {
  requestType,
} = require('../utils/role');

// Method For Creating Company Branch
const addAnswers = async (req, res) => {
  try {
    logger.info('received health answers', req.body);
    const answers = req.body;
    const {
      userId,
    } = req.params;
    if (answers.length > 0) {
      for (let i = 0; i < answers.length; i++) {
        const {
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
        const data = await questionnarieModel.insertAnswers({
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
        });
        logger.info('Added health answers', data);
        if (data.returnValue === 0) {
          if (i === answers.length - 1) {
            logger.info('All the answers added successfully');

            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Answers'),
            );
          }
        } else {
          logger.error('Failed to add answers to the questtionaries', answers[i]);
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.questionnarie,
          );
          break;
        }
      }
    } else {
      logger.info('Received empty answers array');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Empty,
      );
    }
  } catch (err) {
    logger.error('Adding answers of helath report', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.Creation('Health Report'),
    );
  }
};

const fetchQuestions = async (req, res) => {
  try {
    const questions = Questionnaire.questionnaire;
    if (questions.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health Questions'),
        questions,
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Health Questions'),
      );
    }
  } catch (err) {
    logger.error('Error in fetching answers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const doctorQuestion = async (req, res) => {
  try {
    const doctor = doctorQuestions.health_report;
    if (doctor.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Questions'),
        doctor,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Questions'),
      );
    }
  } catch (err) {
    logger.error('Error in fetching answers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getAnswers = async (req, res) => {
  try {
    logger.info('fetching answers using family_id');
    const {
      userId,
    } = req.params;
    const family_id = parseInt(userId, 10);
    const answers = await questionnarieModel.getAnswersByUserId(family_id);
    if (answers.recordset.length > 0) {
      logger.info('fetching answers Sucessfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health report'),
        answers.recordset,
      );
    } else {
      logger.info('No Answers added empty array received');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.NoDataFound('Health report'),
        [],
      );
    }
  } catch (err) {
    logger.error('Error in fetching answers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// const generateHealthQuestionsWithAnswers = (healthReports) => new Promise((resolve, reject) => {
//   try {
//     // logger.info('fetching answers using family_id');
//     let num = 0;
//     const quest = Questionnaire.questionnaire;
//     const subquest = doctorQuestions.health_report;
//     const ques = quest[0].questions;
//     ques.map((subQuestions) => {
//       healthReports.map((answer) => {
//         num++;
//         if (subQuestions.subquestions.length > 0) {
//           subQuestions.subquestions.map((subanswers) => {
//             if (subanswers.questionId === answer.question_id) {
//               let data;
//               if (!subanswers.answer) {
//                 subquest.map((healthAnswers) => {
//                   healthAnswers.answer = answer[healthAnswers.key];
//                 });
//                 data = clone(subquest);
//                 subanswers.answer = [data];
//               } else {
//                 subquest.map((healthAnswers) => {
//                   healthAnswers.answer = answer[healthAnswers.key];
//                 });
//                 data = clone(subquest);
//                 subQuestions.answer.push(data);
//               }
//             } else if (subQuestions.questionId === answer.question_id) {
//               let data;
//               if (!subQuestions.answer) {
//                 subquest.map((healthAnswers) => {
//                   healthAnswers.answer = answer[healthAnswers.key];
//                 });
//                 data = clone(subquest);
//                 subQuestions.answer = [data];
//               } else {
//                 subquest.map((healthAnswers) => {
//                   healthAnswers.answer = answer[healthAnswers.key];
//                 });
//                 data = clone(subquest);
//                 subQuestions.answer.push(data);
//               }
//             }
//           });
//         }
//         if (num === ques.length) {
//           resolve(ques);
//         }
//       });
//     });
//   } catch (err) {
//     reject(err);
//   }
// });

const generateSubQuestions = (answers) => new Promise((resolve, reject) => {
  const subquest = doctorQuestions.health_report;
  for (let i = 0; i < subquest.length; i++) {
    subquest[i].answer = answers[subquest[i].key];
  }
  resolve(subquest);
});

const generateHealthQuestionsWithAnswers = (healthReports) => new Promise(async (resolve, reject) => {
  try {
    // logger.info('fetching answers using family_id');
    const quest = Questionnaire.questionnaire;
    const ques = quest[0].questions;
    if (healthReports.length > 0) {
      for (let i = 0; i < ques.length; i++) {
        if (ques[i].subquestions.length > 0) {
          for (let k = 0; k < ques[i].subquestions.length; k++) {
            for (let j = 0; j < healthReports.length; j++) {
              if (ques[i].subquestions[k].questionId === healthReports[j].question_id) {
                let data;
                data = await generateSubQuestions(healthReports[j]);
                if (!ques[i].subquestions[k].answer) {
                  ques[i].subquestions[k].answer = [data];
                } else {
                  ques[i].subquestions[k].answer.push(data);
                }
                // ques[i].subquestions[k].answer = healthReports[j];
              }
            }
          }
        } else {
          for (let j = 0; j < healthReports.length; j++) {
            if (ques[i].questionId === healthReports[j].question_id) {
              let data;
              data = await generateSubQuestions(healthReports[j]);
              if (!ques[i].answer) {
                ques[i].answer = [data];
              } else {
                ques[i].answer.push(data);
              }
              // ques[i].answer = healthReports[j];
            }
          }
        }
      }
      resolve(ques);
    } else {
      resolve(ques);
    }
  } catch (err) {
    reject(err);
  }
});

const getAnswersWithQuestions = async (req, res) => {
  try {
    const {
      userId,
    } = req.params;
    const answers = await questionnarieModel.getAnswersByUserId(userId);
    const healthReports = answers.recordsets[0];
    // if (healthReports.length > 0) {
    const questions = await generateHealthQuestionsWithAnswers(healthReports);
    if (answers.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health Questions'),
        questions,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health Questions'),
        questions,
      );
    }
    // } else {
    //   new Response(
    //     res,
    //     StatusCodes.OK,
    //   ).SuccessResponse(
    //     Message.Common.FailureMessage.NoDataFound('Health Questions answers'),
    //   );
    // }
    // for(let i=0; i<)
  } catch (err) {
    logger.error('Error in fetching answers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteAnswer = async (req, res) => {
  try {
    logger.info('deleting answers');
    const {
      answer_id,
    } = req.params;
    const deleteAnswer = await questionnarieModel.deleteAnswerById(answer_id);
    if (deleteAnswer.rowsAffected[0] > 1) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Deletion('Answers'),
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Deletion('Answers'),
      );
    }
  } catch (err) {
    logger.error('Error in deleting answers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addQuestionnarieAnswers = async (req, res) => {
  try {
    logger.info('received health answers', req.body);
    const answers = req.body;
    const {
      request_id,
    } = req.params;
    const { request_type } = await fetchRequestType(request_id);

    if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT || request_type === requestType.CHANGE_PLAN) {
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
          });
          logger.info('Added health answers', data);

          if (i === answers.length - 1) {
            logger.info('All the answers added successfully');

            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Answers'),
            );
          }
        }
      } else {
        logger.error('Received empty answers array');
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Empty,
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NextPage('Questionnarie'),
      );
    }
  } catch (err) {
    logger.error('Error in addQuestionnarieAnswers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getAnswer = async (req, res) => {
  try {
    logger.info('fetching answers using request_id');
    const {
      request_id,
    } = req.params;
    // const request_id = parseInt(request_id, 10);
    const answers = await questionnarieModel.getAnswersByRequestId(request_id);
    if (answers.recordset.length > 0) {
      logger.info('fetching answers Sucessfully', answers.recordset);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health report'),
        answers.recordset,
      );
    } else {
      logger.info('No Answers added empty array received');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.NoDataFound('Health report'),
        [],
      );
    }
  } catch (err) {
    logger.error('Error in getting Answers', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const insertAnswerStatusRecords = async (req, res) => {
  try {
    const answer = req.body;
    let {
      family_id,
    } = req.params;
    let {
      request_id,
    } = req.query;
    [request_id, family_id] = [JSON.parse(request_id), JSON.parse(family_id)];
    if (request_id) {
      for (let i = 0; i < answer.length; i++) {
        const {
          question_id,
          answer_status,
          member_id,
          first_consulting,
          specify,
          illness_duration,
          doctor_name,
          doctor_number,
          doctor_address1,
          doctor_address2,
          expected_delivery_date,
        } = answer[i];
        const insertAnswerStatus = await questionnarieModel.insertQuestionAnswersStatusRecords({
          request_id,
          family_id,
          question_id,
          answer_status,
        });
        if (insertAnswerStatus.rowsAffected[0] > 0) {
          if (answer_status === 1) {
            const insertAnswer = await questionnarieModel.insertQuestionAnswersRecords({
              answer_status_id: insertAnswerStatus.recordset[0].insertedId,
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
            });
            if (insertAnswer.returnValue === 0) {
              if (answer.length - 1 === i) {
                new Response(
                  res,
                  StatusCodes.OK,
                ).SuccessResponse(
                  Message.Common.SuccessMessage.Creation('Answer'),
                );
              }
            } else {
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.Creation('Answer'),
              );
              break;
            }
          } else if (answer.length - 1 === i) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Answer'),
            );
          }
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Answer Status'),
          );
          break;
        }
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        'Please send the request_id',
      );
    }
  } catch (err) {
    logger.error('Insert Question Answers Status Records', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addQuestionnarieAnswersRecords = async (req, res) => {
  try {
    logger.info('received health answers', req.body);
    const answers = req.body;
    const {
      request_id,
    } = req.params;

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
        });
        logger.info('Added health answers', data);

        if (i === answers.length - 1) {
          logger.info('All the answers added successfully');

          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Creation('Answers'),
          );
        }
      }
    } else {
      logger.error('Received empty answers array');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Empty,
      );
    }
  } catch (err) {
    logger.error('Error in addQuestionnarieAnswers', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  fetchQuestions,
  addAnswers,
  doctorQuestion,
  getAnswers,
  getAnswersWithQuestions,
  deleteAnswer,
  addQuestionnarieAnswers,
  getAnswer,
  insertAnswerStatusRecords,
  addQuestionnarieAnswersRecords,
};
