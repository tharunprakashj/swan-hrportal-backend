const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const Response = require('../utils/response');
const { Message } = require('../utils/message');
const logger = require('../utils/winston');

const getToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  logger.info('Token expiresIn', process.env.JWT_EXPIRE_TIME, process.env.JWT_SECRET);
  return token;
};

const Authentication = () => (req, res, next) => {
  try {
    const token = req.headers.token || req.cookies.token || null;
    if (!token) {
      logger.error('Token Expired ......');
      new Response(
        res,
        StatusCodes.UNAUTHORIZED,
      ).ErrorMessage(
        Message.Common.FailureMessage.loginPlease,
      );
    } else {
      // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      //   if (err);
      //   else ;
      // });

      const user = jwt.verify(token, process.env.JWT_SECRET);
      // const user = jwt.decode(token, process.env.JWT_SECRET);

      // const user = jwt.decode(token, 'MYSWAN@2022');
      if (user) {
        req.user = user;
        next();
      } else {
        logger.error('Unauthorized to access this url ......');
        new Response(
          res,
          StatusCodes.UNAUTHORIZED,
        ).ErrorMessage(
          Message.Common.FailureMessage.Unauthorized,
        );
      }
    }
  } catch (err) {
    logger.error('Authentication failed', err);
    new Response(
      res,
      StatusCodes.UNAUTHORIZED,
    ).ErrorMessage(
      Message.Common.FailureMessage.Unauthorized,
    );
  }
};

const Access = (roles = []) => (req, res, next) => {
  try {
    if (!roles.includes(req.user.role)) {
      new Response(
        res,
        StatusCodes.UNAUTHORIZED,
      ).ErrorMessage(
        Message.Common.FailureMessage.noAccess,
      );
    } else {
      next();
    }
  } catch (err) {
    logger.error('Access role ', err);
    new Response(
      res,
      StatusCodes.UNAUTHORIZED,
    ).ErrorMessage(
      Message.Common.FailureMessage.Unauthorized,
    );
  }
};

module.exports = {
  getToken,
  Authentication,
  Access,
};
