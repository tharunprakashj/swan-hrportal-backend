/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generator');

const getInsuranceDetails = async (family_id) => {
  const query = `SELECT ins.insurance_id,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
  (select count(*) from tbl_insurance_details where insdetail.insurance_id = ins.insurance_id) AS insuranceCount,
  req.request_status, insdetail.rgpa_basic, insdetail.top_up_part1,insdetail.top_up_part2,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.monthly_premium from tbl_insurance ins
  JOIN tbl_requests req  ON req.member_id = ins.member_id
  JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id
   where ins.family_id = ${family_id};`;

  return await database.request().query(query);
};

const getInsuranceDetailswithProfile = async (family_id) => {
  const query = `SELECT ins.insurance_id,insdetail.effective_insurance_date,insdetail.insurance_end_date,ins.insurance_status,
  (select count(*) from tbl_insurance_details where insdetail.insurance_id = ins.insurance_id) AS insuranceCount,
  req.request_status, insdetail.rgpa_basic, insdetail.top_up_part1,insdetail.top_up_part2,(insdetail.monthly_premium * 12) AS annual_premium,insdetail.monthly_premium from tbl_insurance ins
  JOIN tbl_requests req  ON req.member_id = ins.member_id
  JOIN tbl_insurance_details insdetail ON insdetail.insurance_id = ins.insurance_id
   where ins.family_id = ${family_id};`;

  return await database.request().query(query);
};

const updateEffectiveInsurance = async ({
  effective_insurance_date, insurance_end_date, member_id, family_id,
}) => {
  const query = `UPDATE tbl_insurance_details SET effective_insurance_date = '${effective_insurance_date}',insurance_end_date = '${insurance_end_date}', member_insurance_updated_on = GETDATE()  WHERE member_id IN (${member_id}) AND family_id=${family_id}`;
  return await database.request().query(query);
};

const updateEffectiveDateRecords = async ({
  effective_insurance_date, insurance_end_date, member_id, family_id, request_id,
}) => {
  const query = `UPDATE tbl_insurance_records SET effective_insurance_date = '${effective_insurance_date}',insurance_end_date = '${insurance_end_date}', member_insurance_updated_on = GETDATE()  WHERE member_id IN (${member_id}) AND family_id=${family_id} AND request_id=${request_id}`;
  return await database.request().query(query);
};

const updateInsurance = async (insurance) => {
  insurance.member_insurance_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_insurance_details', insurance, { member_id: insurance.member_id });
  return await database.request().query(query);
};

const updateInsuranceRecords = async (insurance) => {
  insurance.member_insurance_updated_on = new Date();
  const query = await QueryGenerator.update('tbl_insurance_records', insurance, { request_id: insurance.request_id });
  return await database.request().query(query);
};

module.exports = {
  getInsuranceDetails,
  getInsuranceDetailswithProfile,
  updateEffectiveInsurance,
  updateInsurance,
  updateInsuranceRecords,
  updateEffectiveDateRecords,
};
