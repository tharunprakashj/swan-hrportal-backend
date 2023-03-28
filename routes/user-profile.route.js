const express = require('express');

const userProfileRouter = express.Router();

const userProfileController = require('../controllers/user-profile.controller');

const { Authentication } = require('../middleware/auth');

// Add User Dependants API
userProfileRouter.post('/addDependants', Authentication(), userProfileController.addDependantsDetails);

// ~Second Phase Add User Dependants API
userProfileRouter.post('/createDependants/:request_id', Authentication(), userProfileController.createDependantsDetails);

// Add User Profile  ~Second phase
userProfileRouter.post('/addProfile/:request_id', Authentication(), userProfileController.addOrUpdateProfile);

// Edit User Profile Datas
userProfileRouter.put('/updateDependant/:member_id', userProfileController.updateUserProfile);

// Delete User Profiles for both employees and dependants
userProfileRouter.delete('/deleteDependants/:member_id/:request_id', userProfileController.deleteDependants);

// Get User Profiles for dependants
userProfileRouter.get('/getDependants/:familyId', userProfileController.getDependants);

// Get main member details along with their dependants
userProfileRouter.get('/getPrincpalAndDependants/:familyId', userProfileController.getPrincpalAndDependants);

module.exports = userProfileRouter;
