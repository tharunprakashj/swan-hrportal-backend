/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable camelcase */
// Import Response Module for sending response to client application
const { StatusCodes } = require('http-status-codes');

const Response = require('../utils/response');

// Import Response Message
const { Message } = require('../utils/message');

// Import user Model for connecting user controller to  sql server
const { 
  getNotifications, 
  getsubhr, 
  getCountByFamilyId, 
  updateIsRead, 
} = require('../models/notification.model');

const { getUserCount } = require('../services/notification.service');

const { requestStatus } = require('../utils/role');

const logger = require('../utils/winston');


const getNotification = async (req, res) => {
  try {
    const { user_id } = req.user;
    const notifications = await getNotifications(user_id);
    if (notifications.recordsets.length > 0) {
      const updateRead = await updateIsRead(user_id);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Notifications'),
        notifications.recordsets[0],
      );
      if (updateRead.rowsAffected[0] > 0) {
        logger.info('Notifications marked as read sucessfully');
        // new Response(
        //   res,
        //   StatusCodes.OK,
        // ).SuccessResponse(
        //   Message.Common.SuccessMessage.Fetch('Notifications'),
        //   notifications.recordsets[0],
        // );
      } else {
        logger.info('Notifications marked as read unsucessfull');
        // new Response(
        //   res,
        //   StatusCodes.OK,
        // ).ErrorMessage(
        //   Message.Common.FailureMessage.Updation('Is Read'),
        // );
      }
    } else {
      logger.info('Notifications not Available');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Notifications'),
        notifications.recordsets[0],
      );
    }
  } catch (err) {
    logger.error('Error in fetching notifications', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getNotificationCount = async (req, res) => {
  try {
    const { user_id } = req.user;
    const notificationCount = await getCountByFamilyId(user_id);
    if (notificationCount.recordset.length) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Notification Count'),
        notificationCount.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Notification Count'),
      );
    }
  } catch (err) {
    logger.error('Error in get notifications count', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  getNotification,
  getNotificationCount,
};
