/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { Console } = require('winston/lib/winston/transports');
const { request } = require('http');
const { query } = require('mssql');
const { database } = require('../utils/database');

const {
  Role, requestStatus, requestType, userRelationship,
} = require('../utils/role');

const QueryGenerator = require('../generators/query.generate');

// Get rgpa basic plans
const updateRequestStatus = async (request) => {
  let query;

  if (request.request_status === requestStatus.HR_APPROVAL) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},date_request_submitted= GETDATE(),request_updated_on= GETDATE(),request_createdby=${request.user_id},assigned_to=${request.assigned_to}
    WHERE request_id = ${request.request_id} AND request_status!=8 AND request_status!=9`;
  } else if (request.request_status === requestStatus.SWAN_APPROVAL) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},request_submitedby= ${request.user_id},request_updated_on= GETDATE(),assigned_to=NULL
    WHERE request_id = ${request.request_id} AND request_status!=8 AND request_status!=9`;
  } else if (request.request_status === requestStatus.APPROVED) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},request_confirmedby= ${request.user_id},date_request_confirmed= GETDATE(),request_updated_on= GETDATE(),assigned_to=NULL
    WHERE request_id = ${request.request_id} AND request_status!=8 AND request_status!=9`;
  } else if (request.request_status === requestStatus.REJECTED) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},request_confirmedby= ${request.user_id},date_request_confirmed= GETDATE(),request_updated_on= GETDATE(),assigned_to=NULL
    WHERE request_id = ${request.request_id} AND request_status !=8 AND request_status !=9`;
  } else if (request.request_status === requestStatus.BACK_TO_HR) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},requested_by= ${request.user_id},request_updated_on= GETDATE(),assigned_to=NULL
    WHERE request_id = ${request.request_id} AND request_status !=8 AND request_status !=9`;
  } else if (request.request_status === requestStatus.BACK_TO_EMPLOYEE) {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},requested_by= ${request.user_id},request_updated_on= GETDATE(),assigned_to=${request.assigned_to}
    WHERE request_id = ${request.request_id} AND request_status !=8 AND request_status !=9`;
  } else {
    query = `UPDATE tbl_requests SET request_status=${request.request_status},request_updated_on= GETDATE()
    WHERE request_id = ${request.request_id} AND request_status !=8 AND request_status !=9`;
  }

  return await database.request().query(query);
};

const updateInsuranceDetails = async ({
  policy_no, insurance_status, family_id, member_id,
}) => {
  const query = `UPDATE tbl_insurance SET insurance_status= '${insurance_status}', insurance_updated_on = GETDATE()
  WHERE family_id = ${family_id}`;
  return await database.request().query(query);
};

// const reqInfo = async (data) => {
//   let condition = '';
//   if (data.company_branch_id) {
//     condition = condition.concat(` AND company_id IN (${data.company_branch_id})`);
//   }
//   let query;
//   if (data.page_no === undefined || data.count === undefined) {
//     query = `select r.request_id,r.request_type,r.swan_request_to,p.family_id,p.profile_id AS member_id,
//   (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
//   (select forename from tbl_profiles where family_id =  r.assigned_to AND relationship ='PRIMARY') AS assignee_forename,
//   (select surname from tbl_profiles where family_id = r.assigned_to AND relationship ='PRIMARY') AS assignee_surname,
//   (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS status_assignee_forename,
//   (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS status_assignee_surname,
//   r.assigned_to,
//   r.request_status,
//   rs.request_status AS status,
//   surname,
//   forename,
//   r.commented_by as commented_by,
//   r.comments as comments
//   from tbl_requests r inner join tbl_profiles p on r.member_id = p.profile_id
//   inner join tbl_request_status rs on rs.request_status_id = r.request_status where r.request_status = ${data.status.status}`;
//   } else {
//     query = `select r.request_id,r.request_type,r.swan_request_to,p.family_id,p.profile_id AS member_id,
//   (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
//   (select forename from tbl_profiles where family_id =  r.assigned_to AND relationship ='PRIMARY') AS assignee_forename,
//   (select surname from tbl_profiles where family_id = r.assigned_to AND relationship ='PRIMARY') AS assignee_surname,
//   (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS status_assignee_forename,
//   (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS status_assignee_surname,
//   r.assigned_to,
//   r.request_status,
//   rs.request_status AS status,
//   surname,
//   forename,
//   r.commented_by as commented_by,
//   r.comments as comments
//   from tbl_requests r inner join tbl_profiles p on r.member_id = p.profile_id
//   inner join tbl_request_status rs on rs.request_status_id = r.request_status where r.request_status = ${data.status.status}
//   ORDER BY request_id
//   OFFSET ${data.page_no} ROWS
//   FETCH NEXT ${data.count} ROWS ONLY`;
//   }
//   // Get rgpa basic plans
//   return await database.request().query(query);
// };

const reqInfo = async (data) => {
  let query;
  let condition = '';
  if (data.company_branch_id) {
    condition = condition.concat(` AND company_id IN (${data.company_branch_id})`);
  }
  if (data.user_id) {
    condition = condition.concat(` AND r.family_id = ${data.user_id}`);
  }
  if (data.page_no !== undefined && data.count !== undefined) {
    condition = condition.concat(` ORDER BY request_id
    OFFSET ${data.page_no} ROWS
    FETCH NEXT ${data.count} ROWS ONLY`);
  }
  query = `select request_id,reqtypes.request_type,reqtypes.request_type_id,p.family_id,p.profile_id AS member_id,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  (select forename from tbl_profiles where family_id =  r.assigned_to AND relationship ='PRIMARY') AS assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship ='PRIMARY') AS assignee_surname,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS status_assignee_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS status_assignee_surname,
  r.assigned_to,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  company_id,
  surname,
  forename,
  r.request_submitedby,
  r.request_confirmedby
  from tbl_requests r inner join tbl_profiles p on r.member_id = p.profile_id 
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  inner join tbl_request_status rs on rs.request_status_id = r.request_status where r.request_status = ${data.status} AND p.relationship='PRIMARY' ${condition}`;

  // Get rgpa basic plans
  return await database.request().query(query);
};

const reqUserInfo = async (data, role) => {
  let query;
  let condition1 = '';
  let condition2 = '';
  let condition3 = '';
  let condition4 = '';

  if (data.status) {
    if (role === Role.GROUP_HR || role === Role.SUB_HR || role === Role.HR_EXECUTIVE) {
      condition1 = condition1.concat(`where r.request_status IN (${data.status}) AND r.member_id=r.member_id`);
      condition4 = data.status;
    } else if (role === Role.SWAN_ADMIN && (data.status === `${requestStatus.BACK_TO_EMPLOYEE}` || data.status === `${requestStatus.BACK_TO_HR}`)) {
      condition1 = condition1.concat('where r.request_status IN (7,10) AND r.member_id=r.member_id');
      condition4 = '7,10';
    } else {
      // condition1 = condition1.concat(`where r.request_status IN (${data.status}) AND r.member_id=rf.member_id`);
      condition1 = condition1.concat(`where r.request_status IN (${data.status})`);
      condition4 = data.status;
    }
  }
  if (data.company_branch_id) {
    condition2 = condition2.concat(` AND r.company_id IN (${data.company_branch_id})`);
  }
  if (data.user_id) {
    condition2 = condition2.concat(` AND r.family_id = ${data.user_id}`);
  }

  if (data.search) {
    condition2 = condition2.concat(` AND ((p.forename+p.surname) LIKE '%${data.search}%' OR p.nic_no LIKE '%${data.search}%' OR p.passport_no LIKE '%${data.search}%' OR comp.company_branch LIKE '%${data.search}%')`);
  }

  if (data.page_no !== undefined && data.page_count !== undefined) {
    condition3 = condition3.concat(` 
    OFFSET ${data.page_no} ROWS
    FETCH NEXT ${data.page_count} ROWS ONLY`);
  }
  query = `select DISTINCT r.family_id, r.request_id,reqtypes.request_type,reqtypes.request_type_id,p.profile_id AS member_id,
  r.assigned_to,
  comp.company_branch_id,comp.company_branch as company_name,
  (SELECT COUNT(*) from tbl_requests r 
  left join tbl_profiles p on p.profile_id = r.member_id
  left join tbl_company_branches comp on comp.company_branch_id = r.company_id 
   where  r.request_status IN (${condition4}) ${condition2}) AS request_count,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  r.request_created_on AS date_request_created,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  r.date_request_submitted,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  r.date_request_confirmed,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id,
  p.surname,
  p.forename,
  p.nic_no,
  p.passport_no,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r 
  left join tbl_profiles p on p.profile_id = r.member_id
  left join tbl_company_branches comp on comp.company_branch_id = r.company_id 
  left join tbl_request_status rs on rs.request_status_id = r.request_status 
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  ${condition1}${condition2} 
  ORDER BY r.request_id DESC ${condition3}`;
  // Get rgpa basic plans
  // JOIN tbl_request_forms form ON form.request_id = r.request_id
  return await database.request().query(query);
};

const reqCount = async (user_id) => {
  const query = `select (select COUNT(*) from tbl_requests where request_status = 1) as pending_count, 
  (select count(*) from tbl_requests where request_status = 2) as hr_approval_count,
  (select count(*) from tbl_requests  where request_status = 3 ) as swan_approval_count,
  (select count(*) from tbl_requests where request_status = 4 ) as health_admin_count,
  (select count(*) from tbl_requests  where request_status = 5 ) as health_uw_count,
  (select count(*) from tbl_requests  where request_status = 6 ) as health_processer_count,
  ((select count(*) from tbl_requests  where request_status = 7 ) + (select count(*) from tbl_requests  where request_status = 10 )) as back_to_request_count,
  (select count(*) from tbl_requests where request_status = 8) as approved_count,
  (select count(*) from tbl_requests where request_status = 9) as rejected_count,
  (select count(*) from tbl_company_branches) as total_company,
  (select count(*) from tbl_employees e where role = 1) as group_hr_count,
  (select count(*) from tbl_employees e where role = 2) as sub_hr_count,
  (select count(*) from tbl_employees e where role = 3) as hr_excutive_count,
  (select count(*) from tbl_employees e where role = 4) as employee_count,
  (select count(*) from tbl_employees e where role = 5) as swan_admin_count,
  (SELECT 
    COUNT(*)
    FROM tbl_notification_for_user u
    JOIN tbl_notification n ON n.notification_id = u.notification_id
    WHERE u.family_id = ${user_id} AND u.is_read = 0
    AND n.created_at >= cast(dateadd(day, -7, getdate()) as date)) as notificationCount`;

  return await database.request().query(query);
};

const reqCountByCompany = async (company_branch_id, user_id) => {
  const query = `select (select count(*) from tbl_requests where request_status = 1 AND company_id IN (${company_branch_id})) as pending_count, 
  (select count(*) from tbl_requests where request_status = 2 AND company_id IN (${company_branch_id})) as hr_approval_count,
  (select count(*) from tbl_requests where request_status = 3 AND company_id IN (${company_branch_id})) as swan_approval_count,
  (select count(*) from tbl_requests where request_status = 4 AND company_id IN (${company_branch_id})) as health_admin_count,
  (select count(*) from tbl_requests where request_status = 5 AND company_id IN (${company_branch_id})) as health_uw_count,
  (select count(*) from tbl_requests where request_status = 6 AND company_id IN (${company_branch_id})) as health_processer_count,
  ((select count(*) from tbl_requests where request_status = 7 AND company_id IN (${company_branch_id})) + (select count(DISTINCT family_id) from tbl_requests where request_status = 10 AND company_id IN (${company_branch_id}))) as back_to_request_count,
  (select count(*) from tbl_requests where request_status = 8 AND company_id IN (${company_branch_id})) as approved_count,
  (select count(*) from tbl_requests where request_status = 9 AND company_id IN (${company_branch_id})) as rejected_count,
  (select count(*) from tbl_company_branches WHERE company_branch_id IN (${company_branch_id})) as total_company,
  (select count(*) from tbl_employees where role = 1 AND company_id IN (${company_branch_id})) as group_hr_count,
  (select count(*) from tbl_employees where role = 2 AND company_id IN (${company_branch_id})) as sub_hr_count,
  (select count(*) from tbl_employees where role = 3 AND company_id IN (${company_branch_id})) as hr_excutive_count,
  (select count(*) from tbl_employees where role = 4 AND company_id IN (${company_branch_id})) as employee_count,
  (select count(*) from tbl_employees where role = 5 AND company_id IN (${company_branch_id})) as swan_admin_count,
  (SELECT 
    COUNT(*)
    FROM tbl_notification_for_user u
    JOIN tbl_notification n ON n.notification_id = u.notification_id
    WHERE u.family_id = ${user_id} AND u.is_read = 0
    AND n.created_at >= cast(dateadd(day, -7, getdate()) as date)) as notificationCount`;

  return await database.request().query(query);
};

const reqCountByUser = async (user_id) => {
  const query = `select (select count(*) from tbl_requests r where r.request_status = 1 AND r.family_id = ${user_id}) as pending_count, 
  (select count(*) from tbl_requests where request_status = 2 AND family_id = ${user_id}) as hr_approval_count,
  (select count(*) from tbl_requests where request_status = 3 AND family_id = ${user_id}) as swan_approval_count,
  (select count(*) from tbl_requests where request_status = 4 AND family_id = ${user_id}) as health_admin_count,
  (select count(*) from tbl_requests where request_status = 5 AND family_id = ${user_id}) as health_uw_count,
  (select count(*) from tbl_requests where request_status = 6 AND family_id = ${user_id}) as health_processer_count,
  ((select count(*) from tbl_requests where request_status = 10 AND family_id = ${user_id})) as back_to_request_count,
  (select count(*) from tbl_requests where request_status = 8 AND family_id = ${user_id}) as approved_count,
  (select count(*) from tbl_requests where request_status = 9 AND family_id = ${user_id}) as rejected_count,
  (SELECT 
    COUNT(*)
    FROM tbl_notification_for_user u
    JOIN tbl_notification n ON n.notification_id = u.notification_id
    WHERE u.family_id = ${user_id} AND u.is_read = 0
    AND n.created_at >= cast(dateadd(day, -7, getdate()) as date)) as notificationCount`;

  return await database.request().query(query);
};

const getStatus = async () => {
  const query = 'SELECT * FROM tbl_request_status';
  return await database.request().query(query);
};

const getRequestTypeId = async (request_type) => {
  const query = `SELECT * FROM tbl_request_types where request_type = '${request_type}'`;
  return await database.request().query(query);
};

// const assignedRequestById = async (request) => {
//   const query = `UPDATE tbl_requests
//   SET assigned_to = ${request.user_id}
//   WHERE request_id = ${request.requestId}`;
//   return await database.request().query(query);
// };

const updateRequest = async (request, id) => {
  const query = await QueryGenerator.update('tbl_requests', request, { request_id: id });
  return await database.request().query(query);
};

const deleteDependantRequestById = async (reqest, requestId) => {
  const query = await QueryGenerator.update('tbl_requests', reqest, { request_id: requestId });
  return await database.request().query(query);
};

const requestsByUser = async (family_id) => {
  const query = `select request_id,reqtypes.request_type,reqtypes.request_type_id,p.family_id,p.profile_id AS member_id,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_branch,r.company_id AS company_branch_id,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship ='PRIMARY') as hr_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship ='PRIMARY') as hr_surname,
  r.assigned_to,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  p.surname,
  p.forename,
  r.request_submitedby,
  r.request_confirmedby,
  usr.employee_id,usr.email_id,
  p.date_of_birth
  from tbl_requests r 
  JOIN tbl_profiles p on r.member_id = p.profile_id
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status
  JOIN tbl_users usr ON usr.user_id = ${family_id}
  WHERE r.family_id = ${family_id} AND r.request_status != 8 AND r.request_status != 9`;
  return await database.request().query(query);
};

const getMemberList = async (requestId) => {
  const query = `SELECT * FROM tbl_request_forms where request_id=${requestId}`;
  return await database.request().query(query);
};

const createDeleteMemberRequest = async (member) => {
  const query = `INSERT INTO tbl_requests
    (
      family_id,
      member_id,
      request_status,
      request_type,
      request_createdby,
      company_id,
      request_reason,
      effective_date
    )
    VALUES
    (
      ${member.family_id},
      ${member.member_id},
      ${member.request_status},
      ${member.request_type},
      ${member.request_createdby},
      ${member.company_id},
      '${member.request_reason}',
      '${member.effective_date}'
    )
    SELECT SCOPE_IDENTITY() AS request_id;`;
  return await database.request().query(query);
};

const createRequestForm = async (member) => {
  const query = `INSERT INTO tbl_request_forms
  (
    request_id,
    family_id,
    member_id
  )
  VALUES
  (
    ${member.request_id},
    ${member.family_id},
    ${member.member_id}
  )`;
  return await database.request().query(query);
};

const deleteRequestById = async (id) => {
  const query = `DELETE FROM tbl_requests WHERE request_id = ${id}`;
  return await database.request().query(query);
};

const getDependantFormByRequestId = async (id) => {
  const query = `SELECT member_id FROM tbl_request_forms WHERE request_id = ${id}`;
  return await database.request().query(query);
};

const getRequestById = async (id) => {
  const query = `select r.request_id, reqtypes.request_type,reqtypes.request_type_id,
  form.family_id,form.member_id,
  prof.forename,prof.surname,prof.user_status,prof.effective_deletion_date,
  ins.insurance_end_date,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  r.request_reason,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r 
  JOIN tbl_request_forms form ON form.request_id = r.request_id
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status 
  LEFT JOIN tbl_insurance_details ins on ins.member_id = form.member_id
  LEFT JOIN tbl_profiles prof ON prof.profile_id = form.member_id  AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  WHERE r.request_id = ${id}`;
  return await database.request().query(query);
};

// Get all the employee details
const getDepandantsByRequest = async (request_id) => {
  const query = `
  select r.request_id, reqtypes.request_type,reqtypes.request_type_id,
  form.family_id,form.member_id,
  prof.forename, prof.surname,prof.relationship,prof.passport_no,prof.nic_no,prof.is_mauritian,prof.date_of_birth,prof.user_gender,prof.child,prof.card,prof.effective_deletion_date,
  ins.policy_no,insdet.effective_insurance_date,insdet.insurance_end_date,
  pol.plan_cover_id,pol.rgpa_basic,pol.top_up_part1,pol.top_up_part2,
  basic.plan_name as cover_details,
  part1.plan_name as cover_details,
  part2.plan_name as cover_details,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type
    FROM tbl_users usr
    JOIN tbl_roles role ON role.role_id = usr.role
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type
    FROM tbl_users usr
    JOIN tbl_roles role ON role.role_id = usr.role
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,        
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type
    FROM tbl_users usr
    JOIN tbl_roles role ON role.role_id = usr.role
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,      
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type
    FROM tbl_users usr
    JOIN tbl_roles role ON role.role_id = usr.role
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type
    FROM tbl_users usr
    JOIN tbl_roles role ON role.role_id = usr.role
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r
  JOIN tbl_request_forms form ON form.request_id = r.request_id
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  LEFT JOIN tbl_profiles prof on prof.profile_id=form.member_id AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_policy_details pol ON pol.family_id = prof.family_id AND pol.member_id=prof.profile_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
    LEFT JOIN tbl_insurance ins ON ins.family_id = prof.family_id
  JOIN tbl_insurance_details insdet ON insdet.insurance_id = ins.insurance_id AND insdet.family_id = prof.family_id AND insdet.member_id=prof.profile_id
  WHERE r.request_id = ${request_id}`;

  return await database.request().query(query);
};

const getRequest = async (id) => {
  const query = `SELECT *
  FROM tbl_requests
  WHERE request_id = ${id}`;
  return await database.request().query(query);
};

const deleteRequestForm = async (id) => {
  const query = `DELETE FROM tbl_request_forms WHERE request_id=${id}`;
  return await database.request().query(query);
};

const updateRequestHistory = async (request, request_id) => {
  const query = await QueryGenerator.update('tbl_request_histories', request, { request_id });
  return await database.request().query(query);
};

const insertAssignHistory = async (request) => {
  const query = `INSERT INTO tbl_request_assign_history
  (
    request_id,
    request_status,
    assigner,
    assigned_to
  )
  VALUES
  (
    ${request.request_id},
    ${request.request_status},
    ${request.assigner},
    ${request.assigned_to}
  )`;
  return await database.request().query(query);
};

const getAssignHistoryById = async (request_id) => {
  const query = `SELECT assign.request_id,assign.request_status,assign.assigner,assign.assigned_to,assign.assigned_date,
  reqtypes.request_type,reqtypes.request_type_id,reqstatus.request_status AS status,
  (select forename from tbl_profiles where family_id = assign.assigned_to AND relationship = 'PRIMARY') AS assigned_to_forename,
  (select surname from tbl_profiles where family_id = assign.assigned_to AND relationship = 'PRIMARY') AS assigned_to_surname,
  (select role from tbl_users where user_id = assign.assigned_to) as assigned_to_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = assign.assigned_to
  ) AS assigned_to_role,
  (select forename from tbl_profiles where family_id = assign.assigner AND relationship = 'PRIMARY') AS assigner_forename,
  (select surname from tbl_profiles where family_id = assign.assigner AND relationship = 'PRIMARY') AS assigner_surname,
  (select role from tbl_users where user_id = assign.assigner) as assigner_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = assign.assigner
  ) AS assigner_role
  FROM tbl_request_assign_history assign
  JOIN tbl_requests req ON req.request_id = assign.request_id
  JOIN tbl_request_status  reqstatus ON reqstatus.request_status_id = assign.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  WHERE assign.request_id=${request_id}`;
  return await database.request().query(query);
};

const getRequestDetailsById = async (request_id) => {
  const query = `SELECT 
  form.request_id,form.family_id,form.member_id,
  emp.role,emp.company_id,
  req.request_status,req.effective_date,req.request_type,req.request_createdby,req.request_submitedby,req.request_confirmedby,req.requested_by,req.request_reason,req.assigned_to,req.date_request_submitted,
  prof.surname,prof.forename,prof.date_of_birth,prof.relationship,prof.child,prof.user_gender,prof.is_mauritian,prof.nic_no,prof.passport_no,prof.effective_deletion_date,
  prof.marital_status,prof.phone_no_home,prof.phone_no_mobile,prof.phone_no_office,prof.address_1,prof.address_2,prof.is_pensioner,prof.card,prof.user_status,
  insdetail.insurance_details_id,insdetail.insurance_id,insdetail.effective_insurance_date,insdetail.insurance_end_date,insdetail.rgpa_basic,insdetail.monthly_rgpa_amount,insdetail.top_up_part1,
  insdetail.monthly_payment_part1,insdetail.top_up_part2,insdetail.monthly_payment_part2,insdetail.FSC_fee,insdetail.monthly_premium,
  usrbank.bank_id,usrbank.bank_account_holder,usrbank.bank_account_number
  FROM tbl_request_forms form
  JOIN tbl_requests req ON req.request_id = form.request_id
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  JOIN tbl_profiles prof ON prof.profile_id = form.member_id
  JOIN tbl_insurance_details insdetail ON insdetail.member_id = form.member_id
  JOIN tbl_user_bank_details usrbank ON usrbank.user_id = form.family_id
  JOIN tbl_employees emp ON emp.user_id = form.family_id
  WHERE form.request_id = ${request_id}`;
  return await database.request().query(query);
};

const insertRequestHistory = async (request) => {
  const query = `INSERT INTO tbl_request_histories
  (
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
    insurance_end_date
  )
  VALUES
  (
    ${request.request_id},
    ${request.family_id},
    ${request.member_id},
    ${request.insurance_id},
    ${request.role},
    ${request.company_id},
    '${request.surname}',
    '${request.forename}',
    ${request.date_of_birth},
    '${request.relationship}',
    '${request.child}',
    '${request.user_gender}',
    '${request.is_mauritian}',
    '${request.nic_no}',
    '${request.passport_no}',
    '${request.marital_status}',
    '${request.phone_no_home}',
    '${request.phone_no_mobile}',
    '${request.phone_no_office}',
    '${request.address_1}',
    '${request.address_2}',
    '${request.is_pensioner}',
    '${request.card}',
    '${request.user_status}',
    ${request.bank_id},
    '${request.bank_account_holder}',
    '${request.bank_account_number}',
    ${request.rgpa_basic},
    ${request.monthly_rgpa_amount},
    ${request.top_up_part1},
    ${request.monthly_payment_part1},
    ${request.top_up_part2},
    ${request.monthly_payment_part2},
    ${request.FSC_fee},
    ${request.monthly_premium},
    ${request.request_status},
    '${request.request_type}',
    ${request.request_createdby},
    ${request.request_submitedby},
    ${request.request_confirmedby},
    ${request.requested_by},
    '${request.request_reason}',
    ${request.assigned_to},
    ${request.date_request_submitted},
    ${request.effective_insurance_date},
    ${request.insurance_end_date}
  )`;

  return await database.request().query(query);
};

const profileRequestStatusSearch = async (search, page) => {
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
  const query = `SELECT prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.nic_no,prof.passport_no,prof.effective_deletion_date,
    (SELECT COUNT(*) from tbl_employees where role=4) AS employee_Count,
    (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
    ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
    (SELECT COUNT(*) from tbl_insurance_details where family_id = emp.user_id ) AS insurance_count,
    pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
    req.request_type,req.request_id,req.request_status,
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
    LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = 'ADD MEMBER' ${cond1}
    LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
    LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
    LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
    LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
    LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
    WHERE (prof.forename+prof.surname) LIKE '%${search.data}%' OR (prof.forename+' '+prof.surname) LIKE '%${search.data}%' OR prof.nic_no LIKE '%${search.data}%' OR prof.passport_no LIKE '%${search.data}%' ${cond}`;
  return await database.request().query(query);
};

// WHERE prof.forename LIKE '%${search}%' OR prof.surname LIKE '%${search}%' OR prof.nic_no LIKE '%${search}%' OR prof.passport_no LIKE '%${search}%' OR (prof.forename+prof.surname) LIKE '%${search}%' ${cond}`;

const companyRequestStatusSearch = async (search, page) => {
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
  const query = `SELECT brnch.company_branch,prof.forename, prof.surname,prof.family_id,prof.profile_id AS member_id,prof.relationship,prof.nic_no,prof.passport_no,prof.effective_deletion_date,
  (SELECT COUNT(*) from tbl_employees where role=4) AS employee_Count,
  (SELECT COUNT(*) FROM tbl_employees WHERE user_id = usr.user_id) AS working_companies_count,
  ins.policy_no,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
  (SELECT COUNT(*) from tbl_insurance_details where family_id = emp.user_id ) AS insurance_count,
  pol.plan_cover_id,insdetail.monthly_premium,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.rgpa_basic,insdetail.top_up_part1,insdetail.top_up_part2,
  req.request_type,req.request_id,req.request_status,
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
  LEFT JOIN tbl_requests req ON req.family_id = emp.user_id AND req.member_id=prof.profile_id AND req.request_type = 'ADD MEMBER' ${cond1}
  LEFT JOIN tbl_users usr ON usr.user_id = emp.user_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
  LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
  WHERE brnch.company_branch LIKE '%${search}%' ${cond}`;
  return await database.request().query(query);
};

const insertRequests = async (requests) => {
  const query = `INSERT INTO tbl_requests
  (
    family_id,
    member_id, 
    request_status,
    policy_details,
    request_type,
    company_id
  )
  VALUES
  (
    ${requests.family_id},
    ${requests.profile_id},
    ${requests.request_status},
    ${requests.policy_details},
    ${requests.request_type},
    ${requests.company_id}
  );
  SELECT SCOPE_IDENTITY() AS request_id;
`;

  return await database.request().query(query);
};

const insertFormRequests = async (requests) => {
  const query = `
  INSERT INTO tbl_request_forms
  (request_id,
    family_id,
    member_id)
    VALUES
    (
      ${requests.request_id},
      ${requests.family_id},
    ${requests.profile_id}
    );`;
  return await database.request().query(query);
};

const checkRequestType = async (request) => {
  const query = `SELECT * FROM tbl_requests
  WHERE request_type = ${request.request_type} AND member_id = ${request.profile_id}`;
  return await database.request().query(query);
};

const checkAddMemberRequest = async (family_id) => {
  const query = `SELECT * FROM tbl_requests
  WHERE request_type = ${requestType.ADD_MEMBER} AND family_id = ${family_id}`;
  return await database.request().query(query);
};

const checkRequest = async (request) => {
  const query = `SELECT * FROM tbl_requests
  WHERE request_type = ${request.request_type} AND family_id = ${request.family_id} AND request_status NOT IN(${requestStatus.APPROVED}, ${requestStatus.REJECTED})`;
  return await database.request().query(query);
};

const createRequest = async (
  family_id,
  request_type,
  user_id,
) => {
  const result = await database.request()
    .input('family_id', family_id)
    .input('request_status', requestStatus.PENDING)
    .input('request_type', request_type)
    .input('request_createdby', user_id)
    .output('request_id', 0)
    .execute('createRequest');
  return result;
};

// Remove user datas from profile, insurance and policy
const removeUserData = async (user) => {
  const result = await database.request()
    .input('member_id', user.member_id)
    .input('family_id', user.family_id)
    .execute('removeRequestData');
  return result;
};

const getProfileRecordByRequest = async (request_id) => {
  const query = `SELECT
  usr.employee_id,usr.email_id,usr.employment_date,
  r.company_id,
  compbrnch.company_branch,
  r.request_id, reqtypes.request_type,reqtypes.request_type_id,
  prof.family_id,prof.member_id,
  prof.forename,prof.surname,prof.date_of_birth,prof.relationship,prof.child,prof.user_gender,prof.is_mauritian,prof.nic_no,prof.passport_no,
  prof.marital_status,prof.phone_no_home,prof.phone_no_mobile,prof.phone_no_office,prof.address_1,prof.address_2,prof.city,prof.is_pensioner,prof.card,prof.user_status,
  ins.insurance_end_date,ins.effective_insurance_date,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  r.request_reason,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  rs.request_status AS status,
  usrbankrec.bank_account_holder , usrbankrec.bank_account_number,
  bank.bank_name,bank.bank_code,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r 
  JOIN tbl_users usr ON usr.user_id = r.family_id
  JOIN tbl_profile_records prof ON prof.request_id = r.request_id AND prof.relationship = '${userRelationship.PRIMARY}'
  JOIN tbl_request_status rs ON rs.request_status_id = r.request_status 
  LEFT JOIN tbl_insurance_records ins ON ins.request_id = r.request_id AND ins.member_id = r.member_id
  LEFT JOIN tbl_request_types reqtypes ON reqtypes.request_type_id = r.request_type
  LEFT JOIN tbl_company_branches compbrnch ON compbrnch.company_branch_id = r.company_id
  LEFT JOIN tbl_user_bank_records usrbankrec ON usrbankrec.request_id = r.request_id
  LEFT JOIN tbl_bank_list bank ON bank.bank_code = usrbankrec.bank_id
  WHERE r.request_id = ${request_id}`;
  return await database.request().query(query);
};

const getDependantRecordByRequest = async (request_id) => {
  const query = `select r.request_id, reqtypes.request_type,reqtypes.request_type_id,
  form.family_id,form.member_id,
  prof.forename,prof.surname,prof.date_of_birth,prof.relationship,prof.child,prof.user_gender,prof.is_mauritian,prof.nic_no,prof.passport_no,
  prof.marital_status,prof.phone_no_home,prof.phone_no_mobile,prof.phone_no_office,prof.address_1,prof.address_2,prof.city,prof.is_pensioner,prof.card,prof.user_status,
  ins.insurance_end_date,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  r.request_reason,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r 
  JOIN tbl_request_forms form ON form.request_id = r.request_id
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status 
  LEFT JOIN tbl_insurance_records ins on ins.member_id = form.member_id
  JOIN tbl_profile_records prof ON prof.member_id = form.member_id AND prof.relationship != '${userRelationship.PRIMARY}'
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  WHERE r.request_id = ${request_id}`;

  return await database.request().query(query);
};

const getPolicyRecordByRequest = async (request_id) => {
  const query = `select r.request_id, reqtypes.request_type,reqtypes.request_type_id,
  form.family_id,form.member_id,
  prof.forename,prof.surname,prof.relationship,prof.user_status,prof.date_of_birth,
  policy.rgpa_basic,policy.monthly_rgpa_amount,policy.top_up_part1,policy.monthly_payment_part1,policy.top_up_part2,policy.monthly_payment_part2,policy.FSC_fee,policy.monthly_premium,
  ins.insurance_end_date,ins.effective_insurance_date,
  (select company_branch from tbl_company_branches where company_branch_id = r.company_id) as company_name,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  r.request_reason,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id,
  (SELECT TOP 1 comment_title FROM tbl_comments WHERE request_id = r.request_id ORDER BY comment_id DESC) AS comment_title
  FROM tbl_requests r 
  JOIN tbl_request_forms form ON form.request_id = r.request_id
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status 
  LEFT JOIN tbl_insurance_records ins on ins.member_id = form.member_id
  LEFT JOIN tbl_policy_records policy on policy.member_id = form.member_id
  JOIN tbl_profile_records prof ON prof.member_id = form.member_id
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  WHERE r.request_id = ${request_id}`;

  return await database.request().query(query);
};

const getAnswerRecordsByRequestId = async (request_id) => {
  const query = `SELECT
  answer.answer_id, answer.member_id,answer.family_id, answer.question_id, answer.first_consulting, answer.specify, answer.illness_duration,
  answer.doctor_name, answer.doctor_number, answer.doctor_address1, answer.doctor_address2 , answer.expected_delivery_date,
  profile.surname, profile.forename,
  doc.document_key,doc.document_format,docType.document_type,
  reqtypes.request_type,reqtypes.request_type_id,
  r.assigned_to,
  (select forename from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_forename,
  (select surname from tbl_profiles where family_id = r.assigned_to AND relationship = 'PRIMARY') as assignee_surname,
  (select role from tbl_users where user_id = r.assigned_to) as assignee_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.assigned_to
  ) AS assignee_role,
  r.request_createdby,
  (select forename from tbl_profiles where family_id =  r.request_createdby AND relationship ='PRIMARY') AS request_creater_forename,
  (select surname from tbl_profiles where family_id = r.request_createdby AND relationship ='PRIMARY') AS request_creater_surname,
  (select role from tbl_users where user_id = r.request_createdby) as request_creater_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_createdby
  ) AS request_creater_role,
  r.request_submitedby,
  (select forename from tbl_profiles where family_id =  r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_forename,
  (select surname from tbl_profiles where family_id = r.request_submitedby AND relationship ='PRIMARY') AS request_submiter_surname,
  (select role from tbl_users where user_id = r.request_submitedby) as request_submiter_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_submitedby
  ) AS request_submiter_role,
  r.request_confirmedby,
  (select forename from tbl_profiles where family_id =  r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_forename,
  (select surname from tbl_profiles where family_id = r.request_confirmedby AND relationship ='PRIMARY') AS request_confirmer_surname,
  (select role from tbl_users where user_id = r.request_confirmedby) as request_confirmer_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.request_confirmedby
  ) AS request_confirmer_role,
  r.requested_by,
  r.request_reason,
  (select forename from tbl_profiles where family_id =  r.requested_by AND relationship ='PRIMARY') AS requestor_forename,       
  (select surname from tbl_profiles where family_id = r.requested_by AND relationship ='PRIMARY') AS requestor_surname,
  (select role from tbl_users where user_id = r.requested_by) as requestor_role_id,
  (SELECT role.role_type 
    FROM tbl_users usr 
    JOIN tbl_roles role ON role.role_id = usr.role 
    WHERE usr.user_id = r.requested_by
  ) AS requestor_role,
  r.request_status,
  r.effective_date,
  rs.request_status AS status,
  r.company_id
  FROM tbl_questionnarie_answers_temp answer 
  LEFT JOIN tbl_questionnarie_document_records doc ON doc.member_id = answer.member_id AND doc.question_id = answer.question_id AND doc.request_id = ${request_id}
  LEFT JOIN tbl_document_type docType ON docType.document_type_id = doc.document_type
  LEFT JOIN tbl_profiles profile ON profile.profile_id = answer.member_id
  JOIN tbl_requests r ON r.request_id = ${request_id}
  JOIN tbl_request_status rs on rs.request_status_id = r.request_status 
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = r.request_type
  WHERE answer.request_id=${request_id}`;
  return await database.request().query(query);
};

const addDuplicateRecords = async (request_id, family_id) => {
  const result = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .execute('insertDuplicateRecords');
  return result;
};

const updateProfileByRequest = async (request_id, user_status, request_type, family_id) => {
  const result = await database.request()
    .input('request_id', request_id)
    .input('user_status', user_status)
    .input('request_type', request_type)
    .input('family_id', family_id)
    .execute('updateProfileMasters');

  return result;
};

// const updateBankByRequest = async (request_id) => {
//   const query = `UPDATE bank_details SET
//   bank_details.bank_id = bank_records.bank_id,
//   bank_details.bank_account_holder = bank_records.bank_account_holder,
//   bank_details.bank_account_number = bank_records.bank_account_number,
//   bank_details.bank_details_updated_on = GETDATE()
//   FROM tbl_user_bank_details AS bank_details
//   JOIN tbl_user_bank_records AS bank_records
//   ON bank_details.user_id = bank_records.family_id
//   WHERE bank_records.request_id = ${request_id}`;

//   return await database.request().query(query);
// };

const updatePolicyDetailsByRequest = async (request_id) => {
  const result = await database.request()
    .input('request_id', request_id)
    .execute('updatePolicyMasters');

  return result;
};

const updateQuestionnaireByRequest = async (request_id) => {
  const result = await database.request()
    .input('request_id', request_id)
    .execute('updateQuestionnaireMasters');

  return result;
};

const updateDocumentsByRequest = async (request_id) => {
  const result = await database.request()
    .input('request_id', request_id)
    .execute('updateMastersDocuments');

  return result;
};

module.exports = {
  updateRequestStatus,
  reqInfo,
  getStatus,
  updateInsuranceDetails,
  reqCount,
  // assignedRequestById,
  updateRequest,
  deleteDependantRequestById,
  // reqCompanyInfo,
  reqCountByCompany,
  reqCountByUser,
  requestsByUser,
  reqUserInfo,
  getMemberList,
  createDeleteMemberRequest,
  createRequestForm,
  deleteRequestById,
  getDependantFormByRequestId,
  getRequestById,
  getRequest,
  deleteRequestForm,
  updateRequestHistory,
  insertAssignHistory,
  getAssignHistoryById,
  getRequestDetailsById,
  insertRequestHistory,
  profileRequestStatusSearch,
  companyRequestStatusSearch,
  getRequestTypeId,
  insertRequests,
  insertFormRequests,
  checkRequestType,
  removeUserData,
  getDepandantsByRequest,
  checkRequest,
  createRequest,
  checkAddMemberRequest,
  getProfileRecordByRequest,
  getDependantRecordByRequest,
  getPolicyRecordByRequest,
  getAnswerRecordsByRequestId,
  addDuplicateRecords,
  updateProfileByRequest,
  // updateBankByRequest,
  updatePolicyDetailsByRequest,
  updateQuestionnaireByRequest,
  updateDocumentsByRequest,
};
