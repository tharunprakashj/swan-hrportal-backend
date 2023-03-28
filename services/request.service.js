/* eslint-disable spaced-comment */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable camelcase */

const crypto = require('crypto');

const { reject } = require('lodash');

// Import User Model
const { resolve } = require('path');
const userModel = require('../models/user.model');

// Import Policy Model
const policyModel = require('../models/policies.model');

// Import Insurance Model
const insuranceModel = require('../models/insurance.model');

// Import Notification Model
const { createNotification } = require('./notification.service');

// Import User Profile Model
const userProfileModel = require('../models/user-profile.model');

// Import Questionnarie Model
const questionnarieModel = require('../models/questionnarie.model');

// Import Message
const { Message } = require('../utils/message');

// Import Document
const { checkDocument, fetchDocument } = require('./documents.services');

const documentService = require('./documents.services');

const fileController = require('../controllers/file.controller');

// Import File Model
const fileModel = require('../models/file.model');

// Import Send Mail Method
const { sendMail } = require('../utils/mailer');

// Import Static ID's from utils directory
const {
  requestStatus, requestType, Role, insuranceStatus, userStatus,
} = require('../utils/role');

// Import Document Model
const documentModel = require('../models/document.model');

// Import File Service
const fileService = require('./file.services');

// Import Winston Logger
const logger = require('../utils/winston');

// Import Request Model
const requestModel = require('../models/request.model');

// Import User - Service for updating document details in database
const userService = require('./user.services');

const { addPolicyRecord, verifyChangePlan } = require('./polices.services');

// Import User - Service for updating document details in database
const questionnarieService = require('./questionnarie.service');
const { insertDocumentsFromRecords } = require('./documents.services');

const getRequestType = async (request_type) => {
  const type = await requestModel.getRequestTypeId(request_type);
  if (type.recordset.length > 0) {
    const { request_type_id } = type.recordset[0];
    return request_type_id;
  }

  return null;
};

const updateRequestStatus = async (requests) => {
  for (let i = 0; i < requests.length; i++) {
    const {
      request_status, family_id, member_id, request_id,
    } = requests[i];
    if (request_status === requestStatus.APPROVED) {
      const policy_no = crypto.randomBytes(5).toString('hex');
      const insurance_status = 'ACTIVE';
      const updateRequest = await requestModel.updateRequestStatus({
        request_status, family_id, member_id, request_id,
      });
      const updateInsurance = await requestModel.updateInsuranceDetails({
        policy_no, insurance_status, family_id, member_id, request_id,
      });

      if (requests.length === i + 1) {
        if (updateRequest.rowsAffected[0] > 0 && updateInsurance.rowsAffected[0] > 0) {
          return true;
        }
        return false;
      }
    } else {
      const updateRequest = await requestModel.updateRequestStatus({
        family_id, request_status, member_id, request_id,
      });
      if (requests.length === i + 1) {
        if (updateRequest.rowsAffected[0] > 0) {
          return true;
        }
        return false;
      }
    }
  }
};

const getMembersId = async (requestId) => {
  const result = await requestModel.getMemberList(requestId);
  return result;
};

const addRequestHistory = async (request_id) => {
  let requestDetails = await requestModel.getRequestDetailsById(request_id);

  requestDetails = requestDetails.recordset;
  for (let i = 0; i < requestDetails.length; i++) {
    let {
      family_id,
      member_id,
      insurance_id,
      role,
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
      user_status,
      bank_id,
      bank_account_holder,
      bank_account_number,
      rgpa_basic,
      monthly_rgpa_amount,
      top_up_part1,
      monthly_payment_part1,
      top_up_part2,
      monthly_payment_part2,
      FSC_fee,
      monthly_premium,
      request_status,
      request_type,
      request_createdby,
      request_submitedby,
      request_confirmedby,
      requested_by,
      request_reason,
      assigned_to,
      date_request_submitted,
      effective_insurance_date,
      insurance_end_date,
    } = requestDetails[i];

    date_of_birth = JSON.stringify(date_of_birth).replaceAll('"', "'");
    date_request_submitted = JSON.stringify(date_request_submitted).replaceAll('"', "'");
    effective_insurance_date = JSON.stringify(effective_insurance_date).replaceAll('"', "'");
    insurance_end_date = JSON.stringify(insurance_end_date).replaceAll('"', "'");

    const requestHistory = {
      request_id,
      family_id,
      member_id,
      insurance_id,
      role,
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
      user_status,
      bank_id,
      bank_account_holder,
      bank_account_number,
      rgpa_basic,
      monthly_rgpa_amount,
      top_up_part1,
      monthly_payment_part1,
      top_up_part2,
      monthly_payment_part2,
      FSC_fee,
      monthly_premium,
      request_status,
      request_type,
      request_createdby,
      request_submitedby,
      request_confirmedby,
      requested_by,
      request_reason,
      assigned_to,
      date_request_submitted,
      effective_insurance_date,
      insurance_end_date,
    };
    const addHistory = await requestModel.insertRequestHistory(requestHistory);
    if (addHistory.rowsAffected[0] > 0) {
      if (i + 1 === requestDetails.length) {
        return true;
      }
    } else {
      return false;
    }
  }
};

/*---------------------------------------APPROVAED METHOD--------------------------------------------------------*/

// const approved = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//     members,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT) {
//       const insurance_status = 'ACTIVE';
//       const updateInsurance = await requestModel.updateInsuranceDetails({
//         insurance_status, family_id, member_id,
//       });
//       if (updateInsurance.rowsAffected[0] > 0) {
//         const members = await requestModel.getRequestById(request_id);
//         const insuranceDetails = members.recordset;
//         for (let j = 0; j < insuranceDetails.length; j++) {
//           const result = await policyModel.getPolicyByMember(insuranceDetails[j].member_id);
//           const policies = result.recordset[0];
//           const {
//             rgpa_basic,
//             monthly_rgpa_amount,
//             top_up_part1,
//             monthly_payment_part1,
//             top_up_part2,
//             monthly_payment_part2,
//             FSC_fee,
//             monthly_premium,
//           } = policies;
//           const updateInsurance = await insuranceModel.updateInsurance({
//             member_id: policies.member_id,
//             family_id,
//             rgpa_basic,
//             monthly_rgpa_amount,
//             top_up_part1,
//             monthly_payment_part1,
//             top_up_part2,
//             monthly_payment_part2,
//             FSC_fee,
//             monthly_premium,

//           }, request_id);
//           const updateUser = await userProfileModel.updateUserProfileById(insuranceDetails[j].member_id, { user_status: 'ACTIVE' });
//           if (insuranceDetails.length === j + 1) {
//             if (updateInsurance.rowsAffected[0] > 0 && updateUser.rowsAffected[0] > 0) {
//               const updateRequest = await requestModel.updateRequestStatus({
//                 request_status, member_id, request_id, user_id, assigned_to,
//               });
//               const data = await createNotification({
//                 request_id,
//                 request_status,
//                 notify_to: null,
//                 notified_by: user_id,
//                 notification_description: Message.notifications.approved,
//                 family_id,
//                 member_id,
//               });
//               if (updateRequest.rowsAffected[0] > 0) {
//                 resolve({
//                   status: true,
//                   message: Message.Common.SuccessMessage.swanApproval('ADD MEMBER'),
//                 });
//               } else {
//                 resolve({
//                   status: false,
//                   message: Message.Common.FailureMessage.Updation('Request'),
//                 });
//               }
//             } else {
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.Updation('Request'),
//               });
//             }
//           }
//         }
//       } else {
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Insurance Activation'),
//         });
//       }
//     } else if (request_type === requestType.DELETE_MEMBER) {
//       // want to check the insurance end date in insurance table and if date is passed then can delete
//       // can do this last
//       // const deleteMember = await userModel.deleteUserById(family_id);
//       const deleteMember = await userProfileModel.updateUserProfileByFamilyId({ user_status: 'DELETED' }, family_id);
//       if (deleteMember.rowsAffected[0] > 0) {
//         const updateRequest = await requestModel.updateRequestStatus({
//           request_status, member_id, request_id, user_id,
//         });
//         const data = await createNotification({
//           request_id,
//           request_status,
//           notify_to: null,
//           notified_by: user_id,
//           notification_description: `${request_type}${Message.notifications.approved}`,
//           family_id,
//           member_id,
//         });
//         if (updateRequest.rowsAffected[0] > 0) {
//           resolve({
//             status: true,
//             message: Message.Common.SuccessMessage.swanApproval('DELETE MEMBER'),
//           });
//         } else {
//           resolve({
//             status: false,
//             message: Message.Common.FailureMessage.Deletion('Employee'),
//           });
//         }
//       } else {
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Deletion('Employee'),
//         });
//       }
//     } else if (request_type === requestType.DELETE_DEPENDANT) {
//       // want to check the insurance end date in insurance table and if date is passed then can delete
//       // can do this last
//       const dependants = await requestModel.getDependantFormByRequestId(request_id);
//       if (dependants.recordset.length > 0) {
//         let str = '';
//         for (let i = 0; i < dependants.recordset.length; i++) {
//           str += dependants.recordset[i].member_id;
//           if (i !== dependants.recordset.length - 1) {
//             str += ',';
//           }
//         }
//         const deleteDependant = await userProfileModel.softDeleteDependantsById(str);
//         if (deleteDependant.rowsAffected[0] > 0) {
//           const updateRequest = await requestModel.updateRequestStatus({
//             request_status, member_id, request_id, user_id,
//           });
//           const data = await createNotification({
//             request_id,
//             request_status,
//             notify_to: null,
//             notified_by: user_id,
//             notification_description: `${request_type}${Message.notifications.approved}`,
//             family_id,
//             member_id,
//           });
//           if (updateRequest.rowsAffected[0] > 0) {
//             await questionnarieModel.deleteByMemberId(members);
//             resolve({
//               status: true,
//               message: Message.Common.SuccessMessage.swanApproval('Delete Dependent'),
//             });
//           } else {
//             resolve({
//               status: false,
//               message: Message.Common.FailureMessage.Deletion('Dependant'),
//             });
//           }
//         } else {
//           resolve({
//             status: false,
//             message: Message.Common.FailureMessage.Deletion('Dependant'),
//           });
//         }
//       } else {
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Fetch('Delete dependants Id'),
//         });
//       }
//     } else if (request_type === requestType.CHANGE_PLAN) {
//       const result = await policyModel.getPolicRecordyByMember(request_id);
//       const policies = result.recordset;
//       for (let j = 0; j < policies.length; j++) {
//         const {
//           member_id,
//           rgpa_basic,
//           monthly_rgpa_amount,
//           top_up_part1,
//           monthly_payment_part1,
//           top_up_part2,
//           monthly_payment_part2,
//           FSC_fee,
//           monthly_premium,
//         } = policies[j];
//         const PlanChangeType = await verifyChangePlan([{
//           rgpa_basic, top_up_part1, top_up_part2, member_id,
//         }]);
//         const updatePolicyDetails = await policyModel.updateChangePlan({
//           rgpa_basic,
//           monthly_rgpa_amount,
//           top_up_part1,
//           monthly_payment_part1,
//           top_up_part2,
//           monthly_payment_part2,
//           FSC_fee,
//           monthly_premium,
//         }, member_id);
//         if (policies.length === j + 1) {
//           if (updatePolicyDetails.rowsAffected[0] > 0 && insertPlanType.rowsAffected[0] > 0) {
//             let resetQuestionnarie = await questionnarieModel.resetAnswers(family_id);
//             let answers = await questionnarieModel.getAnswersByRequestId(request_id);
//             if (answers.recordset.length > 0) {
//               answers = answers.recordset;
//               for (let j = 0; j < answers.length; j++) {
//                 answers[j].userId = answers[j].family_id;
//                 const insertAnswers = await questionnarieModel.insertAnswers(answers[j]);
//                 if (j === answers.length - 1) {
//                   if (insertAnswers.rowsAffected[0] > 0) {
//                     const docUpload = await insertDocumentsFromRecords(request_id);
//                     if (docUpload) {
//                       const updateRequest = await requestModel.updateRequestStatus({
//                         request_status, member_id, request_id, user_id, assigned_to,
//                       });
//                       const data = await createNotification({
//                         request_id,
//                         request_status,
//                         notify_to: null,
//                         notified_by: user_id,
//                         notification_description: `${request_type}${Message.notifications.approved}`,
//                         family_id,
//                         member_id,
//                       });
//                       if (updateRequest.rowsAffected[0] > 0) {
//                         resolve({
//                           status: true,
//                           message: Message.Common.SuccessMessage.swanApproval('Change Plan'),
//                         });
//                       } else {
//                         resolve({
//                           status: false,
//                           message: Message.Common.FailureMessage.Updation('Request'),
//                         });
//                       }
//                     } else {
//                       resolve({
//                         status: false,
//                         message: Message.Common.FailureMessage.Updation('Request'),
//                       });
//                     }
//                   }
//                 }
//               }
//             } else {
//               const updateRequest = await requestModel.updateRequestStatus({
//                 request_status, member_id, request_id, user_id, assigned_to,
//               });
//               const data = await createNotification({
//                 request_id,
//                 request_status,
//                 notify_to: null,
//                 notified_by: user_id,
//                 notification_description: `${request_type}${Message.notifications.approved}`,
//                 family_id,
//                 member_id,
//               });
//               if (updateRequest.rowsAffected[0] > 0) {
//                 resolve({
//                   status: true,
//                   message: Message.Common.SuccessMessage.swanApproval('Change Plan'),
//                 });
//               } else {
//                 resolve({
//                   status: false,
//                   message: Message.Common.FailureMessage.Updation('Request'),
//                 });
//               }
//             }
//           } else {
//             resolve({
//               status: false,
//               message: Message.Common.FailureMessage.Updation('Request'),
//             });
//           }
//         }
//       }
//     }
//   });
// };

const approved = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
    members,
  } = request;
  return new Promise(async (resolve, reject) => {
    if (request_type === requestType.ADD_MEMBER) {
      const user_status = userStatus.ACTIVE;
      const updateProfileMasters = await requestModel.updateProfileByRequest(request_id, user_status, request_type, family_id);
      const updatePolicyMasters = await requestModel.updatePolicyDetailsByRequest(request_id);
      const updateQuestionnaireMaster = await requestModel.updateQuestionnaireByRequest(request_id);
      const updateDocumentsMaster = await requestModel.updateDocumentsByRequest(request_id);
      if (updateProfileMasters.returnValue === 0 && updatePolicyMasters.returnValue === 0 && updateQuestionnaireMaster.returnValue === 0 && updateDocumentsMaster.returnValue === 0) {
        const updateRequest = await requestModel.updateRequestStatus({
          request_status, member_id, request_id, user_id, assigned_to,
        });
        console.log(updateRequest);
        const data = await createNotification({
          request_id,
          request_status,
          notify_to: null,
          notified_by: user_id,
          notification_description: Message.notifications.approved,
          family_id,
          member_id,
        });
        if (updateRequest.rowsAffected[0] > 0) {
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.swanApproval('ADD MEMBER'),
          });
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Updation('Request'),
          });
        }
      }
    } else if (request_type === requestType.ADD_DEPENDANT) {
      const user_status = userStatus.ACTIVE;
      const updateProfileMasters = await requestModel.updateProfileByRequest(request_id, user_status, request_type, family_id);
      const updatePolicyMasters = await requestModel.updatePolicyDetailsByRequest(request_id);
      const updateQuestionnaireMaster = await requestModel.updateQuestionnaireByRequest(request_id);
      const updateDocumentsMaster = await requestModel.updateDocumentsByRequest(request_id);
      if (updateProfileMasters.returnValue === 0 && updatePolicyMasters.returnValue === 0 && updateQuestionnaireMaster.returnValue === 0 && updateDocumentsMaster.returnValue === 0) {
        const updateRequest = await requestModel.updateRequestStatus({
          request_status, member_id, request_id, user_id, assigned_to,
        });
        console.log(updateRequest);
        const data = await createNotification({
          request_id,
          request_status,
          notify_to: null,
          notified_by: user_id,
          notification_description: Message.notifications.approved,
          family_id,
          member_id,
        });
        if (updateRequest.rowsAffected[0] > 0) {
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.swanApproval('ADD MEMBER'),
          });
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Updation('Request'),
          });
        }
      }
    } else if (request_type === requestType.DELETE_MEMBER) {
      // want to check the insurance end date in insurance table and if date is passed then can delete
      // can do this last
      // const deleteMember = await userModel.deleteUserById(family_id);
      const deleteMember = await userProfileModel.updateUserProfileByFamilyId({ user_status: userStatus.DELETED }, family_id);
      if (deleteMember.rowsAffected[0] > 0) {
        const deleteEmployee = await userModel.deleteemployee(family_id);
        if (deleteEmployee.rowsAffected[0] > 0) {
          const updateRequest = await requestModel.updateRequestStatus({
            request_status, member_id, request_id, user_id,
          });
          if (updateRequest.rowsAffected[0] > 0) {
            resolve({
              status: true,
              message: Message.Common.SuccessMessage.swanApproval('DELETE MEMBER'),
            });
          } else {
            resolve({
              status: false,
              message: Message.Common.FailureMessage.Deletion('Employee'),
            });
          }
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Deletion('Employee'),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Deletion('Employee'),
        });
      }
    } else if (request_type === requestType.DELETE_DEPENDANT) {
      // want to check the insurance end date in insurance table and if date is passed then can delete
      // can do this last
      const deleteDependant = await userProfileModel.softDeleteDependantsById(members);
      if (deleteDependant.rowsAffected[0] > 0) {
        const updateRequest = await requestModel.updateRequestStatus({
          request_status, member_id, request_id, user_id,
        });
        const data = await createNotification({
          request_id,
          request_status,
          notify_to: null,
          notified_by: user_id,
          notification_description: `${request_type}${Message.notifications.approved}`,
          family_id,
          member_id,
        });
        if (updateRequest.rowsAffected[0] > 0) {
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.swanApproval('Delete Dependent'),
          });
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Deletion('Dependant'),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Deletion('Dependant'),
        });
      }
    } else if (request_type === requestType.CHANGE_PLAN) {
      const result = await policyModel.getPolicRecordyByMember(request_id);
      const policies = result.recordset;
      for (let j = 0; j < policies.length; j++) {
        const {
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
          FSC_fee,
          monthly_premium,
        } = policies[j];
        const updatePolicyDetails = await policyModel.updateChangePlan({
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
          FSC_fee,
          monthly_premium,
        }, member_id);
        if (policies.length === j + 1) {
          if (updatePolicyDetails.rowsAffected[0] > 0) {
            let answers = await questionnarieModel.getAnswersByRequestId(request_id);
            if (answers.recordset.length > 0) {
              answers = answers.recordset;
              for (let j = 0; j < answers.length; j++) {
                answers[j].userId = answers[j].family_id;
                const insertAnswers = await questionnarieModel.insertAnswers(answers[j]);
                if (j === answers.length - 1) {
                  if (insertAnswers.rowsAffected[0] > 0) {
                    const updateRequest = await requestModel.updateRequestStatus({
                      request_status, member_id, request_id, user_id, assigned_to,
                    });
                    const data = await createNotification({
                      request_id,
                      request_status,
                      notify_to: null,
                      notified_by: user_id,
                      notification_description: `${request_type}${Message.notifications.approved}`,
                      family_id,
                      member_id,
                    });
                    if (updateRequest.rowsAffected[0] > 0) {
                      resolve({
                        status: true,
                        message: Message.Common.SuccessMessage.swanApproval('Change Plan'),
                      });
                    } else {
                      resolve({
                        status: false,
                        message: Message.Common.FailureMessage.Updation('Request'),
                      });
                    }
                  }
                }
              }
            } else {
              const updateRequest = await requestModel.updateRequestStatus({
                request_status, member_id, request_id, user_id, assigned_to,
              });
              const data = await createNotification({
                request_id,
                request_status,
                notify_to: null,
                notified_by: user_id,
                notification_description: `${request_type}${Message.notifications.approved}`,
                family_id,
                member_id,
              });
              if (updateRequest.rowsAffected[0] > 0) {
                resolve({
                  status: true,
                  message: Message.Common.SuccessMessage.swanApproval('Change Plan'),
                });
              } else {
                resolve({
                  status: false,
                  message: Message.Common.FailureMessage.Updation('Request'),
                });
              }
            }
          } else {
            resolve({
              status: false,
              message: Message.Common.FailureMessage.Updation('Request'),
            });
          }
        }
      }
    } else if (request_type === requestType.CHANGE_MEMBER) {
      const members = await requestModel.getDependantFormByRequestId(request_id);
      if (members.recordset.length > 0) {
        let str = '';
        for (let i = 0; i < members.recordset.length; i++) {
          str += members.recordset[i].member_id;
          if (i !== members.recordset.length - 1) {
            str += ',';
          }
        }
        let memberDocument = await documentModel.getMemberDocumentRecords(str);
        if (memberDocument.recordset.length > 0) {
          console.log('memberDocumentCOUNT', memberDocument);
          let updateInDb;
          for (let k = 0; k < memberDocument.recordset.length; k++) {
            let {
              family_id, member_id, document_type, document_key, document_format, location,
            } = memberDocument.recordset[k];
            console.log('memberDocuments', memberDocument.recordset[k]);
            const check = await fetchDocument(member_id, document_type);
            if (check.length > 0) {
              const existingKey = check[0].document_key;
              await fileController.deleteFile(existingKey);
              updateInDb = await fileModel.updateDocumentByKey({ document_key, document_format, location }, { member_id, document_type });
            } else {
              updateInDb = await userService.uploadDocuments({
                family_id, member_id, document_key, document_type, document_format, location,
              });
            }
            if (k + 1 === memberDocument.recordset.length) {
              if (updateInDb.rowsAffected[0] > 0) {
                logger.info('DOCUMENT RECORDS UPDATED TO tbl_upoaded_documents TABLE SUCCESSFULLY');
                resolve({
                  status: true,
                  message: Message.Common.SuccessMessage.Updation('Change Members Request'),
                });
              }
            }
            // let insertDocumentRecord = await documentModel.insertDocumentRecord(memberDocument.recordset[k]);
          }
        } else {
          logger.info('ERROR IN GETTING REQUEST MEMBER DOCUMENTS');
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Fetch('Request Members Documents'),
          });
        }
      } else {
        logger.info('ERROR IN GETTING REQUEST MEMBERS');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Fetch('Request Members'),
        });
      }
    } else if (request_type === requestType.TRANSFER_MEMBER) {
      const employeeRecord = await userModel.getEmployeeRecordsByRequetId(request_id);
      if (employeeRecord.recordset.length > 0) {
        const { role, company_id, user_id } = employeeRecord.recordset[0];
        const updateEmployee = await userModel.updateEmployee({ role, company_id }, user_id);
        if (updateEmployee.rowsAffected[0] > 0) {
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.Updation('Transfer Member Request'),
          });
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Updation(''),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Fetch('Employee Records'),
        });
      }
    }
  });
};

/*----------------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------HR APPROVAL METHOD--------------------------------------------------------*/

// const hrApproval = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     if (request_type === requestType.ADD_MEMBER) {
//       const members = await getMembersId(request_id);
//       if (members.rowsAffected > 0) {
//         const membersList = members.recordset;
//         for (let j = 0; j < membersList.length; j++) {
//           const { member_id } = membersList[j];
//           const profileData = await userProfileModel.getProfile(membersList[j].member_id);
//           const profile = profileData.recordset[0];
//           if (profile.relationship === 'PRIMARY') {
//             let types;
//             if (profile.is_mauritian === true) {
//               types = [1, 9, 2];
//             } else {
//               types = [1, 9, 3];
//             }
//             const result = await checkDocument(member_id, types);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of Primary User`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'SPOUSE') {
//             let Sptypes;
//             if (profile.is_mauritian === true) {
//               Sptypes = [1, 4, 2];
//             } else {
//               Sptypes = [1, 4, 3];
//             }
//             logger.info('Spouse typesssss', Sptypes);
//             const result = await checkDocument(member_id, Sptypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'LIVE_IN_PARTNER') {
//             let LIPtypes;
//             if (profile.is_mauritian === true) {
//               LIPtypes = [8, 2];
//             } else {
//               LIPtypes = [8, 3];
//             }
//             logger.info('LIP typesssss', LIPtypes);
//             const result = await checkDocument(member_id, LIPtypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'TERTIARY_STUDENT') {
//             let TStypes;
//             if (profile.is_mauritian === true) {
//               TStypes = [1, 5, 2];
//             } else {
//               TStypes = [1, 5, 3];
//             }
//             logger.info('Territary student typesssss', TStypes);
//             const result = await checkDocument(member_id, TStypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'PARENT') {
//             let Partypes;
//             if (profile.is_mauritian === true) {
//               Partypes = [1, 2];
//             } else {
//               Partypes = [1, 3];
//             }
//             logger.info('Parent typesssss', Partypes);
//             const result = await checkDocument(member_id, Partypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'CHILD') {
//             let chiltypes;
//             if (profile.child === 'Adopted Child') {
//               chiltypes = [1, 7];
//             } else if (profile.child === 'Child dependant due to disability') {
//               chiltypes = [1, 6];
//             } else {
//               chiltypes = [1];
//             }
//             logger.info('child typesssss', chiltypes);
//             const result = await checkDocument(member_id, chiltypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.document);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           }
//           if (membersList.length === j + 1) {
//             await userService.insertProfileRecords({ member_id, request_id }).then(async (data) => {
//               if (data.status === true) {
//                 await documentService.insertDocumentRecords({ member_id, request_id }).then(async (data) => {
//                   if (data.status === true) {
//                     await questionnarieService.insertQuestionnarieAnswerRecords({ member_id, request_id }).then(async (data) => {
//                       if (data.status === true) {
//                         await documentService.insertQuestionnarieDocumentsRecords({ member_id, request_id }).then(async (data) => {
//                           if (data.status === true) {
//                             if (membersList.length === j + 1) {
//                               const updateRequest = await requestModel.updateRequestStatus({
//                                 request_status, family_id, member_id, request_id, user_id, assigned_to,
//                               });
//                               const data = await createNotification({
//                                 request_id,
//                                 request_status,
//                                 notify_to: null,
//                                 notified_by: user_id,
//                                 notification_description: Message.notifications.submit,
//                                 family_id,
//                                 member_id,
//                               });
//                               if (updateRequest.rowsAffected[0] > 0) {
//                                 logger.info('Status changes updated');
//                                 const user = await userModel.checkById(family_id);
//                                 if (user.recordset.length > 0) {
//                                   const { email_id, is_verified, password } = user.recordset[0];
//                                   if (!is_verified) {
//                                     sendMail({ email_id, password })
//                                       .then(async (data) => {
//                                         logger.info('Mail sended successfully', data);
//                                         resolve({
//                                           status: true,
//                                           message: Message.Common.SuccessMessage.hrApproval,
//                                         });
//                                       })
//                                       .catch((err) => {
//                                         logger.error(err);
//                                         resolve({
//                                           status: false,
//                                           message: Message.Common.FailureMessage.Updation('Request'),
//                                         });
//                                       });
//                                   } else {
//                                     logger.info('Request submitted successfully');
//                                     resolve({
//                                       status: true,
//                                       message: Message.Common.SuccessMessage.hrApproval,
//                                     });
//                                   }
//                                 }
//                               } else {
//                                 logger.error('Status changes Failed');
//                                 resolve({
//                                   status: false,
//                                   message: Message.Common.FailureMessage.Updation('Request'),
//                                 });
//                               }
//                             }
//                           } else if (data.status === false) {
//                             resolve({
//                               status: data.status,
//                               message: data.message,
//                             });
//                           }
//                         }).catch((error) => {
//                           console.log('ADD Question Document RECORDS', error);
//                         });
//                       } else if (data.status === false) {
//                         resolve({
//                           status: data.status,
//                           message: data.message,
//                         });
//                       }
//                     }).catch((error) => {
//                       console.log('ADD ANSWER RECORDS', error);
//                     });
//                   } else if (data.status === false) {
//                     resolve({
//                       status: data.status,
//                       message: data.message,
//                     });
//                   }
//                 }).catch((error) => {
//                   console.log('ADD DOCUMENTS RECORDS', error);
//                 });
//               } else if (data.status === false) {
//                 resolve({
//                   status: data.status,
//                   message: data.message,
//                 });
//               }
//             }).catch((error) => {
//               console.log('ADD PROFILE', error);
//             });
//           }
//         }
//       } else {
//         logger.info('No members found');
//       }
//     } else if (request_type === requestType.ADD_DEPENDANT) {
//       const members = await getMembersId(request_id);
//       if (members.rowsAffected > 0) {
//         const membersList = members.recordset;
//         for (let j = 0; j < membersList.length; j++) {
//           const { member_id } = membersList[j];
//           const profileData = await userProfileModel.getProfile(membersList[j].member_id);
//           const profile = profileData.recordset[0];
//           if (profile.relationship === 'PRIMARY') {
//           // const types = clone(documentType.PRIMARY);
//             let types;
//             if (profile.is_mauritian === true) {
//             // types.push(clone(documentType.NATIONAL_IDENTITY_CARD));
//               types = [1, 9, 2];
//             } else {
//             // types.push(clone(documentType.PASSPORT));
//               types = [1, 9, 3];
//             }
//             const result = await checkDocument(member_id, types);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'SPOUSE') {
//           // const Sptypes = clone(documentType.SPOUSE);
//             let Sptypes;
//             if (profile.is_mauritian === true) {
//             // Sptypes.push(clone(documentType.NATIONAL_IDENTITY_CARD));
//               Sptypes = [1, 4, 2];
//             } else {
//             // Sptypes.push(clone(documentType.PASSPORT));
//               Sptypes = [1, 4, 3];
//             }
//             logger.info('Spouse typesssss', Sptypes);
//             const result = await checkDocument(member_id, Sptypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'LIVE_IN_PARTNER') {
//           // const LIPtypes = clone(documentType.LIVE_IN_PARTNER);
//             let LIPtypes;
//             if (profile.is_mauritian === true) {
//             // LIPtypes.push(clone(documentType.NATIONAL_IDENTITY_CARD));
//               LIPtypes = [8, 2];
//             } else {
//             // LIPtypes.push(clone(documentType.PASSPORT));
//               LIPtypes = [8, 3];
//             }
//             logger.info('LIP typesssss', LIPtypes);
//             const result = await checkDocument(member_id, LIPtypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'TERTIARY_STUDENT') {
//           // const TStypes = clone(documentType.TERTIARY_STUDENT);
//             let TStypes;
//             if (profile.is_mauritian === true) {
//             // TStypes.push(clone(documentType.NATIONAL_IDENTITY_CARD));
//               TStypes = [1, 5, 2];
//             } else {
//             // TStypes.push(clone(documentType.PASSPORT));
//               TStypes = [1, 5, 3];
//             }
//             logger.info('Territary student typesssss', TStypes);
//             const result = await checkDocument(member_id, TStypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'PARENT') {
//           // const Partypes = clone(documentType.PARENT);
//             let Partypes;
//             if (profile.is_mauritian === true) {
//             // Partypes.push(clone(documentType.NATIONAL_IDENTITY_CARD));
//               Partypes = [1, 2];
//             } else {
//             // Partypes.push(clone(documentType.PASSPORT));
//               Partypes = [1, 3];
//             }
//             logger.info('Parent typesssss', Partypes);
//             const result = await checkDocument(member_id, Partypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           } else if (profile.relationship === 'CHILD') {
//           // const chiltypes = clone(documentType.CHILD);
//             let chiltypes;
//             if (profile.child === 'Adopted Child') {
//             // chiltypes.push(clone(documentType.ADOPTION_PAPER));
//               chiltypes = [1, 7];
//             } else if (profile.child === 'Child dependant due to disability') {
//             // chiltypes.push(clone(documentType.DISABILITY_MEDICAL_REPORT));
//               chiltypes = [1, 6];
//             } else {
//               chiltypes = [1];
//             }
//             logger.info('child typesssss', chiltypes);
//             const result = await checkDocument(member_id, chiltypes);
//             if (result.status === false) {
//               logger.error('Please upload missing documents', result.documentType);
//               resolve({
//                 status: false,
//                 message: Message.Common.FailureMessage.uploads,
//               });
//               break;
//             } else {
//               logger.info('All required documents are available');
//             }
//           }
//           await userService.insertProfileRecords({ member_id, request_id }).then(async (data) => {
//             if (data.status === true) {
//               await documentService.insertDocumentRecords({ member_id, request_id }).then(async (data) => {
//                 if (data.status === true) {
//                   await questionnarieService.insertQuestionnarieAnswerRecords({ member_id, request_id }).then(async (data) => {
//                     if (data.status === true) {
//                       await documentService.insertQuestionnarieDocumentsRecords({ member_id, request_id }).then(async (data) => {
//                         if (data.status === true) {
//                           if (membersList.length === j + 1) {
//                             const updateRequest = await requestModel.updateRequestStatus({
//                               request_status, family_id, member_id, request_id, user_id, assigned_to,
//                             });
//                             const data = await createNotification({
//                               request_id,
//                               request_status,
//                               notify_to: null,
//                               notified_by: user_id,
//                               notification_description: Message.notifications.submit,
//                               family_id,
//                               member_id,
//                             });
//                             if (updateRequest.rowsAffected[0] > 0) {
//                               logger.info('Status changes updated');
//                               const user = await userModel.checkById(family_id);
//                               if (user.recordset.length > 0) {
//                                 const { email_id, is_verified, password } = user.recordset[0];
//                                 if (!is_verified) {
//                                   sendMail({ email_id, password })
//                                     .then(async (data) => {
//                                       logger.info('Mail sended successfully', data);
//                                       resolve({
//                                         status: true,
//                                         message: Message.Common.SuccessMessage.hrApproval,
//                                       });
//                                     })
//                                     .catch((err) => {
//                                       logger.error(err);
//                                       resolve({
//                                         status: false,
//                                         message: Message.Common.FailureMessage.Updation('Request'),
//                                       });
//                                     });
//                                 } else {
//                                   logger.info('Request submitted successfully');
//                                   resolve({
//                                     status: true,
//                                     message: Message.Common.SuccessMessage.hrApproval,
//                                   });
//                                 }
//                               }
//                             } else {
//                               logger.info('Status changes Failed');
//                               resolve({
//                                 status: false,
//                                 message: Message.Common.FailureMessage.Updation('Request'),
//                               });
//                             }
//                           }
//                         } else if (data.status === false) {
//                           resolve({
//                             status: data.status,
//                             message: data.message,
//                           });
//                         }
//                       }).catch((error) => {
//                         console.log('ADD Question Document RECORDS', error);
//                       });
//                     } else if (data.status === false) {
//                       resolve({
//                         status: data.status,
//                         message: data.message,
//                       });
//                     }
//                   }).catch((error) => {
//                     console.log('ADD ANSWER RECORDS', error);
//                   });
//                 } else if (data.status === false) {
//                   resolve({
//                     status: data.status,
//                     message: data.message,
//                   });
//                 }
//               }).catch((error) => {
//                 console.log('ADD DOCUMENTS RECORDS', error);
//               });
//             } else if (data.status === false) {
//               resolve({
//                 status: data.status,
//                 message: data.message,
//               });
//             }
//           }).catch((error) => {
//             console.log('ADD PROFILE', error);
//           });
//         }
//       } else {
//         logger.info('No members found');
//       }
//     } else if (request_type === requestType.DELETE_MEMBER || request_type === requestType.DELETE_DEPENDANT || request_type === requestType.CHANGE_PLAN) {
//       const updateRequest = await requestModel.updateRequestStatus({
//         request_status, member_id, request_id, user_id, assigned_to,
//       });
//       const data = await createNotification({
//         request_id,
//         request_status,
//         notify_to: null,
//         notified_by: user_id,
//         notification_description: Message.notifications.submit,
//         family_id,
//         member_id,
//       });
//       if (updateRequest.rowsAffected[0] > 0) {
//         logger.info('Status changes updated');
//         resolve({
//           status: true,
//           message: Message.Common.SuccessMessage.hrApproval,
//         });
//       } else {
//         logger.info('Status changes Failed');
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Request'),
//         });
//       }
//     }
//   });
// };

const hrApproval = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
    members,
  } = request;
  return new Promise(async (resolve, reject) => {
    if (request_type === requestType.ADD_MEMBER) {
      // const members = await getMembersId(request_id);
      // if (members.rowsAffected > 0) {
      // const membersList = members.recordset;
      for (let j = 0; j < members.length; j++) {
        const member_id = members[j];
        const profileData = await userProfileModel.getProfileRecords(member_id);
        const profile = profileData.recordset[0];
        if (profile.relationship === 'PRIMARY') {
          let types;
          if (profile.is_mauritian === true) {
            types = [1, 9, 2];
          } else {
            types = [1, 9, 3];
          }
          const result = await checkDocument(request_id, member_id, types);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of Primary User`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} user is available`);
          }
        } else if (profile.relationship === 'SPOUSE') {
          let Sptypes;
          if (profile.is_mauritian === true) {
            Sptypes = [1, 4, 2];
          } else {
            Sptypes = [1, 4, 3];
          }
          logger.info('Spouse typesssss', Sptypes);
          const result = await checkDocument(request_id, member_id, Sptypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'LIVE_IN_PARTNER') {
          let LIPtypes;
          if (profile.is_mauritian === true) {
            LIPtypes = [8, 2];
          } else {
            LIPtypes = [8, 3];
          }
          logger.info('LIP typesssss', LIPtypes);
          const result = await checkDocument(request_id, member_id, LIPtypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'TERTIARY_STUDENT') {
          let TStypes;
          if (profile.is_mauritian === true) {
            TStypes = [1, 5, 2];
          } else {
            TStypes = [1, 5, 3];
          }
          logger.info('Territary student typesssss', TStypes);
          const result = await checkDocument(request_id, member_id, TStypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'PARENT') {
          let Partypes;
          if (profile.is_mauritian === true) {
            Partypes = [1, 2];
          } else {
            Partypes = [1, 3];
          }
          logger.info('Parent typesssss', Partypes);
          const result = await checkDocument(request_id, member_id, Partypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'CHILD') {
          let chiltypes;
          if (profile.child === 'Adopted Child') {
            chiltypes = [1, 7];
          } else if (profile.child === 'Child dependant due to disability') {
            chiltypes = [1, 6];
          } else {
            chiltypes = [1];
          }
          logger.info('child typesssss', chiltypes);
          const result = await checkDocument(request_id, member_id, chiltypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.document);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        }

        if (members.length === j + 1) {
          const updateRequest = await requestModel.updateRequestStatus({
            request_status, family_id, member_id, request_id, user_id, assigned_to,
          });
          const data = await createNotification({
            request_id,
            request_status,
            notify_to: null,
            notified_by: user_id,
            notification_description: Message.notifications.submit,
            family_id,
            member_id,
          });
          if (updateRequest.rowsAffected[0] > 0) {
            logger.info('Request Status changed');
            const user = await userModel.checkById(family_id);
            if (user.recordset.length > 0) {
              const { email_id, is_verified, password } = user.recordset[0];
              if (!is_verified) {
                sendMail({ email_id, password })
                  .then(async (data) => {
                    logger.info('Mail sended successfully', data);
                    resolve({
                      status: true,
                      message: Message.Common.SuccessMessage.hrApproval,
                    });
                  })
                  .catch((err) => {
                    logger.error(err);
                    resolve({
                      status: false,
                      message: Message.Common.FailureMessage.Updation('Request'),
                    });
                  });
              } else {
                logger.info('Request submitted successfully');
                resolve({
                  status: true,
                  message: Message.Common.SuccessMessage.hrApproval,
                });
              }
            }
          } else {
            logger.info('Status changes Failed');
            resolve({
              status: false,
              message: Message.Common.FailureMessage.Updation('Request'),
            });
          }
        }

        //   await userService.addProfileRecords({ member_id, request_id }).then(async (data) => {
        //     if (data.status === true) {
        //       await documentService.addDocumentRecords({ member_id, request_id }).then(async (data) => {
        //         if (data.status === true) {
        //           if (membersList.length === j + 1) {

      //           }
      //         } else if (data.status === false) {
      //           resolve({
      //             status: data.status,
      //             message: data.message,
      //           });
      //         }
      //       }).catch((error) => {
      //         console.log('ADD DOCUMENTS RECORDS', error);
      //       });
      //     } else if (data.status === false) {
      //       resolve({
      //         status: data.status,
      //         message: data.message,
      //       });
      //     }
      //   }).catch((error) => {
      //     console.log('ADD PROFILE', error);
      //   });
      }
      // } else {
      //   logger.info('No members found');
      // }
    } else if (request_type === requestType.ADD_DEPENDANT) {
      for (let j = 0; j < members.length; j++) {
        const member_id = members[j];
        const profileData = await userProfileModel.getProfileRecords(member_id);
        const profile = profileData.recordset[0];
        if (profile.relationship === 'PRIMARY') {
          let types;
          if (profile.is_mauritian === true) {
            types = [1, 9, 2];
          } else {
            types = [1, 9, 3];
          }
          const result = await checkDocument(request_id, member_id, types);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of Primary User`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} user is available`);
          }
        } else if (profile.relationship === 'SPOUSE') {
          let Sptypes;
          if (profile.is_mauritian === true) {
            Sptypes = [1, 4, 2];
          } else {
            Sptypes = [1, 4, 3];
          }
          logger.info('Spouse typesssss', Sptypes);
          const result = await checkDocument(request_id, member_id, Sptypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'LIVE_IN_PARTNER') {
          let LIPtypes;
          if (profile.is_mauritian === true) {
            LIPtypes = [8, 2];
          } else {
            LIPtypes = [8, 3];
          }
          logger.info('LIP typesssss', LIPtypes);
          const result = await checkDocument(request_id, member_id, LIPtypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'TERTIARY_STUDENT') {
          let TStypes;
          if (profile.is_mauritian === true) {
            TStypes = [1, 5, 2];
          } else {
            TStypes = [1, 5, 3];
          }
          logger.info('Territary student typesssss', TStypes);
          const result = await checkDocument(request_id, member_id, TStypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'PARENT') {
          let Partypes;
          if (profile.is_mauritian === true) {
            Partypes = [1, 2];
          } else {
            Partypes = [1, 3];
          }
          logger.info('Parent typesssss', Partypes);
          const result = await checkDocument(request_id, member_id, Partypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.documentType);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        } else if (profile.relationship === 'CHILD') {
          let chiltypes;
          if (profile.child === 'Adopted Child') {
            chiltypes = [1, 7];
          } else if (profile.child === 'Child dependant due to disability') {
            chiltypes = [1, 6];
          } else {
            chiltypes = [1];
          }
          logger.info('child typesssss', chiltypes);
          const result = await checkDocument(request_id, member_id, chiltypes);
          if (result.status === false) {
            logger.error('Please upload missing documents', result.document);
            resolve({
              status: false,
              message: Message.Common.FailureMessage.uploadedDocument(`${result.document} of ${profile.relationship}`),
            });
            break;
          } else {
            logger.info(`All required documents of ${profile.relationship} is available`);
          }
        }

        if (members.length === j + 1) {
          const updateRequest = await requestModel.updateRequestStatus({
            request_status, family_id, member_id, request_id, user_id, assigned_to,
          });
          const data = await createNotification({
            request_id,
            request_status,
            notify_to: null,
            notified_by: user_id,
            notification_description: Message.notifications.submit,
            family_id,
            member_id,
          });
          if (updateRequest.rowsAffected[0] > 0) {
            logger.info('Request Status changed');
            logger.info('Request submitted successfully');
            resolve({
              status: true,
              message: Message.Common.SuccessMessage.hrApproval,
            });
          }
        } else {
          logger.info('Status changes Failed');
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Updation('Request'),
          });
        }
      }
    } else if (request_type === requestType.DELETE_MEMBER || request_type === requestType.DELETE_DEPENDANT || request_type === requestType.CHANGE_PLAN) {
      const updateRequest = await requestModel.updateRequestStatus({
        request_status, member_id, request_id, user_id, assigned_to,
      });
      const data = await createNotification({
        request_id,
        request_status,
        notify_to: null,
        notified_by: user_id,
        notification_description: Message.notifications.submit,
        family_id,
        member_id,
      });
      if (updateRequest.rowsAffected[0] > 0) {
        logger.info('Status changes updated');
        resolve({
          status: true,
          message: Message.Common.SuccessMessage.hrApproval,
        });
      } else {
        logger.info('Status changes Failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Updation('Request'),
        });
      }
    }
  });
};

/*----------------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------REJECTED METHOD--------------------------------------------------------*/

// const rejected = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//     members,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     if (request_type === requestType.ADD_DEPENDANT) {
//       const updateRequest = await requestModel.updateRequestStatus({
//         request_status, request_id, user_id,
//       });
//       logger.info('updateRequest--->', updateRequest);
//       const data = await createNotification({
//         request_id,
//         request_status,
//         notify_to: family_id,
//         notified_by: user_id,
//         notification_description: Message.notifications.rejected,
//         family_id,
//         member_id,
//       });
//       if (updateRequest.rowsAffected[0] > 0) {
//         await userProfileModel.deleteRejectedDependant(members);
//         logger.info('Status changes updated');

//         resolve({
//           status: true,
//           message: Message.Common.SuccessMessage.rejected,
//         });
//       } else {
//         logger.info('Status changes Failed');
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Request'),
//         });
//       }
//     } else {
//       const updateRequest = await requestModel.updateRequestStatus({
//         request_status, request_id, user_id,
//       });
//       logger.info('updateRequest--->', updateRequest);
//       const data = await createNotification({
//         request_id,
//         request_status,
//         notify_to: family_id,
//         notified_by: user_id,
//         notification_description: Message.notifications.rejected,
//         family_id,
//         member_id,
//       });
//       if (updateRequest.rowsAffected[0] > 0) {
//         logger.info('Status changes updated');
//         resolve({
//           status: true,
//           message: Message.Common.SuccessMessage.rejected,
//         });
//       } else {
//         logger.info('Status changes Failed');
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Request'),
//         });
//       }
//     }
//   });
// };

const rejected = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
    members,
  } = request;
  return new Promise(async (resolve, reject) => {
    const updateRequest = await requestModel.updateRequestStatus({
      request_status, request_id, user_id,
    });
    logger.info('updateRequest--->', updateRequest);
    const data = await createNotification({
      request_id,
      request_status,
      notify_to: family_id,
      notified_by: user_id,
      notification_description: Message.notifications.rejected,
      family_id,
      member_id,
    });
    if (updateRequest.rowsAffected[0] > 0) {
      logger.info('Status changes updated');
      resolve({
        status: true,
        message: Message.Common.SuccessMessage.rejected,
      });
    } else {
      logger.info('Status changes Failed');
      resolve({
        status: false,
        message: Message.Common.FailureMessage.Updation('Request'),
      });
    }
  });
};
/*----------------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------SWAN APPROVAL METHOD--------------------------------------------------------*/

// const swanApproval = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//     members,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT) {
//       const updateRequest = await requestModel.updateRequestStatus({
//         request_status, request_id, user_id,
//       });
//       const data = await createNotification({
//         request_id,
//         request_status,
//         notify_to: family_id,
//         notified_by: user_id,
//         notification_description: Message.notifications.hrSubmit,
//         family_id,
//         member_id,
//       });

//       if (updateRequest.rowsAffected[0] > 0) {
//         logger.info('Status changes updated');
//         const policies = await addPolicyRecord(members, request_id);
//         resolve({
//           status: true,
//           message: Message.Common.SuccessMessage.swanSubmit,
//         });
//       } else {
//         logger.error('Status changes Failed');
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Request'),
//         });
//       }
//     } else {
//       let updateInsuranceEndDate;
//       if (effective_deletion_date) {
//         updateInsuranceEndDate = await userProfileModel.updateEffectiveDeletionDate(effective_deletion_date, member_id);
//         const updateReq = await requestModel.updateRequest({ effective_date: effective_deletion_date }, request_id);
//       }
//       const updateRequest = await requestModel.updateRequestStatus({
//         request_status, request_id, user_id,
//       });
//       const data = await createNotification({
//         request_id,
//         request_status,
//         notify_to: family_id,
//         notified_by: user_id,
//         notification_description: Message.notifications.hrSubmit,
//         family_id,
//         member_id,
//       });

//       if (updateRequest.rowsAffected[0] > 0) {
//         logger.info('Status changes updated');
//         resolve({
//           status: true,
//           message: Message.Common.SuccessMessage.swanSubmit,
//         });
//       } else {
//         logger.error('Status changes Failed');
//         resolve({
//           status: false,
//           message: Message.Common.FailureMessage.Updation('Request'),
//         });
//       }
//     }
//   });
// };

const swanApproval = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
    members,
  } = request;
  return new Promise(async (resolve, reject) => {
    if (request_type === requestType.DELETE_DEPENDANT || request_type === requestType.DELETE_MEMBER) {
      let updateInsuranceEndDate;
      if (effective_deletion_date) {
        updateInsuranceEndDate = await userProfileModel.updateEffectiveDeletionDate(effective_deletion_date, member_id);
      }
      const updateRequest = await requestModel.updateRequestStatus({
        request_status, request_id, user_id,
      });
      const data = await createNotification({
        request_id,
        request_status,
        notify_to: family_id,
        notified_by: user_id,
        notification_description: Message.notifications.hrSubmit,
        family_id,
        member_id,
      });
      if (updateRequest.rowsAffected[0] > 0) {
        logger.info('Status changes updated');
        resolve({
          status: true,
          message: Message.Common.SuccessMessage.swanSubmit,
        });
      } else {
        logger.info('Status changes Failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Updation('Request'),
        });
      }
    } else if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT) {
      const updateRequest = await requestModel.updateRequestStatus({
        request_status, request_id, user_id,
      });
      const data = await createNotification({
        request_id,
        request_status,
        notify_to: family_id,
        notified_by: user_id,
        notification_description: Message.notifications.hrSubmit,
        family_id,
        member_id,
      });
      if (updateRequest.rowsAffected[0] > 0) {
        logger.info('Status changes updated');
        // const policies = await addPolicyRecord(members, request_id);
        resolve({
          status: true,
          message: Message.Common.SuccessMessage.swanSubmit,
        });
      } else {
        logger.info('Status changes Failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Updation('Request'),
        });
      }
    } else {
      const updateRequest = await requestModel.updateRequestStatus({
        request_status, request_id, user_id,
      });
      const data = await createNotification({
        request_id,
        request_status,
        notify_to: family_id,
        notified_by: user_id,
        notification_description: Message.notifications.hrSubmit,
        family_id,
        member_id,
      });
      if (updateRequest.rowsAffected[0] > 0) {
        logger.info('Status changes updated');
        resolve({
          status: true,
          message: Message.Common.SuccessMessage.swanSubmit,
        });
      } else {
        logger.info('Status changes Failed');
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Updation('Request'),
        });
      }
    }
  });
};
/*----------------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------BACK TO HR METHOD--------------------------------------------------------*/

// const backToHr = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     const updateRequest = await requestModel.updateRequestStatus({
//       request_status, request_id, user_id,
//     });
//     const data = await createNotification({
//       request_id,
//       request_status,
//       notify_to: family_id,
//       notified_by: user_id,
//       notification_description: Message.notifications.addInfo,
//       family_id,
//       member_id,
//     });
//     if (updateRequest.rowsAffected[0] > 0) {
//       logger.info('Status changes updated');
//       resolve({
//         status: true,
//         message: Message.Common.SuccessMessage.backHr,
//       });
//     } else {
//       logger.error('Status changes Failed');
//       resolve({
//         status: false,
//         message: Message.Common.FailureMessage.Updation('Request'),
//       });
//     }
//   });
// };

const backToHr = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
  } = request;
  return new Promise(async (resolve, reject) => {
    const updateRequest = await requestModel.updateRequestStatus({
      request_status, request_id, user_id,
    });
    const data = await createNotification({
      request_id,
      request_status,
      notify_to: family_id,
      notified_by: user_id,
      notification_description: Message.notifications.addInfo,
      family_id,
      member_id,
    });
    if (updateRequest.rowsAffected[0] > 0) {
      logger.info('Status changes updated');
      resolve({
        status: true,
        message: Message.Common.SuccessMessage.backHr,
      });
    } else {
      logger.info('Status changes Failed');
      resolve({
        status: false,
        message: Message.Common.FailureMessage.Updation('Request'),
      });
    }
  });
};

/*----------------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------BACK TO EMPLOYEE METHOD--------------------------------------------------------*/

// const backToEmployee = async (request) => {
//   const {
//     request_status,
//     family_id,
//     member_id,
//     request_id,
//     request_type,
//     effective_deletion_date,
//     user_id,
//     assigned_to,
//   } = request;
//   return new Promise(async (resolve, reject) => {
//     const updateRequest = await requestModel.updateRequestStatus({
//       request_status, request_id, user_id, assigned_to: family_id,
//     });
//     const data = await createNotification({
//       request_id,
//       request_status,
//       notify_to: family_id,
//       notified_by: user_id,
//       notification_description: Message.notifications.addInfo,
//       family_id,
//       member_id,
//     });
//     if (updateRequest.rowsAffected[0] > 0) {
//       logger.info('Status changes updated');
//       resolve({
//         status: true,
//         message: Message.Common.SuccessMessage.backEmployee,
//       });
//     } else {
//       logger.error('Status changes Failed');
//       resolve({
//         status: false,
//         message: Message.Common.FailureMessage.Updation('Request'),
//       });
//     }
//   });
// };

const backToEmployee = async (request) => {
  const {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
  } = request;
  return new Promise(async (resolve, reject) => {
    const updateRequest = await requestModel.updateRequestStatus({
      request_status, request_id, user_id, assigned_to: family_id,
    });
    const data = await createNotification({
      request_id,
      request_status,
      notify_to: family_id,
      notified_by: user_id,
      notification_description: Message.notifications.addInfo,
      family_id,
      member_id,
    });
    if (updateRequest.rowsAffected[0] > 0) {
      logger.info('Status changes updated');
      resolve({
        status: true,
        message: Message.Common.SuccessMessage.backEmployee,
      });
    } else {
      logger.info('Status changes Failed');
      resolve({
        status: false,
        message: Message.Common.FailureMessage.Updation('Request'),
      });
    }
  });
};
/*----------------------------------------------------------------------------------------------------------------------------*/

/*---------------------------------------GENERAL REQUEST STATUS METHOD--------------------------------------------------------*/

const RequestStatus = async (request) => {
  let {
    request_status,
    family_id,
    member_id,
    request_id,
    request_type,
    effective_deletion_date,
    user_id,
    assigned_to,
    role,
  } = request;
  return new Promise(async (resolve, reject) => {
    if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE) {
      assigned_to = user_id;
    }
    if (effective_deletion_date) {
      // const updateInsuranceEndDate = await insuranceModel.updateEndInsuranceDate({ member_id, effective_deletion_date });
      const updateReq = await requestModel.updateRequest({ effective_date: effective_deletion_date }, request_id);
    }
    const updateRequest = await requestModel.updateRequestStatus({
      request_status, member_id, request_id, user_id, assigned_to,
    });
    const data = await createNotification({
      request_id,
      request_status,
      notify_to: null,
      notified_by: user_id,
      notification_description: Message.notifications.submit,
      family_id,
      member_id,
    });
    if (updateRequest.rowsAffected[0] > 0) {
      logger.info('Status changes updated');
      resolve({
        status: true,
        message: Message.Common.SuccessMessage.Updation('Request'),
      });
    } else {
      logger.error('Status changes Failed');
      resolve({
        status: false,
        message: Message.Common.FailureMessage.Updation('Request'),
      });
    }
  });
};

/*----------------------------------------------------------------------------------------------------------------------------*/

const addRequestsAndForms = async ({
  family_id, profile_id, relationship, plan_cover_id, company_id,
}) => {
  if (company_id === null) {
    company_id = 20124;
  }
  let requests = {
    family_id, profile_id, relationship, policy_details: plan_cover_id, company_id,
  };

  requests.request_status = requestStatus.APPROVED;
  if (relationship === 'PRIMARY') {
    requests.request_type = requestType.ADD_MEMBER;
  } else {
    requests.request_type = requestType.ADD_DEPENDANT;
  }
  const checkRequestType = await requestModel.checkRequestType(requests);
  if (checkRequestType.recordset.length === 0) {
    const type = await requestModel.insertRequests(requests);
    let { request_id } = type.recordset[0];
    // await requestModel.insertFormRequests();
    if (type.recordset.length > 0) {
      const data = await requestModel.insertFormRequests({ request_id, family_id, profile_id });
      if (data.rowsAffected.length > 0) {
        return true;
      }
      return false;
    }
  } else {
    return true;
  }
  return false;
};

const cancelRequest = async (request_id) => new Promise(async (resolve, reject) => {
  let requestDetails = await requestModel.getRequestDetailsById(request_id);
  requestDetails = requestDetails.recordset;
  for (let i = 0; i < requestDetails.length; i++) {
    let { relationship, member_id, family_id } = requestDetails[i];
    if (relationship !== 'PRIMARY') {
      let removeDocumentDetails = await fileService.deleteDocuments(member_id);
      if (removeDocumentDetails === true) {
        let deleteDependant = await userProfileModel.deleteDependantsById(member_id);
        if (deleteDependant.rowsAffected) {
          if (i + 1 === requestDetails.length) {
            resolve({
              status: true,
              message: Message.Common.SuccessMessage.Deletion('Request'),
            });
          }
        } else {
          resolve({
            status: false,
            message: Message.Common.FailureMessage.Deletion('Request'),
          });
          break;
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Deletion('Request'),
        });
        break;
      }
    } else {
      // Primay Member Null Block
      let removeDocumentDetails = await fileService.deleteDocuments(member_id);
      let removeProfiles = await requestModel.removeUserData({ member_id, family_id });
      if (removeDocumentDetails === true) {
        if (i + 1 === requestDetails.length) {
          resolve({
            status: true,
            message: Message.Common.SuccessMessage.Deletion('Request'),
          });
        }
      } else {
        resolve({
          status: false,
          message: Message.Common.FailureMessage.Deletion('Request'),
        });
        break;
      }
    }
  }
});

const fetchRequestType = async (request_id) => {
  const result = await requestModel.getRequest(request_id);
  if (result.recordset.length > 0) {
    const { request_type, family_id, member_id } = result.recordset[0];
    return { request_type, family_id, member_id };
  }

  return false;
};

const getRequestMembers = async (requestId) => {
  const memberList = await requestModel.getMemberList(requestId);
  const members = [];
  if (memberList.recordsets[0].length > 0) {
    for (let i = 0; i < memberList.recordsets[0].length; i++) {
      const member = memberList.recordsets[0];
      members.push(member[i].member_id);
      if (i === memberList.recordsets[0].length - 1) {
        return members;
      }
    }
  } else {
    return members;
  }
};

module.exports = {
  updateRequestStatus,
  getMembersId,
  addRequestHistory,
  getRequestType,
  approved,
  hrApproval,
  rejected,
  swanApproval,
  backToHr,
  backToEmployee,
  RequestStatus,
  addRequestsAndForms,
  cancelRequest,
  fetchRequestType,
  getRequestMembers,
};
