/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
// Import Response Module for sending response to client application
const { StatusCodes } = require('http-status-codes');
const { reject } = require('lodash');
const crypto = require('crypto');
const clone = require('clone');
const { BOOLEAN } = require('sequelize');
const Response = require('../utils/response');
const { Message } = require('../utils/message');
const userModel = require('../models/user.model');
const {
  getPrimaryUser, checkNIC, checkPassport, updateUserProfileByFamilyId, getProfile, updateUserProfileByProfileId,
} = require('../models/user-profile.model');
const commentModel = require('../models/comment.model');
const documentModel = require('../models/document.model');
const tokenModule = require('../utils/token');
const {
  checkUser, uploadDocuments, checkPrimaryUser, CapitalizeCase,
} = require('../services/user.services');
const { checkCompanySubHr } = require('../services/company.services');
const { getToken } = require('../middleware/auth');
const { sendMail, sendOTP } = require('../utils/mailer');
const { uploadFilesToS3 } = require('../utils/s3');
const { uploads } = require('../utils/files');
const {
  Role, documentType, userStatus, requestType, userRelationship,
} = require('../utils/role');
const logger = require('../utils/winston');
const { calculateInsuranceDate } = require('../services/insurance.services');
const { sendEmail } = require('../utils/emailer');
const { getDocuments } = require('../models/document.model');

const createEmployee = async (req, res) => {
  try {
    logger.info('Creating new employee data', req.body);
    const { user_id } = req.user;
    let {
      company_id,
      employee_id,
      role,
      email_id,
      surname,
      forename,
      date_of_birth,
      user_gender,
      is_next,
    } = req.body;

    const password = Math.random().toString(36).slice(-8);
    const user_status = userStatus.PENDING;
    const relationship = userRelationship.PRIMARY;
    const policy_no = crypto.randomBytes(5).toString('hex');
    const user = {
      company_id,
      employee_id,
      role,
      email_id,
      password,
      surname,
      forename,
      date_of_birth,
      user_gender,
      user_status,
      relationship,
      policy_no,
    };
    const checkUserEmail = await checkUser(email_id);
    if (checkUserEmail.recordset.length > 0) {
      logger.info('Employee Already available', checkUserEmail);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.Existing('Employee'),
      );
    } else if (role === Role.SUB_HR) {
      const availability = await checkCompanySubHr(company_id);
      if (availability) {
        const createUser = await userModel.addEmployee(user);
        if (createUser.returnValue === 0) {
          const user_details = createUser.output;
          // const userDetails = await userModel.getPrimaryUser(user_details.family_id);
          const userDetails = await userModel.fetchEmployeeDetails(user_details.family_id);
          if (userDetails.recordsets[0].length > 0) {
            logger.info('Sub HR created successfully', userDetails.recordsets[0][0]);
            sendMail({ email_id, password })
              .then(async (data) => {
                new Response(
                  res,
                  StatusCodes.OK,
                ).SuccessResponse(
                  Message.Common.SuccessMessage.Creation('Sub HR'),
                  userDetails.recordsets[0][0],
                );
              })
              .catch((err) => {
                logger.error(err);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.userEmail,
                );
              });
            logger.error('Error in mail sending');
          } else {
            logger.error('Sub HR not created');
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Sub Hr'),
            );
          }
        }
      } else {
        logger.error('Sub Hr already exist');
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).SuccessResponse(
          Message.Common.FailureMessage.Existing('Sub HR'),
        );
      }
    } else {
      const createUser = await userModel.addEmployee(user);
      if (createUser.returnValue === 0) {
        const user_details = createUser.output;
        logger.info('Employee created successfully', user_details);
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Creation('Employee'),
          user_details,
        );
        // if (is_next === 0) {
        // sendMail({ email_id, password })
        //   .then(async (data) => {
        //     logger.info('Mail sended successfully', data);
        //     new Response(
        //       res,
        //       StatusCodes.OK,
        //     ).SuccessResponse(
        //       Message.Common.SuccessMessage.Creation('Employee'),
        //       user_details,
        //     );
        //   })
        //   .catch((err) => {
        //     logger.error(err);
        //     new Response(
        //       res,
        //       StatusCodes.BAD_REQUEST,
        //     ).ErrorMessage(
        //       Message.Common.FailureMessage.userEmail,
        //     );
        //   });
        // } else {
        //   new Response(
        //     res,
        //     StatusCodes.OK,
        //   ).SuccessResponse(
        //     Message.Common.SuccessMessage.Creation('Employee'),
        //     user_details,
        //   );
        // }
      } else {
        logger.error('Employee not created');
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Employee'),
        );
      }
    }
  } catch (err) {
    logger.error('Error in creating employee', err.stack);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.UserManagement.FailureMessage.ServerError,
    );
  }
};

const createProfile = async (profiles) => {
  try {
    logger.info('Creating new profile data', profiles);
    let {
      family_id,
      company_id,
      surname,
      forename,
      date_of_birth,
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
      effective_insurance_date,
      // documents,
    } = profiles;

    if (!is_mauritian) {
      is_mauritian = false;
    }
    if (!is_pensioner) {
      is_pensioner = false;
    }
    if (!user_gender) {
      user_gender = 'MALE';
    }
    if (!date_of_birth) {
      date_of_birth = '2000/01/01';
    }
    // if(!surname){
    //   surname = null
    // }
    // if(!marital_status){
    //   marital_status='Single'
    // }

    const relationship = 'PRIMARY';
    const user_status = 'PENDING';
    const request_type = requestType.ADD_MEMBER;
    const policy_no = crypto.randomBytes(5).toString('hex');
    const user = {
      family_id,
      company_id,
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
      effective_insurance_date,
      request_type,
      policy_no,
      user_status,
    };
    const checkUserEmail = await checkPrimaryUser(family_id);
    if (checkUserEmail.recordset.length > 0) {
      logger.info('Employee Already available', checkUserEmail);
    } else {
      const createUser = await userModel.insertProfiles(user);
      if (createUser.returnValue === 0) {
        logger.info('Employee created successfully');
      } else {
        logger.error('Employee not created', user);
      }
    }
  } catch (err) {
    logger.error('Error in creating employee', err.stack);
  }
};

const getRole = async (req, res) => {
  try {
    const roles = await userModel.getRoles();
    if (roles.recordsets.length > 0) {
      logger.info('Fetching roles', roles);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Roles'),
        roles.recordsets[0],
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Roles'),
      );
    }
  } catch (err) {
    logger.error('Getting role -->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addFiles = async (req, res) => {
  try {
    const { documents } = req.body;
    const forename = 'myswan';
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        const file = documents[i];
        const response = uploads(file, forename);
      }
    }
  } catch (err) {
    logger.error('Add file--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// updating profile user bank details
const updateEmployee = async (req, res) => {
  try {
    let constDate;
    let month;
    let insurance_end_date;
    const { id } = req.params;
    let {
      request_id,
      request_status,
      profile_id,
      employment_date,
      surname,
      forename,
      date_of_birth,
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
      city,
      bank_code,
      bank_account_holder,
      bank_account_number,
      effective_insurance_date,
      documents,
      comments,
      relationship,
      user_status,
    } = req.body;

    logger.info(
      'update Employee',
      req.body,
    );

    if (effective_insurance_date) {
      insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
    }

    const user = {
      id,
      profile_id,
      employment_date,
      surname,
      forename,
      date_of_birth,
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
      city,
      bank_code,
      bank_account_holder,
      bank_account_number,
      effective_insurance_date,
      insurance_end_date,
      request_id,
      relationship,
      user_status,
    };

    if (!profile_id || !request_id) {
      logger.info('Required Fields not received');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.requiredData,
      );
    } else {
      let availability;
      if (nic_no) {
        availability = await checkNIC(nic_no, profile_id);
      }
      if (passport_no) {
        availability = await checkPassport(passport_no, profile_id);
      }
      if (availability.recordset.length > 0) {
        logger.info('Employee Already available', availability.recordset);
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Existing('NIC or Passport'),
        );
      } else {
        const updateUser = await userModel.updateEmployeeDetails(user);
        const family_id = JSON.parse(id);
        if (updateUser.rowsAffected[0] > 0 && updateUser.returnValue === 0) {
          if (comments) {
            let comment_title = 'Edit Application';
            let comment_type = 'EXTERNAL';
            let comment_payload = {
              family_id: id,
              comment_title,
              comment_type,
              comments,
              commented_by: req.user.user_id,
              request_id,
              request_status,
            };
            let commentAdded = await commentModel.insertComment(comment_payload);
            logger.info('comments added successfully');
          }
          logger.info('Employee updated successfully');
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Updation('User Details'),
          );

          // if (documents.length > 0) {
          //   for (let i = 0; i < documents.length; i++) {
          //     const { file, document_id, document_type } = documents[i];
          //     let member_id = profile_id;
          //     const uploadedFile = await uploadDocuments(file, document_type, document_id, family_id, member_id);
          //     if (uploadedFile.rowsAffected[0] > 0) {
          //       logger.info('Documents added successfully');
          //       if (i === documents.length - 1) {
          //         new Response(
          //           res,
          //           StatusCodes.OK,
          //         ).SuccessResponse(
          //           Message.Common.SuccessMessage.Updation('User Details'),
          //         );
          //       }
          //     } else if (i === documents.length - 1) {
          //       logger.error('Documents adding failed');
          //       new Response(
          //         res,
          //         StatusCodes.OK,
          //       ).SuccessResponse(
          //         Message.Common.FailureMessage.documentFailed,
          //       );
          //     }
          //   }
          // } else {
          //   logger.info('Adding employee added');
          //   new Response(
          //     res,
          //     StatusCodes.OK,
          //   ).SuccessResponse(
          //     Message.Common.SuccessMessage.Updation('User Details'),
          //   );
          // }
        } else {
          logger.error('Employee Update failed');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Updation('User Details'),
          );
        }
      }
    }
  } catch (err) {
    logger.error('update Employee', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.UserManagement.FailureMessage.ServerError,
    );
  }
};

const generateEmployeeDetails = (user, profile, bank, company, request, insurance) => new Promise((resolve, reject) => {
  try {
    let finalData;
    if (request !== undefined) {
      finalData = {
        user_id: user.user_id,
        family_id: user.user_id,
        company_name: company.company_name,
        company_branch: company.company_branch,
        request_status: request.request_status,
        employee_id: user.employee_id,
        employment_date: user.employment_date,
        role: user.role,
        email_id: user.email_id,
        profile_id: profile.profile_id,
        surname: profile.surname,
        forename: profile.forename,
        date_of_birth: profile.date_of_birth,
        relationship: profile.relationship,
        child: profile.child,
        user_gender: profile.user_gender,
        is_mauritian: profile.is_mauritian,
        nic_no: profile.nic_no,
        passport_no: profile.passport_no,
        marital_status: profile.marital_status,
        phone_no_home: profile.phone_no_home,
        phone_no_mobile: profile.phone_no_mobile,
        phone_no_office: profile.phone_no_office,
        address_1: profile.address_1,
        address_2: profile.address_2,
        is_pensioner: profile.is_pensioner,
        card: profile.card,
        bank_code: bank.bank_code,
        bank_name: bank.bank_name,
        bank_account_holder: bank.bank_account_holder,
        bank_account_number: bank.bank_account_number,
        role_type: company.role_type,
        effective_insurance_date: insurance.effective_insurance_date,
      };
    } else {
      finalData = {
        user_id: user.user_id,
        family_id: user.user_id,
        company_name: company.company_name,
        company_branch: company.company_branch,
        employee_id: user.employee_id,
        employment_date: user.employment_date,
        role: user.role,
        email_id: user.email_id,
        profile_id: profile.profile_id,
        surname: profile.surname,
        forename: profile.forename,
        date_of_birth: profile.date_of_birth,
        relationship: profile.relationship,
        child: profile.child,
        user_gender: profile.user_gender,
        is_mauritian: profile.is_mauritian,
        nic_no: profile.nic_no,
        passport_no: profile.passport_no,
        marital_status: profile.marital_status,
        phone_no_home: profile.phone_no_home,
        phone_no_mobile: profile.phone_no_mobile,
        phone_no_office: profile.phone_no_office,
        address_1: profile.address_1,
        address_2: profile.address_2,
        is_pensioner: profile.is_pensioner,
        card: profile.card,
        bank_code: bank.bank_code,
        bank_name: bank.bank_name,
        bank_account_holder: bank.bank_account_holder,
        bank_account_number: bank.bank_account_number,
        role_type: company.role_type,
        effective_insurance_date: insurance.effective_insurance_date,
      };
    }
    resolve(finalData);
  } catch (err) {
    reject(err);
  }
});

// Get  employee details
// const getEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employees = await userModel.getEmployee(id);
//     if (employees.recordset.length > 0) {
//       const user = employees.recordsets[0][0];
//       const profile = employees.recordsets[1][0];
//       let bank = employees.recordsets[2][0];
//       const company = employees.recordsets[3][0];
//       const request = employees.recordsets[4][0];
//       let insurance = employees.recordsets[5][0];
//       if (employees.recordsets[2].length <= 0) {
//         bank = {
//           bank_code: null,
//           bank_name: null,
//           bank_account_holder: null,
//           bank_account_number: null,
//         };
//       }
//       if (employees.recordsets[5].length <= 0) {
//         insurance = {
//           effective_insurance_date: null,
//         };
//       }
//       generateEmployeeDetails(user, profile, bank, company, request, insurance)
//         .then((data) => {
//           logger.info('fetching employee details', data);
//           new Response(
//             res,
//             StatusCodes.OK,
//           ).SuccessResponse(
//             Message.Common.SuccessMessage.Fetch('Employee Details'),
//             data,
//           );
//         })
//         .catch((err) => {
//           logger.error('fetching employee details failed', err);
//           new Response(
//             res,
//             StatusCodes.OK,
//           ).ErrorMessage(
//             Message.Common.FailureMessage.Fetch('Employees'),
//           );
//         });
//     } else {
//       logger.error('fetching employee details failed');
//       new Response(
//         res,
//         StatusCodes.OK,
//       ).ErrorMessage(
//         Message.Common.FailureMessage.Fetch('Company Employees'),
//       );
//     }
//   } catch (err) {
//     logger.error('fetching employee details failed', err);
//     new Response(
//       res,
//       StatusCodes.INTERNAL_SERVER_ERROR,
//     ).ErrorMessage(
//       Message.UserManagement.FailureMessage.ServerError,
//     );
//   }
// };

const deleteUser = async (req, res) => {
  try {
    logger.info('Delete user request received', req.params);
    const {
      userId,
    } = req.params;

    const {
      email_id,
    } = req.params;
    const userDelete = await userModel.deleteUserById(userId);
    if (userDelete.rowsAffected.length > 0) {
      logger.info('user deleted succesfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Deletion('User Deletion'),
      );
    } else {
      logger.info('user deletion failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Deletion('User Deletion'),
      );
    }
  } catch (err) {
    logger.error('deleting user failed', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteUserByEmail = async (req, res) => {
  try {
    logger.info('Delete user request received', req.params);
    const {
      email_id,
    } = req.params;
    const data = await userModel.checkEmailById(email_id);
    const userId = data.recordset[0].user_id;
    const userDelete = await userModel.deleteUserById(userId);
    if (userDelete.rowsAffected.length > 0) {
      logger.info('user deleted succesfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Deletion('User Deletion'),
      );
    } else {
      logger.info('user deletion failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Deletion('User Deletion'),
      );
    }
  } catch (err) {
    logger.error('deleting user failed', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteUserById = async (req, res) => {
  try {
    logger.info('Delete user request received', req.params);
    const {
      user_id,
    } = req.params;
    const data = await userModel.checkById(user_id);
    if (data.recordset.length > 0) {
      const deleteMember = await updateUserProfileByFamilyId({ user_status: userStatus.DELETED }, user_id);
      const userDelete = await userModel.deleteemployee(user_id);
      if (userDelete.rowsAffected.length > 0 && deleteMember.rowsAffected.length > 0) {
        logger.info('user deleted succesfully');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Deletion('User'),
        );
      } else {
        logger.info('user deletion failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Deletion('User Deletion'),
        );
      }
    } else {
      logger.info('user doesnt  exist');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoDataFound('User'),
      );
    }
  } catch (err) {
    logger.error('deleting user failed', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteDependantById = async (req, res) => {
  try {
    logger.info('Delete user request received', req.params);
    const {
      profile_id,
    } = req.params;
    const data = await getProfile(profile_id);
    if (data.recordset.length > 0) {
      const deleteMember = await updateUserProfileByProfileId({ user_status: userStatus.DELETED }, profile_id);
      if (deleteMember.rowsAffected.length > 0) {
        logger.info('Dependant deleted succesfully');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Deletion('Dependant'),
        );
      } else {
        logger.info('user deletion failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Deletion('Dependant'),
        );
      }
    } else {
      logger.info('Dependant doesnt  exist');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoDataFound('Dependant'),
      );
    }
  } catch (err) {
    logger.error('deleting user failed', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// const searchPrincipalMember = async (req, res) => {
//   try {
//     const {
//       data,
//     } = req.query;
//     let finalData = [];
//     let remaining_months;
//     let employees;
//     logger.info('received req.query for searching primary user', req.query);
//     employees = await userModel.profileSearch(data);
//     if (employees.recordset.length > 0) {
//       for (let i = 0; i < employees.recordset.length; i++) {
//         let coverDetails = employees.recordset[i].cover_details.filter((val) => val !== null).join(', ');
//         employees.recordset[i].cover_details = clone(coverDetails);

//         // Calculate the remaining insurance month
//         if (employees.recordset[i].insurance_end_date !== null && employees.recordset[i].effective_insurance_date !== null) {
//           remaining_months = employees.recordset[i].insurance_end_date.getMonth()
//           - new Date().getMonth()
//           + 12 * (employees.recordset[i].insurance_end_date.getFullYear()
//           - new Date().getFullYear());
//           if (remaining_months > 0) {
//             employees.recordset[i].remaining_insurance_months = remaining_months;
//           } else {
//             employees.recordset[i].remaining_insurance_months = null;
//           }
//         } else {
//           employees.recordset[i].remaining_insurance_months = null;
//         }

//         // Get the family id from employee details list
//         const { family_id } = employees.recordset[i];

//         // Get the dependants details and combine with employee details
//         const dependants = await userModel.getAllDepandants(family_id);
//         for (let i = 0; i < dependants.recordset.length; i++) {
//           // Concat the rgpa plan, top part 1 and top part 2
//           const coverDetails = dependants.recordset[i].cover_details.filter((val) => val !== null).join(', ');
//           dependants.recordset[i].cover_details = clone(coverDetails);
//         }
//         employees.recordset[i].dependants = dependants.recordset;

//         finalData.push(clone(employees.recordset[i]));
//       }
//       logger.info(' searching principal member ');
//       new Response(
//         res,
//         StatusCodes.OK,
//       ).SuccessResponse(
//         Message.Common.SuccessMessage.Fetch('Principal member'),
//         finalData,
//       );
//     } else {
//       employees = await userModel.companySearch(data);
//       if (employees.recordset.length > 0) {
//         for (let i = 0; i < employees.recordset.length; i++) {
//           let coverDetails = employees.recordset[i].cover_details.filter((val) => val !== null).join(', ');
//           employees.recordset[i].cover_details = clone(coverDetails);

//           // Calculate the remaining insurance month
//           if (employees.recordset[i].insurance_end_date !== null && employees.recordset[i].effective_insurance_date !== null) {
//             remaining_months = employees.recordset[i].insurance_end_date.getMonth()
//             - new Date().getMonth()
//             + 12 * (employees.recordset[i].insurance_end_date.getFullYear()
//             - new Date().getFullYear());
//             if (remaining_months > 0) {
//               employees.recordset[i].remaining_insurance_months = remaining_months;
//             } else {
//               employees.recordset[i].remaining_insurance_months = null;
//             }
//           } else {
//             employees.recordset[i].remaining_insurance_months = null;
//           }

//           // Get the family id from employee details list
//           const { family_id } = employees.recordset[i];

//           // Get the dependants details and combine with employee details
//           const dependants = await userModel.getAllDepandants(family_id);
//           for (let i = 0; i < dependants.recordset.length; i++) {
//             // Concat the rgpa plan, top part 1 and top part 2
//             const coverDetails = dependants.recordset[i].cover_details.filter((val) => val !== null).join(', ');
//             dependants.recordset[i].cover_details = clone(coverDetails);
//           }
//           employees.recordset[i].dependants = dependants.recordset;

//           finalData.push(clone(employees.recordset[i]));
//         }
//         logger.info(' searching principal member ');
//         new Response(
//           res,
//           StatusCodes.OK,
//         ).SuccessResponse(
//           Message.Common.SuccessMessage.Fetch('Principal member'),
//           finalData,
//         );
//       } else {
//         logger.info('No principal member available ');
//         new Response(
//           res,
//           StatusCodes.OK,
//         ).SuccessResponse(
//           Message.Common.FailureMessage.NotFound('Employees'),
//         );
//       }
//     }
//   } catch (err) {
//     logger.error('error in searching principal members', err);
//     new Response(
//       res,
//       StatusCodes.BAD_REQUEST,
//     ).ErrorMessage(
//       Message.Common.FailureMessage.InternalServerError,
//     );
//   }
// };

const searchPrincipalMember = async (req, res) => {
  try {
    const {
      data,
      page_count,
      page_no,
      request_status,
    } = req.query;

    let starts_with;

    if (page_count !== undefined && page_no !== undefined) {
      starts_with = (page_no * page_count) - page_count;
    }

    let page = {
      starts_with,
      page_count,
    };

    let search = {
      data,
      request_status,
    };
    let finalData = [];
    let remaining_months;
    let employees;
    logger.info('received req.query for searching primary user', req.query);
    if (data) {
      employees = await userModel.profileSearch(search, page);
      if (employees.recordset.length < 1) {
        employees = await userModel.companySearch(search, page);
      }
    } else {
      employees = await userModel.getAllEmployee(data, page);
    }
    if (employees.recordset.length > 0) {
      for (let i = 0; i < employees.recordset.length; i++) {
        let coverDetails = employees.recordset[i].cover_details.filter((val) => val !== null).join(', ');
        employees.recordset[i].cover_details = clone(coverDetails);

        // Calculate the remaining insurance month
        if (employees.recordset[i].insurance_end_date !== null && employees.recordset[i].effective_insurance_date !== null) {
          remaining_months = employees.recordset[i].insurance_end_date.getMonth()
                - new Date().getMonth()
                + 12 * (employees.recordset[i].insurance_end_date.getFullYear()
                - new Date().getFullYear());
          if (remaining_months > 0) {
            employees.recordset[i].remaining_insurance_months = remaining_months;
          } else {
            employees.recordset[i].remaining_insurance_months = null;
          }
        } else {
          employees.recordset[i].remaining_insurance_months = null;
        }

        // Get the family id from employee details list
        const { family_id } = employees.recordset[i];

        // Get the dependants details and combine with employee details
        const dependants = await userModel.getAllDepandants(family_id);
        for (let i = 0; i < dependants.recordset.length; i++) {
          // Concat the rgpa plan, top part 1 and top part 2
          const coverDetails = dependants.recordset[i].cover_details.filter((val) => val !== null).join(', ');
          dependants.recordset[i].cover_details = clone(coverDetails);
        }
        employees.recordset[i].dependants = dependants.recordset;

        finalData.push(clone(employees.recordset[i]));
      }
      logger.info(' searching principal member ');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Principal member'),
        finalData,
      );
    } else {
      logger.info('No principal member available ');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.NotFound('Employees'),
      );
    }
  } catch (err) {
    logger.error('error in searching principal members', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getAllEmployees = async (req, res) => {
  // createProfile({
  //   family_id: 10000, forename: 'swanss', surname: 'swan', company_id: 20015,
  // });
  logger.info('Get All Employees');
  let remaining_months;
  let starts_with;
  let finalData = [];
  let {
    role,
    company_id,
    page_count,
    page_no,
    user_id,
    search,
  } = req.query;

  if (!role && !user_id) {
    if (req.user.role === Role.EMPLOYEE) {
      user_id = req.user.user_id;
    }
  }

  if (!role) {
    role = req.user.role;
  }

  if (page_count !== undefined && page_no !== undefined) {
    starts_with = (page_no * page_count) - page_count;
  }

  let page = {
    starts_with,
    page_count,
  };
  let employee = {
    role,
  };
  if (company_id) {
    employee.company_id = company_id;
  }
  if (user_id) {
    employee.user_id = user_id;
  }

  const employees = await userModel.getAllEmployee(employee, page, search);
  if (employees.recordset.length > 0) {
    logger.info('Get All Employees');
    for (let i = 0; i < employees.recordset.length; i++) {
      let coverDetails = employees.recordset[i].cover_details.filter((val) => val !== null).join(', ');
      employees.recordset[i].cover_details = clone(coverDetails);
      // Calculate the remaining insurance month
      if (employees.recordset[i].insurance_end_date !== null && employees.recordset[i].effective_insurance_date !== null) {
        // remaining_months = employees.recordset[i].insurance_end_date.getMonth()
        //       - employees.recordset[i].effective_insurance_date.getMonth()
        //       + 12 * (employees.recordset[i].insurance_end_date.getFullYear()
        //       - employees.recordset[i].effective_insurance_date.getFullYear());
        remaining_months = employees.recordset[i].insurance_end_date.getMonth()
        - new Date().getMonth()
        + 12 * (employees.recordset[i].insurance_end_date.getFullYear()
        - new Date().getFullYear());
        if (remaining_months > 0) {
          employees.recordset[i].remaining_insurance_months = remaining_months;
        } else {
          employees.recordset[i].remaining_insurance_months = null;
        }
      } else {
        employees.recordset[i].remaining_insurance_months = null;
      }

      // Get the family id from employee details list
      const { family_id } = employees.recordset[i];

      // Get the dependants details and combine with employee details
      const dependants = await userModel.getAllDepandants(family_id);
      for (let i = 0; i < dependants.recordset.length; i++) {
        // Concat the rgpa plan, top part 1 and top part 2
        const coverDetails = dependants.recordset[i].cover_details.filter((val) => val !== null).join(', ');
        dependants.recordset[i].cover_details = clone(coverDetails);
      }
      employees.recordset[i].dependants = dependants.recordset;

      finalData.push(clone(employees.recordset[i]));
    }
    logger.info('fetching all employee details');
    new Response(
      res,
      StatusCodes.OK,
    ).SuccessResponse(
      Message.Common.SuccessMessage.Fetch('Employees'),
      finalData,
    );
  } else {
    logger.info('Employee Details not found');
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.NoDataFound('Employees'),
    );
  }
};

const getEmployeeByRole = async (req, res) => {
  try {
    logger.info('Get All Employees by role', req.params);
    const {
      roleId,
    } = req.params;
    let role;
    const employees = await userModel.getEmployeeByRoleId(roleId);
    if (employees.recordset.length > 0) {
      role = `${employees.recordset[0].role_type}'S`;
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch(`${role}`),
        employees.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoDataFound('Employees'),
      );
    }
  } catch (err) {
    logger.error('Getting employee by role', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const setNewPassword = async (req, res) => {
  try {
    const {
      user_id,
    } = req.user;
    const {
      password,
      new_password,
    } = req.body;

    if (password === new_password) {
      let user = {
        id: user_id,
        password: new_password,
      };
      let Passwordchanged = await userModel.changePasswordById(user);
      if (Passwordchanged.rowsAffected[0] > 0) {
        logger.info('password changed succesfully');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.UserManagement.SuccessMessage.Password,
        );
      } else {
        logger.info('password changed Failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('New Password'),
        );
      }
    } else {
      logger.info('wrong password changed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.UserManagement.FailureMessage.PasswordNotSame,
      );
    }
  } catch (err) {
    logger.error('Changing password Error', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const changePassword = async (req, res) => {
  try {
    logger.info('change password requested');
    const {
      user_id,
    } = req.user;
    const {
      password,
      new_password,
    } = req.body;
    let userData = await userModel.getEmployee(user_id);
    let currentPassword = userData.recordset[0].password;
    if (currentPassword === password) {
      let user = {
        id: user_id,
        password: new_password,
      };
      let Passwordchanged = await userModel.changePasswordById(user);
      if (Passwordchanged.rowsAffected[0] > 0) {
        logger.info('password changed succesfully');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.UserManagement.SuccessMessage.Password,
        );
      } else {
        logger.info('password changed Failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('New Password'),
        );
      }
    } else {
      logger.info('wrong password changed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.UserManagement.FailureMessage.PasswordFailed,
      );
    }
  } catch (err) {
    logger.error('Changing password Error', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

function generatePassword() {
  const length = 5;
  const charset = '0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const forgotPassword = async (req, res) => {
  try {
    logger.info('forgot password requested');

    const {
      email_id,
    } = req.body;
    let userData = await userModel.checkEmailById(email_id);
    if (userData.recordset.length > 0) {
      const password = generatePassword();
      const { user_id } = userData.recordset[0];
      let addOTP = await userModel.insertOtp({ user_id, otp: password, email_id });
      // let Passwordchanged = await userModel.forgotPassword({ password, email_id });
      if (addOTP.rowsAffected[0] > 0) {
        sendOTP({ email_id, password })
          .then(async (data) => {
            logger.info('EMail sended successfully', data);
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.forgotPassword,
            );
          })
          .catch((err) => {
            logger.error(err);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.otp,
            );
          });
      } else {
        logger.info('OTP Sending Failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.otp,
        );
      }
    } else {
      logger.info('USER NOT FOUND');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.UserManagement.FailureMessage.NotFound,
      );
    }
  } catch (err) {
    logger.error('Changing password Error', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const fetchEmployee = async (req, res) => {
  try {
    let {
      userId,
    } = req.params;

    let {
      deleted_member,
    } = req.query;

    let fetch = await userModel.fetchEmployeeDetails(userId, deleted_member);
    if (fetch.recordset.length > 0) {
      const family_id = userId;
      const member_id = fetch.recordset[0].profile_id;
      const types = documentType.PRIMARY;
      types.push(documentType.NATIONAL_IDENTITY_CARD, documentType.PASSPORT);
      let documents = await getDocuments({ family_id, member_id, types });
      fetch.recordset[0].documents = documents.recordset;
      fetch.recordsets[0][0].profile_id = fetch.recordsets[0][0].member_id;
      logger.info('Employees fetched Successfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Employee Details'),
        fetch.recordset[0],
      );
    } else {
      logger.error('Employees fetching Failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NotFound('User'),
      );
    }
  } catch (err) {
    logger.error('Fetch Employee ', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const fetchEmployeeById = async (req, res) => {
  try {
    let {
      user_id,
    } = req.params;
    let fetch = await userModel.fetchEmployeeById(user_id);
    if (fetch.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Employee Details'),
        fetch.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Employee Details'),
      );
    }
  } catch (err) {
    logger.error('Fetch Employee by id ', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const verifyOTP = async (req, res) => {
  try {
    let {
      email_id,
      otp,
    } = req.body;
    let fetch = await userModel.checkOTP({ email_id, otp });
    if (fetch.recordset.length > 0) {
      let updates = await userModel.updateVerified({ email_id, otp });
      if (updates.rowsAffected[0] > 0) {
        const users = await userModel.getUserByEmail(email_id);
        const {
          user_id, role, surname, forename, profile_id, is_verified,
        } = users.recordset[0];
        const token_payload = {
          user_id, role, email_id, profileId: profile_id,
        };
        const jwtToken = await getToken(token_payload);
        if (jwtToken !== '') {
          res
            .cookie('token', jwtToken, { httpOnly: true })
            .send({
              status: true,
              message: 'OTP Verified Successfully',
              data: {
                family_id: user_id,
                profile_id,
                role_id: role,
                email_id,
                forename,
                surname,
                is_verified,

              },
              token: jwtToken,
            });
        } else {
          logger.error('Error in creating jwt token');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Token.FailureMessage.Created,
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.otpVerification,
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.otpVerification,
      );
    }
  } catch (err) {
    logger.error('Fetch Employee by id ', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const sendMailToAllUsers = async (req, res) => {
  try {
    let email_id;
    let password;
    let employees = await userModel.getAllEmployee();
    employees = employees.recordset;
    for (let i = 0; i < employees.length; i++) {
      email_id = employees[i].email_id;
      password = employees[i].password;
      sendMail({ email_id, password })
        .then(async (data) => {
          if (i === employees.length - 1) {
            logger.info('Mail sended successfully', data);
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.sendMailToAll,
            );
          }
        })
        .catch((err) => {
          // logger.error(err);
          logger.error('Failure EMAIL--->', email_id);
          // new Response(
          //   res,
          //   StatusCodes.BAD_REQUEST,
          // ).ErrorMessage(
          //   Message.Common.FailureMessage.userEmail,
          // );
        });
    }
  } catch (err) {
    // logger.error('Send Mail To All Users ', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};
const addSubHrProfiles = async (req, res) => {
  try {
    let user;
    let getSubHr = await userModel.getAllSubHr();
    let subhr_details = getSubHr.recordset;
    for (let i = 0; i < subhr_details.length; i++) {
      let { user_id, email_id, company_id } = subhr_details[i];
      email_id = email_id.replace(/[0-9]/g, '');
      email_id = email_id.substring(0, email_id.indexOf('@'));
      let surname = 'Mr';
      if (email_id.includes('Mr')) {
        surname = 'Mr';
      } else if (email_id.includes('Mrs')) {
        surname = 'Mrs';
      }
      email_id = email_id.replace(/Mrs|Mr/g, '');
      let forename = await CapitalizeCase(email_id);
      createProfile({
        family_id: user_id, forename, surname, company_id,
      });
      if (i + 1 === subhr_details.length) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Creation('Sub HR Profiles Added Successfully'),
        );
      }
    }
  } catch (err) {
    logger.error('ADD profiles for subhr----->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const insertRGPAUser = async (req, res) => {
  try {
    logger.info('Adding new user data', req.body);
    const { user_id } = req.user;
    let {
      company_id,
      employee_id,
      role,
      email_id,
      password,
      employment_date,
      surname,
      forename,
      relationship,
      date_of_birth,
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
      is_next,
      // documents,
    } = req.body;

    if (!is_mauritian) {
      is_mauritian = false;
    }
    if (!is_pensioner) {
      is_pensioner = false;
    }

    // const relationship = 'PRIMARY';
    const user_status = 'ACTIVE';
    const request_type = requestType.ADD_MEMBER;
    const request_createdby = user_id;
    const policy_no = crypto.randomBytes(5).toString('hex');
    const user = {
      company_id,
      employee_id,
      role,
      email_id,
      password,
      is_verified: true,
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
      policy_no,
      user_status,
    };
    const checkUserEmail = await checkUser(email_id);
    if (checkUserEmail.recordset.length > 0) {
      logger.info('Employee Already available', checkUserEmail);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.Existing('Employee'),
      );
    } else if (role === Role.SUB_HR) {
      const availability = await checkCompanySubHr(company_id);
      if (availability) {
        const createUser = await userModel.insertEmployee(user);
        if (createUser.returnValue === 0) {
          const user_details = createUser.output;
          // const userDetails = await userModel.getPrimaryUser(user_details.family_id);
          const userDetails = await userModel.fetchEmployeeDetails(user_details.family_id);
          if (userDetails.recordsets[0].length > 0) {
            logger.info('Sub HR created successfully', userDetails.recordsets[0][0]);
            sendMail({ email_id, password })
              .then(async (data) => {
                new Response(
                  res,
                  StatusCodes.OK,
                ).SuccessResponse(
                  Message.Common.SuccessMessage.Creation('Sub HR'),
                  userDetails.recordsets[0][0],
                );
              })
              .catch((err) => {
                logger.error(err);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.userEmail,
                );
              });
            logger.error('Error in mail sending');
          } else {
            logger.error('Sub HR not created');
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Sub Hr'),
            );
          }
        }
      } else {
        logger.error('Sub Hr already exist');
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).SuccessResponse(
          Message.Common.FailureMessage.Existing('Sub HR'),
        );
      }
    } else {
      const createUser = await userModel.insertEmployee(user);
      if (createUser.returnValue === 0) {
        const user_details = createUser.output;
        // const userDetails = await userModel.getPrimaryUser(user_details.family_id);
        const userDetails = await userModel.fetchEmployeeDetails(user_details.family_id);
        userDetails.recordsets[0][0].profile_id = userDetails.recordsets[0][0].member_id;
        if (userDetails.recordsets[0].length > 0) {
          logger.info('Employee created successfully', userDetails.recordsets[0][0]);
          // new Response(
          //   res,
          //   StatusCodes.OK,
          // ).SuccessResponse(
          //   Message.Common.SuccessMessage.Creation('Employee'),
          //   userDetails.recordsets[0][0],
          // );
          if (is_next === 0) {
            sendMail({ email_id, password })
              .then(async (data) => {
                logger.info('Mail sended successfully', data);
                new Response(
                  res,
                  StatusCodes.OK,
                ).SuccessResponse(
                  Message.Common.SuccessMessage.Creation('Employee'),
                  userDetails.recordsets[0][0],
                );
              })
              .catch((err) => {
                logger.error(err);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.userEmail,
                );
              });
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Employee'),
              userDetails.recordsets[0][0],
            );
          }
        } else {
          logger.error('Employee not created');
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Employee'),
          );
        }
      }
    }
  } catch (err) {
    logger.error('Error in creating employee', err.stack);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.UserManagement.FailureMessage.ServerError,
    );
  }
};

const userLogin = async (req, res) => {
  try {
    const {
      email_id,
      password,
    } = req.body;

    let {
      role,
    } = req.params;

    role = JSON.parse(role);

    logger.info('login response received', email_id);
    if (Object.values(Role).includes(role) === true) {
      console.log('1');
      if (email_id !== '' && email_id !== undefined && email_id !== null) {
        console.log('2');
        if (password !== '' && password !== undefined && password !== null) {
          console.log('3');
          const checkUserEmail = await userModel.checkEmailById(email_id);
          if (checkUserEmail.recordset.length > 0) {
            const user = checkUserEmail.recordset[0];
            if (role === Role.GROUP_HR || role === Role.SWAN_ADMIN) {
              if (role === user.role) {
                console.log(user.password, password);
                if (user.password === password) {
                  const {
                    user_id, employee_id, role, profile_id,
                  } = user;
                  const token_payload = {
                    user_id, employee_id, role, email_id, profileId: profile_id,
                  };
                  const jwtToken = await getToken(token_payload);
                  if (jwtToken !== '') {
                    delete user.password;
                    logger.info('logged in succesfully', user);
                    res
                      .cookie('token', jwtToken, { httpOnly: true })
                      .send({
                        status: true,
                        message: 'Login Successfull !',
                        data: {
                          family_id: user_id,
                          profile_id,
                          role_id: role,
                          email_id,
                          forename: user.forename,
                          surname: user.surname,
                          is_verified: user.is_verified,

                        },
                        token: jwtToken,
                      });
                  } else {
                    logger.error('Error in creating jwt token');
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      Message.Token.FailureMessage.Created,
                    );
                  }
                } else {
                  logger.info('Wrong password .........');
                  new Response(
                    res,
                    StatusCodes.BAD_REQUEST,
                  ).ErrorMessage(
                    Message.UserManagement.FailureMessage.Invalid,
                  );
                }
              } else {
                logger.info('Role id is not valid');
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.UserManagement.FailureMessage.EnterRole,
                );
              }
            } else {
              const checkRole = await userModel.checkUserRole({ user_id: user.user_id, role });
              if (checkRole.recordset.length > 0) {
                if (user.password === password) {
                  const {
                    user_id, employee_id, role, profile_id,
                  } = user;
                  const token_payload = {
                    user_id, employee_id, role, email_id, profileId: profile_id,
                  };
                  const jwtToken = await getToken(token_payload);
                  if (jwtToken !== '') {
                    delete user.password;
                    logger.info('logged in succesfully', user);
                    res
                      .cookie('token', jwtToken, { httpOnly: true })
                      .send({
                        status: true,
                        message: 'Login Successfull !',
                        data: {
                          family_id: user_id,
                          profile_id,
                          role_id: role,
                          email_id,
                          forename: user.forename,
                          surname: user.surname,
                          is_verified: user.is_verified,

                        },
                        token: jwtToken,
                      });
                  } else {
                    logger.error('Error in creating jwt token');
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      Message.Token.FailureMessage.Created,
                    );
                  }
                } else {
                  logger.info('Wrong password .........');
                  new Response(
                    res,
                    StatusCodes.BAD_REQUEST,
                  ).ErrorMessage(
                    Message.UserManagement.FailureMessage.Invalid,
                  );
                }
              } else {
                logger.info('Invalid Role Id');
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.UserManagement.FailureMessage.EnterRole,
                );
              }
            }
          } else {
            logger.info('Invalid credentials');
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.UserManagement.FailureMessage.EnterEmail,
            );
          }
        } else {
          logger.info('Invalid credentials');
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.UserManagement.FailureMessage.EnterPassword,
          );
        }
      } else {
        logger.info('Invalid credentials');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.UserManagement.FailureMessage.EnterEmail,
        );
      }
    } else {
      logger.info('Please enter a valid role id');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.UserManagement.FailureMessage.InvalidRole,
      );
    }
  } catch (err) {
    logger.error('login failed --->', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.UserManagement.FailureMessage.EnterEmail,
    );
  }
};

const getEmployeeByRequestId = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const employee = await userModel.getEmployeeByRequestId(request_id);
    if (employee.recordset.length > 0) {
      logger.info('fetching employee details success');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Employee Details'),
        employee.recordset,
      );
    } else {
      logger.error('fetching employee details failed');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.Fetch('Employees'),
      );
    }
  } catch (err) {
    logger.error('Get employee using request id failed --->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addSubHR = async (req, res) => {
  const {
    company_id,
    family_id,
  } = req.params;
  const checkHrAvailability = await checkCompanySubHr(company_id);
  if (checkHrAvailability === true) {
    const addSubHR = await userModel.insertSubHR(
      {
        company_id,
        family_id,
      },
    );
    if (addSubHR.rowsAffected[0] > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Creation('Sub-HR'),
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.Creation('Sub-HR'),
      );
    }
  } else if (checkHrAvailability === false) {
    new Response(
      res,
      StatusCodes.OK,
    ).SuccessResponse(
      Message.Common.FailureMessage.hrExists,
    );
  }
};

module.exports = {
  createEmployee,
  // getEmployee,
  generateEmployeeDetails,
  deleteUser,
  updateEmployee,
  searchPrincipalMember,
  getAllEmployees,
  getRole,
  getEmployeeByRole,
  changePassword,
  addFiles,
  fetchEmployee,
  setNewPassword,
  fetchEmployeeById,
  deleteUserByEmail,
  forgotPassword,
  verifyOTP,
  sendMailToAllUsers,
  addSubHrProfiles,
  insertRGPAUser,
  deleteUserById,
  deleteDependantById,
  userLogin,
  getEmployeeByRequestId,
  addSubHR,
};
