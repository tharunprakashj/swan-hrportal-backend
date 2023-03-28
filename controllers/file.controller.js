/* eslint-disable max-len */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
// For connecting Nodejs and AWS S3 Bucket
const AWS = require('aws-sdk');

const { StatusCodes } = require('http-status-codes');

const reader = require('xlsx');
const { child } = require('winston');
const Response = require('../utils/response');

// Import User - Service for updating document details in database
const { uploadDocuments } = require('../services/user.services');

const companyModel = require('../models/company-branch.model');

const profilePicture = require('../utils/profilePic');

// Import File Model
const fileModel = require('../models/file.model');

// Import Response Message
const { Message } = require('../utils/message');
const {
  getAllDocumentTypes, getDocuments, insertBankList, insertQuestionDocument, insertQuestionDocumentRecords, insertDocumentRecords,
} = require('../models/document.model');
const { insertCompanyFromDoc } = require('../models/company-branch.model');
const { checkCompany, checkBank } = require('../services/company.services');
const userModel = require('../models/user.model');
const { checkUser } = require('../services/user.services');
const { fetchDocument, fetchDocumentRecords } = require('../services/documents.services');
const fileServices = require('../services/file.services');
const logger = require('../utils/winston');
const { Role, requestType } = require('../utils/role');

// Get Image From S3 Bucket
const getS3Image = async (req, res) => {
  logger.info('getting uploaded file');
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // endpoint: ENDPOINT,
  });

  const { key } = req.query;
  if (key === null || key === undefined || key === '' || key === 'null') {
    const imageType = 'image/png';
    const image = Buffer.from(profilePicture, 'base64');
    res.writeHead(200, {
      'Content-Type': imageType,
      'Content-Length': image.length,
    });
    res.end(image);
  } else {
    const downloadParams = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME,
    };
    const readStream = s3
      .getObject(downloadParams)
      .createReadStream()
      .on('error', (error) => {
        logger.error('fetching uploaded data', error);
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.NotFound('File'),
        );
      });
    readStream
      .pipe(res);
  }
};

const getDocumentTypes = async (req, res) => {
  try {
    logger.info('fetching document types');
    const roles = await getAllDocumentTypes();
    if (roles.recordsets.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Roles'),
        roles.recordsets[0],
      );
    } else {
      logger.info('No document types found');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Roles'),
      );
    }
  } catch (err) {
    logger.error('Error in fetching document types', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteFile = async (key) => new Promise(async (resolve, reject) => {
  logger.info('delete uploaded file');
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    // endpoint: ENDPOINT,
  });
  const deleteParams = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  await s3.deleteObject(deleteParams, (err, data) => {
    if (err) {
      logger.error('while deleting file', err);
      reject(err);
    } else {
      logger.info('Deleted the file Successfully');
      resolve(data);
    }
  }).promise();
});

const getDocument = async (req, res) => {
  try {
    logger.info('Fetching the uploaded files');
    const { family_id } = req.params;
    const { types } = req.query;
    if (types) {
      types.split(',').map((e) => Number(e));
    }

    const result = await getDocuments({ family_id, types });
    const documents = result.recordset;
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const file = process.env.FILE_BASE_URL + documents[i].document_key;
        documents[i].file = file;

        if (documents.length === i + 1) {
          logger.info('Documents fetched Sucessfully');
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Documents'),
            documents,
          );
        }
      }
    } else {
      logger.info('Document not found');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Documents'),
        documents,
      );
    }
  } catch (err) {
    logger.error('fetching uploaded documents', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const fetchingDocData = async (employees) => {
  // const file = reader.readFile('C:/Users/DELL/Desktop/MySwan/MySwan_Backend/docs/bank_list.xlsx');
  const file = reader.readFile(employees);
  const data = [];
  const sheets = file.SheetNames;
  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
      file.Sheets[file.SheetNames[i]],
    );
    temp.forEach((list) => {
      data.push(list);
    });
    if (i === sheets.length - 1) {
      return data;
    }
  }
};

const bankList = async (req, res) => {
  try {
    const path = `${process.env.APP_BASE_PATH}/docs/bank_list.xlsx`;
    const data = await fetchingDocData(path);
    for (let i = 0; i < data.length; i++) {
      if (data[i].bank_code) {
        const bank_code = parseInt(data[i].bank_code.trim());
        const result = await checkBank(bank_code);
        if (result) {
          const bank_name = data[i].bank_name.trim();
          const { account_no_length } = data[i];
          const bankUpdate = await insertBankList({ bank_code, bank_name, account_no_length });
        } else {
          logger.info('Bank already listed', data[i].bank_name);
        }
      } else if (data[i].company_branch) {
        const company_branch = data[i].company_branch.trim();
        const result = await checkCompany(company_branch);
        if (result) {
          const country = 'Mauritius';
          const company_id = 1;
          const updateCompany = await insertCompanyFromDoc({
            company_id, company_branch, country,
          });
        } else {
          logger.info(data[i], result);
        }
      }

      if (i === data.length - 1) {
        res.send(data);
      }
    }
    // res.send(data);
  } catch (err) {
    logger.error('bank list updating', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// Method for uploading documents
const uploadUserDocuments = async (req, res) => {
  let document_key;
  try {
    const {
      family_id,
      member_id,
    } = req.body;
    logger.info('Response received for uploading documents', req.body);

    if (req.files !== undefined || req.files !== null) {
      logger.info('Added images to s3 Sucessfully ');
      const certificates = Object.values(req.files);
      for (let i = 0; i < certificates.length; i++) {
        let updateInDb;
        for (let j = 0; j < certificates[i].length; j++) {
          const {
            key, mimetype, location, fieldname,
          } = certificates[i][j];
          let document_type = await fileModel.getDocumentTypeId(fieldname);
          document_type = document_type.recordset[0].document_type_id;
          const document_format = mimetype;
          const check = await fetchDocument(member_id, document_type);
          if (check.length > 0) {
            const existingKey = check[0].document_key;
            document_key = key;
            await deleteFile(existingKey);
            updateInDb = await fileModel.updateDocumentByKey({ document_key, document_format, location }, { member_id, document_type });
          } else {
            document_key = key;
            updateInDb = await uploadDocuments({
              family_id, member_id, document_key, document_type, document_format, location,
            });
          }
        }
        // if (i === certificates.length - 1) {
        if (updateInDb.rowsAffected[0] > 0) {
          logger.info('Document Added Sucessfully');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('User Documents'),
            );
          }
        } else {
          logger.error('Failed to upload images');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('User Documents'),
            );
          }
        }
        // }
      }
    } else {
      logger.error('Uploading images failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('User Documents'),
      );
    }
  } catch (err) {
    logger.error('User Documents Uploading', err);
    const delDocument = await deleteFile(document_key);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// Method for uploading documents records
const uploadUserDocumentRecords = async (req, res) => {
  let document_key;
  try {
    const {
      family_id,
      member_id,
    } = req.body;
    const { request_id } = req.params;
    logger.info('Response received for uploading documents', req.body);

    if (req.files !== undefined || req.files !== null) {
      logger.info('Added images to s3 Sucessfully ');
      const certificates = Object.values(req.files);
      for (let i = 0; i < certificates.length; i++) {
        let updateInDb;
        for (let j = 0; j < certificates[i].length; j++) {
          const {
            key, mimetype, location, fieldname,
          } = certificates[i][j];
          let document_type = await fileModel.getDocumentTypeId(fieldname);
          document_type = document_type.recordset[0].document_type_id;
          const document_format = mimetype;
          const check = await fetchDocumentRecords(request_id, member_id, document_type);
          if (check.length > 0) {
            const existingKey = check[0].document_key;
            document_key = key;
            await deleteFile(existingKey);
            updateInDb = await fileModel.updateDocumentRecordsByKey({ document_key, document_format, location }, { member_id, document_type });
          } else {
            document_key = key;
            updateInDb = await insertDocumentRecords({
              request_id, family_id, member_id, document_key, document_format, document_type, location,
            });
          }
        }
        // if (i === certificates.length - 1) {
        if (updateInDb.rowsAffected[0] > 0) {
          logger.info('Document Added Sucessfully');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('User Documents'),
            );
          }
        } else {
          logger.error('Failed to upload images');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('User Documents'),
            );
          }
        }
        // }
      }
    } else {
      logger.error('Uploading images failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('User Documents'),
      );
    }
  } catch (err) {
    logger.error('User Documents Uploading', err);
    const delDocument = await deleteFile(document_key);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// Method for uploading documents
const uploadQuestionDocuments = async (req, res) => {
  let document_key;
  try {
    const {
      family_id,
      member_id,
      question_id,
    } = req.body;

    if (req.files.XRAY_SCAN) {
      const certificates = Object.values(req.files);
      for (let i = 0; i < certificates.length; i++) {
        let updateInDb;
        for (let j = 0; j < certificates[i].length; j++) {
          const {
            key, mimetype, location, fieldname,
          } = certificates[i][j];
          document_key = key;
          const document_format = mimetype;
          let document_type = await fileModel.getDocumentTypeId(fieldname);
          document_type = document_type.recordset[0].document_type_id;
          const check = await fileServices.deleteQuestionaryDocuments(member_id, question_id);
          if (check) {
            updateInDb = await insertQuestionDocument({
              family_id, question_id, member_id, document_key, document_type, document_format, location,
            });
          } else {
            logger.error('Checking existing document in questionary error');
          }
        }
        if (updateInDb.rowsAffected[0] > 0) {
          logger.info('Questionnaire document uploaded successfully');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('User Documents'),
            );
          }
        } else {
          logger.info('Questionnaire document uploaded Failed');
          if (i === certificates.length - 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('User Documents'),
            );
          }
        }
        // }
      }
    } else {
      logger.info('Questionnaire not uploaded with requirement file');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('User Documents'),
      );
    }
  } catch (err) {
    logger.error('User Documents Uploading', err);
    const delDocument = await deleteFile(document_key);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const uploadChangePlanDocuments = async (req, res) => {
  let document_key;
  try {
    const {
      family_id,
      member_id,
      question_id,
    } = req.body;

    const { request_id } = req.params;

    if (req.files.XRAY_SCAN) {
      const certificates = Object.values(req.files);
      for (let i = 0; i < certificates.length; i++) {
        let updateInDb;
        for (let j = 0; j < certificates[i].length; j++) {
          const {
            key, mimetype, location, fieldname,
          } = certificates[i][j];
          document_key = key;
          const document_format = mimetype;
          let document_type = await fileModel.getDocumentTypeId(fieldname);
          document_type = document_type.recordset[0].document_type_id;
          const check = await fileServices.deleteQuestionaryDocumentsRecords(request_id, member_id, question_id);
          if (check) {
            updateInDb = await insertQuestionDocumentRecords({
              request_id, family_id, question_id, member_id, document_key, document_type, document_format, location,
            });
          } else {
            logger.error('Checking existing document in questionary error');
          }
        }
        if (i === certificates.length - 1) {
          if (updateInDb.rowsAffected[0] > 0) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('Change plan document'),
            );
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('Change plan document'),
            );
          }
        }
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('Change plan document'),
      );
    }
  } catch (err) {
    logger.error('Change plan document Uploading', err);
    const delDocument = await deleteFile(document_key);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// Method for uploading documents
const uploadUsers = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { employees } = req.body;
    const responses = [];
    const path = `${process.env.APP_BASE_PATH}/docs/${employees}`;
    const data = await fetchingDocData(path);
    for (let i = 0; i < data.length; i++) {
      const { email_id } = data[i];
      const checkUserEmail = await checkUser(email_id);
      if (checkUserEmail.recordset.length > 0) {
        responses.push({ email_id, message: Message.Common.FailureMessage.Existing('Employee'), status: false });
        logger.info('Employee Already available', checkUserEmail);
        if (data.length === i + 1) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Creation('Employee'),
            responses,
          );
        }
      } else {
        let company_id;
        let {
          company_branch,
          employee_id,
          surname,
          forename,
          user_gender,
          bank_id,
          bank_account_holder,
          bank_account_number,
          effective_insurance_date,
          is_next,
          is_mauritian,
          is_pensioner,
          date_of_birth,
          child,
          nic_no,
          passport_no,
          marital_status,
          phone_no_home,
          phone_no_mobile,
          phone_no_office,
          address_1,
          address_2,
          card,
        } = data[i];
        const companyDetails = await companyModel.getCompanyBranchDetails(company_branch);
        company_id = companyDetails.recordset[0].company_branch_id;
        if (is_mauritian === 'null' || is_mauritian === undefined || is_mauritian === '') {
          is_mauritian = true;
        }
        if (is_pensioner === 'null' || is_pensioner === undefined || is_pensioner === '') {
          is_pensioner = false;
        }
        if (date_of_birth === 'null' || date_of_birth === undefined || date_of_birth === '') {
          date_of_birth = '2000/01/01';
        }
        if (child === 'null' || child === undefined || child === '') {
          child = null;
        }
        if (nic_no === 'null' || nic_no === undefined || nic_no === '') {
          nic_no = null;
        }
        if (passport_no === 'null' || passport_no === undefined || passport_no === '') {
          passport_no = null;
        }
        if (marital_status === 'null' || marital_status === undefined || marital_status === '') {
          marital_status = null;
        }
        if (phone_no_home === 'null' || phone_no_home === undefined || phone_no_home === '') {
          phone_no_home = null;
        }
        if (phone_no_mobile === 'null' || phone_no_mobile === undefined || phone_no_mobile === '') {
          phone_no_mobile = null;
        }
        if (phone_no_office === 'null' || phone_no_office === undefined || phone_no_office === '') {
          phone_no_office = null;
        }
        if (address_1 === 'null' || address_1 === undefined || address_1 === '') {
          address_1 = null;
        }
        if (address_2 === 'null' || address_2 === undefined || address_2 === '') {
          address_2 = null;
        }
        if (card === 'null' || card === undefined || card === '') {
          card = null;
        }

        const password = Math.random().toString(36).slice(-8);
        const relationship = 'PRIMARY';
        const request_type = requestType.ADD_MEMBER;
        const request_createdby = user_id;
        const role = Role.EMPLOYEE;

        const createUser = await userModel.insertEmployee({
          company_id,
          employee_id,
          role,
          email_id,
          password,
          surname,
          forename,
          date_of_birth,
          relationship,
          child,
          user_gender,
          is_mauritian,
          nic_no,
          passport_no,
          marital_status,
          phone_no_home,
          phone_no_mobile,
          phone_no_office,
          address_1,
          address_2,
          is_pensioner,
          card,
          bank_id,
          bank_account_holder,
          bank_account_number,
          effective_insurance_date,
          request_type,
          request_createdby,
          policy_no: null,
          user_status: 'PENDING',
        });
        if (createUser.returnValue === 0) {
          const user_details = createUser.output;
          responses.push({ email_id, message: Message.Common.SuccessMessage.Creation('Employee'), status: true });
          logger.info('Employee created successfully', user_details);
          if (data.length === i + 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Employee'),
              responses,
            );
          }
          // if (is_next === 0) {
          //   sendMail({ email_id, password })
          //     .then(async (data) => {
          //       new Response(
          //         res,
          //         StatusCodes.OK,
          //       ).SuccessResponse(
          //         Message.Common.SuccessMessage.Creation('Employee'),
          //         userDetails.recordsets[0][0],
          //       );
          //     })
          //     .catch((err) => {
          //       new Response(
          //         res,
          //         StatusCodes.BAD_REQUEST,
          //       ).ErrorMessage(
          //         Message.Common.FailureMessage.userEmail,
          //       );
          //     });
          // } else {
          //   new Response(
          //     res,
          //     StatusCodes.OK,
          //   ).SuccessResponse(
          //     Message.Common.SuccessMessage.Creation('Employee'),
          //     userDetails.recordsets[0][0],
          //   );
          // }
        } else {
          logger.error('Employee not created');
          responses.push({ email_id, message: Message.Common.FailureMessage.Creation('Employee'), status: false });
          if (data.length === i + 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Employee'),
              responses,
            );
          }
        }
      }
    }
  } catch (err) {
    logger.error('User Excel Uploading', err.stack);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteDocuments = async (req, res) => {
  try {
    const {
      key,
    } = req.query;
    if (key) {
      // const deleteS3Key = await deleteFile(key);
      // const deleteDbKey = await fileModel.deleteDocumentByKey(key);
      // if (deleteDbKey.rowsAffected[0] > 0) {
      //   res.send({
      //     msg: 'deleted',
      //   });
      // }
      await deleteFile(key).then(async (data) => {
        const deleteDbKey = await fileModel.deleteDocumentByKey(key);
        if (deleteDbKey.rowsAffected[0] > 0) {
          logger.info('Document details deleted from db');
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Deletion('Document'),
          );
        } else {
          logger.error('Document details failed to delete from db');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Deletion('Document'),
          );
        }
      }).catch((err) => {
        logger.error('CATCH ERR--->', err);
      });
    }
  } catch (err) {
    logger.error('User Documents delete', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateUserDocuments = async (req, res) => {
  const {
    key,
  } = req.query;
  if (req.files !== undefined || req.files !== null) {
    await deleteFile(key).then(async (data) => {
      const certificates = Object.values(req.files);
      for (let i = 0; i < certificates.length; i++) {
        let updateDbKey;
        for (let j = 0; j < certificates[i].length; j++) {
          const {
            key,
          } = certificates[i][j];
          const document_key = key;
          updateDbKey = await fileModel.updateDocumentByKey({ document_key }, req.query.key);
        }
        if (i === certificates.length - 1) {
          if (updateDbKey.rowsAffected[0] > 0) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('Documents'),
            );
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('Documents'),
            );
          }
        }
      }
    }).catch((err) => {
      logger.error('CATCH ERR--->', err);
    });
  } else {
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.Updation('Documents'),
    );
  }
};

module.exports = {
  getS3Image,
  getDocumentTypes,
  deleteFile,
  getDocument,
  bankList,
  uploadUserDocuments,
  updateUserDocuments,
  uploadUsers,
  deleteDocuments,
  uploadQuestionDocuments,
  fetchingDocData,
  uploadChangePlanDocuments,
  uploadUserDocumentRecords,
};
