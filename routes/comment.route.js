// import express library for routing
const express = require('express');

// Company Branch Routing
const commentRouter = express.Router();

// Authentication and Authorization
const { Authentication, Access } = require('../middleware/auth');

// Import Comment Controller
const commentController = require('../controllers/comment.controller');

// Add Comment
commentRouter.post('/addComments', Authentication(), commentController.addComment);

// Get Comments by member id
commentRouter.get('/getAllComments/:familyId', commentController.getCommentOfMember);

module.exports = commentRouter;
