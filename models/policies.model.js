/* eslint-disable no-param-reassign */
/* eslint-disable object-shorthand */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');
const { Role, requestType, requestStatus } = require('../utils/role');
const QueryGenerator = require('../generators/query.generate');

// Get rgpa basic plans
const getbasicPlans = async () => {
  const query = 'SELECT * FROM tbl_rgpa_plans';
  return await database.request().query(query);
};

// Get rgpa basic plans
const getTopPlan1 = async () => {
  const query = 'SELECT * FROM tbl_top_up_part1';
  return await database.request().query(query);
};

const updateRGPA = async (policy, family_id) => {
  // const query = `UPDATE tbl_policy_details SET rgpa_basic = ${rgpa_basic},monthly_rgpa_amount=${monthly_rgpa_amount} where family_id=${family_id}`;
  policy.policy_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_policy_details', policy, { family_id: family_id });
  return await database.request().query(query);
};

const updateChangePlan = async (policy, member_id) => {
  policy = JSON.parse(JSON.stringify(policy));
  policy.policy_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_policy_details', policy, { member_id: member_id });
  return await database.request().query(query);
};

const updatePrincipalMemberTopUp = async (policy) => {
  const query = `UPDATE tbl_policy_details SET top_up_part1 = ${policy.top_up_part1}, top_up_part2 = ${policy.top_up_part2}, policy_updated_on = GETDATE() where family_id = ${policy.family_id} AND member_id = ${policy.member_id}`;
  return await database.request().query(query);
};

// Get rgpa basic plans
const getTopPlan2 = async () => {
  const query = 'SELECT * FROM tbl_top_up_part2';
  return await database.request().query(query);
};

// Get rgpa basic plans
const getAllPlans = async () => {
  const query = 'SELECT * FROM tbl_rgpa_plans;SELECT * FROM tbl_top_up_part1;SELECT * FROM tbl_top_up_part2;';
  return await database.request().query(query);
};

// Get all policies for both employees and dependants
const getFamilyPolicies = async (family_id, request_id) => {
  let query;
  //   const query = `SELECT prof.forename,prof.surname,prof.relationship,
  //   ins.*,
  //   basic.rgpa_basic_id,basic.basic_range,basic.monthly_payable,basic.plan_name AS rgpa_basic_plan,
  //   part1.plan_name AS topUpPart1_planName,part1.annual_premium AS top_up_part1_annual_premium,
  //   part2.plan_name AS topUpPart2_planName,part2.annual_premium AS top_up_part2_annual_premium,part2.age_limit,part2.above_75,
  //  (select r.request_status from tbl_request_forms f
  //  LEFT JOIN tbl_requests r on r.request_id = f.request_id
  //    WHERE f.family_id=${family_id} AND f.member_id =prof.profile_id AND r.request_type IN ('ADD MEMBER','ADD DEPENDANT')) AS request_status
  //   FROM tbl_insurance_details ins
  //   JOIN tbl_profiles prof on prof.profile_id = ins.member_id
  //   LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = ins.rgpa_basic
  //   LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = ins.top_up_part1
  //   LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = ins.top_up_part2
  //   WHERE ins.family_id=${family_id}`;
  if (request_id) {
    query = `SELECT prof.forename,prof.surname,prof.relationship,prof.user_status,
  policy.*,
  basic.rgpa_basic_id,basic.basic_range,basic.monthly_payable,basic.plan_name AS rgpa_basic_plan,
  part1.plan_name AS topUpPart1_planName,part1.annual_premium AS top_up_part1_annual_premium,
  part2.plan_name AS topUpPart2_planName,part2.annual_premium AS top_up_part2_annual_premium,part2.age_limit,part2.above_75,
  ins.effective_insurance_date,ins.insurance_end_date,
  (select r.request_status from tbl_request_forms f
  LEFT JOIN tbl_requests r on r.request_id = f.request_id
   WHERE f.family_id=${family_id} AND f.member_id =prof.profile_id AND r.request_type IN (${requestType.CHANGE_PLAN}) AND r.request_status != ${requestStatus.APPROVED} AND r.request_status !=${requestStatus.REJECTED}) AS request_status
  FROM tbl_policy_records policy
  JOIN tbl_profiles prof on prof.profile_id = policy.member_id AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_insurance_details ins on ins.member_id = policy.member_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = policy.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = policy.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = policy.top_up_part2
  WHERE policy.request_id=${request_id}`;
  } else {
    query = `SELECT prof.forename,prof.surname,prof.relationship,prof.user_status,
  policy.*,
  basic.rgpa_basic_id,basic.basic_range,basic.monthly_payable,basic.plan_name AS rgpa_basic_plan,
  part1.plan_name AS topUpPart1_planName,part1.annual_premium AS top_up_part1_annual_premium,
  part2.plan_name AS topUpPart2_planName,part2.annual_premium AS top_up_part2_annual_premium,part2.age_limit,part2.above_75,
  ins.effective_insurance_date,ins.insurance_end_date,
  (select r.request_status from tbl_request_forms f
  LEFT JOIN tbl_requests r on r.request_id = f.request_id
   WHERE f.family_id=${family_id} AND f.member_id =prof.profile_id AND r.request_type IN (${requestType.ADD_MEMBER},${requestType.ADD_DEPENDANT})) AS request_status
  FROM tbl_policy_details policy
  JOIN tbl_profiles prof on prof.profile_id = policy.member_id AND prof.user_status != 'DELETED'
  LEFT JOIN tbl_insurance_details ins on ins.member_id = policy.member_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = policy.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = policy.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = policy.top_up_part2
  WHERE policy.family_id=${family_id}`;
  }

  return await database.request().query(query);
};

// const insertPolicyDetails = async (policyDetails) => {
//   const query = `INSERT INTO tbl_policy_details
//   ( family_id,
//     member_id,
//     rgpa_basic,
//     monthly_rgpa_amount,
//     top_up_part1,
//     monthly_payment_part1,
//     top_up_part2,
//     monthly_payment_part2
//   ) VALUES (
//     ${policyDetails.family_id},
//     ${policyDetails.member_id},
//     ${policyDetails.rgpa_basic},
//     ${policyDetails.monthly_rgpa_amount},
//     ${policyDetails.top_up_part1},
//     ${policyDetails.monthly_payment_part1},
//     ${policyDetails.top_up_part2},
//     ${policyDetails.monthly_payment_part2}
// )`;
//   return await database.request().query(query);
// };

const insertPolicyDetails = async (
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
) => {
  const result = await database.request()
    .input('family_id', family_id)
    .input('member_id', member_id)
    .input('rgpa_basic', rgpa_basic)
    .input('monthly_rgpa_amount', monthly_rgpa_amount)
    .input('top_up_part1', top_up_part1)
    .input('monthly_payment_part1', monthly_payment_part1)
    .input('top_up_part2', top_up_part2)
    .input('monthly_payment_part2', monthly_payment_part2)
    .input('FSC_fee', FSC_fee)
    .input('monthly_premium', monthly_premium)
    .output('policy_id', 0)
    .execute('insertPolicyDetails');
  return result;
};

const getMemberPolicies = async (policy_id) => {
  const query = `SELECT prof.forename,prof.surname,
  policy.*,
  basic.basic_range,basic.monthly_payable,basic.plan_name AS rgpa_basic_plan,
  part1.plan_name AS topUpPart1_planName,part1.annual_premium AS top_up_part1_annual_premium,
  part2.plan_name AS topUpPart2_planName,part2.annual_premium AS top_up_part2_annual_premium,part2.age_limit,part2.above_75
  FROM tbl_policy_details policy
  JOIN tbl_profiles prof on prof.profile_id = policy.member_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = policy.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = policy.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = policy.top_up_part2
  WHERE policy.plan_cover_id=${policy_id}`;
  return await database.request().query(query);
};

const getPolicyByMember = async (member_id) => {
  const query = `SELECT * from tbl_policy_details WHERE member_id = ${member_id}`;
  return await database.request().query(query);
};

const getPolicRecordyByMember = async (request_id) => {
  const query = `SELECT * from tbl_policy_records WHERE request_id = ${request_id}`;
  return await database.request().query(query);
};

// Get rgpa basic plans
const getFamilyMemberPolicies = async (family_id) => {
  const query = `SELECT 
  pol.* 
  FROM tbl_policy_details pol 
  LEFT JOIN tbl_profiles prof ON prof.family_id = pol.family_id AND prof.relationship='PRIMARY' 
  WHERE pol.family_id=${family_id}`;
  return await database.request().query(query);
};

// Get rgpa basic plans
const getFamilyMemberPoliciesRecord = async (request_id) => {
  const query = `SELECT 
  pol.* 
  FROM tbl_policy_records pol 
  WHERE pol.request_id=${request_id}`;
  return await database.request().query(query);
};

const getFamilyApprovedPolicies = async (family_id) => {
  const query = `SELECT prof.forename,prof.surname,prof.user_status,prof.relationship,prof.effective_deletion_date,
  ins.*,
  basic.rgpa_basic_id,basic.basic_range,basic.monthly_payable,basic.plan_name AS rgpa_basic_plan,
  part1.plan_name AS topUpPart1_planName,part1.annual_premium AS top_up_part1_annual_premium,
  part2.plan_name AS topUpPart2_planName,part2.annual_premium AS top_up_part2_annual_premium,part2.age_limit,part2.above_75,
 (select r.request_status from tbl_request_forms f
 LEFT JOIN tbl_requests r on r.request_id = f.request_id
   WHERE f.family_id=${family_id} AND f.member_id =prof.profile_id AND r.request_type IN (${requestType.ADD_MEMBER},${requestType.ADD_DEPENDANT})) AS request_status
  FROM tbl_insurance_details ins
  JOIN tbl_profiles prof on prof.profile_id = ins.member_id AND user_status != 'DELETED'
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = ins.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = ins.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = ins.top_up_part2
  WHERE ins.family_id=${family_id}`;

  return await database.request().query(query);
};

const getPrimaryMemberPolicy = async (family_id) => {
  const query = `SELECT pol.*
  FROM tbl_policy_details pol 
  JOIN tbl_profiles prof ON prof.profile_id = pol.member_id AND prof.relationship = 'PRIMARY'
  WHERE pol.family_id = ${family_id}`;
  return await database.request().query(query);
};

const insertPolicyRecordDetails = async (policy) => {
  const result = await database.request()
    .input('request_id', policy.request_id)
    .input('family_id', policy.family_id)
    .input('member_id', policy.member_id)
    .input('rgpa_basic', policy.rgpa_basic)
    .input('monthly_rgpa_amount', policy.monthly_rgpa_amount)
    .input('top_up_part1', policy.top_up_part1)
    .input('monthly_payment_part1', policy.monthly_payment_part1)
    .input('top_up_part2', policy.top_up_part2)
    .input('monthly_payment_part2', policy.monthly_payment_part2)
    .input('FSC_fee', policy.FSC_fee)
    .input('monthly_premium', policy.monthly_premium)
    .execute('insertPolicyRecords');
  return result;
};

const getPolicyByMemberId = async (member_id) => {
  const query = `SELECT * from tbl_policy_details WHERE member_id IN (${member_id})`;
  return await database.request().query(query);
};

const insertChangePlanType = async (plan) => {
  const query = await QueryGenerator.insert('tbl_change_policy', plan);
  return await database.request().query(query);
};

const updateSalaryBandRecords = async (policy) => {
  const query = `UPDATE tbl_policy_records SET rgpa_basic = ${policy.rgpa_basic}, monthly_rgpa_amount = ${policy.monthly_rgpa_amount}, policy_updated_on = GETDATE() where request_id = ${policy.request_id}`;

  console.log(query);
  return await database.request().query(query);
};

module.exports = {
  getbasicPlans,
  getTopPlan1,
  getTopPlan2,
  insertPolicyDetails,
  getFamilyPolicies,
  getAllPlans,
  getMemberPolicies,
  updatePrincipalMemberTopUp,
  updateRGPA,
  updateChangePlan,
  getFamilyMemberPolicies,
  getPolicyByMember,
  getFamilyApprovedPolicies,
  getPrimaryMemberPolicy,
  insertPolicyRecordDetails,
  getPolicRecordyByMember,
  getFamilyMemberPoliciesRecord,
  getPolicyByMemberId,
  insertChangePlanType,
  updateSalaryBandRecords,
};
