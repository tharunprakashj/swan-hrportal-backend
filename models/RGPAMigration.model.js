/* eslint-disable camelcase */
const moment = require('moment');
const oracledb = require('oracledb');
const { reject } = require('lodash');
const clone = require('clone');
const crypto = require('crypto');
const oracle_database = require('../utils/oracle_db');
const { orclConnection } = require('../utils/oracleDatabase');
// const { database } = require('../utils/coredatabase');
const { database } = require('../utils/database');
const { Role, userStatus, requestType } = require('../utils/role');
const { calculateInsuranceDate } = require('../services/insurance.services');

const Response = require('../utils/response');
const policyModel = require('./policies.model');

const addBank = async (req, res) => {
  let i = 0;
  await oracle_database.getConnected('select * from BANKMASTER ORDER BY BANKID ASC', [], (bank_data) => {
    if (bank_data) {
      bank_data.map(async (bank) => {
        if (bank.ACCNUMLEN == null) {
          bank.ACCNUMLEN = '';
        }
        const bankquery = `INSERT INTO tbl_bank_list (bank_code,bank_name,account_no_length) VALUES (${bank.BANKID},'${bank.BANKNAME}','${bank.ACCNUMLEN}')`;
        await database.request().query(bankquery);
        i += 1;
        if (i === bank_data.length) {
          res.send('Bank List Uploaded Succesfully');
        }
      });
    }
  });
};

function CapitalizeCase(str) {
  const splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}

const addCompanies = async (req, res) => {
  try {
    let i = 0;
    await oracle_database.getConnected('SELECT corp.CORPID,corp.CORPNAME,mascit.MNAME AS CITY,mascou.MNAME AS COUNTRY FROM CORPORATEMASTER corp JOIN  MASTERS mascit ON mascit.MSTRID = corp.CITYID JOIN MASTERS mascou ON mascou.MSTRID = corp.COUNTRYID ORDER BY corp.CORPID ASC', [], (corporate_data) => {
      if (corporate_data) {
        corporate_data.map(async (corp) => {
          const company_branch_id = corp.CORPID;
          let company_branch = '';
          company_branch = corp.CORPNAME;
          company_branch = company_branch.replace("'", "''");

          let city = '';
          city = corp.CITY;
          //   city = await clone(CapitalizeCase(city));corp
          city = city.replace("'", "''");

          let country = '';
          country = corp.COUNTRY;
          //   country = await clone(CapitalizeCase(country));
          country = country.replace("'", "''");

          const compbranquery = `
                      SET IDENTITY_INSERT tbl_company_branches ON;
                      INSERT INTO tbl_company_branches (company_branch_id,company_id,company_branch,country,city) VALUES (${company_branch_id},1,'${company_branch}','${country}','${city}');
                      SET IDENTITY_INSERT tbl_company_branches OFF`;
          await database.request().query(compbranquery);
          i += 1;
          if (i === corporate_data.length) {
            res.send('Corporate Company List Uploaded Succesfully');
          }
        });
      }
    });
  } catch (err) {
    res.statuscode(400).send(err);
  }
};
// ORDER BY mem.MEMBERID ASC
// WHERE mem.MEMBERID = 104334
// WHERE mem.MEMBERTYPE = 'Principal' ORDER BY mem.MEMBERID ASC
const addUsers = async (req, res) => {
  try {
    let i = 0;
    let { member } = req.query;
    if (!member) {
      member = 'Principal';
    }
    await oracle_database.getConnected(`SELECT mem.*,base.BENEFITPREMIUM,part2.BENEFITPREMIUMT FROM MEMBERMASTER mem 
    left JOIN planscoveragesalband base ON base.BENEFITISBID = mem.SALBAND
    left JOIN PLANSCOVERAGETOPUPBAND part2 ON part2.BENEFITISBIDT = mem.SALBANDTOPUP
    WHERE mem.MEMBERTYPE = '${member}' ORDER BY mem.MEMBERID ASC`, [], (user_data) => {
      if (user_data) {
        user_data.map(async (user) => {
          const company_id = user.CORPID;
          const memberType = user.MEMBERTYPE;
          const member_id = user.MEMBERID;
          const family_id = user.MAINMEMBERID;
          let employee_id = user.REGNO;
          const role = Role.EMPLOYEE;
          let email_id = user.EMAILID;
          const password = 'Swan@2023';
          let employment_date;
          let surname = user.SURNAME;
          let forename = user.FIRSTNAME;
          let date_of_birth;
          const user_gender = user.GENDER;
          const is_mauritian = true;
          const nic_no = user.NIC;
          let passport_no;
          const marital_status = null;
          const phone_no_home = user.PHONENUM;
          const phone_no_mobile = user.ALTPHONENUM;
          const phone_no_office = null;
          let is_pensioner = false;
          const card = 'DIGITAL';
          const bank_id = user.BANKID;
          const bank_account_holder = user.FIRSTNAME;
          const bank_account_number = user.BANKACCNO;
          let effective_insurance_date = user.INSURANCEDOJ;
          let request_type;
          const request_createdby = 0;
          let user_status = userStatus.ACTIVE;
          const city = user.CITYID;
          const salaryBand = user.SALBAND;
          const salaryTopUp = user.SALBANDTOPUP;
          const premium = user.BENEFITPREMIUMT;
          const salaryBandPart = user.SALBANDTOPUPPART;
          const status = user.MEMBERSTATUS;
          const empStatus = user.MEMBEREMPSTATUS;
          let date_request_confirmed = user.CREATEDON;
          let rgpa_basic;
          let monthly_rgpa_amount = 0;
          let top_up_part1;
          let monthly_payment_part1 = 0;
          let top_up_part2;
          let monthly_payment_part2 = 0;

          if (user.EMAILID === 'mail@mail.com' || user.EMAILID === 'MAIL@MAIL.COM' || user.EMAILID === 'dummy@dummy.com' || user.EMAILID === 'DUMMY@DUMMY.com' || user.EMAILID === '-' || user.EMAILID === '#' || user.EMAILID === '' || user.EMAILID == null) {
            email_id = user.FIRSTNAME + user.MEMBERID;
            email_id = email_id.toLowerCase();
            email_id = email_id.replace(/\s/g, '');
            email_id += '@swanforlife.com';
            email_id = email_id.replace("'", "''");
          } else {
            email_id = user.EMAILID;
            email_id = email_id.replace("'", "''");
          }

          if (!employee_id) {
            employee_id = `EMP${user.MEMBERID}`;
          }

          if (user.SURNAME != null) {
            surname = user.SURNAME;
            surname = surname.replace("'", "''");
          }

          if (user.FIRSTNAME != null) {
            forename = user.FIRSTNAME;
            forename = forename.replace("'", "''");
          }
          if (user.DOB != null) {
            date_of_birth = new Date(user.DOB).toISOString().split('T')[0];
            date_of_birth = date_of_birth.replace('-', '/');
            date_of_birth = date_of_birth.replace('-', '/');
          }
          if (user.DOB === null || user.DOB === undefined) {
            date_of_birth = null;
          }
          if (user.COMPANYDOJ != null) {
            employment_date = new Date(user.COMPANYDOJ).toISOString().split('T')[0];
            employment_date = employment_date.replace('-', '/');
            employment_date = employment_date.replace('-', '/');
          }
          if (user.INSURANCEDOJ != null) {
            effective_insurance_date = new Date(user.INSURANCEDOJ).toISOString().split('T')[0];
            effective_insurance_date = effective_insurance_date.replace('-', '/');
            effective_insurance_date = effective_insurance_date.replace('-', '/');
          }
          if (user.CREATEDON != null) {
            date_request_confirmed = new Date(user.CREATEDON).toISOString().split('T')[0];
            date_request_confirmed = date_request_confirmed.replace('-', '/');
            date_request_confirmed = date_request_confirmed.replace('-', '/');
          }

          let address_1 = '';
          if (user.ADDRLINE1) {
            address_1 = user.ADDRLINE1;
            address_1 = address_1.replace("'", "''");
          }

          let address_2 = '';
          if (user.ADDRLINE2) {
            address_2 = user.ADDRLINE2;
            address_2 = address_2.replace("'", "''");
          }

          let child = null;
          let relationship = '';
          if (user.RELATIONSHIP === 'Self' || user.RELATIONSHIP === 'SELF') {
            relationship = 'PRIMARY';
          } else if (user.RELATIONSHIP === 'SPOUSE' || user.RELATIONSHIP === 'Spouse') {
            relationship = 'SPOUSE';
          } else if (user.RELATIONSHIP === 'Daughter' || user.RELATIONSHIP === 'DAUGHTER' || user.RELATIONSHIP === 'Son' || user.RELATIONSHIP === 'SON' || user.RELATIONSHIP === 'Child') {
            relationship = 'CHILD';
            child = 'Natural Child';
          } else if (user.RELATIONSHIP === 'Father' || user.RELATIONSHIP === 'FATHER' || user.RELATIONSHIP === 'Mother' || user.RELATIONSHIP === 'MOTHER') {
            relationship = 'PARENT';
          } else if (user.RELATIONSHIP === 'Full Time Student' || user.RELATIONSHIP === 'FULL TIME STUDENT' || user.RELATIONSHIP === 'STUDENT' || user.RELATIONSHIP === 'Student') {
            relationship = 'TERTIARY_STUDENT';
          } else {
            relationship = 'PRIMARY';
          }

          if (empStatus === 'Pensioner') {
            is_pensioner = true;
          }

          if (status === 'In-active') {
            user_status = userStatus.INACTIVE;
          }

          if (salaryBand === 'A') {
            rgpa_basic = 1;
            monthly_rgpa_amount = user.BASEPREMIUM;
          } else if (salaryBand === 'B') {
            rgpa_basic = 2;
            monthly_rgpa_amount = user.BASEPREMIUM;
          } else if (salaryBand === 'C') {
            rgpa_basic = 3;
            monthly_rgpa_amount = user.BASEPREMIUM;
          } else if (salaryBand === 'D') {
            rgpa_basic = 4;
            monthly_rgpa_amount = user.BASEPREMIUM;
          }

          if (salaryBandPart === 'Part-1') {
            top_up_part1 = 1;
            monthly_payment_part1 = 325;
          } else if (salaryBandPart === 'Part-2') {
            if (salaryTopUp === 'A') {
              top_up_part2 = 1;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'B') {
              top_up_part2 = 2;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'C') {
              top_up_part2 = 3;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'D') {
              top_up_part2 = 4;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'E') {
              top_up_part2 = 5;
              monthly_payment_part2 = premium;
            }
          } else if (salaryBandPart === 'Both') {
            top_up_part1 = 1;
            monthly_payment_part1 = 325;
            if (salaryTopUp === 'A') {
              top_up_part2 = 1;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'B') {
              top_up_part2 = 2;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'C') {
              top_up_part2 = 3;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'D') {
              top_up_part2 = 4;
              monthly_payment_part2 = premium;
            } else if (salaryTopUp === 'E') {
              top_up_part2 = 5;
              monthly_payment_part2 = premium;
            }
          }
          const totalAmount = monthly_rgpa_amount + monthly_payment_part1 + monthly_payment_part2;
          const FSC_fee = ((0.35 / 100) * totalAmount);
          const total = totalAmount + FSC_fee;
          const monthly_premium = JSON.parse(total.toFixed(2));
          const policy_no = crypto.randomBytes(5).toString('hex');
          let insurance_end_date;

          if (effective_insurance_date) {
            insurance_end_date = await calculateInsuranceDate(effective_insurance_date);
          }
          const is_verified = false;
          let result;

          if (memberType === 'Principal') {
            request_type = requestType.ADD_MEMBER;
            result = await database.request()
              .input('company_id', company_id)
              .input('family_id', family_id)
              .input('member_id', member_id)
              .input('employee_id', employee_id)
              .input('role', role)
              .input('email_id', email_id)
              .input('password', password)
              .input('is_verified', is_verified)
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
              .input('user_status', user_status)
              .input('city', city)
              .input('bank_id', bank_id)
              .input('bank_account_holder', bank_account_holder)
              .input('bank_account_number', bank_account_number)
              .input('effective_insurance_date', effective_insurance_date)
              .input('request_type', request_type)
              .input('rgpa_basic', rgpa_basic)
              .input('monthly_rgpa_amount', monthly_rgpa_amount)
              .input('top_up_part1', top_up_part1)
              .input('monthly_payment_part1', monthly_payment_part1)
              .input('top_up_part2', top_up_part2)
              .input('monthly_payment_part2', monthly_payment_part2)
              .input('request_confirmedby', 0)
              .input('FSC_fee', FSC_fee)
              .input('monthly_premium', monthly_premium)
              .input('policy_no', policy_no)
              .input('insurance_end_date', insurance_end_date)
              .input('request_reason', 'wetftyw')
              .input('date_request_confirmed', date_request_confirmed)
              .execute('migratingUser');
          } else if (memberType === 'Dependent') {
            request_type = requestType.ADD_DEPENDANT;
            result = await database.request()
              .input('company_id', company_id)
              .input('family_id', family_id)
              .input('member_id', member_id)
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
              .input('user_status', user_status)
              .input('city', city)
              .input('effective_insurance_date', effective_insurance_date)
              .input('request_type', request_type)
              .input('rgpa_basic', rgpa_basic)
              .input('monthly_rgpa_amount', monthly_rgpa_amount)
              .input('top_up_part1', top_up_part1)
              .input('monthly_payment_part1', monthly_payment_part1)
              .input('top_up_part2', top_up_part2)
              .input('monthly_payment_part2', monthly_payment_part2)
              .input('FSC_fee', FSC_fee)
              .input('monthly_premium', monthly_premium)
              .input('insurance_end_date', insurance_end_date)
              .input('date_request_confirmed', date_request_confirmed)
              .execute('migratingDependant');
          }

          i += 1;
          if (i === user_data.length && result.returnValue === 0) {
            res.send('Users Uploaded Succesfully');
          }
        });
      }
    });
  } catch (err) {
    res.statuscode(400).send(err);
  }
};

const addSubHr = async (req, res) => {
  try {
    let i = 0;
    await oracle_database.getConnected('SELECT EMAILID,CORPID FROM CORPORATEMASTER', [], (corporate_data) => {
      if (corporate_data) {
        corporate_data.map(async (corp) => {
          const email_id = corp.EMAILID;
          const company_id = corp.CORPID;
          const check_mail = await database.request().query(`SELECT * FROM tbl_users WHERE email_id='${email_id}'`);

          if (check_mail.recordset.length > 0) {
            const { user_id } = check_mail.recordset[0];
            const empcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES (2,${user_id},${company_id})`;
            const result = await database.request().query(empcompany);
          }
          i += 1;
          if (i === corporate_data.length) {
            res.send('Sub Hr List Uploaded Succesfully');
          }
        });
      }
    });
  } catch (err) {
    res.statuscode(400).send(err);
  }
};

module.exports = {
  addBank, addCompanies, addUsers, addSubHr,
};
