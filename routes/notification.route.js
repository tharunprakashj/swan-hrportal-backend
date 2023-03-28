// import express library for routing
const express = require('express');

// Company Branch Routing
const notificationRouter = express.Router();

const { Authentication, Access } = require('../middleware/auth');

// Import Notification Controller
const notificationController = require('../controllers/notification.controller');

// const { addNotification } = require('../services/notification.service');

// Get notification
notificationRouter.get('/getNotification', Authentication(), notificationController.getNotification);

// notificationRouter.post('/test', notificationController.addNotification);
notificationRouter.get('/getNotificationCount', Authentication(), notificationController.getNotificationCount);

module.exports = notificationRouter;
