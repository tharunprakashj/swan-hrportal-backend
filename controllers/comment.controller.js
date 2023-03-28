/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable camelcase */
// Import Response Module for sending response to client application
const { StatusCodes } = require('http-status-codes');

const crypto = require('crypto');
const Response = require('../utils/response');

// Import Response Message
const { Message } = require('../utils/message');

// Import user Model for connecting user controller to  sql server
const commentModel = require('../models/comment.model');

const { requestStatus } = require('../utils/role');

const requestModel = require('../models/request.model');

// Import profile model
const userProfileModel = require('../models/user-profile.model');

const { updateRequestStatus } = require('../services/request.service');
const logger = require('../utils/winston');


const addComment = async (req, res) => {
  try {
    logger.info('Adding comments', req.body);
    // const comment = req.body;
    const {
      family_id,
      request_id,
      request_status,
      comment_title,
      comments,
      comment_type,
    } = req.body;
    const {
      user_id,
    } = req.user;
    const comment = {
      family_id,
      request_id,
      request_status,
      comment_title,
      comments,
      comment_type,
    };
    let commentAdded;
    if (comment) {
      comment.commented_by = user_id;
      if (!comment.comment_type) {
        comment.comment_type = 'EXTERNAL';
      }
      commentAdded = await commentModel.insertComment(comment);
      if (commentAdded.rowsAffected[0] > 0) {
        logger.info('Added comments Sucessfully');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Updation('Comments'),
        );
      } else {
        logger.error('Adding comments Failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('Comments'),
        );
      }
    } else {
      new Response(res, StatusCodes.BAD_REQUEST).ErrorMessage(
        Message.Common.FailureMessage.invalidData,
      );
    }
  } catch (err) {
    logger.error('Adding Comments Failed', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getCommentOfMember = async (req, res) => {
  try {
    logger.info('fetching comments', req.params);
    let request_id;
    const {
      familyId,
    } = req.params;
    if (req.query.request_id) {
      request_id = req.query.request_id;
    }
    const comments = await commentModel.getCommentByMemberId(familyId, request_id);
    if (comments.recordset.length > 0) {
      logger.info('Fetched Comments Succesfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Comments'),
        comments.recordset,
      );
    } else {
      logger.info('No Comments available');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Comments'),
        comments.recordset,
      );
    }
  } catch (err) {
    logger.error('Get Comments', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  addComment,
  getCommentOfMember,
};
