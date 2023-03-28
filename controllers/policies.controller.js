/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const clone = require('clone');
const Response = require('../utils/response');
const { Message } = require('../utils/message');
const { Questionnaire, doctorQuestions } = require('../utils/questionnaire');
const policyModel = require('../models/policies.model');
const {
  addOrUpdatePolicy, addOrUpdatePolicyRecords, verifyChangePlan, validateChangePlan,
} = require('../services/polices.services');
const logger = require('../utils/winston');
const {
  Role, requestStatus, documentType, requestType,
} = require('../utils/role');
const { updateRequest } = require('../models/request.model');

const companyBranchModel = require('../models/company-branch.model');

const { updateSalaryBandRecords } = require('../models/policies.model');

const {
  fetchRequestType,
} = require('../services/request.service');

const getBasicPlans = async (req, res) => {
  try {
    logger.info('get basic plans');
    const basicPlans = await policyModel.getbasicPlans();
    if (basicPlans.recordsets.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        basicPlans.recordsets[0],
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Companies'),
      );
    }
  } catch (err) {
    logger.error('Getting basic RGPA plans', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getTopUpPart1 = async (req, res) => {
  try {
    logger.info('get top up part1 plans');
    const topUpPlans = await policyModel.getTopPlan1();
    if (topUpPlans.recordsets.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        topUpPlans.recordsets[0],
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Companies'),
      );
    }
  } catch (err) {
    logger.error('Getting basic RGPA Top part1', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getTopUpPart2 = async (req, res) => {
  try {
    logger.info('get top up part2 plans');
    const topUpPlans = await policyModel.getTopPlan2();
    if (topUpPlans.recordsets.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        topUpPlans.recordsets[0],
      );
    } else {
      new Response(
        res,
        StatusCodes.BAD_REQUEST,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Companies'),
      );
    }
  } catch (err) {
    logger.error('Getting basic RGPA Top part2', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addPolicy = async (req, res) => {
  try {
    logger.info('adding policy details', req.body);
    const policydata = req.body;
    const AllPlans = await policyModel.getAllPlans();
    if (policydata.length > 0) {
      for (let i = 0; i < policydata.length; i++) {
        const policy = policydata[i];
        let {
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          top_up_part2,
          monthly_payment_part2,
        } = policy;
        // let top_up_part1 = null;
        let monthly_payment_part1 = 0;
        // if (!monthly_payment_part2) {
        //   monthly_payment_part2 = 0;
        // }
        if (!rgpa_basic || rgpa_basic === null) {
          rgpa_basic = AllPlans.recordsets[0][0].rgpa_basic_id;
          monthly_rgpa_amount = AllPlans.recordsets[0][0].monthly_payable;
        }

        if (top_up_part1) {
          top_up_part1 = AllPlans.recordsets[1][0].top_up_part1_id;
          monthly_payment_part1 = AllPlans.recordsets[1][0].annual_premium;
        }
        if (top_up_part2 != null) {
          let num = top_up_part2 - 1;
          top_up_part2 = AllPlans.recordsets[2][num].top_up_part2_id;
          monthly_payment_part2 = AllPlans.recordsets[2][num].annual_premium;
        }

        const insertPolicy = await addOrUpdatePolicy({
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        });

        if (insertPolicy.rowsAffected[0] > 0 && insertPolicy.returnValue === 0) {
          if (policydata.length === i + 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Policy Details'),
            );
          }
        } else {
          logger.error('policy details adding failed');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Policy Details'),
          );
          break;
        }
      }
    } else {
      logger.info('received empty array');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Empty,
      );
    }
  } catch (err) {
    logger.error('Adding policy details', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getFamilyPolicyDetails = async (req, res) => {
  try {
    logger.info('getting family policy details');
    let {
      family_id,
    } = req.params;
    let {
      request_id,
    } = req.query;
    family_id = parseInt(family_id);
    const { status } = req.query;
    if (status === '8') {
      const policies = await policyModel.getFamilyApprovedPolicies(family_id);
      if (policies.recordset.length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Family policy details'),
          policies.recordset,
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.NoDataFound('Policy details'),
        );
      }
    } else {
      const policies = await policyModel.getFamilyPolicies(family_id, request_id);
      if (policies.recordset.length > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Family policy details'),
          policies.recordset,
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.NoDataFound('Policy details'),
        );
      }
    }
  } catch (err) {
    logger.error('Fetching family policy details--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateBasicRGPA = async (req, res) => {
  try {
    logger.info('updating basic RGPA', req.body);

    const {
      family_id,
    } = req.params;

    const { request_id } = req.query;
    const {
      rgpa_basic,
      monthly_rgpa_amount,
      effective_date,
    } = req.body;

    if (request_id) {
      const getAllPolicies = await policyModel.getFamilyMemberPoliciesRecord(request_id);
      const memberPolicies = getAllPolicies.recordset;
      for (let i = 0; i < memberPolicies.length; i++) {
        let {
          member_id,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        } = memberPolicies[i];
        if (!monthly_payment_part1) {
          monthly_payment_part1 = 0;
        }
        if (!monthly_payment_part2) {
          monthly_payment_part2 = 0;
        }

        const insertPolicy = await addOrUpdatePolicyRecords({
          request_id,
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        });
        if (i === memberPolicies.length - 1) {
          if (effective_date) {
            const updateReq = await updateRequest({ effective_date }, request_id);
          }
          if (insertPolicy.rowsAffected[0] > 0) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('Policy details'),

            );
          } else {
            logger.error('adding or updating policy failed');
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('Policy details'),
            );
          }
        }
      }
    } else {
      const getAllPolicies = await policyModel.getFamilyMemberPolicies(family_id);
      const memberPolicies = getAllPolicies.recordset;
      for (let i = 0; i < memberPolicies.length; i++) {
        let {
          member_id,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        } = memberPolicies[i];
        if (!monthly_payment_part1) {
          monthly_payment_part1 = 0;
        }
        if (!monthly_payment_part2) {
          monthly_payment_part2 = 0;
        }

        const insertPolicy = await addOrUpdatePolicy({
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        });
        if (i === memberPolicies.length - 1) {
          if (insertPolicy.rowsAffected[0] > 0) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Updation('Policy details'),

            );
          } else {
            logger.error('adding or updating policy failed');
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Updation('Policy details'),
            );
          }
        }
      }
    }

    // const policies = await policyModel.updateRGPA(policy, family_id);
  } catch (err) {
    logger.error('update basic RGPA', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getPolicyDetails = async (req, res) => {
  try {
    logger.info('getting policy details');
    const {
      policy_id,
    } = req.params;
    const memberPolicies = await policyModel.getMemberPolicies(policy_id);
    if (memberPolicies.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Member policy details'),
        memberPolicies.recordset,
      );
    } else {
      logger.info('failed to fetch policy details');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Member policy details'),
      );
    }
  } catch (err) {
    logger.error('Get policy details', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getFamilyApprovedPolicyDetails = async (req, res) => {
  try {
    logger.info('getting family policy details');
    let {
      family_id,
    } = req.params;
    family_id = parseInt(family_id);

    const policies = await policyModel.getFamilyApprovedPolicies(family_id);
    if (policies.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Family policy details'),
        policies.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.NoDataFound('Policy details'),
      );
    }
  } catch (err) {
    logger.error('Fetching family policy details--->', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updatePolicy = async (req, res) => {
  try {
    let policy = req.body;
    const {
      user_id,
      role,
    } = req.user;
    let { request_id } = req.params;
    const { request_type } = await fetchRequestType(request_id);

    if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT || request_type === requestType.CHANGE_PLAN) {
      const AllPlans = await policyModel.getAllPlans();
      const verification = await verifyChangePlan(policy);
      if (verification.rgpa === true || verification.top_up1 === true || verification.top_up2 === true) {
        for (let i = 0; i < policy.length; i++) {
          let {
            family_id,
            member_id,
            rgpa_basic,
            monthly_rgpa_amount,
            top_up_part1,
            monthly_payment_part1,
            top_up_part2,
            monthly_payment_part2,
          } = policy[i];

          if (rgpa_basic != null && role === Role.SUB_HR) {
            let num = rgpa_basic - 1;
            rgpa_basic = AllPlans.recordsets[0][num].rgpa_basic_id;
            monthly_rgpa_amount = AllPlans.recordsets[0][num].monthly_payable;
          }

          if (top_up_part1) {
            top_up_part1 = AllPlans.recordsets[1][0].top_up_part1_id;
            monthly_payment_part1 = AllPlans.recordsets[1][0].annual_premium;
          } else {
            monthly_payment_part1 = 0;
          }
          if (top_up_part2 != null) {
            let num = top_up_part2 - 1;
            top_up_part2 = AllPlans.recordsets[2][num].top_up_part2_id;
            monthly_payment_part2 = AllPlans.recordsets[2][num].annual_premium;
          } else {
            monthly_payment_part2 = 0;
          }

          const insertPolicy = await addOrUpdatePolicyRecords({
            family_id,
            member_id,
            request_id,
            rgpa_basic,
            monthly_rgpa_amount,
            top_up_part1,
            monthly_payment_part1,
            top_up_part2,
            monthly_payment_part2,
          });

          if (insertPolicy.returnValue === 0) {
            if (i === policy.length - 1) {
              new Response(
                res,
                StatusCodes.OK,
              ).SuccessResponse(
                Message.Common.SuccessMessage.Updation('Policy Records'),
                { request_id, questionnary: verification.top_up2 },

              );
            }
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Policy Records'),
            );
            break;
          }
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
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NextPage('Policy'),
      );
    }
  } catch (err) {
    logger.error('Update policy details--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updatePolicyDetails = async (req, res) => {
  try {
    let policy = req.body;
    const {
      user_id,
      role,
    } = req.user;
    let { request_id } = req.params;
    const { request_type } = await fetchRequestType(request_id);

    if (request_type === requestType.ADD_MEMBER || request_type === requestType.ADD_DEPENDANT || request_type === requestType.CHANGE_TOP_UP) {
      const AllPlans = await policyModel.getAllPlans();
      console.log('policy', policy);
      const verification = await validateChangePlan(policy);
      console.log('verification', verification);
      if (verification.top_up1 === true || verification.top_up2 === true) {
        const existingRgpa = await policyModel.getPrimaryMemberPolicy(policy[0].family_id);
        let { rgpa_basic, monthly_rgpa_amount } = existingRgpa.recordset[0];
        for (let i = 0; i < policy.length; i++) {
          let {
            family_id,
            member_id,
            top_up_part1,
            monthly_payment_part1,
            top_up_part2,
            monthly_payment_part2,
          } = policy[i];

          if (top_up_part1) {
            top_up_part1 = AllPlans.recordsets[1][0].top_up_part1_id;
            monthly_payment_part1 = AllPlans.recordsets[1][0].annual_premium;
          } else {
            monthly_payment_part1 = 0;
          }
          if (top_up_part2 != null) {
            let num = top_up_part2 - 1;
            top_up_part2 = AllPlans.recordsets[2][num].top_up_part2_id;
            monthly_payment_part2 = AllPlans.recordsets[2][num].annual_premium;
          } else {
            monthly_payment_part2 = 0;
          }

          const insertPolicy = await addOrUpdatePolicyRecords({
            family_id,
            member_id,
            request_id,
            rgpa_basic,
            monthly_rgpa_amount,
            top_up_part1,
            monthly_payment_part1,
            top_up_part2,
            monthly_payment_part2,
          });

          if (insertPolicy.returnValue === 0) {
            if (i === policy.length - 1) {
              new Response(
                res,
                StatusCodes.OK,
              ).SuccessResponse(
                Message.Common.SuccessMessage.Updation('Policy Records'),
                { request_id, questionnary: verification.top_up2 },

              );
            }
          } else {
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Policy Records'),
            );
            break;
          }
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
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NextPage('Policy'),
      );
    }
  } catch (err) {
    logger.error('Update policy details--->', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const addPolicyRecords = async (req, res) => {
  try {
    logger.info('adding policy records', req.body);
    const policydata = req.body;
    const { request_id } = req.params;
    const AllPlans = await policyModel.getAllPlans();
    if (policydata.length > 0) {
      for (let i = 0; i < policydata.length; i++) {
        const policy = policydata[i];
        let {
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          top_up_part2,
          monthly_payment_part2,
        } = policy;
        // let top_up_part1 = null;
        let monthly_payment_part1 = 0;
        // if (!monthly_payment_part2) {
        //   monthly_payment_part2 = 0;
        // }
        if (!rgpa_basic || rgpa_basic === null) {
          rgpa_basic = AllPlans.recordsets[0][0].rgpa_basic_id;
          monthly_rgpa_amount = AllPlans.recordsets[0][0].monthly_payable;
        } else {
          monthly_rgpa_amount = AllPlans.recordsets[0][rgpa_basic - 1].monthly_payable;
        }

        if (top_up_part1) {
          top_up_part1 = AllPlans.recordsets[1][0].top_up_part1_id;
          monthly_payment_part1 = AllPlans.recordsets[1][0].annual_premium;
        } else {
          top_up_part1 = null;
        }
        if (top_up_part2 != null) {
          let num = top_up_part2 - 1;
          top_up_part2 = AllPlans.recordsets[2][num].top_up_part2_id;
          monthly_payment_part2 = AllPlans.recordsets[2][num].annual_premium;
        } else {
          top_up_part2 = null;
          monthly_payment_part2 = 0;
        }

        const insertPolicy = await addOrUpdatePolicyRecords({
          request_id,
          family_id,
          member_id,
          rgpa_basic,
          monthly_rgpa_amount,
          top_up_part1,
          monthly_payment_part1,
          top_up_part2,
          monthly_payment_part2,
        });

        if (insertPolicy.rowsAffected[0] > 0 && insertPolicy.returnValue === 0) {
          if (policydata.length === i + 1) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Policy Records'),
            );
          }
        } else {
          logger.error('policy records adding failed');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Policy Records'),
          );
          break;
        }
      }
    } else {
      logger.info('received empty array');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Empty,
      );
    }
  } catch (err) {
    logger.error('Adding policy records', err.stack);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateSalaryRGPA = async (req, res) => {
  try {
    logger.info('updating basic RGPA', req.body);

    const {
      request_id,
    } = req.params;

    const {
      rgpa_basic,
      monthly_rgpa_amount,
      effective_date,
    } = req.body;

    const updateSalary = await updateSalaryBandRecords({ rgpa_basic, monthly_rgpa_amount, request_id });

    if (updateSalary.rowsAffected > 0) {
      logger.info('Updated the salary band in policy records ');
      if (effective_date) {
        await updateRequest({ effective_date }, request_id);
      }
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Updation('Policy Records'),

      );
    } else {
      logger.error('updating Salary band failed');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('Policy records'),
      );
    }

    // const policies = await policyModel.updateRGPA(policy, family_id);
  } catch (err) {
    logger.error('update basic RGPA', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  getBasicPlans,
  getTopUpPart1,
  getTopUpPart2,
  addPolicy,
  getFamilyPolicyDetails,
  getPolicyDetails,
  updateBasicRGPA,
  getFamilyApprovedPolicyDetails,
  updatePolicy,
  addPolicyRecords,
  updateSalaryRGPA,
  updatePolicyDetails,
};
