/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-const-assign */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-const */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const { result, isNaN } = require('lodash');
const { STRING } = require('sequelize');
const Response = require('../utils/response');
const { Message } = require('../utils/message');

const { requestType, userRelationship } = require('../utils/role');

const userProfileModel = require('../models/user-profile.model');
const {
  checkNIC, checkPassport, checkAllNIC, checkAllPassport,
} = require('../models/user-profile.model');
const UserModel = require('../models/user.model');
const logger = require('../utils/winston');
const { getDocuments } = require('../models/document.model');

const { checkAddMemberRequest, createRequest } = require('../models/request.model');

const {
  getRequestType, fetchRequestType,
} = require('../services/request.service');

// Import policy model for use policy queries
const policyModel = require('../models/policies.model');

const { calculateInsuranceDate } = require('../services/insurance.services');

const { updateInsuranceRecords } = require('../models/insuranceDetails.model');

const policyService = require('../services/polices.services');

const updateUserProfile = async (req, res) => {
  try {
    logger.info('update dependant', req.body);
    let {
      surname,
      forename,
      date_of_birth,
      relationship,
      child,
      user_gender,
      is_mauritian,
      nic_no,
      passport_no,
      card,
    } = req.body;
    let {
      member_id,
    } = req.params;
    member_id = parseInt(member_id);

    if (is_mauritian) {
      is_mauritian = 1;
    }
    // let availability;
    // if (nic_no) {
    //   availability = await checkNIC(nic_no, member_id);
    // }
    // if (passport_no) {
    //   availability = await checkPassport(passport_no, member_id);
    // }

    // if (availability.recordset.length > 0) {
    //   logger.info('NIC or Passport available', availability.recordset);
    //   new Response(
    //     res,
    //     StatusCodes.OK,
    //   ).ErrorMessage(
    //     Message.Common.FailureMessage.Existing('NIC or Passport'),
    //   );
    // } else {
    const userProfileDetails = {
      surname,
      forename,
      date_of_birth,
      relationship,
      child,
      user_gender,
      is_mauritian,
      nic_no,
      passport_no,
      card,
    };

    const profileUpdate = await userProfileModel.updateUserProfileById(
      member_id,
      userProfileDetails,
    );

    if (profileUpdate.rowsAffected[0] > 0) {
      logger.info('profileUpdate--->', profileUpdate);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Updation('User Profile'),
      );
    } else {
      logger.info('profileUpdate--->', profileUpdate);
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('User Profile'),
      );
    }
    // }
  } catch (err) {
    logger.error('Error in updating dependant--->', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// updating profile user bank details
const addOrUpdateProfile = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { request_id } = req.params;

    const { request_type, family_id, member_id } = await fetchRequestType(request_id);

    if (request_type === requestType.ADD_MEMBER || request_type === requestType.CHANGE_MEMBER) {
      let {
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
        employment_date,
      } = req.body;

      const relationship = userRelationship.PRIMARY;

      logger.info(
        'Add or Update Profile Employee',
        req.body,
      );
      // if (!request_id) {
      //   const checkRequest = await checkAddMemberRequest(family_id);
      //   if (checkRequest.recordset.length > 0) {
      //     new Response(
      //       res,
      //       StatusCodes.OK,
      //     ).ErrorMessage(
      //       Message.Common.FailureMessage.Existing('Add Member Request'),
      //     );
      //   } else {
      //     let availability;
      //     if (nic_no) {
      //       availability = await checkNIC(nic_no, profile_id);
      //     }
      //     if (passport_no) {
      //       availability = await checkPassport(passport_no, profile_id);
      //     }

      //     if (availability.recordset.length > 0) {
      //       logger.info('Employee Already available', availability.recordset);
      //       new Response(
      //         res,
      //         StatusCodes.OK,
      //       ).ErrorMessage(
      //         Message.Common.FailureMessage.Existing('NIC or Passport'),
      //       );
      //     } else {
      //       const addRequest = await createRequest(family_id, request_type, user_id);
      //       if (addRequest.returnValue === 0) {
      //         request_id = addRequest.output.request_id;
      //         request_id = JSON.parse(request_id);
      //         const user = {
      //           family_id,
      //           profile_id,
      //           surname,
      //           forename,
      //           date_of_birth,
      //           child,
      //           user_gender,
      //           is_mauritian,
      //           nic_no,
      //           passport_no,
      //           marital_status,
      //           phone_no_home,
      //           phone_no_mobile,
      //           phone_no_office,
      //           address_1,
      //           address_2,
      //           is_pensioner,
      //           card,
      //           city,
      //           bank_code,
      //           bank_account_holder,
      //           bank_account_number,
      //           request_id,
      //           relationship,
      //           user_status: 'PENDING',
      //         };

      //         const updateUser = await UserModel.insertOrUpdateProfileRecord(user);
      //         if (updateUser.returnValue === 0) {
      //           logger.info('Employee updated successfully');
      //           new Response(
      //             res,
      //             StatusCodes.OK,
      //           ).SuccessResponse(
      //             Message.Common.SuccessMessage.Updation('User Details'),
      //             { request_id },
      //           );
      //         } else {
      //           logger.error('Employee Update failed');
      //           new Response(
      //             res,
      //             StatusCodes.OK,
      //           ).ErrorMessage(
      //             Message.Common.FailureMessage.Updation('User Details'),
      //           );
      //         }
      //       // }
      //       } else {
      //         new Response(
      //           res,
      //           StatusCodes.BAD_REQUEST,
      //         ).ErrorMessage(
      //           Message.Common.FailureMessage.Creation('Request'),
      //         );
      //       }
      //     }
      //   }
      // } else {

      let availability;
      if (nic_no) {
        availability = await checkNIC(nic_no, member_id);
      }
      if (passport_no) {
        availability = await checkPassport(passport_no, member_id);
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
        const user = {
          family_id,
          member_id,
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
          request_id,
          relationship,
          user_status: 'PENDING',
          effective_insurance_date,
          employment_date,
        };
        const updateUser = await UserModel.insertOrUpdateProfileRecord(user);
        console.log(updateUser);
        if (updateUser.returnValue === 0) {
          logger.info('Employee updated successfully');
          let insurance_end_date;
          if (effective_insurance_date) {
            insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
            const insuranceRecords = await updateInsuranceRecords({ effective_insurance_date, insurance_end_date, request_id });
            if (insuranceRecords.rowsAffected[0] > 0) {
              new Response(
                res,
                StatusCodes.OK,
              ).SuccessResponse(
                Message.Common.SuccessMessage.Updation('User Details and Insurance details'),
              );
            } else {
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.Updation('User Details and insurance details'),
              );
            }
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('User Details'),
            );
          }
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
      // }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NextPage('Employee'),
      );
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

// const addOrUpdateDependantsDetails = async (req, res) => {
//   try {
//     let insertDependants;
//     let insertPrincipalCover;
//     let insurance_end_date;
//     let constDate;
//     let month;
//     const { user_id } = req.user;
//     const dependants = req.body;
//     for (let i = 0; i < dependants.length; i++) {
//       if (dependants[i].relationship === 'PRIMARY') {
//         let top_up_data1 = null;
//         if (dependants[i].top_up_part1) {
//           top_up_data1 = 1;
//         }
//         const policyCover = {
//           top_up_part1: top_up_data1,
//           top_up_part2: dependants[i].top_up_part2,
//           family_id: dependants[i].family_id,
//           member_id: dependants[i].profile_id,
//         };
//         insertPrincipalCover = await policyModel.updatePrincipalMemberTopUp(policyCover);
//       } else {
//         let {
//           family_id,
//           profile_id,
//           surname,
//           forename,
//           date_of_birth,
//           relationship,
//           child,
//           user_gender,
//           is_mauritian,
//           nic_no,
//           passport_no,
//           card,
//           top_up_part1,
//           top_up_part2,
//           effective_insurance_date,
//         } = dependants[i];
//         if (effective_insurance_date !== undefined) {
//           if (effective_insurance_date[4] === '/') {
//             // Calculate Insurance End Date
//             constDate = '/09/30';
//             month = effective_insurance_date.slice(
//               effective_insurance_date.indexOf('/') + 1,
//               effective_insurance_date.lastIndexOf('/'),
//             );
//           } else if (effective_insurance_date[4] === '-') {
//             // Calculate Insurance End Date
//             constDate = '-09-30';
//             month = effective_insurance_date.slice(
//               effective_insurance_date.indexOf('/') + 1,
//               effective_insurance_date.lastIndexOf('/'),
//             );
//           }
//           // let year = effective_insurance_date.substring(6);
//           let year = effective_insurance_date.substring(0, 4);
//           if (month > 9) {
//             year = JSON.parse(year) + 1;
//             insurance_end_date = `${year}${constDate}`;
//           } else {
//             insurance_end_date = `${year}${constDate}`;
//           }
//         }
//         const insurance_status = 'NOT ACTIVE';
//         const request_createdby = user_id;
//         const request_status = 1;
//         const request_type = 'ADD DEPENDANT';
//         const rgpa_basic = 1;
//         const company = await UserModel.getUserCompany(family_id);
//         const { company_id } = company.recordset[0];
//         const userDependantsDetails = {
//           family_id,
//           profile_id,
//           surname,
//           forename,
//           date_of_birth,
//           relationship,
//           child,
//           user_gender,
//           is_mauritian,
//           nic_no,
//           passport_no,
//           card,
//           company_id,
//           request_createdby,
//           insurance_end_date,
//           insurance_status,
//           request_status,
//           request_type,
//           rgpa_basic,
//           top_up_part1,
//           top_up_part2,
//           effective_insurance_date,
//         };

//         insertDependants = await userProfileModel.insertDependants(
//           userDependantsDetails,
//         );
//       }
//       if (i === dependants.length - 1) {
//         new Response(
//           res,
//           StatusCodes.OK,
//         ).SuccessResponse(
//           Message.Common.SuccessMessage.Creation('User Dependants and Pricipal Member Cover Details'),
//         );
//       }
//     }
//   } catch (err) {
//     new Response(
//       res,
//       StatusCodes.OK,
//     ).ErrorMessage(
//       Message.Common.FailureMessage.InternalServerError,
//     );
//   }
// };

const addDependantsDetails = async (req, res) => {
  try {
    // let rgpa_basic;
    let insertDependants;
    let insurance_end_date;
    const { user_id } = req.user;
    logger.info('Add dependant', req.body);
    let {
      request_id,
      request_type,
      family_id,
      profile_id,
      surname,
      forename,
      date_of_birth,
      relationship,
      child,
      user_gender,
      is_mauritian,
      nic_no,
      passport_no,
      card,
      effective_insurance_date,
    } = req.body;
    if (request_type === requestType.ADD_MEMBER || request_type === requestType.CHANGE_MEMBER || request_type === requestType.ADD_DEPENDANT) {
      if (effective_insurance_date !== undefined) {
        insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
      }

      // let availability;
      // if (nic_no) {
      //   availability = await checkAllNIC(nic_no);
      // }
      // if (passport_no) {
      //   availability = await checkAllPassport(passport_no);
      // }

      // if (availability.recordset.length > 0) {
      //   logger.error('Employee Already available', availability.recordset);
      //   new Response(
      //     res,
      //     StatusCodes.OK,
      //   ).ErrorMessage(
      //     Message.Common.FailureMessage.Existing('NIC or Passport'),
      //   );
      // } else {
      let request_type_id;
      if (Number.isFinite(request_type)) {
        request_type_id = request_type;
      } else {
        request_type_id = await getRequestType(request_type);
      }
      const insurance_status = 'NOT ACTIVE';
      const user_status = 'PENDING';
      const request_createdby = user_id;
      const request_status = 1;
      // if (!request_type) {
      //   const request_type = 'ADD DEPENDANT';
      // }
      // const primaryMemberRgpaBasic = await policyModel.getFamilyMemberPolicies(family_id);
      //   rgpa_basic = primaryMemberRgpaBasic.recordset[0].rgpa_basic;
      const company = await UserModel.getUserCompany(family_id);
      const { company_id } = company.recordset[0];
      const userDependantsDetails = {
        request_id,
        family_id,
        profile_id,
        surname,
        forename,
        date_of_birth,
        relationship,
        child,
        user_gender,
        is_mauritian,
        nic_no,
        passport_no,
        card,
        company_id,
        insurance_end_date,
        insurance_status,
        request_createdby,
        request_status,
        request_type: request_type_id,
        // rgpa_basic,
        effective_insurance_date,
        user_status,
      };
      insertDependants = await userProfileModel.insertDependants(
        userDependantsDetails,
      );
      if (insertDependants.rowsAffected[0] > 0 && insertDependants.returnValue === 0) {
        const member_id = insertDependants.recordset[0].profile_id;
        logger.info('dependent added');
        let rgpaAmount = await policyModel.getPrimaryMemberPolicy(family_id);
        if (rgpaAmount.recordset.length > 0) {
          let { monthly_rgpa_amount, rgpa_basic } = rgpaAmount.recordset[0];
          const updatePremium = await policyService.addOrUpdatePolicy({
            family_id, member_id, monthly_rgpa_amount, rgpa_basic,
          });
          if (updatePremium.rowsAffected[0] > 0 && updatePremium.returnValue === 0) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Dependent'),
              insertDependants.recordset[0],
            );
          } else {
            new Response(res, StatusCodes.OK).ErrorMessage(
              Message.Common.FailureMessage.Updation('Updating Premium'),
            );
          }
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Fetch('Family policy'),
          );
        }
      } else {
        logger.error('Adding dependent failed');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Dependent'),
        );
      }
    // }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NextPage('Dependant'),
      );
    }
  } catch (err) {
    logger.error('Adding dependant ', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const createDependantsDetails = async (req, res) => {
  try {
    let insertDependants;
    let insurance_end_date;
    const { user_id } = req.user;
    const { request_id } = req.params;
    const { family_id } = await fetchRequestType(request_id);

    logger.info('NEW API Add dependant', req.body);
    let {
      member_id,
      surname,
      forename,
      date_of_birth,
      relationship,
      child,
      user_gender,
      is_mauritian,
      nic_no,
      passport_no,
      card,
      city,
      effective_insurance_date,
    } = req.body;
    if (effective_insurance_date !== undefined) {
      insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
    }
    const insurance_status = 'NOT ACTIVE';
    const user_status = 'PENDING';
    const request_createdby = user_id;

    const company = await UserModel.getUserCompany(family_id);
    const { company_id } = company.recordset[0];

    // if (!request_id) {
    //   const checkRequest = await checkAddMemberRequest(family_id);
    //   if (checkRequest.recordset.length > 0) {
    //     new Response(
    //       res,
    //       StatusCodes.OK,
    //     ).ErrorMessage(
    //       Message.Common.FailureMessage.Existing('Add Member Request'),
    //     );
    //   } else {
    //     const addRequest = await createRequest(family_id, request_type, user_id);
    //     if (addRequest.returnValue === 0) {
    //       request_id = addRequest.output.request_id;
    //       request_id = JSON.parse(request_id);
    //       const userDependantsDetails = {
    //         request_id,
    //         family_id,
    //         member_id,
    //         surname,
    //         forename,
    //         date_of_birth,
    //         relationship,
    //         child,
    //         user_gender,
    //         is_mauritian,
    //         nic_no,
    //         passport_no,
    //         card,
    //         company_id,
    //         insurance_end_date,
    //         insurance_status,
    //         request_createdby,
    //         request_status,
    //         request_type,
    //         effective_insurance_date,
    //         user_status,
    //         city,
    //       };
    //       insertDependants = await userProfileModel.createDependants(
    //         userDependantsDetails,
    //       );
    //       const { profile_id } = insertDependants.recordset[0];
    //       if (insertDependants.returnValue === 0) {
    //         new Response(
    //           res,
    //           StatusCodes.OK,
    //         ).SuccessResponse(
    //           Message.Common.SuccessMessage.Creation('Dependent'),
    //           { member_id: profile_id },
    //         );
    //       } else {
    //         logger.error('Adding dependent failed');
    //         new Response(
    //           res,
    //           StatusCodes.OK,
    //         ).ErrorMessage(
    //           Message.Common.FailureMessage.Creation('Dependent'),
    //         );
    //       }
    //     } else {
    //       new Response(
    //         res,
    //         StatusCodes.BAD_REQUEST,
    //       ).ErrorMessage(
    //         Message.Common.FailureMessage.Creation('Request'),
    //       );
    //     }
    //   }
    // } else {
    const userDependantsDetails = {
      request_id,
      family_id,
      member_id,
      surname,
      forename,
      date_of_birth,
      relationship,
      child,
      user_gender,
      is_mauritian,
      nic_no,
      passport_no,
      card,
      company_id,
      insurance_end_date,
      insurance_status,
      request_createdby,
      effective_insurance_date,
      user_status,
      city,
    };
    insertDependants = await userProfileModel.createDependants(
      userDependantsDetails,
    );
    const { profile_id } = insertDependants.recordset[0];
    if (insertDependants.returnValue === 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Creation('Dependent'),
        { member_id: profile_id },
      );
    } else {
      logger.error('Adding dependent failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Creation('Dependent'),
      );
    }
    // }

    // }
  } catch (err) {
    logger.error('Adding dependant ', err.stack);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteDependants = async (req, res) => {
  try {
    logger.info('deleting dependant');
    const {
      member_id,
      request_id,
    } = req.params;
    const deleteProfile = await userProfileModel.deleteDependantsById(member_id, request_id);
    if (deleteProfile.rowsAffected.length > 0) {
      logger.info('deleted dependant');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Deletion('User Profile'),
      );
    } else {
      logger.error(' failed to delete dependant');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Deletion('User Profile'),
      );
    }
  } catch (err) {
    logger.error('Deleting dependant ', err);
    new Response(
      res,
      StatusCodes.OK,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getDependants = async (req, res) => {
  try {
    logger.info('getting dependent -->');
    const {
      familyId,
    } = req.params;

    const { deleted } = req.query;
    const dependants = await UserModel.getAllDepandants(familyId, deleted);
    const family_id = familyId;

    if (dependants.recordset.length > 0) {
      for (let i = 0; i < dependants.recordset.length; i++) {
        const { member_id } = dependants.recordset[i];
        const coverDetails = dependants.recordset[i].cover_details.filter((val) => val !== null).join(', ');
        let documents = await getDocuments({ family_id, member_id });
        dependants.recordset[i].cover_details = coverDetails;
        dependants.recordset[i].documents = documents.recordset;
      }
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Dependants'),
        dependants.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoData,
      );
    }
  } catch (err) {
    logger.error('Fetching dependant data -->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.Fetch('Dependants'),
    );
  }
};

const getPrincpalAndDependants = async (req, res) => {
  try {
    logger.info('Fetching principal data -->');
    const {
      familyId,
    } = req.params;
    const getMembers = await userProfileModel.getPrincpalAndDependantsByFamilyId(familyId);
    if (getMembers.recordset.length > 0) {
      for (let i = 0; i < getMembers.recordset.length; i++) {
        // Concat the rgpa plan, top part 1 and top part 2
        const coverDetails = getMembers.recordset[i].cover_details.filter((val) => val !== null).join(', ');
        getMembers.recordset[i].cover_details = coverDetails;
      }
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Principal Member and Dependants'),
        getMembers.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoDataFound('Principal Member and Dependants'),
      );
    }
  } catch (err) {
    logger.error('Fetching principal and dependant data -->', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  updateUserProfile,
  deleteDependants,
  addDependantsDetails,
  getDependants,
  getPrincpalAndDependants,
  addOrUpdateProfile,
  createDependantsDetails,
};
