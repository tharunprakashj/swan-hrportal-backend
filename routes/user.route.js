const express = require('express');

const userRouter = express.Router();

const { Authentication } = require('../middleware/auth');

// const { connectDatabase } = require('../middleware/database-connection');

// Import User Controller
const userController = require('../controllers/user.controller');

// ~Second phase
userRouter.post('/userLogin/:role', userController.userLogin);

// creating user,profile,bank and companies details of the employee
// userRouter.post('/createEmployee', Authentication(), userController.createEmployee);
userRouter.post('/createEmployee', Authentication(), userController.createEmployee);

// fetching user details of an employee
userRouter.get('/getEmployee/:userId', userController.fetchEmployee);

// fetching user details of an employee
userRouter.get('/getUserDetails/:user_id', Authentication(), userController.fetchEmployeeById);

// fetching Roles
userRouter.get('/getRole', userController.getRole);

userRouter.put('/updateEmployee/:id', Authentication(), userController.updateEmployee);

// Delete the User Details
userRouter.delete('/deleteUser/:userId', userController.deleteUser);

// Delete the User Details
userRouter.get('/delete/:email_id', userController.deleteUserByEmail);

// Delete the User Details
userRouter.delete('/softDeleteUser/:user_id', userController.deleteUserById);

// Delete the User Dependant
userRouter.delete('/softDeleteDependant/:profile_id', userController.deleteDependantById);

// Search API for Main Member Details
userRouter.get('/searchPrincipalMember', userController.searchPrincipalMember);

// Fetch all the Employees
userRouter.get('/getAllEmployees', Authentication(), userController.getAllEmployees);

// Get users according to role wise
userRouter.get('/getEmployeeByRole/:roleId', userController.getEmployeeByRole);

// Change Password
userRouter.put('/setPassword', Authentication(), userController.setNewPassword);

// Change Password
userRouter.put('/changePassword', Authentication(), userController.changePassword);

// forgot Password
userRouter.post('/forgotPassword', userController.forgotPassword);

// Verify Otp
userRouter.post('/verifyOTP', userController.verifyOTP);

// Send Mail To All Users
userRouter.get('/welcomeMail', userController.sendMailToAllUsers);

// Add profiles, request, insurance, policy for subhr
userRouter.get('/addSubHrProfiles', userController.addSubHrProfiles);

// Add profiles, request, insurance, policy for subhr
userRouter.post('/rgpaUsers', userController.insertRGPAUser);

// ~Second phase get employee using request id
userRouter.get('/getEmployeeDetails/:request_id', userController.getEmployeeByRequestId);

// ~ Second phase add subhr
userRouter.post('/addSubHR/:company_id/:family_id', userController.addSubHR);

module.exports = userRouter;
