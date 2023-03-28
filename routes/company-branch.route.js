// import express library for routing
const express = require('express');

// Company Branch Routing
const companyBranchRouter = express.Router();

const { Role } = require('../utils/role');

// Uploading Files using multer
const { upload } = require('../middleware/file-upload');

// Import Company Branch Controller
const companyBranchController = require('../controllers/company-branch.controller');
const { Authentication, Access } = require('../middleware/auth');

// POST METHOD
companyBranchRouter.post('/createCompanyBranch', upload.fields(
  [
    {
      name: 'COMPANY_LOGO',
      maxCount: 1,
    },
  ],
), companyBranchController.createCompanyBranch);

companyBranchRouter.get('/getCompanyBranch', Authentication(), Access([Role.GROUP_HR, Role.SWAN_ADMIN]), companyBranchController.fetchCompanyBranch);

// PUT METHOD for editing company
companyBranchRouter.put('/updateCompanyBranch/:branchId', Authentication(), Access([Role.GROUP_HR, Role.SWAN_ADMIN]), companyBranchController.updateCompanyBranch);

// DELETE METHOD for delete company branch
companyBranchRouter.delete('/deleteCompanyBranch/:branchId', companyBranchController.deleteCompanyBranch);

companyBranchRouter.get('/companies', Authentication(), companyBranchController.getCompanies);

companyBranchRouter.get('/employeeDetails/:companyId', companyBranchController.getEmployeeDetails);

// Get users according to role wise
companyBranchRouter.get('/getdependentDetails/:family_id/:member_id', companyBranchController.getDependentDetails);

companyBranchRouter.get('/banks', companyBranchController.getBankList);

companyBranchRouter.get('/getCompanyList', Authentication(), Access([Role.GROUP_HR, Role.SWAN_ADMIN]), companyBranchController.CompaniesWithoutSubHr);

module.exports = companyBranchRouter;
