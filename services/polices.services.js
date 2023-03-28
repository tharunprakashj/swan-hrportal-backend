/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const {
  getFamilyMemberPolicies,
  insertPolicyDetails,
  insertPolicyRecordDetails,
  getPolicyByMember,
  getFamilyMemberPoliciesRecord,
  getPolicyByMemberId,

} = require('../models/policies.model');

const addOrUpdatePolicy = async ({
  family_id,
  member_id,
  rgpa_basic,
  monthly_rgpa_amount,
  top_up_part1,
  monthly_payment_part1,
  top_up_part2,
  monthly_payment_part2,
}) => {
  if (monthly_payment_part1 === undefined) {
    monthly_payment_part1 = 0;
  }
  if (monthly_payment_part2 === undefined) {
    monthly_payment_part2 = 0;
  }
  const totalAmount = monthly_rgpa_amount + monthly_payment_part1 + monthly_payment_part2;
  const FSC_fee = ((0.35 / 100) * totalAmount);

  const total = totalAmount + FSC_fee;

  let monthly_premium = total.toFixed(2);
  monthly_premium = JSON.parse(monthly_premium);
  const insertPolicy = await insertPolicyDetails(
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
  );
  return insertPolicy;
};

const addOrUpdatePolicyRecords = async ({
  family_id,
  member_id,
  request_id,
  rgpa_basic,
  monthly_rgpa_amount,
  top_up_part1,
  monthly_payment_part1,
  top_up_part2,
  monthly_payment_part2,
}) => {
  if (monthly_payment_part1 === undefined) {
    monthly_payment_part1 = 0;
  }
  if (monthly_payment_part2 === undefined) {
    monthly_payment_part2 = 0;
  }
  const totalAmount = monthly_rgpa_amount + monthly_payment_part1 + monthly_payment_part2;
  const FSC_fee = ((0.35 / 100) * totalAmount);

  const total = totalAmount + FSC_fee;

  let monthly_premium = total.toFixed(2);
  monthly_premium = JSON.parse(monthly_premium);
  const insertPolicy = await insertPolicyRecordDetails({
    family_id,
    member_id,
    request_id,
    rgpa_basic,
    monthly_rgpa_amount,
    top_up_part1,
    monthly_payment_part1,
    top_up_part2,
    monthly_payment_part2,
    FSC_fee,
    monthly_premium,
  });

  console.log(insertPolicy);

  return insertPolicy;
};

const calculateFscMonthlyPremium = async (payment) => {
  const totalAmount = payment.monthly_rgpa_amount
  + payment.monthly_payment_part1
  + payment.monthly_payment_part2;

  // Calculate FSC Fee
  const FSC_fee = JSON.parse(((0.35 / 100) * totalAmount).toFixed(2));

  // Calculate monthly premium
  const monthly_premium = JSON.parse((totalAmount + FSC_fee).toFixed(2));

  return {
    FSC_fee,
    monthly_premium,
  };
};

const verifyChangePlan = async (data) => {
  let rgpa = false; let top_up1 = false; let top_up2 = false;
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      const oldData = await getPolicyByMember(data[i].member_id);
      const policy = oldData.recordset[0];
      if (data[i].rgpa_basic !== policy.rgpa_basic) {
        rgpa = true;
      }
      if (data[i].top_up_part1 !== policy.top_up_part1) {
        top_up1 = true;
      }
      if (data[i].top_up_part2 !== policy.top_up_part2) {
        top_up2 = true;
      }
      if (data.length === i + 1) {
        return { rgpa, top_up1, top_up2 };
      }
    }
  } else {
    return false;
  }
};

const validateChangePlan = async (data) => {
  let top_up1 = false; let top_up2 = false;
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      const oldData = await getPolicyByMember(data[i].member_id);
      const policy = oldData.recordset[0];
      console.log('OLD', policy.top_up_part1);
      console.log('NEW', data[i].top_up_part1);
      if (data[i].top_up_part1 !== policy.top_up_part1) {
        top_up1 = true;
      }
      if (data[i].top_up_part2 !== policy.top_up_part2) {
        top_up2 = true;
      }
      if (data.length === i + 1) {
        return { top_up1, top_up2 };
      }
    }
  } else {
    return false;
  }
};

const getpolicyByRequestId = async (request_id) => {
  if (request_id) {
    const oldData = await getFamilyMemberPoliciesRecord(request_id);
    const data = await verifyChangePlan(oldData.recordset);
    return data;
  }
  return false;
};

const addPolicyRecord = async (members, request_id) => {
  const data = await getPolicyByMemberId(members);
  if (data.recordset.length > 0) {
    const policies = data.recordset;
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      policy.request_id = request_id;
      delete policy.plan_cover_id;
      const insertPolicy = await insertPolicyRecordDetails(policy);
      if (insertPolicy.returnValue === 0) {
        if (i === data.recordset.length - 1) {
          return true;
        }
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
};

// const fetchPrincipalMemberPolicy = async (family_id) => {
//   // const
// }

module.exports = {
  addOrUpdatePolicy,
  calculateFscMonthlyPremium,
  addOrUpdatePolicyRecords,
  verifyChangePlan,
  getpolicyByRequestId,
  addPolicyRecord,
  validateChangePlan,
};
