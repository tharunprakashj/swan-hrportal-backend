/* eslint-disable camelcase */
const { fetchingCompanyWithUser } = require('../models/employee.model');
const {
  getCompanyBranchDetails, getCompanySubHr, fetchingCompanyWithSubHr, getCompanyBankDetails,
} = require('../models/company-branch.model');

const getCompanyIds = async (user_id) => {
  const companies = await fetchingCompanyWithUser(user_id);
  const company_id = [];
  if (companies.recordsets[0].length > 0) {
    for (let i = 0; i < companies.recordsets[0].length; i++) {
      const company = companies.recordsets[0];
      company_id.push(company[i].company_id);
      if (i === companies.recordsets[0].length - 1) {
        return company_id;
      }
    }
  } else {
    return company_id;
  }
};

const getCompanyWithSubHr = async () => {
  const companies = await fetchingCompanyWithSubHr();
  const company_id = [];
  if (companies.recordsets[0].length > 0) {
    for (let i = 0; i < companies.recordsets[0].length; i++) {
      const company = companies.recordsets[0];
      company_id.push(company[i].company_id);
      if (i === companies.recordsets[0].length - 1) {
        return company_id;
      }
    }
  } else {
    return company_id;
  }
};

const checkCompany = async (company_branch) => {
  const checkExistingCompanyBranch = await getCompanyBranchDetails(company_branch);
  if (checkExistingCompanyBranch.recordset.length > 0) {
    return false;
  }
  return true;
};

const checkBank = async (bank_code) => {
  const checkExistingBank = await getCompanyBankDetails(bank_code);
  if (checkExistingBank.recordset.length > 0) {
    return false;
  }
  return true;
};

const checkCompanySubHr = async (company_id) => {
  const checkExistingCompanyBranch = await getCompanySubHr(company_id);
  if (checkExistingCompanyBranch.recordset.length > 0) {
    return false;
  }
  return true;
};

module.exports = {
  getCompanyIds, checkCompany, checkCompanySubHr, getCompanyWithSubHr, checkBank,
};

// DELETE FROM tbl_questionnarie_answer
// WHERE family_id = @family_id

// DELETE FROM tbl_questionnarie_documents
// WHERE family_id = @family_id

// DELETE FROM tbl_uploaded_documents
// WHERE family_id = @family_id
