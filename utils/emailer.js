/* eslint-disable camelcase */
const AWS = require('aws-sdk');
require('dotenv').config(); // import .env
const logger = require('./winston');

const {
  AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION, SOURCE_EMAIL,
} = process.env;

const sendEmail = async ({ email_id, password }) => {
  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_KEY_ID,
    secretAccessKey: AWS_SECRET_KEY,
  });
  const params = {
    Destination: {
      ToAddresses: [email_id],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `Hi Welcome to MySwan<br>Your Password is: <b>${password}</b><br>Username is Your Email Address<br>Thank You`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Reset Password',
      },
    },
    // https://api.selfpass.ai/logo.png
    Source: `${SOURCE_EMAIL}`,
  };
  const sendPromise = new AWS.SES({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'ses:SendEmail',
          'ses:SendRawEmail',
        ],
        Resource: '*',
      },
    ],
  }).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    (data) => {
      logger.info(data.MessageId);
    },
  ).catch(
    (err) => {
      logger.error(err, err.stack);
    },
  );
};

module.exports = { sendEmail };
