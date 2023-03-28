/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generate');

const updateEffectiveInsurance = async (data) => {
  const query = `UPDATE tbl_insurance_details SET effective_insurance_date = ${data.effective_insurance_date}, member_insurance_updated_on = GETDATE() WHERE member_id IN (${data.member_id})`;
  return await database.request().query(query);
};

const updateEndInsuranceDate = async (data) => {
  const query = `UPDATE tbl_insurance_details SET insurance_end_date = '${data.effective_deletion_date}', member_insurance_updated_on = GETDATE() WHERE member_id IN (${data.member_id})`;
  return await database.request().query(query);
};

const getInsuranceDetails = async (family_id) => {
  const query = `SELECT ins.insurance_status,ins.policy_no,insDetails.* from tbl_insurance ins
  JOIN tbl_insurance_details insDetails ON insDetails.insurance_id = ins.insurance_id WHERE ins.family_id=${family_id}`;
  return await database.request().query(query);
};

const updateInsurance = async (insurance, request_id) => {
  insurance.member_insurance_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_insurance_details', insurance, { member_id: insurance.member_id });

  const result = await database.request()
    .input('request_id', request_id)
    .input('family_id', insurance.family_id)
    .input('member_id', insurance.member_id)
    .input('rgpa_basic', insurance.rgpa_basic)
    .input('monthly_rgpa_amount', insurance.monthly_rgpa_amount)
    .input('top_up_part1', insurance.top_up_part1)
    .input('monthly_payment_part1', insurance.monthly_payment_part1)
    .input('top_up_part2', insurance.top_up_part2)
    .input('monthly_payment_part2', insurance.monthly_payment_part2)
    .input('FSC_fee', insurance.FSC_fee)
    .input('monthly_premium', insurance.monthly_premium)
    .execute('insertPolicyRecords');

  return await database.request().query(query);
};

const getInsuranceByMember = async (member_id) => {
  const query = `SELECT * from tbl_insurance_details WHERE member_id = ${member_id}`;
  return await database.request().query(query);
};

module.exports = {
  updateEffectiveInsurance,
  updateEndInsuranceDate,
  getInsuranceDetails,
  updateInsurance,
  getInsuranceByMember,
};
