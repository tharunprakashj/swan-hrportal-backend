/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generator');

const insertCompanyBranch = async (company) => {
  // const query = QueryGenerator.insert('tbl_company_branches', company);
  const query = `INSERT INTO tbl_company_branches (company_id,company_branch,description,country,state,city) VALUES (${company.company_id},'${company.company_branch}','${company.description}','${company.country}','${company.state}','${company.city}');SELECT SCOPE_IDENTITY() AS company_branch_id;`;
  return await database.request().query(query);
};

const insertCompanyFromDoc = async (company) => {
  // const query = QueryGenerator.insert('tbl_company_branches', company);
  const query = `INSERT INTO tbl_company_branches (company_id,company_branch,country) VALUES (${company.company_id},'${company.company_branch}','${company.country}')`;
  return await database.request().query(query);
};

const fetchAllCompanies = async (data, search, page) => {
  let condition = '';
  let count = '';
  if (data.company_id) {
    condition = `WHERE combrnch.company_branch_id IN (${data.company_id})`;
    count = `WHERE combrnch.company_branch_id IN (${data.company_id})`;
  } else if (data.companyList) {
    condition = `WHERE combrnch.company_branch_id NOT IN (${data.companyList})`;
  }
  if (search) {
    if (condition !== '') {
      condition = `${condition} AND combrnch.company_branch LIKE '%${search}%'`;
      count = `${count} AND combrnch.company_branch LIKE '%${search}%'`;
    } else {
      condition = `WHERE combrnch.company_branch LIKE '%${search}%'`;
      count = `WHERE combrnch.company_branch LIKE '%${search}%'`;
    }
  } else {
    search = '';
  }
  if (typeof page === 'object') {
    page = JSON.parse(JSON.stringify(page));
    const keysAndValues = Object.entries(page);
    for (let i = 0; i < keysAndValues.length; i++) {
      if (i === 0) {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            condition = `${condition} ORDER BY combrnch.company_branch OFFSET ${keysAndValues[i][j]} ROWS`;
          }
        }
      } else {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            condition = `${condition} FETCH NEXT ${keysAndValues[i][j]} ROWS ONLY`;
          }
        }
      }
    }
  }
  const query = `SELECT
  combrnch.company_id,combrnch.company_branch_id,combrnch.company_branch,combrnch.description,combrnch.country,combrnch.state,combrnch.city,
  comimg.company_image_key,comimg.company_image_format,comimg.company_image_location,emp.user_id,prof.forename,prof.surname,
  (SELECT COUNT(*) FROM tbl_company_branches combrnch ${count}) AS company_count,
  (SELECT COUNT(*) FROM tbl_employees WHERE company_id = combrnch.company_branch_id AND role=4) AS employee_count
  FROM tbl_company_branches combrnch
  LEFT JOIN tbl_company_images comimg ON comimg.company_branch_id = combrnch.company_branch_id
  LEFT JOIN tbl_employees emp ON emp.company_id = combrnch.company_branch_id AND role=2
  LEFT JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY' ${condition};
`;
  return await database.request().query(query);
};
// (SELECT COUNT(*) FROM tbl_employees WHERE company_id = combrnch.company_branch_id AND emp.role=4) AS employee_count

// SELECT COUNT(*) AS employee_count from tbl_employees e WHERE e.company_id = ${company_branch_id} AND e.role=4;
// ORDER BY combrnch.company_branch_id DESC`;

// (SELECT count(*) FROM tbl_employees emp WHERE emp.company_id = combrnch.company_id) AS empolyee_Count

// const fetchAllCompanies = async (data) => {
//   let condition = '';
//   if (data.company_id) {
//     condition = `WHERE combrnch.company_branch_id IN (${data.company_id})`;
//   }
//   const query = `SELECT
//   combrnch.company_id,combrnch.company_branch_id,combrnch.company_branch,combrnch.description,combrnch.country,combrnch.state,combrnch.city,
//   comimg.company_image_key,comimg.company_image_format,comimg.company_image_location
//   FROM tbl_company_branches combrnch
//   LEFT JOIN tbl_company_images comimg ON comimg.company_id = combrnch.company_branch_id ${condition}`;
//   return await database.request().query(query);
// };

const getCompanyDetails = async (company_branch_id) => {
  const query = `SELECT prof.forename, prof.surname from tbl_employees emp
  JOIN tbl_profiles prof ON prof.family_id = emp.user_id
  WHERE emp.company_id = ${company_branch_id} AND role=2;
  SELECT COUNT(*) AS employee_count from tbl_employees e WHERE e.company_id = ${company_branch_id} AND e.role=4;
  `;
  return await database.request().query(query);
};

const getCompanyEmployeeDetails = async (companyId) => {
  const query = `SELECT prof.forename, prof.surname, prof.family_id, prof.profile_id,prof.relationship, usr.employee_id, rol.role_type,rol.role_id from tbl_employees emp
  JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY'
  JOIN tbl_users usr ON usr.user_id = emp.user_id
  JOIN tbl_roles rol ON rol.role_id = emp.role
  WHERE emp.company_id = ${companyId} AND emp.role !=1;`;

  return await database.request().query(query);
};

const updateCompanyBranchById = async (branchDetails, branchId) => {
  const query = `UPDATE tbl_company_branches SET company_name='${branchDetails.company_name}',company_branch='${branchDetails.company_branch}',description='${branchDetails.description}',
  country='${branchDetails.country}',state='${branchDetails.state}',city='${branchDetails.city}',logo='${branchDetails.logo}', branch_updated_on = GETDATE()
  WHERE company_branch_id=${branchId}`;
  return await database.request().query(query);
};
const deleteCompanyBranchById = async (branchId) => {
  const query = `DELETE FROM tbl_company_branches where company_branch_id=${branchId}`;
  return await database.request().query(query);
};

// Get the Individual Company Details using Company Branch Name
const getCompanyBranchDetails = async (companyBranch) => {
  const query = `SELECT * FROM tbl_company_branches where company_branch='${companyBranch}'`;
  return await database.request().query(query);
};
// Get the Individual Company Details using Company Branch Name
const getCompanyBankDetails = async (bank_code) => {
  const query = `SELECT * FROM tbl_bank_list where bank_code=${bank_code}`;
  return await database.request().query(query);
};

// Get the Individual Company Details using Company Branch Name
const getCompanySubHr = async (company_id) => {
  const query = `SELECT * FROM tbl_employees where company_id=${company_id} AND role=2`;
  return await database.request().query(query);
};

// Get the Individual Company Details with subhr
const fetchingCompanyWithSubHr = async () => {
  const query = 'SELECT DISTINCT company_id FROM tbl_employees where role=2';
  return await database.request().query(query);
};

// Get rgpa basic plans
const getBankList = async () => {
  const query = 'SELECT * FROM tbl_bank_list ORDER BY bank_name';
  return await database.request().query(query);
};

module.exports = {
  insertCompanyBranch,
  fetchAllCompanies,
  updateCompanyBranchById,
  deleteCompanyBranchById,
  getCompanyBranchDetails,
  getCompanyDetails,
  getCompanyEmployeeDetails,
  getBankList,
  insertCompanyFromDoc,
  getCompanySubHr,
  fetchingCompanyWithSubHr,
  getCompanyBankDetails,
};
