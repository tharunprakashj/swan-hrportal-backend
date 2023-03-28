/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable camelcase */
const { StatusCodes } = require('http-status-codes');
const clone = require('clone');
const Response = require('../utils/response');
const { Role } = require('../utils/role');
const { Message } = require('../utils/message');
const companyBranchModel = require('../models/company-branch.model');
const { getInsuranceDetails } = require('../models/insuranceDetails.model');
const { uploadDocuments } = require('../services/user.services');
const { getCompanyIds, getCompanyWithSubHr } = require('../services/company.services');
const logger = require('../utils/winston');

// Method For Creating Company Branch
const createCompanyBranch = async (req, res) => {
  try {
    logger.info('creating sub company branches -->', req.body);
    logger.info('File Uploaded', req.files);
    const {

      company_branch,
      description,
      country,
      state,
      city,
    } = req.body;
    let { company_id } = req.body;
    company_id = JSON.parse(company_id);
    const companyBranch = {
      company_id,
      company_branch,
      description,
      country,
      state,
      city,
    };
    const checkExistingCompanyBranch = await companyBranchModel.getCompanyBranchDetails(
      companyBranch.company_branch,
    );
    if (checkExistingCompanyBranch.recordset.length > 0) {
      logger.info('Sub company already existed, please register new company');
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.CompanyManagement.SuccessMessage.Existing,
      );
    } else {
      const companyCreation = await companyBranchModel.insertCompanyBranch(companyBranch);
      if (companyCreation.recordset[0].company_branch_id) {
        logger.info('Sub company created succesfully', companyCreation.recordset);
        const { company_branch_id } = companyCreation.recordset[0];
        if (req.files.COMPANY_LOGO) {
          const {
            key, mimetype, location,
          } = req.files.COMPANY_LOGO[0];
          const company_image_key = key;
          const company_image_format = mimetype;
          const company_image_location = location;
          const CompanyLogoUpload = await uploadDocuments({
            company_branch_id, company_image_key, company_image_format, company_image_location,
          });
          if (CompanyLogoUpload.rowsAffected[0] > 0) {
            logger.info('sub companies created with logo added');
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Company along with logo'),
            );
          } else {
            logger.info('sub companies created with out  logo added');
            new Response(
              res,
              StatusCodes.OK,
            ).ErrorMessage(
              Message.Common.FailureMessage.Creation('Company along with logo'),
            );
          }
        } else {
          logger.info('sub companies created successfully');
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Creation('Company'),
          );
        }
      } else {
        logger.error('Sub company adding failed');
        new Response(
          res,
          StatusCodes.BAD_REQUEST,
        ).ErrorMessage(
          Message.Common.FailureMessage.Creation('Company'),
        );
      }
    }
  } catch (err) {
    logger.error('Sub company adding failed', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.Creation('Company'),
    );
  }
};

const fetchCompanyBranch = async (req, res) => {
  try {
    logger.info('Fetching all companies');
    const company_id = null;
    const companies = await companyBranchModel.fetchAllCompanies({ company_id });
    if (companies.recordsets.length > 0) {
      logger.info('Companies added successfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        companies.recordsets[0],
      );
    } else {
      logger.info('Companies not found');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Companies'),
        companies.recordsets[0],
      );
    }
  } catch (err) {
    logger.info('Companies fetching failed', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.NoDataFound('Companies'),
    );
  }
};

const getCompanies = async (req, res) => {
  try {
    logger.info('Get companies with employee names');
    let starts_with;
    const { role, user_id } = req.user;
    const {
      page_count,
      page_no,
      search,
    } = req.query;

    if (page_count !== undefined && page_no !== undefined) {
      starts_with = (page_no * page_count) - page_count;
    }

    const page = {
      starts_with,
      page_count,
    };
    let company_id = null;
    if (role === Role.GROUP_HR || role === Role.SWAN_ADMIN) {
      const companiesdata = await companyBranchModel.fetchAllCompanies({ company_id }, search, page);
      const companyDetails = [];
      if (companiesdata.recordset.length > 0) {
        logger.info('Companies fetched Succesfully');
        const companies = companiesdata.recordset;
        // for (let i = 0; i < companies.length; i++) {
        //   const { company_branch_id } = companies[i];
        //   const hrDetails = await companyBranchModel.getCompanyDetails(company_branch_id);
        //   let forename = '';
        //   let surname = '';
        //   let employee_count = '';
        //   if (hrDetails.recordset.length > 0) {
        //     forename = hrDetails.recordset[0].forename;
        //     surname = hrDetails.recordset[0].surname;
        //   }
        //   if (hrDetails.recordsets[1].length > 0) {
        //     employee_count = hrDetails.recordsets[1][0].employee_count;
        //   }
        //   const data = companies[i];
        //   data.forename = forename;
        //   data.surname = surname;
        //   data.employee_count = employee_count;
        //   companyDetails.push(clone(data));
        //   if (companies.length === i + 1) {
        //     logger.info('companies fetching sucessfull for looooooooooooooooooooooooo');
        //     new Response(
        //       res,
        //       StatusCodes.OK,
        //     ).SuccessResponse(
        //       Message.Common.SuccessMessage.Fetch('Companies'),
        //       companyDetails,
        //     );
        //   }
        // }
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.Fetch('Companies'),
          companies,
        );
      } else {
        logger.info('companies list not found');
        new Response(
          res,
          StatusCodes.OK,
        ).ErrorMessage(
          Message.Common.FailureMessage.NoDataFound('Companies'),
        );
      }

    // } else if (role === Role.SUB_HR || role === Role.HR_EXECUTIVE) {
    } else {
      company_id = await getCompanyIds(user_id);
      const companyDetails = [];
      if (company_id.length > 0) {
        const companiesdata = await companyBranchModel.fetchAllCompanies({ company_id }, search, page);
        if (companiesdata.recordset.length > 0) {
          logger.info('Companies fetched Succesfully');
          const companies = companiesdata.recordset;
          // logger.info('companies list', companiesdata.recordset);
          // for (let i = 0; i < companies.length; i++) {
          //   const { company_branch_id } = companies[i];
          //   const hrDetails = await companyBranchModel.getCompanyDetails(company_branch_id);
          //   let forename = '';
          //   let surname = '';
          //   let employee_count = '';
          //   if (hrDetails.recordset.length > 0) {
          //     forename = hrDetails.recordset[0].forename;
          //     surname = hrDetails.recordset[0].surname;
          //   }
          //   if (hrDetails.recordsets[1].length > 0) {
          //     employee_count = hrDetails.recordsets[1][0].employee_count;
          //   }
          //   const data = companies[i];
          //   data.forename = forename;
          //   data.surname = surname;
          //   data.employee_count = employee_count;
          //   companyDetails.push(clone(data));
          //   if (companies.length === i + 1) {
          //     logger.info('companies fetching sucessfull');
          //     new Response(
          //       res,
          //       StatusCodes.OK,
          //     ).SuccessResponse(
          //       Message.Common.SuccessMessage.Fetch('Companies'),
          //       companyDetails,
          //     );
          //   }
          // }
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Fetch('Companies'),
            companies,
          );
        } else {
          logger.info('companies list not found');
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.NoDataFound('Companies'),
          );
        }
      } else {
        logger.info('Companies list not found for the company_id');
        new Response(
          res,
          StatusCodes.OK,
        ).SuccessResponse(
          Message.Common.SuccessMessage.NoData('Companies'),
          companyDetails,
        );
      }
    }
  } catch (err) {
    logger.error('companies fetching failed', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getEmployeeDetails = async (req, res) => {
  try {
    logger.info('Get employee details with company id', req.params);
    const { companyId } = req.params;
    const companies = await companyBranchModel.getCompanyEmployeeDetails(companyId);
    const companyDetails = companies.recordsets[0];
    for (let i = 0; i < companyDetails.length; i++) {
      const { family_id } = companyDetails[i];
      const member_id = companyDetails[i].profile_id;
      const insurances = await getInsuranceDetails(family_id, member_id);
      if (insurances.recordset.length > 0) {
        const insuranceDetails = insurances.recordsets[0][0];
        companyDetails[i].insurance_id = insuranceDetails.insurance_id;
        companyDetails[i].request_status = insuranceDetails.request_status;
        companyDetails[i].insuranceCount = insuranceDetails.insuranceCount;
        companyDetails[i].monthly_premium = insuranceDetails.monthly_premium;
        companyDetails[i].rgpa_basic = insuranceDetails.rgpa_basic;
        companyDetails[i].top_up_part1 = insuranceDetails.top_up_part1;
        companyDetails[i].top_up_part2 = insuranceDetails.top_up_part2;
        companyDetails[i].annual_premium = insuranceDetails.annual_premium;
      }
    }
    if (companies.recordsets.length > 0) {
      logger.info('Employee details fetched succesfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        companies.recordsets[0],
      );
    } else {
      logger.info('Employee details fetched failed');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Companies'),
      );
    }
  } catch (err) {
    logger.error('Fetching companies employee details', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getDependentDetails = async (req, res) => {
  try {
    logger.info('Fetching dependent details', req.params);

    const { family_id, member_id } = req.params;

    const insurances = await getInsuranceDetails(family_id, member_id);

    if (insurances.recordsets.length > 0) {
      logger.info('Dependant detail fetched success fully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies'),
        insurances.recordsets[0],
      );
    } else {
      logger.info('dependant detail not found,received empty');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Companies'),
        insurances.recordsets[0],
      );
    }
  } catch (err) {
    logger.error('Fetching employee dependant details', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const getBankList = async (req, res) => {
  try {
    const bankList = await companyBranchModel.getBankList();

    if (bankList.recordsets.length > 0) {
      logger.info('Bank list fetched sucessfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Bank List'),
        bankList.recordsets[0],
      );
    } else {
      logger.info('Bank list is empty');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Bank List'),
        bankList.recordsets[0],
      );
    }
  } catch (err) {
    logger.error('Fetching bank list', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const CompaniesWithoutSubHr = async (req, res) => {
  try {
    const companyList = await getCompanyWithSubHr();
    const fetchCompany = await companyBranchModel.fetchAllCompanies({ companyList });

    if (fetchCompany.recordsets.length > 0) {
      logger.info('Companies list successfully');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Companies List'),
        fetchCompany.recordsets[0],
      );
    } else {
      logger.info('Companies List');
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.NoData('Companies List'),
        fetchCompany.recordsets[0],
      );
    }
  } catch (err) {
    logger.error('Fetching Companies list', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const updateCompanyBranch = async (req, res) => {
  try {
    const {
      branchId,
    } = req.params;
    const {
      company_name,
      company_branch,
      description,
      country,
      state,
      city,
    } = req.body;
    const branchDetails = {
      company_name,
      company_branch,
      description,
      country,
      state,
      city,
    };
    const updateCompany = await companyBranchModel.updateCompanyBranchById(branchDetails, branchId);
    if (updateCompany.rowsAffected[0] > 0) {
      new Response(res, StatusCodes.OK).SuccessResponse(
        Message.Common.SuccessMessage.Updation('Company Branch Details'),
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Updation('Company Branch Details'),
      );
    }
  } catch (err) {
    logger.error('updating company branch details', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

const deleteCompanyBranch = async (req, res) => {
  try {
    const {
      branchId,
    } = req.params;
    const deleteBranch = await companyBranchModel.deleteCompanyBranchById(branchId);
    if (deleteBranch.rowsAffected[0] > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Deletion('Company Branch'),
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Deletion('Company Branch'),
      );
    }
  } catch (err) {
    logger.error('Delete company branch details', err);
    new Response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

module.exports = {
  createCompanyBranch,
  updateCompanyBranch,
  fetchCompanyBranch,
  deleteCompanyBranch,
  getCompanies,
  getEmployeeDetails,
  getDependentDetails,
  getBankList,
  CompaniesWithoutSubHr,
};
