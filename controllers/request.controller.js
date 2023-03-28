/* eslint-disable no-unused-vars */
/* eslint-disable no-loop-func */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const clone = require('clone');
const crypto = require('crypto');
const { request } = require('http');
const moment = require('moment');
const { json } = require('body-parser');
const Response = require('../utils/response');
const { sendMail } = require('../utils/mailer');

const {
  getRequestType, addRequestsAndForms, fetchRequestType, getRequestMembers, 
} = require('../services/request.service');


const { Message } = require('../utils/message');
const logger = require('../utils/winston');
const {
  Role, requestStatus, documentType, requestType, 
} = require('../utils/role');

// Import User Model
const userModel = require('../models/user.model');

// Import User Profile Model
const userProfileModel = require('../models/user-profile.model');

// Import Insurance Model
const insuranceModel = require('../models/insurance.model');

// Import Questionnarie Model
const questionnarieModel = require('../models/questionnarie.model');

// Import Questionnarie Model
const requestService = require('../services/request.service');

// Import Policy Service
const policyService = require('../services/polices.services');


const { getAllProfile } = require('../models/user-profile.model');


// Import Policy Model
const policyModel = require('../models/policies.model');
const requestModel = require('../models/request.model');
const { getCompanyIds } = require('../services/company.services');
const { getAllDocumentTypes, getDocumentRecords } = require('../models/document.model');

// Import Request Service Methods
const { getMembersId, addRequestHistory } = require('../services/request.service');

const { checkDocument } = require('../services/documents.services');
const { createNotification } = require('../services/notification.service');
const { 
  getCountByFamilyId, 
} = require('../models/notification.model');


const createRequest = async (req, res) => {
  try {
    logger.info('Creating request based on request type --->');
    const { role, user_id } = req.user;
    const { request_type, family_id } = req.params;
    console.log('request_type -', request_type, 'family_id -', family_id);
    const checkRequest = await requestModel.checkRequest({ request_type, family_id });
    if (checkRequest.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.pendingRequest,
      );
    } else {
      const addRequest = await requestModel.createRequest(family_id, request_type, user_id);
      console.log(addRequest);
      if (addRequest.returnValue === 0) {
        console.log('addRequest', addRequest);
        let { request_id } = addRequest.output;
        request_id = JSON.parse(request_id);
        const addRecords = await requestModel.addDuplicateRecords(request_id, family_id);
        if (addRecords.returnValue === 0) {
          console.log('addRecords', addRecords);
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessCreationResponse(
            Message.Common.SuccessMessage.Creation('Request'),
            request_id,
          );
        } else {
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Request'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Request'),
        );
      }
    }
  } catch (err) {
    logger.error('Error in Creating a request --->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const changePlan = async (data) => {
  const {
    request_status, family_id, member_id, request_id, request_type, effective_deletion_date, user_id,
  } = data;
  const members = await requestModel.getRequestById(request_id);
  const insuranceDetails = members.recordset;
  for (let j = 0; j < insuranceDetails.length; j++) {
    const result = await policyModel.getPolicyByMember(insuranceDetails[j].member_id);
    const policies = result.recordset[0];
    const {
      rgpa_basic,
      monthly_rgpa_amount,
      top_up_part1,
      monthly_payment_part1,
      top_up_part2,
      monthly_payment_part2,
      FSC_fee,
      monthly_premium,
    } = policies;
    const updateInsurance = await insuranceModel.updateInsurance({
      member_id,
      family_id,
      rgpa_basic,
      monthly_rgpa_amount,
      top_up_part1,
      monthly_payment_part1,
      top_up_part2,
      monthly_payment_part2,
      FSC_fee,
      monthly_premium,  
    });
    if (insuranceDetails.length === j + 1) {
      if (updateInsurance.rowsAffected[0] > 0) {
        const updateRequest = await requestModel.updateRequestStatus({
          request_status, member_id, request_id, user_id,
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
        } else {
          logger.info('Status changes Failed');
        }
      }
    }
  } 
};

const updateRequestStatus = async (req, res) => {
  try {
    logger.info('Update request status --->', req.body);
    const { user_id, role, profileId } = req.user;
    const requests = req.body;
    let assigned_to = null;
    if (requests.length > 0) {
      for (let i = 0; i < requests.length; i++) {
        const {
          request_status, family_id, member_id, request_id, effective_deletion_date,
        } = requests[i];
        // let { request_type } = requests[i];
  
        // let request_type_id;
  
        const request_type = await fetchRequestType(request_id);

        const members = await getRequestMembers(request_id);

  
        if (request_type) {
          if (request_status === requestStatus.APPROVED) {
            if (role === Role.SWAN_ADMIN) {
              await requestService.approved({
                request_status, 
                family_id, 
                member_id, 
                request_id, 
                request_type, 
                effective_deletion_date, 
                user_id, 
                assigned_to,
                members,
              }).then((data) => {
                if (data.status === true) {
                  if (requests.length === i + 1) {
                    logger.info('Status changes updated');
                    new Response(
                      res, 
                      StatusCodes.OK,
                    ).SuccessResponse(
                      data.message,
                    );
                  }
                } else if (data.status === false) {
                  logger.error('Status changes Failed');
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    data.message,
                  );
                }
              }).catch((error) => {
                logger.error('PROMISE CATCH ERR--->', error);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.InternalServerError,
                );
              });
            } else {
              logger.info('Unauthorised to approve the request');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.access,
              );
              break;
            }
          } else if (request_status === requestStatus.HR_APPROVAL) {
            if (role === Role.SUB_HR) {
              assigned_to = user_id;
            }
            await requestService.hrApproval({
              request_status, 
              family_id, 
              member_id, 
              request_id, 
              request_type, 
              effective_deletion_date, 
              user_id, 
              assigned_to,
            }).then((data) => {
              if (data.status === true) {
                if (requests.length === i + 1) {
                  logger.info('Status changes updated');
                  new Response(
                    res, 
                    StatusCodes.OK,
                  ).SuccessResponse(
                    data.message,
                  );
                }
              } else if (data.status === false) {
                logger.info('Status changes Failed');
                new Response(
                  res,
                  StatusCodes.OK,
                ).ErrorMessage(
                  data.message,
                );
              }
            }).catch((error) => {
              logger.error('PROMISE CATCH ERR--->', error);
              new Response(
                res,
                StatusCodes.BAD_REQUEST,
              ).ErrorMessage(
                Message.Common.FailureMessage.InternalServerError,
              );
            });
          } else if (request_status === requestStatus.REJECTED) {
            if (role === Role.SWAN_ADMIN || role === Role.SUB_HR) {
              await requestService.rejected({
                request_status, 
                family_id, 
                member_id, 
                request_id, 
                request_type, 
                effective_deletion_date, 
                user_id, 
                assigned_to,
                members,
              }).then((data) => {
                if (data.status === true) {
                  if (requests.length === i + 1) {
                    logger.info('Status changes updated');
                    new Response(
                      res, 
                      StatusCodes.OK,
                    ).SuccessResponse(
                      data.message,
                    );
                  }
                } else if (data.status === false) {
                  logger.error('Status changes Failed');
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    data.message,
                  );
                }
              }).catch((error) => {
                logger.error('PROMISE CATCH ERR--->', error);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.InternalServerError,
                );
              });
            } else {
              logger.info('Unauthorised to approve the request');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.access,
              );
              break;
            }
          } else if (request_status === requestStatus.SWAN_APPROVAL) {
            if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE || role === Role.EMPLOYEE) {
              if (request_type === requestType.DELETE_DEPENDANT || request_type === requestType.DELETE_MEMBER) {
                const { request_reason } = requests[i];
                await requestService.swanApproval({
                  request_status, 
                  family_id, 
                  member_id, 
                  request_id, 
                  request_type, 
                  effective_deletion_date, 
                  user_id, 
                  assigned_to,
                }).then(async (data) => {
                  if (data.status === true) {
                    if (request_reason) {
                      const requestReasonUpdate = await requestModel.updateRequest({ request_reason }, request_id);
                      if (requestReasonUpdate.rowsAffected[0] > 0) {
                        if (requests.length === i + 1) {
                          logger.info('Status changes updated');
                          new Response(
                            res, 
                            StatusCodes.OK,
                          ).SuccessResponse(
                            data.message,
                          );
                        }
                      } else {
                        logger.error('Request reason updation failed');
                        new Response(
                          res,
                          StatusCodes.OK,
                        ).ErrorMessage(
                          data.message,
                        );
                      }
                    } else if (requests.length === i + 1) {
                      logger.info('Status changes updated');
                      new Response(
                        res, 
                        StatusCodes.OK,
                      ).SuccessResponse(
                        data.message,
                      );
                    }
                  } else if (data.status === false) {
                    logger.info('Status changes Failed');
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      data.message,
                    );
                  }
                }).catch((error) => {
                  logger.error('PROMISE CATCH ERR--->', error);
                  new Response(
                    res,
                    StatusCodes.BAD_REQUEST,
                  ).ErrorMessage(
                    Message.Common.FailureMessage.InternalServerError,
                  );
                });
              } else {
                await requestService.swanApproval({
                  request_status, 
                  family_id, 
                  member_id, 
                  request_id, 
                  request_type, 
                  effective_deletion_date, 
                  user_id, 
                  assigned_to,
                  members,
                }).then((data) => {
                  if (data.status === true) {
                    if (requests.length === i + 1) {
                      logger.info('Status changes updated');
                      new Response(
                        res, 
                        StatusCodes.OK,
                      ).SuccessResponse(
                        data.message,
                      );
                    }
                  } else if (data.status === false) {
                    logger.error('Status changes Failed');
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      data.message,
                    );
                  }
                }).catch((error) => {
                  logger.error('PROMISE CATCH ERR--->', error);
                  new Response(
                    res,
                    StatusCodes.BAD_REQUEST,
                  ).ErrorMessage(
                    Message.Common.FailureMessage.InternalServerError,
                  );
                });
              }
            } else {
              logger.info('Unauthorised to approve the request');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.access,
              );
              break;
            }
          } else if (request_status === requestStatus.BACK_TO_HR) {
            if (role === Role.SWAN_ADMIN) {
              await requestService.backToHr({
                request_status, 
                family_id, 
                member_id, 
                request_id, 
                request_type, 
                effective_deletion_date, 
                user_id, 
                assigned_to,
              }).then((data) => {
                if (data.status === true) {
                  if (requests.length === i + 1) {
                    logger.info('Status changes updated');
                    new Response(
                      res, 
                      StatusCodes.OK,
                    ).SuccessResponse(
                      data.message,
                    );
                  }
                } else if (data.status === false) {
                  logger.error('Status changes Failed');
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    data.message,
                  );
                }
              }).catch((error) => {
                logger.error('PROMISE CATCH ERR--->', error);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.InternalServerError,
                );
              });
            } else {
              logger.info('Unauthorised to approve the request');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.access,
              );
              break;
            }
          } else if (request_status === requestStatus.BACK_TO_EMPLOYEE) {
            if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE || role === Role.SWAN_ADMIN) {
              await requestService.backToEmployee({
                request_status, 
                family_id, 
                member_id, 
                request_id, 
                request_type, 
                effective_deletion_date, 
                user_id, 
                assigned_to,
              }).then((data) => {
                if (data.status === true) {
                  if (requests.length === i + 1) {
                    logger.info('Status changes updated');
                    new Response(
                      res, 
                      StatusCodes.OK,
                    ).SuccessResponse(
                      data.message,
                    );
                  }
                } else if (data.status === false) {
                  logger.error('Status changes Failed');
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    data.message,
                  );
                }
              }).catch((error) => {
                logger.error('PROMISE CATCH ERR--->', error);
                new Response(
                  res,
                  StatusCodes.BAD_REQUEST,
                ).ErrorMessage(
                  Message.Common.FailureMessage.InternalServerError,
                );
              });
            } else {
              logger.info('Unauthorised to approve the request');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.access,
              );
              break;
            }
          } else {
            await requestService.RequestStatus({
              request_status, 
              family_id, 
              member_id, 
              request_id, 
              request_type, 
              effective_deletion_date, 
              user_id, 
              assigned_to,
              role,
            }).then((data) => {
              if (data.status === true) {
                if (requests.length === i + 1) {
                  logger.info('Status changes updated');
                  new Response(
                    res, 
                    StatusCodes.OK,
                  ).SuccessResponse(
                    data.message,
                  );
                }
              } else if (data.status === false) {
                logger.error('Status changes Failed');
                new Response(
                  res,
                  StatusCodes.OK,
                ).ErrorMessage(
                  data.message,
                );
              }
            }).catch((error) => {
              logger.error('PROMISE CATCH ERR--->', error);
              new Response(
                res,
                StatusCodes.BAD_REQUEST,
              ).ErrorMessage(
                Message.Common.FailureMessage.InternalServerError,
              );
            });
          }
        } else {
          logger.error('Request Id is not valid--->');
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.requestId,
          );
        }
      }
    } else {
      logger.error('Its an empty array or not an array--->');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Empty,
      );
    }
  } catch (err) {
    logger.error('Update request status --->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// eslint-disable-next-line consistent-return
const requestInfo = async (req, res) => {
  try {
    logger.info('fetching request information based on request status --->');
    const { status } = req.params;
    const { role, user_id } = req.user;
    let {
      search, page_no, page_count, company_branch_id, 
    } = req.query;

    if (page_count) {
      page_count = req.query.page_count;
    }
    if (page_no) {
      page_no = page_no * page_count - page_count;
    }

    if (role === Role.SWAN_ADMIN) {
      const Get_HR_Approv = await requestModel.reqUserInfo({
        status, page_count, page_no, search, company_branch_id,
      }, role);
      const requestDetails = Get_HR_Approv.recordsets[0];
      if (Get_HR_Approv.recordsets[0].length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          requestDetails,
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          requestDetails,
        );
      }
    } else if (role === Role.GROUP_HR) {
      const Get_HR_Approv = await requestModel.reqUserInfo({
        status, page_count, page_no, search,
      }, role);
      const requestDetails = Get_HR_Approv.recordsets[0];
      if (Get_HR_Approv.recordsets[0].length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          requestDetails,
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          requestDetails,
        );
      }
    } else if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE) {
      if (!company_branch_id) {
        company_branch_id = await getCompanyIds(user_id);
      }
      
      if (company_branch_id.length > 0) {
        const result = await requestModel.reqUserInfo({
          status, page_count, page_no, company_branch_id, search,
        }, role);
        const requestDetails = result.recordsets[0];
        if (result.recordsets[0].length > 0) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Request Info'),
            requestDetails,
          );
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Request Info'),
            requestDetails,
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.NoDataFound('Request Info'),
        );
      }
    } else {
      const result = await requestModel.reqUserInfo({
        status, page_count, page_no, user_id, search,
      });
      const requestDetails = result.recordsets[0];
      if (result.recordsets[0].length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          requestDetails,
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          result.recordsets[0],
        );
      }
    }
  } catch (err) {
    logger.error('Error in getting request info--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

// eslint-disable-next-line consistent-return
const familyRequest = async (req, res) => {
  try {
    logger.info('Fetching family request --->');
    const { family_id } = req.params;
    const { role, user_id } = req.user;
    const result = await requestModel.requestsByUser(family_id);
    const data = result.recordset;
    for (let i = 0; i < data.length; i++) {
      if (data[i].request_type_id === requestType.CHANGE_PLAN) {
        const updatePolicy = await policyService.getpolicyByRequestId(data[i].request_id);
        data[i].questionnary = updatePolicy.top_up2;
      }
    }

    if (result.recordsets[0].length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Info'),
        data,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Info'),
        result.recordsets[0],
      );
    }
  } catch (err) {
    logger.error('Error in getting request info--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getRequestStatuses = async (req, res) => {
  try {
    const status = await requestModel.getStatus();
    if (status.recordsets.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Status'),
        status.recordsets[0],
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Request Info'),
        Message.Common.FailureMessage.Fetch('Request Status'),
      );
    }
  } catch (err) {
    logger.error(' getting request Status--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const generateRoles = async (role) => {
  const roles = [];
  const obj = {};
  role.map((data) => {
    obj[data.role_type] = data.role_id;
  });
  roles.push(obj);
  return roles;
};

const generateStatuses = async (status) => {
  const statuses = [];
  const obj = {};
  status.map((data) => {
    obj[data.request_status] = data.request_status_id;
  });
  statuses.push(obj);
  return statuses;
};

const generatedocumentTypes = async (types) => {
  const documents = [];
  const obj = {};
  types.map((data) => {
    obj[data.document_type] = data.document_type_id;
  });
  documents.push(obj);
  return documents;
};

const generateRequestTypes = async (types) => {
  const documents = [];
  const obj = {};
  types.map((data) => {
    obj[data.request_type] = data.request_type_id;
  });
  documents.push(obj);
  return documents;
};

const getRequestCount = async (req, res) => {
  try {
    logger.info('request count');
    const { role, user_id } = req.user;
    // const roles = await userModel.getRoles();
    // const requestStatuses = await requestModel.getStatus();
    // const documentType = await getAllDocumentTypes();

    // const roleObj = await generateRoles(roles.recordsets[0]);
    // const statusObj = await generateStatuses(requestStatuses.recordsets[0]);
    // const docs = await generatedocumentTypes(documentType.recordsets[0]);
    // // roleObj.map((obs) => {
    // });

    if (role === Role.GROUP_HR || role === Role.SWAN_ADMIN) {
      const ReqCount = await requestModel.reqCount(user_id);
      if (ReqCount.recordsets.length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          ReqCount.recordsets[0],
        );
      } else {
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Fetch('Request Info'),
        );
      }
    } else if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE) {
      const company_branch_id = await getCompanyIds(user_id);

      if (company_branch_id.length > 0) {
        const result = await requestModel.reqCountByCompany(company_branch_id, user_id);
        if (result.recordsets[0].length > 0) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Request Info'),
            result.recordsets[0],
          );
        } else {
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.Fetch('Request Info'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.NoDataFound('Request Info'),
        );
      }
    } else {
      // const company_branch_id = await getCompanyIds(user_id);
      // if (company_branch_id.length > 0) {
      const result = await requestModel.reqCountByUser(
        user_id,
      );
      if (result.recordsets[0].length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Request Info'),
          result.recordsets[0],
        );
      } else {
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Fetch('Request Info'),
        );
      }
      // } else {
      //   new Response(
      //     res,
      //     StatusCodes.BAD_REQUEST,
      //   ).ErrorMessage(
      //     Message.Common.FailureMessage.NoDataFound('Request Info'),
      //   );
      // }
    }
  } catch (err) {
    logger.error(' getting request count--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const masterData = async (req, res) => {
  try {
    const allTypes = await userModel.getAllTypes();
    for (let i = 0; i < allTypes.recordsets[3].length; i++) {
      allTypes.recordsets[3][i].request_type = allTypes.recordsets[3][i].request_type.replaceAll(' ', '_');
      if (i === allTypes.recordsets[3].length - 1) {
        const roleObj = await generateRoles(allTypes.recordsets[0]);
        const statusObj = await generateStatuses(allTypes.recordsets[1]);
        const docs = await generatedocumentTypes(allTypes.recordsets[2]);
        const reqTypes = await generateRequestTypes(allTypes.recordsets[3]);
        if (allTypes.recordsets.length > 0) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponseData(
            Message.Common.SuccessMessage.Fetch('Role & Types'),
            roleObj,
            statusObj,
            docs,
            reqTypes,
          );
        } else {
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.Fetch('Role & Types'),
          );
        }
      }
    }
  } catch (err) {
    logger.error(' getting request Status--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const assignRequest = async (req, res) => {
  try {
    logger.info('updating assignee', req.params);
    let {
      assigned_to,
    } = req.params;
    const { user_id } = req.user;
    const userRequest = req.body;
    assigned_to = JSON.parse(assigned_to);
    const request = {
      assigned_to,
    };
    for (let i = 0; i < userRequest.length; i++) {
      const {
        request_id,
      } = userRequest[i];
      const assigned = await requestModel.updateRequest(request, request_id);
      const requestDetails = await requestModel.getRequest(request_id);
      const { request_status, family_id, member_id } = requestDetails.recordset[0];
      const assignDetails = {    
        request_id,
        request_status,
        assigner: user_id,
        assigned_to,
      };
      const assignHistory = await requestModel.insertAssignHistory(assignDetails);
      const data = await createNotification({
        request_id,
        request_status,
        notify_to: assigned_to,
        notified_by: user_id,
        notification_description: Message.notifications.assisgned,
        family_id,
        member_id,
      });
      if (assigned.rowsAffected[0] > 0 && assignHistory.rowsAffected[0] > 0) {
        if (i === userRequest.length - 1) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Updation('Assigned Status'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('Assigned Status'),
        );
        break;
      }
    }
  } catch (err) {
    logger.error('Assigned request--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteDependantRequest = async (req, res) => {
  let request_id;
  try {
    const {
      user_id,
      role,
    } = req.user;
    const { family_id, request_type } = req.body[0];
    const request_type_id = await getRequestType(request_type);
    const request_createdby = user_id;
    let request_status;
    // if (role === Role.EMPLOYEE) {
    //   request_status = requestStatus.HR_APPROVAL;
    // } else {
    //   request_status = requestStatus.SWAN_APPROVAL;
    // }
    let company_id;
    let member_id;
    const company = await userModel.getUserCompany(family_id);
    if (company.recordset.length > 0) {
      company_id = company.recordset[0].company_id;
      const userDetails = await userProfileModel.getPrimaryUser(family_id);
      if (userDetails.recordset.length > 0) {
        member_id = userDetails.recordset[0].profile_id;
        if (request_type === 'DELETE DEPENDANT') {
          if (role === Role.EMPLOYEE) {
            request_status = requestStatus.HR_APPROVAL;
          } else {
            request_status = requestStatus.SWAN_APPROVAL;
          }
          const dependants = req.body;
          // const request_type = 'DELETE DEPENDANT';
          const {
            request_reason, effective_deletion_date, request_type,
          } = dependants[0];
          let { request_id } = dependants[0];
          if (request_id) {
            const updateRequest = await requestModel.updateRequest({ request_reason, effective_date: effective_deletion_date }, request_id);
          } else {
            const memberDetails = {
              family_id,
              member_id,
              request_status,
              request_type: request_type_id,
              request_createdby,
              company_id,
              request_reason,
              effective_date: effective_deletion_date,
            };
            const insertRequest = await requestModel.createDeleteMemberRequest(memberDetails);
            if (insertRequest.recordset[0].request_id) {
              let updateInsuranceEndDate;
              if (effective_deletion_date) {
                let memberId = '';
                for (let i = 0; i < dependants.length; i++) {
                  memberId += dependants[i].member_id;
                  if (i !== dependants.length - 1) {
                    memberId += ',';
                  }
                }
                updateInsuranceEndDate = await userProfileModel.updateEffectiveDeletionDate(effective_deletion_date, memberId);
              }
              if ((effective_deletion_date && updateInsuranceEndDate.rowsAffected[0] > 0) || insertRequest.recordset[0].request_id) {
                request_id = insertRequest.recordset[0].request_id;
                for (let i = 0; i < dependants.length; i++) {
                  const {
                    family_id,
                    member_id,
                  } = dependants[i];
                  const insertRequestForm = await requestModel.createRequestForm({ family_id, member_id, request_id });
                  if (insertRequestForm.rowsAffected[0] > 0) {
                    if (i === dependants.length - 1) {
                      new Response(
                        res,
                        StatusCodes.OK,
                      ).SuccessResponse(
                        Message.Common.SuccessMessage.Creation('Delete Dependant Request'),
                        { request_id },
                      );
                    }
                  } else {
                    const deleteRequest = await requestModel.deleteRequestById(request_id);
                    if (deleteRequest.rowsAffected[0] > 0) {
                      new Response(
                        res,
                        StatusCodes.OK,
                      ).ErrorMessage(
                        Message.Common.FailureMessage.Creation('Request Forms'),
                      );
                      break;
                    }
                  }
                }
              } else {
                new Response(
                  res,
                  StatusCodes.OK,
                ).ErrorMessage(
                  Message.Common.FailureMessage.Updation('Effective Deletion Date'),
                );
              }
            } else {
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.Creation('Request'),
              );
            }
          }
        } else if (request_type === 'CHANGE PLAN') {
          request_status = requestStatus.PENDING;
          const changePlan = req.body;
          const verification = await policyService.verifyChangePlan(changePlan);    
          if (verification.rgpa === true || verification.top_up1 === true || verification.top_up2 === true) {
            const {
              family_id, request_type, 
            } = changePlan[0];
            let { effective_date } = changePlan[0];
            if (!effective_date) {
              effective_date = moment(new Date()).endOf('month').format('YYYY/MM/DD');
            }
            const memberDetails = {
              family_id,
              member_id,
              request_createdby,
              request_status,
              request_type: request_type_id,
              company_id,
              effective_date,
            };
            const insertPlanRequest = await requestModel.createDeleteMemberRequest(memberDetails);
            if (insertPlanRequest.recordset[0].request_id) {
              const { request_id } = insertPlanRequest.recordset[0];
              for (let i = 0; i < changePlan.length; i++) {
                const {
                  family_id,
                  member_id,
                  rgpa_basic,
                  monthly_rgpa_amount,
                  top_up_part1,
                  monthly_payment_part1,
                  top_up_part2,
                  monthly_payment_part2,
                } = changePlan[i];
                changePlan[i] = JSON.parse(JSON.stringify(changePlan[i]));
                const insertRequestForm = await requestModel.createRequestForm({ family_id, member_id, request_id });
                if (insertRequestForm.rowsAffected[0] > 0) {
                // const updateUserPolicy = await policyModel.updateChangePlan({ /* rgpa_basic, */ top_up_part1, top_up_part2 }, member_id);

                  const fscPremium = await policyService.calculateFscMonthlyPremium({
                    monthly_rgpa_amount,
                    monthly_payment_part1,
                    monthly_payment_part2,
                  });

                  const [FSC_fee, monthly_premium] = [fscPremium.FSC_fee, fscPremium.monthly_premium];

                  const addPolicyRecords = await policyModel.insertPolicyRecordDetails({
                    request_id,
                    family_id,
                    member_id,
                    rgpa_basic,
                    monthly_rgpa_amount,
                    top_up_part1,
                    monthly_payment_part1,
                    top_up_part2,
                    monthly_payment_part2,
                    FSC_fee,
                    monthly_premium,
                  });

                  if (addPolicyRecords.rowsAffected[0] > 0) {
                    if (i === changePlan.length - 1) {
                      new Response(
                        res,
                        StatusCodes.OK,
                      ).SuccessResponse(
                        Message.Common.SuccessMessage.Creation('Change Plan Request Forms and Policies'),
                        { request_id, questionnary: verification.top_up2 },
                      );
                    }
                  } else {
                    logger.error('Error in adding policy to record form');
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      Message.Common.FailureMessage.Creation('Insert Policy Record'),
                    );
                    break;
                  }
                } else {
                  logger.error('Error in adding request form');
                  const deleteRequest = await requestModel.deleteRequestById(request_id);
                  if (deleteRequest.rowsAffected[0] > 0) {
                    new Response(
                      res,
                      StatusCodes.OK,
                    ).ErrorMessage(
                      Message.Common.FailureMessage.Creation('Change Plan Request Forms'),
                    );
                    break;
                  }
                }
              }
            } else {
              logger.error('Request creation failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                Message.Common.FailureMessage.Creation('Change Plan Request'),
              );
            }
          } else {
            logger.error('No changes made for change plan', verification);
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessageWithData(
              Message.Common.FailureMessage.noChanges,
              { questionnary: verification.top_up2 },
            );
          }
          // 
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Fetch('Member Details'),
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Company'),
      );
    }
  } catch (err) {
    logger.error('Delete dependant request', err.stack);
    if (request_id) {
      const deleteRequest = await requestModel.deleteRequestById(request_id);
      if (deleteRequest.rowsAffected[0] > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Request Id reverted'),
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.InternalServerError,
      );
    }
  }
};

const deleteMemberRequest = async (req, res) => {
  let request_id;
  try {
    const {
      family_id,
      member_id,
      request_type,
      request_reason,
      effective_deletion_date,
    } = req.body;

    const request_type_id = await getRequestType(request_type);

    
    const {
      user_id,
      role,
    } = req.user;
    if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE || role === Role.GROUP_HR) {
      // let assigned_to = user_id;
      const request_createdby = user_id;
      const request_status = requestStatus.SWAN_APPROVAL;
      let company_id;
      const company = await userModel.getUserCompany(family_id);
      if (company.recordset.length > 0) {
        company_id = company.recordset[0].company_id;
        const memberDetails = {
          family_id,
          member_id,
          request_status,
          request_type: request_type_id,
          request_createdby,
          company_id,
          request_reason,
          effective_date: effective_deletion_date,
          // assigned_to
        };
        const insertRequest = await requestModel.createDeleteMemberRequest(memberDetails);
        if (insertRequest.recordset[0].request_id) {
          request_id = insertRequest.recordset[0].request_id;
          let members = await userProfileModel.getAllFamilyMembers(family_id);
          members = members.recordset;
          if (members.length > 0) {
            for (let i = 0; i < members.length; i++) {
              const { profile_id } = members[i];
              const insertRequestForm = await requestModel.createRequestForm({ family_id, member_id: profile_id, request_id });
              const updateInsuranceEndDate = await userProfileModel.updateEffectiveDeletionDate(effective_deletion_date, profile_id);
              if (updateInsuranceEndDate.rowsAffected[0] > 0 && insertRequestForm.rowsAffected[0] > 0) {
                if (i === members.length - 1) {
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).SuccessResponse(
                    Message.Common.SuccessMessage.Creation('Delete Member Request'),
                    { request_id },
                  );
                }
              } else {
                new Response(
                  res,
                  StatusCodes.OK,
                ).ErrorMessage(
                  Message.Common.FailureMessage.Updation('Effective Deletion Date'),
                );
                return false;
              }
            }
          }
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Request'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Fetch('Company'),
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Unauthorized,
      );
    }
  } catch (err) {
    logger.error('delete Member Request ', err);
    if (request_id) {
      const deleteRequest = await requestModel.deleteRequestById(request_id);
      if (deleteRequest.rowsAffected[0] > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Request Id reverted'),
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.InternalServerError,
      );
    }
  }
};

const getRequest = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const request = await requestModel.getRequestById(request_id);
    if (request.recordset.length) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Details'),
        request.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Request Details'),
      );
    }
  } catch (err) {
    logger.error('get request--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};



const getDependant = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const request = await requestModel.getDepandantsByRequest(request_id);
    if (request.recordset.length) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Details'),
        request.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Request Details'),
      );
    }
  } catch (err) {
    logger.error('get request--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateRequest = async (req, res) => {
  try {
    const {
      request_id,
      request_type,
      effective_deletion_date,
    } = req.query;

    const members = req.body;

    let updateRequest;
    let deleteRequestForms;
    let updateInsuranceEndDate;

    const {
      role,
    } = req.user;

    let request_status;
    if (role === Role.EMPLOYEE) {
      request_status = requestStatus.HR_APPROVAL;
    } else {
      request_status = requestStatus.SWAN_APPROVAL;
    }

    if (request_type) {
      const request_type_id = await getRequestType(request_type);

      updateRequest = await requestModel.updateRequest({ request_type: request_type_id, request_status }, request_id);
    }
    if ((request_type && updateRequest.rowsAffected[0] > 0 && members.length > 0) || members.length > 0) {
      deleteRequestForms = await requestModel.deleteRequestForm(request_id);
      if (deleteRequestForms.rowsAffected[0] > 0) {
        for (let i = 0; i < members.length; i++) {
          const {
            family_id,
            member_id,
          } = members[i];
          const insertRequestForm = await requestModel.createRequestForm({ family_id, member_id, request_id });
          if (insertRequestForm.rowsAffected[0] > 0) {
            if (i === members.length - 1) {
              if (effective_deletion_date) {
                let memberId = '';
                for (let i = 0; i < members.length; i++) {
                  memberId += members[i].member_id;
                  if (i !== members.length - 1) {
                    memberId += ',';
                  }
                }
                updateInsuranceEndDate = await insuranceModel.updateEndInsuranceDate({ member_id: memberId, effective_deletion_date });
                if (updateInsuranceEndDate.rowsAffected[0] > 0) {
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).SuccessResponse(
                    Message.Common.SuccessMessage.Updation('Request'),
                  );
                } else {
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    Message.Common.FailureMessage.Updation('Request'),
                  );
                }
              }
            }
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Request Forms'),
            );
            break;
          }
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Deletion('Old Request Forms'),
        );
      }
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('Request'),
      );
    }
  } catch (err) {
    logger.error('update request--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getRequestAssignHistory = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const assignDetails = await requestModel.getAssignHistoryById(request_id);
    if (assignDetails.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Assign History'),
        assignDetails.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Request Assign History'),
      );
    }
  } catch (err) {
    logger.error('Get Request Assign History--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};


const uploadRequestDeatils = async (req, res) => {
  try {
    const profileDetails = await getAllProfile();
    const profiles = profileDetails.recordset;
    for (let i = 0; i < profiles.length; i++) {
      const {
        family_id, profile_id, relationship, plan_cover_id, company_id,
      } = profiles[i];
      const result = await addRequestsAndForms({
        family_id, profile_id, relationship, plan_cover_id, company_id, 
      });
      if (result) {
        if (i === profiles.length - 1) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Creation('Requests'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Requests'),
        );
        break;
      }
    }
  } catch (err) {
    logger.error('Get Request Assign History--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};



const cancelRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const data = await requestModel.getRequest(request_id);
    const request = data.recordset[0];
    if (request.request_status === requestStatus.PENDING) {
      if (request.request_type === requestType.ADD_MEMBER || request.request_type === requestType.ADD_DEPENDANT) {
        const requestCancel = await requestService.cancelRequest(request.request_id);
        if (requestCancel.status === true) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            requestCancel.message,
          );
        } else if (requestCancel.status === false) {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            requestCancel.message,
          );
        }
      }
    } else {
      logger.error('Request status is not pending to be cancelled--->');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.cancelRequest,
      );
    }
  } catch (err) {
    logger.error('Error in cancelling the request--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};



const getProfile = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const request = await requestModel.getProfileRecordByRequest(request_id);
    if (request.recordset.length > 0) {
      const { member_id } = request.recordset[0];
      const types = documentType.PRIMARY;
      types.push(documentType.NATIONAL_IDENTITY_CARD, documentType.PASSPORT);
      const documents = await getDocumentRecords({ request_id, member_id, types });
      request.recordset[0].documents = documents.recordset;
      logger.info('Profile record is fetched succesfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Request Profile'),
        request.recordset,
      );
    } else {
      logger.error('Profile record is empty for the request id--->');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Request Profile'),
      );
    }
  } catch (err) {
    logger.error('get request profile--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};


const getDependantsByRequestId = async (req, res) => {
  try {
    logger.info('Fetching depandants by request id');
    const {
      request_id,
    } = req.params;
    const request = await requestModel.getDependantRecordByRequest(request_id);
    if (request.recordset.length > 0) {
      for (let i = 0; i < request.recordset.length; i++) {
        const { member_id } = request.recordset[i];
        const documents = await getDocumentRecords({ request_id, member_id });
        request.recordset[i].documents = documents.recordset;
        if (i === request.recordset.length - 1) {
          logger.info('Depandants record details fetched successfully by request id');
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Depandant Details'),
            request.recordset,
          );
        }
      }
    } else {
      logger.error('No Dependants available');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Depandant Details'),
        request.recordset,
      );
    }
  } catch (err) {
    logger.error('fetching dependant records --->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};


const getPolicyByRequestId = async (req, res) => {
  try {
    logger.info('Fetching policy record by request id');
    const {
      request_id,
    } = req.params;
    const request = await requestModel.getPolicyRecordByRequest(request_id);
    if (request.recordset.length) {
      logger.info('policy record details fetched successfully by request id');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Policy plan details'),
        request.recordset,
      );
    } else {
      logger.error('No policy details available');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Policy plan details'),
      );
    }
  } catch (err) {
    logger.error('fetching policy records --->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getAnswerRecords = async (req, res) => {
  try {
    const {
      request_id,
    } = req.params;
    const answers = await requestModel.getAnswerRecordsByRequestId(request_id);
    if (answers.recordset.length > 0) {
      logger.info('fetching answers Sucessfully', answers.recordset);
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Health report'),
        answers.recordset,
      );
    } else {
      logger.info('No Answers added empty array received');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.FailureMessage.NoDataFound('Health report'),
      );
    }
  } catch (err) {
    logger.error('fetching answer records --->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const changeRequestStatus = async (req, res) => {
  try {
    logger.info('Update request status --->', req.body);
    const { user_id, role, profileId } = req.user;
    const requests = req.body;
    const assigned_to = null;
    const { request_id } = req.params;
    // for (let i = 0; i < requests.length; i++) {
    const {
      request_status, effective_deletion_date, request_reason,
    } = requests;
    const { request_type, family_id, member_id } = await fetchRequestType(request_id);

    const members = await getRequestMembers(request_id);
    console.log('membersssss', members);
    if (request_type && members.length > 0) {
      if (request_status === requestStatus.APPROVED) {
        if (role === Role.SWAN_ADMIN) {
          await requestService.approved({
            request_status, 
            family_id, 
            member_id, 
            request_id, 
            request_type, 
            user_id, 
            assigned_to,
            members,
          }).then((data) => {
            if (data.status === true) {
              logger.info('Status changes updated');
              new Response(
                res, 
                StatusCodes.OK,
              ).SuccessResponse(
                data.message,
              );
            } else if (data.status === false) {
              logger.info('Status changes Failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                data.message,
              );
            }
          }).catch((error) => {
            logger.error('Error while approving Request--->', error);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.InternalServerError,
            );
          });
        } else {
          logger.info('Unauthorised to approve the request');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.access,
          );
        }
      } else if (request_status === requestStatus.HR_APPROVAL) {
        await requestService.hrApproval({
          request_status, 
          family_id, 
          member_id, 
          request_id, 
          request_type, 
          effective_deletion_date, 
          user_id, 
          assigned_to,
          members,
        }).then((data) => {
          if (data.status === true) {
            logger.info('Status changes updated');
            new Response(
              res, 
              StatusCodes.OK,
            ).SuccessResponse(
              data.message,
            );
          } else if (data.status === false) {
            logger.info('HR Approval Status changes Failed ');
            console.log(data.message);
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              data.message,
            );
          }
        }).catch((error) => {
          logger.error('Error while submitting the request to hr--->', error);
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.InternalServerError,
          );
        });
      } else if (request_status === requestStatus.REJECTED) {
        if (role === Role.SWAN_ADMIN) {
          await requestService.rejected({
            request_status, 
            family_id, 
            member_id, 
            request_id, 
            request_type, 
            effective_deletion_date, 
            user_id, 
            assigned_to,
            members,
          }).then((data) => {
            if (data.status === true) {
              logger.info('Status changes updated');
              new Response(
                res, 
                StatusCodes.OK,
              ).SuccessResponse(
                data.message,
              );
            } else if (data.status === false) {
              logger.info('Status changes Failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                data.message,
              );
            }
          }).catch((error) => {
            logger.error('Error in rejecting the request-->', error);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.InternalServerError,
            );
          });
        } else {
          logger.info('Unauthorised to approve the request');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.access,
          );
        }
      } else if (request_status === requestStatus.SWAN_APPROVAL) {
        if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE || role === Role.EMPLOYEE) {
          // if (request_type === requestType.DELETE_DEPENDANT || request_type === requestType.DELETE_MEMBER) {
          await requestService.swanApproval({
            request_status, 
            family_id, 
            member_id, 
            request_id, 
            request_type, 
            effective_deletion_date, 
            user_id, 
            assigned_to,
            members,
          }).then(async (data) => {
            if (data.status === true) {
              if (request_reason) {
                const requestReasonUpdate = await requestModel.updateRequest({ request_reason }, request_id);
                if (requestReasonUpdate.rowsAffected[0] > 0) {
                  // if (requests.length === i + 1) {
                  logger.info('Status changes updated');
                  new Response(
                    res, 
                    StatusCodes.OK,
                  ).SuccessResponse(
                    data.message,
                  );
                  // }
                } else {
                  logger.info('Request reason updation failed');
                  new Response(
                    res,
                    StatusCodes.OK,
                  ).ErrorMessage(
                    data.message,
                  );
                }
              } else {
                logger.info('Status changes updated');
                new Response(
                  res, 
                  StatusCodes.OK,
                ).SuccessResponse(
                  data.message,
                );
              }
            } else if (data.status === false) {
              logger.info('Status changes Failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                data.message,
              );
            }
          }).catch((error) => {
            logger.error('Error while approving request to swan--->', error);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.InternalServerError,
            );
          });
        } else {
          logger.info('Unauthorised to approve the request');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.access,
          );
        }
      } else if (request_status === requestStatus.BACK_TO_HR) {
        if (role === Role.SWAN_ADMIN) {
          await requestService.backToHr({
            request_status, 
            family_id, 
            member_id, 
            request_id, 
            request_type, 
            effective_deletion_date, 
            user_id, 
            assigned_to,
          }).then((data) => {
            if (data.status === true) {
              logger.info('Status changes updated');
              new Response(
                res, 
                StatusCodes.OK,
              ).SuccessResponse(
                data.message,
              );
            } else if (data.status === false) {
              logger.info('Status changes Failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                data.message,
              );
            }
          }).catch((error) => {
            logger.error('Error while submitting the request back to hr-->', error);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.InternalServerError,
            );
          });
        } else {
          logger.info('Unauthorised to approve the request');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.access,
          );
        }
      } else if (request_status === requestStatus.BACK_TO_EMPLOYEE) {
        if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE || role === Role.SWAN_ADMIN) {
          await requestService.backToEmployee({
            request_status, 
            family_id, 
            member_id, 
            request_id, 
            request_type, 
            effective_deletion_date, 
            user_id, 
            assigned_to,
          }).then((data) => {
            if (data.status === true) {
              logger.info('Status changes updated');
              new Response(
                res, 
                StatusCodes.OK,
              ).SuccessResponse(
                data.message,
              );
            } else if (data.status === false) {
              logger.info('Status changes Failed');
              new Response(
                res,
                StatusCodes.OK,
              ).ErrorMessage(
                data.message,
              );
            }
          }).catch((error) => {
            logger.error('Error while submitting the request Back to Employee--->', error);
            new Response(
              res,
              StatusCodes.BAD_REQUEST,
            ).ErrorMessage(
              Message.Common.FailureMessage.InternalServerError,
            );
          });
        } else {
          logger.info('Unauthorised to approve the request');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.access,
          );
        }
      } else {
        await requestService.RequestStatus({
          request_status, 
          family_id, 
          member_id, 
          request_id, 
          request_type, 
          effective_deletion_date, 
          user_id, 
          assigned_to,
          role,
        }).then((data) => {
          if (data.status === true) {
            logger.info('Status changes updated');
            new Response(
              res, 
              StatusCodes.OK,
            ).SuccessResponse(
              data.message,
            );
          } else if (data.status === false) {
            logger.info('Status changes Failed');
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              data.message,
            );
          }
        }).catch((error) => {
          logger.error('PROMISE CATCH ERR--->', error);
          new Response(
            res,
            StatusCodes.BAD_REQUEST,
          ).ErrorMessage(
            Message.Common.FailureMessage.InternalServerError,
          );
        });
      }
    } else {
      logger.error('Request Id is not valid--->');
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.requestId,
      );
    }
  } catch (err) {
    logger.error('Update request status --->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};



module.exports = {
  createRequest,
  updateRequestStatus,
  requestInfo,
  getRequestStatuses,
  getRequestCount,
  assignRequest,
  deleteDependantRequest,
  familyRequest,
  masterData,
  deleteMemberRequest,
  getRequest,
  updateRequest,
  getRequestAssignHistory,
  uploadRequestDeatils,
  cancelRequest,
  getDependant,
  getProfile,
  getDependantsByRequestId,
  getPolicyByRequestId,
  getAnswerRecords,
  changeRequestStatus,
};
