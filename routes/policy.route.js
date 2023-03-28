const express = require('express');

const policyRouter = express.Router();
const { Role } = require('../utils/role');
const policyController = require('../controllers/policies.controller');
const { Authentication, Access } = require('../middleware/auth');

policyRouter.get('/basicRGPA', policyController.getBasicPlans);

policyRouter.get('/topUpPlan1', policyController.getTopUpPart1);

policyRouter.get('/topUpPlan2', policyController.getTopUpPart2);

policyRouter.post('/addPolicydetails', policyController.addPolicy);

policyRouter.post('/addPolicyrecords/:request_id', policyController.addPolicyRecords);

// Change Salary Band Request
policyRouter.put('/updateBasicRGPA/:family_id', Authentication(), Access([Role.SUB_HR, Role.SWAN_ADMIN]), policyController.updateBasicRGPA);

// Get Policy Details of the family for both employee and dependants
policyRouter.get('/getFamilyPolicyDetails/:family_id', Authentication(), policyController.getFamilyPolicyDetails);

// Get Change Plan Policy Details
policyRouter.get('/getFamilyApprovedPolicyDetails/:family_id', Authentication(), policyController.getFamilyApprovedPolicyDetails);

// Get Policy Details Using Policy Id
policyRouter.get('/getPolicyDetails/:policy_id', Authentication(), policyController.getPolicyDetails);

// Update Policy Details
policyRouter.put('/updatePolicy/:request_id', Authentication(), policyController.updatePolicy);

// Change Top-Up Request
policyRouter.put('/updatePolicyDetails/:request_id', Authentication(), policyController.updatePolicyDetails);

// policyRouter.put('/updateSalaryBand/:request_id', Authentication(), Access([Role.SUB_HR, Role.SWAN_ADMIN]), policyController.updateSalaryRGPA);

module.exports = policyRouter;
