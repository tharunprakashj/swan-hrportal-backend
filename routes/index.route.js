const express = require('express');

const router = express.Router();
const { Authentication, test } = require('../middleware/auth');

// Import User Routes
const userRouter = require('./user.route');

// Import Location Routes
const locationRouter = require('./location.route');

// Import Company Branch Routes
const companyBranchRouter = require('./company-branch.route');

// Import User Profile Routes
const userProfileRouter = require('./user-profile.route');

// Import Health questions Routes
const healthQuestionsRouter = require('./questionnarie.route');

// Import Notification Routes
const notificationRouter = require('./notification.route');

// Import Image Routes
const imageRouter = require('./file.route');

// Import policies route
const policyRouter = require('./policy.route');

// Import request route
const requestRouter = require('./request.route');

// Import comment route
const commentRouter = require('./comment.route');

// Import Insurance route
const insuranceRouter = require('./insurance.route');

// Import Data Migration Route
const dataMigrationRouter = require('./datamigration.route');

// Routing to  Data Migration Routes
router.use('/dataMigration', dataMigrationRouter);

// Routing to User Routes
router.use('/user', userRouter);

// Routing to Location Routes
router.use('/location', locationRouter);

// Routing to Company Branch Routes
router.use('/companyBranch', companyBranchRouter);

// Routing to User Profile Routes
router.use('/userProfile', userProfileRouter);

// Routing to User Profile Routes
router.use('/healthQuestions', healthQuestionsRouter);

// Routing to User Profile Routes
router.use('/policy', policyRouter);

// Routing to User Profile Routes
router.use('/request', requestRouter);

// Routing to Comments Routes
router.use('/comment', commentRouter);

// Routing to Image Routes
router.use('/file', imageRouter);

// Routing to Insurance Routes
router.use('/insurance', insuranceRouter);

// Routing to  Notification Routes
router.use('/notification', notificationRouter);

module.exports = router;
