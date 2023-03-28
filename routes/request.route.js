const express = require('express');

const requestRouter = express.Router();

// const { Route53RecoveryCluster } = require('aws-sdk');
const { Authentication, Access } = require('../middleware/auth');

const requestController = require('../controllers/request.controller');
const { Role } = require('../utils/role');

// upload excel Files
requestRouter.post('/createRequest/:request_type/:family_id', Authentication(), requestController.createRequest);

// Change the Request Status
requestRouter.put('/updateRequestStatus', Authentication(), requestController.updateRequestStatus);

// Update Request like delete member, delete dependant, change plan
requestRouter.put('/updateRequest', Authentication(), requestController.updateRequest);

// Get the Request Details By Status
requestRouter.get('/requestinfo/:status', Authentication(), requestController.requestInfo);

// Get the Request Status
requestRouter.get('/requestStatuses', requestController.getRequestStatuses);

requestRouter.get('/requestcounts', Authentication(), requestController.getRequestCount);

requestRouter.get('/getByUser/:family_id', Authentication(), requestController.familyRequest);

requestRouter.get('/masterData', requestController.masterData);

// Assigned request Under HR's
requestRouter.put('/assignRequest/:assigned_to', Authentication(), Access([Role.SUB_HR, Role.SWAN_ADMIN]), requestController.assignRequest);

// Delete Dependant Request
requestRouter.post('/deleteDependantRequest', Authentication(), requestController.deleteDependantRequest);

// Delete Member Request
requestRouter.post('/deleteMemberRequest', Authentication(), requestController.deleteMemberRequest);

// Get the Request Details using Request ID
requestRouter.get('/getRequest/:request_id', requestController.getRequest);

// Get Request Assign History
requestRouter.get('/getRequestAssignHistory/:request_id', requestController.getRequestAssignHistory);

// upload excel Files
requestRouter.post('/uploadRequests', Authentication(), requestController.uploadRequestDeatils);

// cancel request
requestRouter.delete('/cancel/:request_id', Authentication(), requestController.cancelRequest);

// get dependent by request id
requestRouter.get('/getDependantByRequestId/:request_id', Authentication(), requestController.getDependant);

// Get the profile records using request id
requestRouter.get('/getPrimaryProfile/:request_id', requestController.getProfile);

// Get the profile records using request id
requestRouter.get('/getDependantsProfile/:request_id', requestController.getDependantsByRequestId);

// Get the profile records using request id
requestRouter.get('/getPolicyRecords/:request_id', requestController.getPolicyByRequestId);

// ~ SECOND PHASE  Get Questonnaire Answer Records by request_id
requestRouter.get('/answerRecords/:request_id', requestController.getAnswerRecords);

// Change the Request Status
requestRouter.put('/changeRequestStatus/:request_id', Authentication(), requestController.changeRequestStatus);

module.exports = requestRouter;
