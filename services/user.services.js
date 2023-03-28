/* eslint-disable max-len */
/* eslint-disable camelcase */
const userModel = require('../models/user.model');
const { insertDocument, insertCompanyImages } = require('../models/document.model');
const logger = require('../utils/winston');

// Import User Profile Model
const userProfileModel = require('../models/user-profile.model');

const { Message } = require('../utils/message');

const checkUser = async (email_id) => {
  const checkUserEmail = await userModel.checkEmailById(email_id);
  return checkUserEmail;
};

const checkPrimaryUser = async (family_id) => {
  const checkUserEmail = await userModel.checkPrimaryUser(family_id);
  return checkUserEmail;
};

const uploadDocuments = async (docs) => {
  const {
    document_type,
    family_id,
    member_id,
    company_branch_id,
    company_image_key,
    company_image_format,
    company_image_location,
    document_format,
    document_key,
    location,
  } = docs;
  if (family_id && member_id) {
    logger.info('Update user files in SQL DB');
    const certificate = await insertDocument({
      family_id, member_id, document_key, location, document_type, document_format,
    });
    return certificate;
  }
  if (company_branch_id) {
    logger.info('Company files in SQL DB');
    const companyLogo = await insertCompanyImages({
      company_branch_id, company_image_key, company_image_format, company_image_location,
    });
    return companyLogo;
  }
};

// const uploadDocuments = async (docs) => {
//   const {
//     file, document_type, document_id, family_id, member_id, company_branch_id,
//   } = docs;
//   const response = await uploads(file, document_type);
//   const [, type] = file.split(';')[0].split('/');
//   if (family_id && member_id) {
//     const location = response.Location;
//     const document_key = response.key;
//     const certificate = await insertDocument({
//       family_id, member_id, document_key, location, document_type: document_id, document_format: type,
//     });
//     return certificate;
//   }
//   if (company_branch_id) {
//     const company_image_location = response.Location;
//     const company_image_key = response.key;
//     const companyLogo = await insertCompanyImages({
//       company_branch_id, company_image_key, company_image_format: type, company_image_location,
//     });
//     return companyLogo;
//   }
// };

const CapitalizeCase = async (str) => {
  const splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
};

const addProfileRecords = async (data) => new Promise(async (resolve, reject) => {
  const profile = await userProfileModel.getProfile(data.member_id);
  profile.recordset[0].request_id = data.request_id;
  const insertProfileRecords = await userModel.insertProfileRecords(profile.recordset[0]);
  if (insertProfileRecords.rowsAffected[0] > 0) {
    resolve({
      status: true,
      message: Message.Common.SuccessMessage.Creation('Profile Record'),
    });
  } else {
    resolve({
      status: false,
      message: Message.Common.FailureMessage.Creation('Profile Record'),
    });
  }
});

const insertProfileRecords = async (data) => new Promise(async (resolve, reject) => {
  const profile = await userProfileModel.getProfileByRequestId(data.request_id);
  for (let i = 0; i < profile.recordset.length; i++) {
    const insertProfileRecords = await userModel.insertProfileRecords(profile.recordset[i]);
    if (profile.recordset.length === i + 1) {
      if (insertProfileRecords.rowsAffected[0] > 0) {
        resolve({
          status: true,
          message: Message.Common.SuccessMessage.Creation('Profile Record'),
        });
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Creation('Profile Record'),
        });
      }
    }
  }
});

module.exports = {
  checkUser,
  uploadDocuments,
  checkPrimaryUser,
  CapitalizeCase,
  addProfileRecords,
  insertProfileRecords,
};
