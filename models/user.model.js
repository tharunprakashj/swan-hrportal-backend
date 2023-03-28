/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-else-return */
/* eslint-disable no-return-await */
/* eslint-disable no-const-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const mssql = require('mssql');
const { request } = require('http');
const { database } = require('../utils/database');
const QueryGenerator = require('../generators/query.generate');
const logger = require('../utils/winston');
const { Role, requestType } = require('../utils/role');

// // Check whether the email is presents or not
// const checkEmailById = async (email_id) => {
//   const query = `SELECT * FROM tbl_users where email_id='${email_id}'`;
//   return await database.request().query(query);
// };

// Check whether the email is presents or not
const checkEmailById = async (email_id) => {
  const query = `SELECT usr.email_id,usr.password,usr.role,usr.user_id,usr.is_verified,prof.surname,prof.forename,prof.profile_id FROM tbl_users usr
  JOIN tbl_profiles prof ON prof.family_id = usr.user_id AND prof.relationship = 'PRIMARY'  AND prof.user_status != 'DELETED'
  where usr.email_id='${email_id}'`;
  return await database.request().query(query);
};

// Check whether the id is presents or not
const checkById = async (user_id) => {
  const query = `SELECT * FROM tbl_users usr
  JOIN tbl_profiles prof ON prof.family_id = usr.user_id AND prof.relationship = 'PRIMARY'  AND prof.user_status != 'DELETED'
  where usr.user_id =${user_id}`;
  return await database.request().query(query);
};
// Check whether the email is presents or not
const getUserByEmail = async (email_id) => {
  const query = `SELECT usr.email_id,usr.user_id,usr.role,usr.is_verified,prof.surname,prof.forename,prof.profile_id FROM tbl_users usr
  JOIN tbl_profiles prof ON prof.family_id = usr.user_id AND prof.relationship = 'PRIMARY'  AND prof.user_status != 'DELETED'
  where email_id='${email_id}'`;
  return await database.request().query(query);
};

// Check whether the email is presents or not
const checkOTP = async ({ email_id, otp }) => {
  const query = `SELECT * FROM tbl_otps where email_id='${email_id}' AND otp = '${otp}' AND verified !=1`;
  return await database.request().query(query);
};

// Check whether the email is presents or not
const getEmployee = async (user_id) => {
  const query = `SELECT * FROM tbl_users where user_id=${user_id}`;
  return await database.request().query(query);
};

// Check whether the email is presents or not
const checkPrimaryUser = async (family_id) => {
  const query = `SELECT * FROM tbl_profiles where family_id=${family_id} AND relationship = 'PRIMARY'`;
  return await database.request().query(query);
};

// Check whether the email is presents or not
const getAllAdmins = async () => {
  const query = `SELECT * FROM tbl_users where role IN (${Role.SWAN_ADMIN},${Role.GROUP_HR})`;
  return await database.request().query(query);
};

// Check whether the password is presents or not
const checkPasswordById = async (password) => {
  const query = `SELECT * FROM tbl_users where password='${password}'`;
  return await database.request().query(query);
};

// Check whether the email and password is present or not
const checkEmailAndPassword = async (email_id, password) => {
  const query = `SELECT * FROM tbl_users where email_id='${email_id}' AND password='${password}'`;
  return await database.request().query(query);
};

// Insert the employee details
const insertEmployee = async ({
  company_id,
  employee_id,
  role,
  email_id,
  password,
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
}) => {
  const result = await database.request()
    .input('company_id', company_id)
    .input('employee_id', employee_id)
    .input('role', role)
    .input('email_id', email_id)
    .input('password', password)
    .input('surname', surname)
    .input('forename', forename)
    .input('date_of_birth', date_of_birth)
    .input('relationship', relationship)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('card', card)
    .input('bank_id', bank_id)
    .input('bank_account_holder', bank_account_holder)
    .input('bank_account_number', bank_account_number)
    .input('effective_insurance_date', effective_insurance_date)
    .input('request_type', request_type)
    .input('request_createdby', request_createdby)
    .input('policy_no', policy_no)
    .input('user_status', user_status)
    .output('family_id', 0)
    .output('member_id', 0)
    .output('bank_detail_id', 0)
    .output('policy_details', 0)
    .output('insurance_id', 0)
    .execute('createEmployee');

  return result;
};

// Add the employee details
const addEmployee = async ({
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
}) => {
  const result = await database.request()
    .input('company_id', company_id)
    .input('employee_id', employee_id)
    .input('role', role)
    .input('email_id', email_id)
    .input('password', password)
    .input('surname', surname)
    .input('forename', forename)
    .input('date_of_birth', date_of_birth)
    .input('user_gender', user_gender)
    .input('user_status', user_status)
    .input('relationship', relationship)
    .input('policy_no', policy_no)
    .output('family_id', 0)
    .output('member_id', 0)
    .execute('addEmployee');

  return result;
};

// update the employee details
const updateEmployeeDetails = async ({
  family_id,
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
}) => {
  const result = await database.request()
    .input('id', family_id)
    .input('profile_id', profile_id)
    .input('employment_date', employment_date)
    .input('surname', surname)
    .input('forename', forename)
    .input('date_of_birth', date_of_birth)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('card', card)
    .input('city', city)
    .input('bank_id', bank_code)
    .input('bank_account_holder', bank_account_holder)
    .input('bank_account_number', bank_account_number)
    .input('effective_insurance_date', effective_insurance_date)
    .input('insurance_end_date', insurance_end_date)
    .execute('updateEmployee');

  const recordResult = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .input('member_id', profile_id)
    .input('surname', surname)
    .input('forename', forename)
    .input('relationship', relationship)
    .input('date_of_birth', date_of_birth)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('city', city)
    .input('card', card)
    .input('user_status', user_status)
    .input('bank_id', bank_code)
    .input('bank_account_holder', bank_account_holder)
    .input('bank_account_number', bank_account_number)
    .execute('profilesRecord');

  return recordResult;
};

// update the employee details
const insertOrUpdateProfileRecord = async ({
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
  user_status,
  employment_date,
}) => {
  const recordResult = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .input('member_id', member_id)
    .input('surname', surname)
    .input('forename', forename)
    .input('relationship', relationship)
    .input('date_of_birth', date_of_birth)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('city', city)
    .input('card', card)
    .input('user_status', user_status)
    .input('bank_id', bank_code)
    .input('bank_account_holder', bank_account_holder)
    .input('bank_account_number', bank_account_number)
    .input('employment_date', employment_date)
    .execute('insertOrUpdateProfileRecord');

  return recordResult;
};

// update the employee details
const insertProfileRecords = async ({
  request_id,
  family_id,
  profile_id,
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
  relationship,
  user_status,
}) => {
  const recordResult = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .input('member_id', profile_id)
    .input('surname', surname)
    .input('forename', forename)
    .input('relationship', relationship)
    .input('date_of_birth', date_of_birth)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('card', card)
    .input('user_status', user_status)
    .execute('insertProfileRecord');

  return recordResult;
};

// Get all the employees from the company
// const getEmployee = async (id) => {
//   const result = await database.request()
//     .input('id', id)
//     .execute('getEmployeeDetails');
//   return result;
// };

const fetchEmployeeDetails = async (id, deleted_member) => {
  let query;
  if (deleted_member) {
    query = `SELECT 
  usr.user_id,usr.employee_id,usr.role,usr.email_id,usr.employment_date,
  role.role_type,
  combrnch.company_branch,combrnch.company_branch_id,
  req.request_id,
  req.request_status,
  reqstatus.request_status AS status,
  req.assigned_to,
  (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.assigned_to
  ) AS assignee_role,
  req.request_createdby,
  (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_createdby
  ) AS request_creater_role,
  req.request_submitedby,
  (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_submitedby
  ) AS request_submiter_role,
  req.request_confirmedby,
  (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_confirmedby
  ) AS request_confirmer_role,
  prof.profile_id AS member_id,prof.family_id,prof.forename,prof.surname,prof.date_of_birth,prof.relationship,prof.child,prof.user_gender,prof.is_mauritian,prof.nic_no,
  prof.passport_no,prof.marital_status,prof.phone_no_home,prof.phone_no_mobile,prof.phone_no_office,prof.address_1,prof.address_2,prof.is_pensioner,prof.card,prof.user_status,
  banklist.bank_code,banklist.bank_name,banklist.account_no_length,
  usrbank.bank_account_holder,usrbank.bank_account_number,
  ins.effective_insurance_date,
  prof.city AS city_id,
  (SELECT city_name from tbl_city WHERE city_id = prof.city) AS city,
  (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 1) AS birth_certificate_key,
  (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 2) AS nic_key,
  (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 9) AS pay_roll_key
  FROM tbl_users usr 
  LEFT JOIN tbl_roles role ON role.role_id = usr.role
  LEFT JOIN tbl_profiles prof ON prof.family_id = usr.user_id 
  LEFT JOIN tbl_employees emp ON emp.user_id = usr.user_id
  LEFT JOIN tbl_company_branches combrnch ON combrnch.company_branch_id = emp.company_id
  LEFT JOIN tbl_user_bank_details usrbank ON usrbank.user_id = usr.user_id
  LEFT JOIN tbl_bank_list banklist ON banklist.bank_code = usrbank.bank_id
  LEFT JOIN tbl_insurance_details ins ON ins.member_id = prof.profile_id 
  LEFT JOIN tbl_requests req ON req.member_id = prof.profile_id AND req.request_type = ${requestType.ADD_MEMBER}
  LEFT JOIN tbl_request_status reqstatus ON reqstatus.request_status_id=req.request_status
  WHERE usr.user_id = ${deleted_member} AND prof.relationship = 'PRIMARY'`;
  } else {
    query = `SELECT 
    usr.user_id,usr.employee_id,usr.role,usr.email_id,usr.employment_date,
    role.role_type,
    combrnch.company_branch,combrnch.company_branch_id,
    req.request_id,
    req.request_status,
    reqstatus.request_status AS status,
    req.assigned_to,
    (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
    (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
    (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.assigned_to
    ) AS assignee_role,
    req.request_createdby,
    (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
    (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
    (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_createdby
    ) AS request_creater_role,
    req.request_submitedby,
    (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
    (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
    (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_submitedby
    ) AS request_submiter_role,
    req.request_confirmedby,
    (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
    (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
    (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_confirmedby
    ) AS request_confirmer_role,
    prof.profile_id AS member_id,prof.family_id,prof.forename,prof.surname,prof.date_of_birth,prof.relationship,prof.child,prof.user_gender,prof.is_mauritian,prof.nic_no,
    prof.passport_no,prof.marital_status,prof.phone_no_home,prof.phone_no_mobile,prof.phone_no_office,prof.address_1,prof.address_2,prof.is_pensioner,prof.card,prof.user_status,
    banklist.bank_code,banklist.bank_name,banklist.account_no_length,
    usrbank.bank_account_holder,usrbank.bank_account_number,
    ins.effective_insurance_date,
    prof.city AS city_id,
    (SELECT city_name from tbl_city WHERE city_id = prof.city) AS city,
    (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 1) AS birth_certificate_key,
    (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 2) AS nic_key,
    (SELECT TOP 1 document_key FROM tbl_uploaded_documents WHERE member_id = prof.profile_id AND document_type = 9) AS pay_roll_key
    FROM tbl_users usr 
    LEFT JOIN tbl_roles role ON role.role_id = usr.role
    LEFT JOIN tbl_profiles prof ON prof.family_id = usr.user_id  AND prof.user_status != 'DELETED'
    LEFT JOIN tbl_employees emp ON emp.user_id = usr.user_id
    LEFT JOIN tbl_company_branches combrnch ON combrnch.company_branch_id = emp.company_id
    LEFT JOIN tbl_user_bank_details usrbank ON usrbank.user_id = usr.user_id
    LEFT JOIN tbl_bank_list banklist ON banklist.bank_code = usrbank.bank_id
    LEFT JOIN tbl_insurance_details ins ON ins.member_id = prof.profile_id 
    LEFT JOIN tbl_requests req ON req.member_id = prof.profile_id AND req.request_type = ${requestType.ADD_MEMBER}
    LEFT JOIN tbl_request_status reqstatus ON reqstatus.request_status_id=req.request_status
    WHERE usr.user_id = ${id} AND prof.relationship = 'PRIMARY'`;
  }

  return await database.request().query(query);
};

const fetchEmployeeById = async (id) => {
  const query = ` SELECT * from tbl_profiles  WHERE family_id = ${id}  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

// Get all the employees from the company
const getEmployeeForm = async (id) => {
  const result = await database.request()
    .input('id', id)
    .execute('getEmployeeForm');
  return result;
};

// Get roles
const getRoles = async () => {
  const query = 'SELECT * FROM tbl_roles';
  return await database.request().query(query);
};

const deleteUserById = async (userId) => {
  const query = `DELETE FROM tbl_questionnarie_answers WHERE family_id=${userId};
  DELETE FROM tbl_employees WHERE user_id=${userId}; 
  DELETE FROM tbl_users WHERE user_id=${userId};
  DELETE FROM tbl_requests WHERE family_id=${userId};`;
  // DELETE FROM tbl_policy_records WHERE family_id=${userId};`;
  // const query = `DELETE FROM tbl_users WHERE user_id=${userId}`
  return await database.request().query(query);
};

const removeUser = async (user_id) => {
  const query = `DELETE FROM tbl_questionnarie_answers WHERE family_id=${user_id};DELETE FROM tbl_employees WHERE user_id=${user_id}; DELETE FROM tbl_users WHERE user_id=${user_id}`;
  // const query = `DELETE FROM tbl_users WHERE user_id=${userId}`
  return await database.request().query(query);
};

// Delete employee
const deleteemployee = async (user_id) => {
  const query = `DELETE FROM tbl_employees WHERE user_id = ${user_id}`;
  return await database.request().query(query);
};

// Search main member using company name,nic number,passport number and forename
// const getMainMemberBySearch = async (search) => {
//   search = JSON.parse(JSON.stringify(search));
//   let cond = '';
//   let keyValues;
//   let keysOfObject = [];
//   keysOfObject = Object.keys(search);
//   for (let i = 0; i < keysOfObject.length; i++) {
//     if (i !== keysOfObject.length - 1) {
//       keyValues = search[`${keysOfObject[i]}`];
//       if (keysOfObject[i] === 'company_branch') {
//         cond += `brnch.${keysOfObject[i]} LIKE '%${keyValues}%' AND `;
//       } else {
//         cond += `prof.${keysOfObject[i]} LIKE '%${keyValues}%' AND `;
//       }
//       // cond += `${keysOfObject[i]} LIKE '%${keyValues}%' AND `;
//     } else {
//       keyValues = search[`${keysOfObject[i]}`];
//       if (keysOfObject[i] === 'company_branch') {
//         cond += `brnch.${keysOfObject[i]} LIKE '%${keyValues}%' AND prof.relationship='PRIMARY'`;
//       } else {
//         cond += `prof.${keysOfObject[i]} LIKE '%${keyValues}%' AND prof.relationship='PRIMARY'`;
//       }
//     }
//   }
//   if ('company_branch' in search) {
//     const query = `SELECT prof.profile_id as member_id,prof.family_id,prof.forename,prof.surname,prof.date_of_birth,prof.relationship,brnch.company_branch
//     FROM tbl_company_branches brnch
//     JOIN tbl_employees emp ON emp.company_id=brnch.company_branch_id
//     JOIN tbl_users usr ON usr.user_id = emp.user_id
//     JOIN tbl_profiles prof ON prof.family_id=usr.user_id  AND prof.user_status != 'DELETED'
//     WHERE ${cond}`;
//     console.log('COMPANY QUERY', query);
//     return await database.request().query(query);
//   } else {
//     // const query = `SELECT prof.profile_id as member_id,prof.family_id,prof.forename,prof.surname,prof.date_of_birth,prof.relationship
//     // FROM tbl_profiles prof WHERE ${cond}`;
//     const query = `SELECT prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,
//     (SELECT COUNT(*) from tbl_employees where role=4) AS employee_Count,
//     (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
//     ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
//     (SELECT COUNT(*) from tbl_insurance_details where family_id = emp.user_id ) AS insurance_count,
//     pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
//     req.request_type,req.request_id,req.request_status,
//     reqstatus.request_status AS status,
//     req.assigned_to,
//     (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
//     (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
//     (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
//     (SELECT role.role_type
//       FROM tbl_users usr
//       JOIN tbl_roles role ON role.role_id = usr.role
//       WHERE usr.user_id = req.assigned_to
//     ) AS assignee_role,
//     req.request_createdby,
//     (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
//     (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
//     (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
//     (SELECT role.role_type
//       FROM tbl_users usr
//       JOIN tbl_roles role ON role.role_id = usr.role
//       WHERE usr.user_id = req.request_createdby
//     ) AS request_creater_role,
//     req.request_submitedby,
//     (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
//     (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
//     (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
//     (SELECT role.role_type
//       FROM tbl_users usr
//       JOIN tbl_roles role ON role.role_id = usr.role
//       WHERE usr.user_id = req.request_submitedby
//     ) AS request_submiter_role,
//     req.request_confirmedby,
//     (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
//     (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
//     (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
//     (SELECT role.role_type
//       FROM tbl_users usr
//       JOIN tbl_roles role ON role.role_id = usr.role
//       WHERE usr.user_id = req.request_confirmedby
//     ) AS request_confirmer_role,
//     emp.role,emp.company_id,
//     usr.employee_id,
//     basic.plan_name as cover_details,
//     part1.plan_name as cover_details,
//     part2.plan_name as cover_details
//     from tbl_employees emp
//     JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY' AND prof.user_status != 'DELETED'
//     LEFT JOIN tbl_insurance ins ON ins.family_id = emp.user_id
//     LEFT JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id AND insdetail.member_id =prof.profile_id
//     LEFT JOIN tbl_policy_details pol ON pol.family_id = emp.user_id AND pol.member_id=prof.profile_id
//     LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = 'ADD MEMBER'
//     LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
//     LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
//     LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
//     LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
//     LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
//     WHERE ${cond}
//     ORDER BY usr.user_id DESC`;
//     console.log('WITHOUT COMPANY QUERY', query);
//     return await database.request().query(query);
//   }
// };

const profileSearch = async (search, page) => {
  let cond = '';
  let cond1 = '';
  search = JSON.parse(JSON.stringify(search));
  if (search.request_status) {
    cond1 = `AND req.request_status = ${search.request_status}`;
  }
  if (typeof page === 'object') {
    page = JSON.parse(JSON.stringify(page));
    const keysAndValues = Object.entries(page);
    for (let i = 0; i < keysAndValues.length; i++) {
      if (i === 0) {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `ORDER BY emp.id DESC OFFSET ${keysAndValues[i][j]} ROWS`;
          }
        }
      } else {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `${cond} FETCH NEXT ${keysAndValues[i][j]} ROWS ONLY`;
          }
        }
      }
    }
  }
  const query = `SELECT prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.nic_no,prof.passport_no,
    (SELECT COUNT(*) from tbl_employees where role=4) AS employee_Count,
    (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
    ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
    (SELECT COUNT(*) from tbl_insurance_details insurance
    JOIN tbl_profiles profile ON profile.profile_id = insurance.member_id AND  profile.user_status != 'DELETED'
    where insurance.family_id = emp.user_id ) AS insurance_count,
    pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
    reqtypes.request_type, reqtypes.request_type_id,req.request_id,req.request_status,
    reqstatus.request_status AS status,
    req.assigned_to,
    (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
    (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
    (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.assigned_to
    ) AS assignee_role,
    req.request_createdby,
    (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
    (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
    (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_createdby
    ) AS request_creater_role,
    req.request_submitedby,
    (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
    (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
    (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_submitedby
    ) AS request_submiter_role,
    req.request_confirmedby,
    (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
    (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
    (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
    (SELECT role.role_type 
      FROM tbl_users usr 
      JOIN tbl_roles role ON role.role_id = usr.role 
      WHERE usr.user_id = req.request_confirmedby
    ) AS request_confirmer_role,
    emp.role,emp.company_id,
    usr.employee_id,
    basic.plan_name as cover_details,
    part1.plan_name as cover_details,
    part2.plan_name as cover_details
    from tbl_employees emp
    JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY' AND prof.user_status != 'DELETED'
    LEFT JOIN tbl_insurance ins ON ins.family_id = emp.user_id
    LEFT JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id AND insdetail.member_id =prof.profile_id
    LEFT JOIN tbl_policy_details pol ON pol.family_id = emp.user_id AND pol.member_id=prof.profile_id
    LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = ${requestType.ADD_MEMBER} ${cond1}
    LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
    LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
    LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
    LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
    LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
    LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
    WHERE (prof.forename+prof.surname) LIKE '%${search.data}%' OR (prof.forename+' '+prof.surname) LIKE '%${search.data}%' OR prof.nic_no LIKE '%${search.data}%' OR prof.passport_no LIKE '%${search.data}%' ${cond}`;

  return await database.request().query(query);
};

// WHERE prof.forename LIKE '%${search}%' OR prof.surname LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%' OR (prof.forename+prof.surname) LIKE '%${search}%' ${cond}`;

const companySearch = async (search, page) => {
  let cond = '';
  let cond1 = '';
  search = JSON.parse(JSON.stringify(search));
  if (search.request_status) {
    cond1 = `AND req.request_status = ${search.request_status}`;
  }
  if (typeof page === 'object') {
    page = JSON.parse(JSON.stringify(page));
    const keysAndValues = Object.entries(page);
    for (let i = 0; i < keysAndValues.length; i++) {
      if (i === 0) {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `ORDER BY brnch.company_branch OFFSET ${keysAndValues[i][j]} ROWS`;
          }
        }
      } else {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `${cond} FETCH NEXT ${keysAndValues[i][j]} ROWS ONLY`;
          }
        }
      }
    }
  }
  const query = `SELECT brnch.company_branch,prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.nic_no,prof.passport_no,
  (SELECT COUNT(*) from tbl_employees emp where emp.role=4 AND emp.company_id =  brnch.company_branch_id) AS employee_Count,
  (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
  ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
  (SELECT COUNT(*) from tbl_insurance_details where family_id = emp.user_id ) AS insurance_count,
  pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
  reqtypes.request_type, reqtypes.request_type_id,req.request_id,req.request_status,
  reqstatus.request_status AS status,
  req.assigned_to,
  (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.assigned_to
  ) AS assignee_role,
  req.request_createdby,
  (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_createdby
  ) AS request_creater_role,
  req.request_submitedby,
  (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_submitedby
  ) AS request_submiter_role,
  req.request_confirmedby,
  (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_confirmedby
  ) AS request_confirmer_role,
  emp.role,emp.company_id,
  usr.employee_id,
  basic.plan_name as cover_details,
  part1.plan_name as cover_details,
  part2.plan_name as cover_details
  FROM tbl_company_branches brnch
  JOIN tbl_employees emp ON emp.company_id=brnch.company_branch_id
  JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY' AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_insurance ins ON ins.family_id = emp.user_id
  LEFT JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id AND insdetail.member_id =prof.profile_id
  LEFT JOIN tbl_policy_details pol ON pol.family_id = emp.user_id AND pol.member_id=prof.profile_id
  LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = ${requestType.ADD_MEMBER}
  LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
  LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  WHERE brnch.company_branch LIKE '%${search}%' ${cond}`;
  return await database.request().query(query);
};

// FROM tbl_company_branches brnch
// JOIN tbl_employees emp ON emp.company_id=brnch.company_branch_id
// JOIN tbl_users usr ON usr.user_id = emp.user_id
// JOIN tbl_profiles prof ON prof.family_id=usr.user_id  AND prof.user_status != 'DELETED'

// Get User's Company Details
const getUserCompany = async (family_id) => {
  const query = `SELECT brnch.company_branch_id as company_id, brnch.company_branch as company_name FROM tbl_employees emp
  JOIN tbl_company_branches brnch on brnch.company_branch_id = emp.company_id  WHERE emp.user_id=${family_id}`;
  return await database.request().query(query);
};

// Get all the employee details
const getAllDepandants = async (family_id, deleted) => {
  let query;
  if (deleted) {
    query = `  SELECT 
    prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.passport_no,prof.nic_no,prof.is_mauritian,prof.date_of_birth,prof.user_gender,prof.child,prof.card,
    ins.policy_no,insdet.effective_insurance_date,insdet.insurance_end_date,
    pol.plan_cover_id,pol.rgpa_basic,pol.top_up_part1,pol.top_up_part2,
    reqtypes.request_type, reqtypes.request_type_id,reqs.request_id,reqs.request_status,
    reqstatus.request_status AS status,
    basic.plan_name as cover_details,
    part1.plan_name as cover_details,
    part2.plan_name as cover_details
    FROM tbl_profiles prof
    LEFT JOIN tbl_insurance ins ON ins.family_id = prof.family_id
    JOIN tbl_insurance_details insdet ON insdet.insurance_id = ins.insurance_id AND insdet.family_id = prof.family_id AND insdet.member_id=prof.profile_id
    LEFT JOIN tbl_policy_details pol ON pol.family_id = prof.family_id AND pol.member_id=prof.profile_id
    LEFT JOIN tbl_requests req ON req.request_type IN (${requestType.ADD_MEMBER},${requestType.ADD_DEPENDANT}) AND req.family_id=prof.family_id
    JOIN tbl_request_forms fr ON  fr.member_id = prof.profile_id AND fr.request_id=req.request_id
    LEFT JOIN tbl_requests reqs ON reqs.request_id = fr.request_id AND reqs.family_id = fr.family_id
    LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
    LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
    LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
    LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = reqs.request_status 
    LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
    WHERE prof.family_id=${family_id}  AND prof.relationship != 'PRIMARY' AND prof.user_status = 'DELETED'`;
  } else {
    query = `  SELECT 
    prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.passport_no,prof.nic_no,prof.is_mauritian,prof.date_of_birth,prof.user_gender,prof.child,prof.card,
    ins.policy_no,insdet.effective_insurance_date,insdet.insurance_end_date,
    pol.plan_cover_id,pol.rgpa_basic,pol.top_up_part1,pol.top_up_part2,
    reqtypes.request_type, reqtypes.request_type_id,reqs.request_id,reqs.request_status,
    reqstatus.request_status AS status,
    basic.plan_name as cover_details,
    part1.plan_name as cover_details,
    part2.plan_name as cover_details
    FROM tbl_profiles prof
    LEFT JOIN tbl_insurance ins ON ins.family_id = prof.family_id
    JOIN tbl_insurance_details insdet ON insdet.insurance_id = ins.insurance_id AND insdet.family_id = prof.family_id AND insdet.member_id=prof.profile_id
    LEFT JOIN tbl_policy_details pol ON pol.family_id = prof.family_id AND pol.member_id=prof.profile_id
    LEFT JOIN tbl_requests req ON req.request_type IN (${requestType.ADD_MEMBER},${requestType.ADD_DEPENDANT}) AND req.family_id=prof.family_id
    JOIN tbl_request_forms fr ON  fr.member_id = prof.profile_id AND fr.request_id=req.request_id
    LEFT JOIN tbl_requests reqs ON reqs.request_id = fr.request_id AND reqs.family_id = fr.family_id
    LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
    LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
    LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
    LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = reqs.request_status 
    LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
    WHERE prof.family_id=${family_id}  AND prof.relationship != 'PRIMARY' AND prof.user_status != 'DELETED'`;
  }
  return await database.request().query(query);
};

// Get all the employee details
const getPrimaryUser = async (family_id) => {
  const query = `SELECT 
  prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.passport_no,prof.nic_no,prof.is_mauritian,prof.date_of_birth,prof.user_gender,prof.child,prof.card,
  ins.insurance_id,insdet.effective_insurance_date,insdet.insurance_end_date,ins.policy_no,ins.insurance_status,
  pol.plan_cover_id,pol.rgpa_basic,pol.top_up_part1,pol.top_up_part2,
  reqstatus.request_status,  reqtypes.request_type,reqtypes.request_type_id,req.request_id,
  basic.plan_name as cover_details,
  part1.plan_name as cover_details,
  part2.plan_name as cover_details
  from tbl_profiles prof
  LEFT JOIN tbl_insurance ins ON ins.family_id = ${family_id}
  LEFT JOIN tbl_insurance_details insdet ON insdet.insurance_id = ins.insurance_id AND insdet.member_id =prof.profile_id
  LEFT JOIN tbl_policy_details pol ON pol.family_id = ${family_id} AND pol.member_id=prof.profile_id
  LEFT JOIN tbl_requests req ON req.family_id = ${family_id} AND req.member_id=prof.profile_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
  LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  WHERE prof.family_id=${family_id} AND prof.relationship = 'PRIMARY'  AND prof.user_status != 'DELETED'`;

  return await database.request().query(query);
};
// Get all the employee details
const getAllEmployee = async (emp, page, search) => {
  let cond = '';
  let cond1 = '';
  let count = '';

  if (emp.company_id) {
    cond1 = `AND company_id = ${emp.company_id}`;
  }

  if (typeof emp === 'object') {
    emp = JSON.parse(JSON.stringify(emp));
    const keysAndValues = Object.entries(emp);
    for (let i = 0; i < keysAndValues.length; i++) {
      if (i === 0) {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j === 0) {
            cond = ` WHERE ${'emp'}.${keysAndValues[i][j]}`;
            count = ` WHERE ${'emp'}.${keysAndValues[i][j]}`;
          } else {
            cond = `${cond} = ${keysAndValues[i][j]}`;
            count = `${count} = ${keysAndValues[i][j]}`;
          }
        }
      } else {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j === 0) {
            cond = `${cond} AND ${'emp'}.${keysAndValues[i][j]}`;
            count = `${count} AND ${'emp'}.${keysAndValues[i][j]}`;
          } else {
            cond = `${cond} = ${keysAndValues[i][j]}`;
            count = `${count} = ${keysAndValues[i][j]}`;
          }
        }
      }
    }
  }
  if (search) {
    if (cond !== '') {
      cond = `${cond} AND ((prof.forename+prof.surname) LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%')`;
      count = `${count} AND ((prof.forename+prof.surname) LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%')`;
    } else {
      cond = `WHERE ((prof.forename+prof.surname) LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%')`;
      count = `WHERE ((prof.forename+prof.surname) LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%')`;
    }
  }
  if (typeof page === 'object') {
    page = JSON.parse(JSON.stringify(page));
    const keysAndValues = Object.entries(page);
    for (let i = 0; i < keysAndValues.length; i++) {
      if (i === 0) {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `${cond} ORDER BY usr.user_id DESC OFFSET ${keysAndValues[i][j]} ROWS`;
          }
        }
      } else {
        for (let j = 0; j < keysAndValues[i].length; j++) {
          if (j !== 0) {
            cond = `${cond} FETCH NEXT ${keysAndValues[i][j]} ROWS ONLY`;
          }
        }
      }
    }
  }

  const query = `SELECT prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.city AS city_id,
  (SELECT city_name from tbl_city WHERE city_id = prof.city) AS city,
  (SELECT COUNT(*) from tbl_employees emp ${count}) AS employee_Count,
  (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
  ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
  (SELECT COUNT(*) from tbl_insurance_details insurance
  JOIN tbl_profiles profile ON profile.profile_id = insurance.member_id AND  profile.user_status != 'DELETED'
  where insurance.family_id = emp.user_id ) AS insurance_count,  pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
  reqtypes.request_type,reqtypes.request_type_id,req.request_id,req.request_status,
  reqstatus.request_status AS status,
  req.assigned_to,
  (select forename from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = req.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = req.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.assigned_to
  ) AS assignee_role,
  req.request_createdby,
  (select forename from tbl_profiles where family_id =  req.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = req.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = req.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_createdby
  ) AS request_creater_role,
  req.request_submitedby,
  (select forename from tbl_profiles where family_id =  req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = req.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = req.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_submitedby
  ) AS request_submiter_role,
  req.request_confirmedby,
  (select forename from tbl_profiles where family_id =  req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = req.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = req.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = req.request_confirmedby
  ) AS request_confirmer_role,
  emp.role,emp.company_id,
  usr.employee_id,usr.email_id,
  basic.plan_name as cover_details,
  part1.plan_name as cover_details,
  part2.plan_name as cover_details
  from tbl_employees emp
  JOIN tbl_profiles prof ON prof.family_id = emp.user_id AND prof.relationship = 'PRIMARY' AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_insurance ins ON ins.family_id = emp.user_id
  LEFT JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id AND insdetail.member_id =prof.profile_id
  LEFT JOIN tbl_policy_details pol ON pol.family_id = emp.user_id AND pol.member_id=prof.profile_id
  LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = ${requestType.ADD_MEMBER}
  LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
  LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  ${cond}
  `;

  // console.log(query);
  return await database.request().query(query);
};

// Get the Employees depends on Role
const getEmployeeByRoleId = async (roleId) => {
  // const query = `SELECT role.role_type,emp.*,prof.*
  // FROM tbl_employees emp
  // JOIN tbl_roles role on role.role_id = emp.role
  // JOIN tbl_profiles prof on prof.family_id=emp.user_id
  // WHERE emp.role=${roleId}`;
  const query = `SELECT role.role_type,prof.* 
  FROM tbl_users usr 
  JOIN tbl_roles role on role.role_id = usr.role
  JOIN tbl_profiles prof on prof.family_id=usr.user_id
  WHERE usr.role=${roleId} AND prof.relationship = 'PRIMARY'  AND prof.user_status != 'DELETED'`;
  return await database.request().query(query);
};

// Change Password using user id
const changePasswordById = async (user) => {
  const query = `UPDATE tbl_users
  SET password = '${user.password}',is_verified=1
  WHERE user_id = ${user.id}`;
  return await database.request().query(query);
};

// Change Password using user id
const updateVerified = async ({ email_id, otp }) => {
  const query = `UPDATE tbl_otps
  SET verified = 1, otp_updated_on= GETDATE()
  WHERE email_id = '${email_id}';
  update tbl_users SET is_verified=0 where email_id='${email_id}'`;
  return await database.request().query(query);
};

// Change Password using user id
const forgotPassword = async ({ password, email_id }) => {
  const query = `UPDATE tbl_users
  SET password = '${password}',is_verified=0
  WHERE email_id = ${email_id}`;
  return await database.request().query(query);
};

// Get Users policy,insurance,profile and request ids
const getIds = async (user_id) => {
  const query = `SELECT
  usr.user_id AS family_id,usr.role AS role_id,
  prof.profile_id,
  pol.plan_cover_id AS policy_id,
  req.request_id,req.request_status AS request_status_id,
  reqstatus.request_status,
  ins.insurance_id
  FROM tbl_users usr
  JOIN tbl_profiles prof ON prof.family_id = usr.user_id  AND prof.user_status != 'DELETED'
  JOIN tbl_policy_details pol ON pol.member_id = prof.profile_id
  JOIN tbl_requests req ON req.member_id = prof.profile_id
  JOIN tbl_request_status reqstatus ON reqstatus.request_status_id= req.request_status
  JOIN tbl_insurance_details ins ON ins.member_id = prof.profile_id
  WHERE usr.user_id = ${user_id} AND prof.relationship = 'PRIMARY'`;
  return await database.request().query(query);
};

// Update User Table Details

const updateUserDetails = async (user, id) => {
  const query = await QueryGenerator.update('tbl_users', user, { user_id: id });
  return await database.request().query(query);
};

// Get rgpa basic plans
const getAllTypes = async () => {
  const query = 'SELECT * FROM tbl_roles; SELECT * FROM tbl_request_status;SELECT * FROM tbl_document_type;SELECT * FROM tbl_request_types;';
  return await database.request().query(query);
};

const getHr = async (company_id, role) => {
  const query = `SELECT user_id FROM tbl_employees WHERE company_id = ${company_id} AND role IN (${role})`;
  return await database.request().query(query);
};

const insertOtp = async ({ user_id, email_id, otp }) => {
  const query = `INSERT INTO tbl_otps
    (
      user_id,
        email_id,
        otp,
        verified
    )
    VALUES
    (
        ${user_id},
        '${email_id}',
        '${otp}',
        0
    )`;
  return await database.request().query(query);
};

// Insert the employee details
const insertProfiles = async ({
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
}) => {
  const result = await database.request()
    .input('family_id', family_id)
    .input('company_id', company_id)
    .input('surname', surname)
    .input('forename', forename)
    .input('date_of_birth', date_of_birth)
    .input('relationship', relationship)
    .input('child', child)
    .input('user_gender', user_gender)
    .input('is_mauritian', is_mauritian)
    .input('nic_no', nic_no)
    .input('passport_no', passport_no)
    .input('marital_status', marital_status)
    .input('phone_no_home', phone_no_home)
    .input('phone_no_mobile', phone_no_mobile)
    .input('phone_no_office', phone_no_office)
    .input('address_1', address_1)
    .input('address_2', address_2)
    .input('is_pensioner', is_pensioner)
    .input('card', card)
    .input('effective_insurance_date', effective_insurance_date)
    .input('request_type', request_type)
    .input('policy_no', policy_no)
    .input('user_status', user_status)
    .execute('createProfiles');

  return result;
};

const getAllSubHr = async () => {
  const query = `select usr.user_id,usr.email_id,min(emp.company_id) AS company_id from tbl_users usr
  join tbl_employees emp ON emp.user_id = usr.user_id AND emp.role = 2
  where usr.user_id < 124
  GROUP BY usr.user_id,usr.email_id;`;
  return await database.request().query(query);
};

const checkUserRole = async (user) => {
  const query = `SELECT * FROM tbl_employees
  WHERE user_id = ${user.user_id} AND role = ${user.role}`;
  console.log(query);
  return await database.request().query(query);
};

const getEmployeeByRequestId = async (request_id) => {
  const query = `SELECT
  usr.employee_id,usr.employment_date,usr.email_id,
  city.city_name,city.city_id,
  compbrnch.company_branch,compbrnch.company_branch_id,
  profrec.member_id AS member_id,profrec.family_id,profrec.forename,profrec.surname,profrec.date_of_birth,profrec.relationship,profrec.child,profrec.user_gender,profrec.is_mauritian,profrec.nic_no,
  profrec.passport_no,profrec.marital_status,profrec.phone_no_home,profrec.phone_no_mobile,profrec.phone_no_office,profrec.address_1,profrec.address_2,profrec.is_pensioner,profrec.card,profrec.user_status,
  insrec.effective_insurance_date,
  banklist.bank_code,banklist.bank_name,banklist.account_no_length,
  usrbankrec.bank_account_holder,usrbankrec.bank_account_number
  FROM tbl_profile_records profrec
  JOIN tbl_users usr ON usr.user_id = profrec.family_id
  LEFT JOIN tbl_user_bank_records usrbankrec ON usrbankrec.family_id = profrec.family_id AND usrbankrec.request_id = ${request_id}
  LEFT JOIN tbl_bank_list banklist ON banklist.bank_code = usrbankrec.bank_id
  LEFT JOIN tbl_city city ON city.city_id = profrec.city 
  LEFT JOIN tbl_insurance_records insrec ON insrec.family_id = profrec.family_id AND insrec.request_id = ${request_id}
  LEFT JOIN tbl_employee_records emprec ON emprec.user_id = profrec.family_id AND emprec.request_id = ${request_id}
  LEFT JOIN tbl_company_branches compbrnch ON compbrnch.company_branch_id = emprec.company_id
  WHERE profrec.request_id = ${request_id} AND profrec.user_status != 'DELETED'`;
  console.log(query);
  return await database.request().query(query);
};

const insertSubHR = async (hr) => {
  const query = `INSERT INTO tbl_employees
  (
    role,
    company_id,
    user_id
  )
  VALUES
  (
    2,
    ${hr.company_id},
    ${hr.family_id}
  )`;
  return await database.request().query(query);
};

module.exports = {
  checkEmailById,
  checkPasswordById,
  checkEmailAndPassword,
  deleteUserById,
  getEmployee,
  updateEmployeeDetails,
  insertEmployee,
  getEmployeeForm,
  getUserCompany,
  getAllEmployee,
  getRoles,
  getEmployeeByRoleId,
  changePasswordById,
  getAllDepandants,
  getPrimaryUser,
  fetchEmployeeDetails,
  getIds,
  updateUserDetails,
  getAllTypes,
  getHr,
  getAllAdmins,
  fetchEmployeeById,
  forgotPassword,
  insertOtp,
  checkOTP,
  updateVerified,
  getUserByEmail,
  profileSearch,
  companySearch,
  checkPrimaryUser,
  insertProfiles,
  getAllSubHr,
  checkById,
  removeUser,
  deleteemployee,
  insertProfileRecords,
  checkUserRole,
  addEmployee,
  insertOrUpdateProfileRecord,
  getEmployeeByRequestId,
  insertSubHR,
};
