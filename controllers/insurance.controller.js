/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
/* eslint-disable camelcase */
// Import Response Module for sending response to client application
const { StatusCodes } = require('http-status-codes');

const crypto = require('crypto');
const Response = require('../utils/response');
const { Message } = require('../utils/message');
const { updateEffectiveInsurance, updateEffectiveDateRecords } = require('../models/insuranceDetails.model');
const { calculateInsuranceDate } = require('../services/insurance.services');
const logger = require('../utils/winston');
const userModel = require('../models/user.model');
// const { updateEmployee } = require('./user.controller');


const updateInsuranceDate = async (req, res) => {
  try {
    logger.info('Updating insurance Date --->', req.body);
    const {
      member_id,
      family_id,
      employment_date,
    } = req.body;
    let { effective_insurance_date } = req.body;
    effective_insurance_date = effective_insurance_date.replaceAll('/', '-');
    if (employment_date) {
      const updateEmployee = await userModel.updateUserDetails({ employment_date }, family_id);
      const effective_ins_date = new Date(new Date(employment_date).getFullYear(), new Date(employment_date).getMonth() + 1).toLocaleDateString('fr-CA');
      if (effective_ins_date <= effective_insurance_date) {
        const insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
        const updateResult = await updateEffectiveInsurance({
          effective_insurance_date, insurance_end_date, member_id, family_id, 
        });
        if (updateResult.rowsAffected[0] > 0 && updateEmployee.rowsAffected[0] > 0) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Updation('Effective insurance date'),
          );
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Updation('Assigned Status'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.misMatchInsuranceDate,
        );
      }
    } else {
      const insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
      const updateResult = await updateEffectiveInsurance({
        effective_insurance_date, insurance_end_date, member_id, family_id, 
      });
      
      if (updateResult.rowsAffected[0] > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Updation('Effective insurance date'),
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('Effective insurance date'),
        );
      }
    }
  } catch (err) {
    logger.error('Updating Effective insurance date', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateEffectiveInsuranceDate = async (req, res) => {
  try {
    logger.info('Updating insurance Date --->', req.body);
    const {
      member_id,
      family_id,
      employment_date,
    } = req.body;
    const { request_id } = req.params;
    let { effective_insurance_date } = req.body;
    effective_insurance_date = effective_insurance_date.replaceAll('/', '-');
    if (employment_date) {
      const updateEmployee = await userModel.updateUserDetails({ employment_date }, family_id);
      const effective_ins_date = new Date(new Date(employment_date).getFullYear(), new Date(employment_date).getMonth() + 1).toLocaleDateString('fr-CA');
      if (effective_ins_date <= effective_insurance_date) {
        const insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
        const updateResult = await updateEffectiveDateRecords({
          effective_insurance_date, insurance_end_date, member_id, family_id, request_id,
        });
        if (updateResult.rowsAffected[0] > 0 && updateEmployee.rowsAffected[0] > 0) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Updation('Effective insurance date'),
          );
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Updation('Assigned Status'),
          );
        }
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.misMatchInsuranceDate,
        );
      }
    } else {
      const insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
      const updateResult = await updateEffectiveDateRecords({
        effective_insurance_date, insurance_end_date, member_id, family_id, request_id,
      });
      
      if (updateResult.rowsAffected[0] > 0) {
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Updation('Effective insurance date'),
        );
      } else {
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.Updation('Effective insurance date'),
        );
      }
    }
  } catch (err) {
    logger.error('Updating Effective insurance date', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};


module.exports = { 
  updateInsuranceDate,
  updateEffectiveInsuranceDate,
};

