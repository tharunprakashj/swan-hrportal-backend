const express = require('express');

const questionnarieRouter = express.Router();
const { Role } = require('../utils/role');
const questionnarieController = require('../controllers/questionnarie.controller');
const { Authentication, Access } = require('../middleware/auth');

// POST METHOD
// questionnarieRouter.post('/create-company-branch', companyBranchController.createCompanyBranch);

// , Authentication(), Access([Role.HR_EXECUTIVE, Role.GROUP_HR, Role.EMPLOYEE])

questionnarieRouter.get('/questions', questionnarieController.fetchQuestions);

questionnarieRouter.post('/answers/:userId', questionnarieController.addAnswers);

questionnarieRouter.post('/addAnswers/:request_id', questionnarieController.addQuestionnarieAnswers);

// Get the Health Details Questions
questionnarieRouter.get('/getHealthQuestion', questionnarieController.doctorQuestion);

// Get the Answers
questionnarieRouter.get('/answers/:userId', questionnarieController.getAnswers);

// Get the Answer fro change plan questionnarie
questionnarieRouter.get('/getAnswers/:request_id', questionnarieController.getAnswer);

// Get the Answers with questions
questionnarieRouter.get('/answersWithQuestions/:userId', questionnarieController.getAnswersWithQuestions);

// Delete answer
questionnarieRouter.delete('/deleteAnswer/:answer_id', questionnarieController.deleteAnswer);

// Insert Answer Status
questionnarieRouter.post('/insertAnswer/:family_id', questionnarieController.insertAnswerStatusRecords);

questionnarieRouter.post('/addAnswerRecords/:request_id', questionnarieController.addQuestionnarieAnswersRecords);

module.exports = questionnarieRouter;
