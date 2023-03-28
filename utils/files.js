require('dotenv').config();
const AWS = require('aws-sdk');
const shortid = require('shortid');
const logger = require('./winston');

const {
  AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME,
} = process.env;

const uploads = async (file, document_type) => new Promise((resolve, reject) => {
  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_KEY_ID,
    secretAccessKey: AWS_SECRET_KEY,
  });
  const s3 = new AWS.S3({
    accessKeyId: AWS_KEY_ID,
    secretAccessKey: AWS_SECRET_KEY,
  });

  const uniqueId = shortid.generate();

  const [, type] = file.split(';')[0].split('/');
  const todayDate = new Date().toISOString().slice(0, 10);
  const filename = `${document_type}_${todayDate}_${uniqueId}.${type}`;
  const fileLocation = `uploads/documents/${filename}`;

  const buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const params = {
    Bucket: AWS_BUCKET_NAME, Key: fileLocation, Body: buf, ContentEncoding: 'base64', ContentType: 'image/jpeg',
  };
  // ACL: 'public-read'
  try {
    const response = s3.upload(params).promise();
    resolve(response);
  } catch (err) {
    logger.error('uploading file', err);
    reject(err);
  }
});

module.exports = { uploads };
