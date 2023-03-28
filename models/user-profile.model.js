/* eslint-disable camelcase */
/* eslint-disable no-return-await */
// const { query } = require('express');
// const { query } = require('express');
const { database } = require('../utils/database');
const QueryGenerator = require('../generators/query.generate');

// Update Profile using member_id
const updateUserProfileById = async (member_id, userProfileDetails) => {
  const query = await QueryGenerator.update('tbl_profiles', userProfileDetails, { profile_id: member_id });
  // const query = `UPDATE tbl_profiles SET surname='${userProfileDetails.surname}',forename='${userProfileDetails.forename}',date_of_birth='${userProfileDetails.date_of_birth}',relationship='${userProfileDetails.relationship}',child='${userProfileDetails.child}',
  //   user_gender='${userProfileDetails.user_gender}',is_mauritian=${userProfileDetails.is_mauritian},nic_no='${userProfileDetails.nic_no}',passport_no='${userProfileDetails.passport_no}',marital_status='${userProfileDetails.marital_status}',phone_no_home='${userProfileDetails.phone_no_home}',
  //   phone_no_mobile='${userProfileDetails.phone_no_mobile}',phone_no_office='${userProfileDetails.phone_no_office}',address_1='${userProfileDetails.address_1}',address_2='${userProfileDetails.address_2}',is_pensioner='${userProfileDetails.is_pensioner}',card='${userProfileDetails.card}'
  //   where profile_id=${profileId}`;
  return await database.request().query(query);
};

// Update Profile using family_id
const updateUserProfileByFamilyId = async (userProfileDetails, family_id) => {
  const query = await QueryGenerator.update('tbl_profiles', userProfileDetails, { family_id });
  return await database.request().query(query);
};

// Update Profile using profile_id
const updateUserProfileByProfileId = async (userProfileDetails, profile_id) => {
  const query = await QueryGenerator.update('tbl_profiles', userProfileDetails, { profile_id });
  return await database.request().query(query);
};

// Update Profile using profile_id
const updateEffectiveDeletionDate = async (effective_deletion_date, profile_id) => {
  const query = `UPDATE tbl_profiles SET effective_deletion_date = '${effective_deletion_date}' WHERE profile_id IN (${profile_id})`;

  return await database.request().query(query);
};

const insertORUpdateDependants = async (userDependantsDetails) => await database.request()
  .input('family_id', userDependantsDetails.family_id)
  .input('surname', userDependantsDetails.surname)
  .input('forename', userDependantsDetails.forename)
  .input('date_of_birth', userDependantsDetails.date_of_birth)
  .input('relationship', userDependantsDetails.relationship)
  .input('child', userDependantsDetails.child)
  .input('user_gender', userDependantsDetails.user_gender)
  .input('is_mauritian', userDependantsDetails.is_mauritian)
  .input('nic_no', userDependantsDetails.nic_no)
  .input('passport_no', userDependantsDetails.passport_no)
  .input('card', userDependantsDetails.card)
  .input('company_id', userDependantsDetails.company_id)
  .input('request_createdby', userDependantsDetails.request_createdby)
  .input('effective_insurance_date', userDependantsDetails.effective_insurance_date)
  .input('insurance_end_date', userDependantsDetails.insurance_end_date)
  .input('insurance_status', userDependantsDetails.insurance_status)
  .input('request_status', userDependantsDetails.request_status)
  .input('request_type', userDependantsDetails.request_type)
  .input('rgpa_basic', userDependantsDetails.rgpa_basic)
  .input('top_up_part1', userDependantsDetails.top_up_part1)
  .input('top_up_part2', userDependantsDetails.top_up_part2)
  .execute('insertOrUpdateDependants');

const insertDependants = async (userDependantsDetails) => await database.request()
  .input('request_id', userDependantsDetails.request_id)
  .input('family_id', userDependantsDetails.family_id)
  .input('surname', userDependantsDetails.surname)
  .input('forename', userDependantsDetails.forename)
  .input('date_of_birth', userDependantsDetails.date_of_birth)
  .input('relationship', userDependantsDetails.relationship)
  .input('child', userDependantsDetails.child)
  .input('user_gender', userDependantsDetails.user_gender)
  .input('is_mauritian', userDependantsDetails.is_mauritian)
  .input('nic_no', userDependantsDetails.nic_no)
  .input('passport_no', userDependantsDetails.passport_no)
  .input('card', userDependantsDetails.card)
  .input('company_id', userDependantsDetails.company_id)
  .input('effective_insurance_date', userDependantsDetails.effective_insurance_date)
  .input('insurance_end_date', userDependantsDetails.insurance_end_date)
  .input('insurance_status', userDependantsDetails.insurance_status)
  .input('request_createdby', userDependantsDetails.request_createdby)
  .input('request_status', userDependantsDetails.request_status)
  .input('request_type', userDependantsDetails.request_type)
  // .input('rgpa_basic', userDependantsDetails.rgpa_basic)
  .input('top_up_part1', userDependantsDetails.top_up_part1)
  .input('top_up_part2', userDependantsDetails.top_up_part2)
  .input('user_status', userDependantsDetails.user_status)
  .execute('insertDependants');

const createDependants = async (userDependantsDetails) => await database.request()
  .input('request_id', userDependantsDetails.request_id)
  .input('family_id', userDependantsDetails.family_id)
  .input('member_id', userDependantsDetails.member_id)
  .input('surname', userDependantsDetails.surname)
  .input('forename', userDependantsDetails.forename)
  .input('date_of_birth', userDependantsDetails.date_of_birth)
  .input('relationship', userDependantsDetails.relationship)
  .input('child', userDependantsDetails.child)
  .input('user_gender', userDependantsDetails.user_gender)
  .input('is_mauritian', userDependantsDetails.is_mauritian)
  .input('nic_no', userDependantsDetails.nic_no)
  .input('passport_no', userDependantsDetails.passport_no)
  .input('card', userDependantsDetails.card)
  .input('company_id', userDependantsDetails.company_id)
  .input('effective_insurance_date', userDependantsDetails.effective_insurance_date)
  .input('insurance_end_date', userDependantsDetails.insurance_end_date)
  .input('insurance_status', userDependantsDetails.insurance_status)
  .input('request_createdby', userDependantsDetails.request_createdby)
  .input('user_status', userDependantsDetails.user_status)
  .input('city', userDependantsDetails.city)
  .execute('createDependants');

const deleteDependantsById = async (member_id, request_id) => {
  const query = `
  DELETE FROM tbl_uploaded_documents WHERE member_id IN (${member_id});
  DELETE FROM tbl_insurance_records WHERE member_id IN (${member_id}) AND request_id = ${request_id};
  DELETE FROM tbl_insurance_details WHERE member_id IN (${member_id});
  DELETE FROM tbl_request_forms WHERE member_id IN (${member_id});
  DELETE FROM tbl_requests WHERE member_id IN (${member_id});
  DELETE FROM tbl_policy_details WHERE member_id IN (${member_id});
  DELETE FROM tbl_questionnarie_documents where member_id IN (${member_id});
  DELETE FROM tbl_questionnarie_document_records where member_id IN (${member_id}) AND request_id = ${request_id};
  DELETE FROM tbl_questionnarie_answers where member_id IN (${member_id});
  DELETE FROM tbl_questionnarie_answers_temp where member_id IN (${member_id}) AND request_id = ${request_id};
  DELETE FROM tbl_policy_records WHERE member_id IN (${member_id}) AND request_id = ${request_id};
  DELETE FROM tbl_profiles where profile_id IN (${member_id}) AND relationship !='PRIMARY';
  DELETE FROM tbl_profile_records WHERE member_id IN (${member_id}) AND relationship !='PRIMARY' AND request_id = ${request_id};
  `;
  return await database.request().query(query); tbl_questionnarie_document_records;
};

const deleteRejectedDependant = async (id) => {
  const query = `
  DELETE FROM tbl_uploaded_documents WHERE member_id IN (${id});
  DELETE FROM tbl_insurance_details WHERE member_id IN (${id});
  DELETE FROM tbl_policy_details WHERE member_id IN (${id});
  DELETE FROM tbl_questionnarie_documents where member_id IN (${id});
  DELETE FROM tbl_questionnarie_answers where member_id IN (${id});
  Update tbl_profiles SET user_status = 'DELETED' where profile_id IN (${id}) AND relationship !='PRIMARY'`;
  return await database.request().query(query);
};

const softDeleteDependantsById = async (id) => {
  const query = `UPDATE tbl_profiles
  SET user_status='DELETED'
  WHERE profile_id IN (${id}) AND relationship !='PRIMARY';`;
  return await database.request().query(query);
};

const getUserDependants = async (familyId) => {
  const relationship = 'PRIMARY';
  const query = `SELECT * FROM tbl_profiles WHERE family_id=${familyId} AND relationship!='${relationship}'  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

const getProfile = async (member_id) => {
  const query = `SELECT * FROM tbl_profiles WHERE profile_id = ${member_id}  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

const getProfileRecords = async (member_id) => {
  const query = `SELECT * FROM tbl_profile_records WHERE member_id = ${member_id}  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

const getProfileByRequestId = async (request_id) => {
  const query = `SELECT forms.request_id,forms.member_id,prof.* FROM tbl_request_forms forms
  JOIN tbl_profiles prof ON prof.profile_id = forms.member_id where request_id=${request_id}`;
  return await database.request().query(query);
};

const getAllProfile = async () => {
  const query = `SELECT prof.*, pol.plan_cover_id,emp.company_id FROM tbl_profiles prof
   LEFT JOIN tbl_policy_details pol ON pol.member_id=prof.profile_id
   LEFT JOIN tbl_employees emp ON emp.user_id=prof.family_id`;
  return await database.request().query(query);
};

const getPrimaryUser = async (familyId) => {
  const relationship = 'PRIMARY';
  const query = `SELECT prof.*,usr.* 
  FROM tbl_profiles prof 
  JOIN tbl_users usr ON usr.user_id = prof.family_id
  WHERE prof.family_id=${familyId} AND prof.relationship ='${relationship}'  AND prof.user_status != 'DELETED'`;
  return await database.request().query(query);
};
const getPrincpalAndDependantsByFamilyId = async (familyId) => {
  const query = `SELECT 
  prof.forename, prof.surname,prof.family_id,prof.profile_id,prof.relationship,prof.passport_no,prof.nic_no,prof.is_mauritian,prof.date_of_birth,prof.user_gender,prof.child,prof.card,
  ins.policy_no,insdetails.effective_insurance_date,ins.insurance_end_date,
  pol.plan_cover_id,pol.rgpa_basic,pol.top_up_part1,pol.top_up_part2,
  reqstatus.request_status,reqtypes.request_type,reqtypes.request_type_id ,
  basic.plan_name as cover_details,
  part1.plan_name as cover_details,
  part2.plan_name as cover_details
  from tbl_profiles prof
  LEFT JOIN tbl_insurance_details ins ON ins.family_id = ${familyId} AND ins.member_id=prof.profile_id
  LEFT JOIN tbl_policy_details pol ON pol.family_id = ${familyId} AND pol.member_id=prof.profile_id
  LEFT JOIN tbl_requests req ON req.family_id = ${familyId} AND req.member_id=prof.profile_id
  LEFT JOIN tbl_rgpa_plans basic on basic.rgpa_basic_id = pol.rgpa_basic
  LEFT JOIN tbl_top_up_part1 part1 on part1.top_up_part1_id = pol.top_up_part1
  LEFT JOIN tbl_top_up_part2 part2 on part2.top_up_part2_id = pol.top_up_part2
  LEFT JOIN tbl_request_status reqstatus on reqstatus.request_status_id = req.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  WHERE prof.family_id=${familyId} AND prof.user_status != 'DELETED'`;
  // const query = `SELECT forename,surname,profile_id,family_id,relationship FROM tbl_profiles WHERE family_id=${familyId}`;
  return await database.request().query(query);
};

// Get Individual User Dependants
const getIndividualProfile = async (profileId) => {
  const query = `SELECT * FROM tbl_profiles WHERE profile_id = ${profileId}  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

// Get All Family Members
const getAllFamilyMembers = async (familyId) => {
  const query = `SELECT * FROM tbl_profiles WHERE family_id = ${familyId}  AND user_status != 'DELETED'`;
  return await database.request().query(query);
};

// Check whether the NIC is presents or not
const checkNIC = async (nic_no, profile_id) => {
  const query = `SELECT * FROM tbl_profiles where nic_no='${nic_no}' AND profile_id !=${profile_id}`;
  return await database.request().query(query);
};

// Check whether the NIC is presents or not
const checkPassport = async (passport_no, profile_id) => {
  const query = `SELECT * FROM tbl_profiles where passport_no='${passport_no}'  AND profile_id !=${profile_id}`;
  return await database.request().query(query);
};

// Check whether the NIC is presents or not
const checkAllNIC = async (nic_no) => {
  const query = `SELECT * FROM tbl_profiles where nic_no='${nic_no}'`;
  return await database.request().query(query);
};

// Check whether the NIC is presents or not
const checkAllPassport = async (passport_no) => {
  const query = `SELECT * FROM tbl_profiles where passport_no='${passport_no}'`;
  return await database.request().query(query);
};

// update the employee details
const addOrUpdateUserProfile = async ({
  family_id,
  member_id,
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
}) => {
  const result = await database.request()
    .input('request_id', request_id)
    .input('family_id', family_id)
    .input('member_id', member_id)
    .input('employment_date', employment_date)
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
    .input('city', city)
    .input('bank_id', bank_code)
    .input('bank_account_holder', bank_account_holder)
    .input('bank_account_number', bank_account_number)
    .execute('updateEmployee');

  return result;
};

module.exports = {
  updateUserProfileById,
  insertORUpdateDependants,
  deleteDependantsById,
  getUserDependants,
  getPrimaryUser,
  getPrincpalAndDependantsByFamilyId,
  getIndividualProfile,
  insertDependants,
  getProfile,
  getAllFamilyMembers,
  updateUserProfileByFamilyId,
  softDeleteDependantsById,
  checkNIC,
  checkPassport,
  checkAllNIC,
  checkAllPassport,
  getAllProfile,
  updateUserProfileByProfileId,
  updateEffectiveDeletionDate,
  getProfileByRequestId,
  deleteRejectedDependant,
  addOrUpdateUserProfile,
  createDependants,
  getProfileRecords,
};
