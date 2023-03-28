/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable camelcase */
const moment = require('moment');
const oracledb = require('oracledb');
const { StatusCodes } = require('http-status-codes');
const { reject } = require('lodash');
const oracle_database = require('../utils/oracle_db');
const { orclConnection } = require('../utils/oracleDatabase');
const { database } = require('../utils/coredatabase');
const Response = require('../utils/response');
const policyModel = require('./policies.model');
const logger = require('../utils/winston');

async function datamigrate(req, res) {
  try {
    // //BANK
    await addbank().then((data) => logger.info('databank', data)).catch((error) => {
      logger.error(error);
    });
    // //CORPORATE
    await addcorp_company().then((data) => logger.info('dataaddcorp', data)).catch((error) => {
      logger.error(error);
    });

    // await get_subhr_profiles().then((data) => console.log('datasubhr_profile', data)).catch((error) => {
    //   console.log(error);
    // });

    new Response(
      res,
      StatusCodes.OK,
    ).SuccessResponse(
      'success',
      'Migrated successfully',
    );
  } catch (error) {
    new Response(
      res,
      StatusCodes.CONFLICT,
    ).ErrorMessage(
      'Migration Error',
      error,
    );
    logger.error('Migration error', error);
  }
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// TO ADD BANK
async function addbank() {
  return new Promise(async (resolve, reject) => {
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
            resolve('bank');
          }
        });
      }
    });
  });
}

// TO ADD CORPORATE COMPANY
async function addcorp_company() {
  return new Promise(async (resolve, reject) => {
    let i = 0;
    await oracle_database.getConnected('select * from CORPORATEMASTER WHERE CORPID=20069 ORDER BY CORPID ASC', [], async (corporate_data) => {
      if (corporate_data) {
        let auto_id;
        for (let corp = 0; corp < corporate_data.length; corp++) {
          auto_id = corp + 1;
          await add_corp_comp_sub(corporate_data[corp], auto_id).then(async (corp_data) => {
            if (corp_data != '' || corp_data != null || corp_data != undefined) {
              i += 1;
              if (i === corporate_data.length) {
                resolve('corpcompany');
              } else {
                // console.log("corpcompany",corporate_data.length,i)
              }
            }
          }).catch((error) => {
            logger.error(error);
          });
        }
      }
    });
  });
}

async function add_corp_comp_sub(corp, auto_id) {
  return new Promise(async (resolve, reject) => {
    //
    let company_name = '';
    company_name = corp.CORPNAME;
    company_name = company_name.replace("'", "''");
    await oracle_database.getConnected(`SELECT MNAME as city FROM MASTERS WHERE MSTRID = '${corp.CITYID}'`, [], async (city_name) => {
      await oracle_database.getConnected(`SELECT MNAME as country FROM MASTERS WHERE MSTRID = '${corp.COUNTRYID}'`, [], async (country_name) => {
        //
        let cityname = '';
        if (city_name != null) {
          if (city_name.length > 0) {
            if (city_name[0].CITY != undefined) {
              cityname = city_name[0].CITY;
              cityname = CapitalizeCase(cityname);
              cityname = cityname.replace("'", "''");
            }
          }
        }
        let countryname = '';
        if (country_name != null) {
          if (country_name.length > 0) {
            if (country_name[0].COUNTRY != undefined) {
              countryname = country_name[0].COUNTRY;
              countryname = CapitalizeCase(countryname);
              countryname = countryname.replace("'", "''");
            }
          }
        }

        const compbranquery = `
                SET IDENTITY_INSERT tbl_company_branches ON;
                INSERT INTO tbl_company_branches (company_branch_id,company_id,company_branch,description,country,state,city,logo) VALUES ('${corp.CORPID}',1,'${company_name}-${corp.CORPID}','','${countryname}','','${cityname}','');
                SET IDENTITY_INSERT tbl_company_branches OFF`;
        await database.request().query(compbranquery);
        // console.log("company branches added")
        let emailid = '';
        if (corp.EMAILID == 'mail@mail.com' || corp.EMAILID == 'MAIL@MAIL.com' || corp.EMAILID == 'dummy@dummy.com' || corp.EMAILID == 'DUMMY@DUMMY.com' || corp.EMAILID == '-' || corp.EMAILID == '#' || corp.EMAILID == '' || corp.EMAILID == null) {
          emailid = corp.CORPCONTACTNAME + corp.CORPID;
          emailid = emailid.toLowerCase();
          emailid = emailid.replace(/\s/g, '');
          emailid += '@swanforlife.com';
          emailid = emailid.replace("'", "''");
        } else {
          emailid = corp.EMAILID;
          emailid = emailid.replace("'", "''");
        }

        await add_comp_users(emailid, corp, auto_id).then(async (userid) => {
          if (userid != '' || userid != null || userid != undefined) {
            await add_members(corp).then(async (memberresult) => {
              if (memberresult != undefined || memberresult != '') {
                resolve('Company branches added');
              } else {
                // console.log("Company branches not added")
              }
            });
          }
        });
      });
    });
  });
}

async function add_comp_users(emailid, corp, auto_id) {
  return new Promise(async (resolve, reject) => {
    let checkmail = '';
    checkmail = `SELECT * FROM tbl_users WHERE email_id='${emailid}'`;
    const check_mail = await database.request().query(checkmail);
    if (check_mail.recordset.length == 0) {
      const empquery = `SET IDENTITY_INSERT tbl_users ON;INSERT INTO tbl_users (user_id,employee_id,password,is_verified,role,email_id,employment_date) VALUES (${auto_id},'','subhr@123#','0',2,'${emailid}',null);SELECT SCOPE_IDENTITY() AS user_id;SET IDENTITY_INSERT tbl_users OFF;`;

      const getlastuser_details = await database.request().query(empquery);
      let userid;
      userid = getlastuser_details.recordsets[0][0].user_id;

      const empcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES ('2','${userid}','${corp.CORPID}')`;

      await database.request().query(empcompany);
      if (userid != '' || userid != null || userid != undefined) {
        // console.log("company user added",userid);
        resolve(userid);
      } else {
        // console.log("user and employee not inserted");
      }
    } else {
      let userid = '';
      userid = check_mail.recordset[0].user_id;
      const empcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES ('2','${userid}','${corp.CORPID}')`;
      await database.request().query(empcompany);
      if (userid != '' || userid != null || userid != undefined) {
        // console.log("company user added",userid);
        resolve(userid);
      } else {
        // console.log("company user inserted");
      }
    }
  });
}

async function add_members(corp) {
  return new Promise(async (resolve, reject) => {
    // console.log("corp.CORPID",corp.CORPID)
    await oracle_database.getConnected(`select * from MEMBERMASTER WHERE CORPID='${corp.CORPID}' ORDER BY MEMBERID ASC`, [], async (profiledata) => {
      if (profiledata != null) {
        let i = 0;
        if (profiledata.length > 0) {
          for (let profilesdata = 0; profilesdata < profiledata.length; profilesdata++) {
            const profile_data = profiledata[profilesdata];
            if (profile_data.MAINMEMBERID == profile_data.MEMBERID) {
              // onsole.log("profile_data--->",profile_data);
              let emailid = '';
              if (profile_data.EMAILID == 'mail@mail.com' || profile_data.EMAILID == 'MAIL@MAIL.COM' || profile_data.EMAILID == 'dummy@dummy.com' || profile_data.EMAILID == 'DUMMY@DUMMY.com' || profile_data.EMAILID == '-' || profile_data.EMAILID == '#' || profile_data.EMAILID == '' || profile_data.EMAILID == null) {
                emailid = profile_data.FIRSTNAME + profile_data.MEMBERID;
                emailid = emailid.toLowerCase();
                emailid = emailid.replace(/\s/g, '');
                emailid += '@swanforlife.com';
                emailid = emailid.replace("'", "''");
              } else {
                emailid = profile_data.EMAILID;
                emailid = emailid.replace("'", "''");
              }
              //
              let doj = null;
              if (profile_data.COMPANYDOJ != null) {
                doj = new Date(profile_data.COMPANYDOJ).toISOString().split('T')[0];
              }

              await add_memb_users(emailid, doj, corp, profile_data).then(async (memb_userid) => {
                //
                await oracle_database.getConnected(`SELECT MNAME as city FROM MASTERS WHERE MSTRID = '${profile_data.CITYID}'`, [], async (city_name) => {
                  //
                  await oracle_database.getConnected(`SELECT MNAME as country FROM MASTERS WHERE MSTRID = '${profile_data.COUNTRYID}'`, [], async (country_name) => {
                    let cityname = '';
                    if (city_name != null) {
                      if (city_name.length > 0) {
                        if (city_name[0].CITY != undefined) {
                          cityname = city_name[0].CITY;
                          cityname = CapitalizeCase(cityname);
                          cityname = cityname.replace("'", "''");
                        }
                      }
                    }
                    let countryname = '';
                    if (country_name != null) {
                      if (country_name.length > 0) {
                        if (country_name[0].COUNTRY != undefined) {
                          countryname = country_name[0].COUNTRY;
                          countryname = CapitalizeCase(countryname);
                          countryname = countryname.replace("'", "''");
                        }
                      }
                    }
                    await add_profiles(profile_data, memb_userid, cityname, countryname).then(async (profileresult) => {
                      if (profileresult != undefined || profileresult != '') {
                        // console.log(profileresult)
                      } else {
                        // console.log("No member add to profiles");
                      }
                    });
                  });
                });
              }).catch((error) => {
                logger.error(error);
              });
            }
            i += 1;
            if (i === profiledata.length) {
              resolve('member added');
            } else {
              // console.log("Member not Added",profiledata.length,i)
            }
          }
        }
      } else {
        // console.log("member profiles not added")
        resolve('member not added');
      }
    });
  });
}

async function add_memb_users(emailid, doj, corp, profile_data) {
  return new Promise(async (resolve, reject) => {
    let checkhrmail = '';
    checkhrmail = `SELECT * FROM tbl_users WHERE email_id='${emailid}'`;
    const checkhr = await database.request().query(checkhrmail);
    const len = checkhr.recordset.length;
    let empquery = '';
    let corememberid = '';
    corememberid = profile_data.MEMBERID;
    if (len == 0) {
      if (doj != null || doj != undefined) {
        empquery = `SET IDENTITY_INSERT tbl_users ON;INSERT INTO tbl_users (user_id,employee_id,password,is_verified,role,email_id,employment_date) VALUES ('${corememberid}','','emp@123#','0','4','${emailid}','${doj}');SELECT SCOPE_IDENTITY() AS user_id;SET IDENTITY_INSERT tbl_users OFF`;
      } else {
        empquery = `SET IDENTITY_INSERT tbl_users ON;INSERT INTO tbl_users (user_id,employee_id,password,is_verified,role,email_id,employment_date) VALUES ('${corememberid}','','emp@123#','0','4','${emailid}',null);SELECT SCOPE_IDENTITY() AS user_id;SET IDENTITY_INSERT tbl_users OFF`;
      }

      const getlastuser_details = await database.request().query(empquery);
      let memb_userid;
      memb_userid = getlastuser_details.recordsets[0][0].user_id;
      //
      const empcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES ('4','${memb_userid}','${corp.CORPID}')`;

      await database.request().query(empcompany);

      if (memb_userid != '' || memb_userid != null || memb_userid != undefined) {
        // console.log("add member user",memb_userid);
        resolve(memb_userid);
      } else {
        // console.log("Member not inserted")
      }
    } else {
      let password = '';
      let role_id = '';
      let user_id = '';
      password = checkhr.recordset[0].password;
      role_id = checkhr.recordset[0].role;
      user_id = checkhr.recordset[0].user_id;
      const del_user = `SELECT * FROM tbl_employees WHERE user_id='${user_id}';DELETE FROM tbl_employees WHERE user_id='${user_id}';DELETE FROM tbl_users WHERE user_id='${user_id}'`;
      let emp_details = '';
      emp_details = await database.request().query(del_user);
      if (doj != null || doj != undefined) {
        empquery = `SET IDENTITY_INSERT tbl_users ON;INSERT INTO tbl_users (user_id,employee_id,password,is_verified,role,email_id,employment_date) VALUES ('${corememberid}','','${password}','0','${role_id}','${emailid}','${doj}');SELECT SCOPE_IDENTITY() AS user_id;SET IDENTITY_INSERT tbl_users OFF`;
      } else {
        empquery = `SET IDENTITY_INSERT tbl_users ON;INSERT INTO tbl_users (user_id,employee_id,password,is_verified,role,email_id,employment_date) VALUES ('${corememberid}','','${password}','0','${role_id}','${emailid}',null);SELECT SCOPE_IDENTITY() AS user_id;SET IDENTITY_INSERT tbl_users OFF`;
      }
      //
      const getlastuser_details = await database.request().query(empquery);
      let memb_userid;
      memb_userid = getlastuser_details.recordsets[0][0].user_id;

      if (emp_details != '' || emp_details != null || emp_details != undefined) {
        let empdetails = '';
        empdetails = emp_details.recordsets[0];
        logger.info('emp_details', empdetails);
        if (empdetails.length > 0) {
          for (let index = 0; index < empdetails.length; index++) {
            const existempcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES ('${empdetails[index].role_id}','${corememberid}','${empdetails[index].company_id}')`;

            await database.request().query(existempcompany);
          }
        }
      }
      //
      const empcompany = `INSERT INTO tbl_employees (role,user_id,company_id) VALUES ('4','${memb_userid}','${corp.CORPID}')`;

      await database.request().query(empcompany);

      if (memb_userid != '' || memb_userid != null || memb_userid != undefined) {
        // console.log("add member user",memb_userid);
        resolve(memb_userid);
      } else {
        // console.log("Member not inserted")
      }
    }
  });
}

async function add_profiles(profile_data, memb_userid, cityname, countryname) {
  return new Promise(async (resolve, reject) => {
    const AllPlans = await policyModel.getAllPlans();
    let surname = '';
    if (profile_data.SURNAME != null) {
      surname = profile_data.SURNAME;
      surname = surname.replace("'", "''");
    }
    let firstname = '';
    if (profile_data.FIRSTNAME != null) {
      firstname = profile_data.FIRSTNAME;
      firstname = firstname.replace("'", "''");
    }
    //
    let dob = null;
    if (profile_data.DOB != null) {
      dob = new Date(profile_data.DOB).toISOString().split('T')[0];
    }
    let child_type = '';
    let relationship = '';
    if (profile_data.RELATIONSHIP == 'Self' || profile_data.RELATIONSHIP == 'SELF') {
      relationship = 'PRIMARY';
    } else if (profile_data.RELATIONSHIP == 'SPOUSE' || profile_data.RELATIONSHIP == 'Spouse') {
      relationship = 'SPOUSE';
    } else if (profile_data.RELATIONSHIP == 'Daughter' || profile_data.RELATIONSHIP == 'DAUGHTER' || profile_data.RELATIONSHIP == 'Son' || profile_data.RELATIONSHIP == 'SON' || profile_data.RELATIONSHIP == 'Child') {
      relationship = 'CHILD';
      child_type = 'Natural Child';
    } else if (profile_data.RELATIONSHIP == 'Father' || profile_data.RELATIONSHIP == 'FATHER' || profile_data.RELATIONSHIP == 'Mother' || profile_data.RELATIONSHIP == 'MOTHER') {
      relationship = 'PARENT';
    } else if (profile_data.RELATIONSHIP == 'Full Time Student' || profile_data.RELATIONSHIP == 'FULL TIME STUDENT' || profile_data.RELATIONSHIP == 'STUDENT' || profile_data.RELATIONSHIP == 'Student') {
      relationship = 'TERTIARY_STUDENT';
    } else {
      relationship = 'PRIMARY';
      // console.log("relationship out of list",profile_data.RELATIONSHIP)
    }

    let address1 = '';
    if (profile_data.ADDRLINE1) {
      address1 = profile_data.ADDRLINE1;
      address1 = address1.replace("'", "''");
    }

    let address2 = '';
    if (profile_data.ADDRLINE2) {
      address2 = profile_data.ADDRLINE2;
      address2 = address2.replace("'", "''");
    }
    let empprofile = '';

    let corememberid = '';
    corememberid = profile_data.MEMBERID;
    if (dob != null || dob != undefined) {
      empprofile = `SET IDENTITY_INSERT tbl_profiles ON;INSERT INTO tbl_profiles (profile_id,family_id,surname,forename,date_of_birth,relationship,child,user_gender,is_mauritian,nic_no,passport_no,marital_status,phone_no_home,phone_no_mobile,phone_no_office,address_1,address_2,is_pensioner,card) VALUES ('${corememberid}','${memb_userid}','${surname}','${firstname}','${dob}','${relationship}','${child_type}','${profile_data.GENDER}',0,'${profile_data.NIC}','','SINGLE','${profile_data.ALTPHONENUM}','${profile_data.PHONENUM}','','${address1},${cityname},${countryname}','${address2},${cityname},${countryname}','','Physical');SELECT SCOPE_IDENTITY() AS profile_id;SET IDENTITY_INSERT tbl_profiles OFF`;
    } else {
      empprofile = `SET IDENTITY_INSERT tbl_profiles ON;INSERT INTO tbl_profiles (profile_id,family_id,surname,forename,date_of_birth,relationship,child,user_gender,is_mauritian,nic_no,passport_no,marital_status,phone_no_home,phone_no_mobile,phone_no_office,address_1,address_2,is_pensioner,card) VALUES ('${corememberid}','${memb_userid}','${surname}','${firstname}',null,'${relationship}','${child_type}','${profile_data.GENDER}',0,'${profile_data.NIC}','','SINGLE','${profile_data.ALTPHONENUM}','${profile_data.PHONENUM}','','${address1},${cityname},${countryname}','${address2},${cityname},${countryname}','','Physical');SELECT SCOPE_IDENTITY() AS profile_id;SET IDENTITY_INSERT tbl_profiles OFF`;
    }
    const getlastprofile_details = await database.request().query(empprofile);
    let memprofile_id;
    memprofile_id = getlastprofile_details.recordset[0].profile_id;

    //
    const rgpa_basic = AllPlans.recordsets[0][0].rgpa_basic_id;
    const monthly_rgpa_amount = AllPlans.recordsets[0][0].monthly_payable;
    const totalAmount = monthly_rgpa_amount + 0 + 0;
    const FSC_fee = ((0.35 / 100) * totalAmount);
    const total = totalAmount + FSC_fee;
    const monthly_premium = total.toFixed(2);
    const top_up_part1 = null;
    const top_up_part2 = null;

    const mempolicy = `INSERT INTO tbl_policy_details (family_id,member_id,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${memb_userid}','${memprofile_id}','${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}');`;
    await database.request().query(mempolicy);

    //
    const profile_no = await generateString(10);
    const memins = `INSERT INTO tbl_insurance (family_id,policy_no,insurance_status) VALUES ('${memb_userid}','${profile_no}','NOT ACTIVE');SELECT bank_code as bank_id FROM tbl_bank_list WHERE bank_code='${profile_data.BANKID}';`;
    //

    const getbank_id_details = await database.request().query(memins);
    let membbankid;
    membbankid = getbank_id_details.recordset[0].bank_id;
    //
    let insurenceid = '';
    const insurence_query = `SELECT insurance_id FROM tbl_insurance WHERE family_id='${memb_userid}'`;

    insurenceid = await database.request().query(insurence_query);

    if (insurenceid.recordset.length > 0) {
      insurenceid = insurenceid.recordset[0].insurance_id;

      const mainmembinsdetails = `INSERT INTO tbl_insurance_details (insurance_id,family_id,member_id,effective_insurance_date,insurance_end_date,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${insurenceid}','${memb_userid}','${memprofile_id}',null,null,'${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}')`;

      await database.request().query(mainmembinsdetails);
    }
    //

    const empbank = `INSERT INTO tbl_user_bank_details (user_id,bank_id,bank_account_holder,bank_account_number) VALUES ('${memb_userid}','${membbankid}','${firstname}','${profile_data.BANKACCNO}')`;
    await database.request().query(empbank);

    // console.log("Member added");
    await add_family_member(profile_data, memb_userid).then(async (familymemberresult) => {
      if (familymemberresult != undefined || familymemberresult != '') {
        resolve('Member added');
      } else {
        // console.log("profile no added");
      }
    });
  });
}

async function add_family_member(profile_data, memb_userid) {
  return new Promise(async (resolve, reject) => {
    const AllPlans = await policyModel.getAllPlans();
    // FAMILYMEMBER
    let corememberid = '';
    corememberid = profile_data.MEMBERID;
    await oracle_database.getConnected(`select * from MEMBERMASTER WHERE MAINMEMBERID='${corememberid}' AND MEMBERID!='${corememberid}'`, [], async (family_profiledata) => {
      let i = 0;
      if (family_profiledata) {
        if (family_profiledata.length > 0) {
          for (let familyprofiledata = 0; familyprofiledata < family_profiledata.length; familyprofiledata++) {
            //
            const family_profile_data = family_profiledata[familyprofiledata];
            await oracle_database.getConnected(`SELECT MNAME as city FROM MASTERS WHERE MSTRID = '${family_profile_data.CITYID}'`, [], async (city_name) => {
              //
              await oracle_database.getConnected(`SELECT MNAME as country FROM MASTERS WHERE MSTRID = '${family_profile_data.COUNTRYID}'`, [], async (country_name) => {
                //
                let dob = null;
                if (family_profile_data.DOB != null) {
                  dob = new Date(family_profile_data.DOB).toISOString().split('T')[0];
                }
                let cityname = '';
                if (city_name != null) {
                  if (city_name.length > 0) {
                    if (city_name[0].CITY != undefined) {
                      cityname = city_name[0].CITY;
                      cityname = CapitalizeCase(cityname);
                      cityname = cityname.replace("'", "''");
                    }
                  }
                }

                let countryname = '';
                if (country_name != null) {
                  if (country_name.length > 0) {
                    if (country_name[0].COUNTRY != undefined) {
                      countryname = country_name[0].COUNTRY;
                      countryname = CapitalizeCase(countryname);
                      countryname = countryname.replace("'", "''");
                    }
                  }
                }
                await family_member_profiles(family_profile_data, memb_userid, cityname, countryname).then(async (familyprofileresult) => {
                  if (familyprofileresult != undefined || familyprofileresult != '') {
                    // console.log(familyprofileresult);
                  } else {
                    // console.log("No family member");
                  }
                });
              });
            });
            i += 1;
            if (i === family_profiledata.length) {
              resolve('Family Member Added');
            } else {
              // console.log("Family Member not Added",family_profiledata.length,i)
            }
          }
        }
      } else {
        // console.log("No Family Member to Added")
        resolve('Family Member Not Added');
      }
    });
  });
}

async function family_member_profiles(profile_data, memb_userid, cityname, countryname) {
  return new Promise(async (resolve, reject) => {
    const AllPlans = await policyModel.getAllPlans();
    let surname = '';
    if (profile_data.SURNAME != null) {
      surname = profile_data.SURNAME;
      surname = surname.replace("'", "''");
    }
    let firstname = '';
    if (profile_data.FIRSTNAME != null) {
      firstname = profile_data.FIRSTNAME;
      firstname = firstname.replace("'", "''");
    }
    //
    let dob = null;
    if (profile_data.DOB != null) {
      dob = new Date(profile_data.DOB).toISOString().split('T')[0];
    }
    let child_type = '';
    let relationship = '';
    if (profile_data.RELATIONSHIP == 'Self' || profile_data.RELATIONSHIP == 'SELF') {
      relationship = 'PRIMARY';
    } else if (profile_data.RELATIONSHIP == 'SPOUSE' || profile_data.RELATIONSHIP == 'Spouse') {
      relationship = 'SPOUSE';
    } else if (profile_data.RELATIONSHIP == 'Daughter' || profile_data.RELATIONSHIP == 'DAUGHTER' || profile_data.RELATIONSHIP == 'Son' || profile_data.RELATIONSHIP == 'SON' || profile_data.RELATIONSHIP == 'Child') {
      relationship = 'CHILD';
      child_type = 'Natural Child';
    } else if (profile_data.RELATIONSHIP == 'Father' || profile_data.RELATIONSHIP == 'FATHER' || profile_data.RELATIONSHIP == 'Mother' || profile_data.RELATIONSHIP == 'MOTHER') {
      relationship = 'PARENT';
    } else if (profile_data.RELATIONSHIP == 'Full Time Student' || profile_data.RELATIONSHIP == 'FULL TIME STUDENT' || profile_data.RELATIONSHIP == 'STUDENT' || profile_data.RELATIONSHIP == 'Student') {
      relationship = 'TERTIARY_STUDENT';
    } else {
      relationship = 'PRIMARY';
      // console.log("relationship out of list",profile_data.RELATIONSHIP)
    }

    let address1 = '';
    if (profile_data.ADDRLINE1) {
      address1 = profile_data.ADDRLINE1;
      address1 = address1.replace("'", "''");
    }

    let address2 = '';
    if (profile_data.ADDRLINE2) {
      address2 = profile_data.ADDRLINE2;
      address2 = address2.replace("'", "''");
    }
    let empprofile = '';

    let corememberid = '';
    corememberid = profile_data.MEMBERID;
    // console.log("corememberid,memb_userid",corememberid,memb_userid)

    if (dob != null || dob != undefined) {
      empprofile = `SET IDENTITY_INSERT tbl_profiles ON;INSERT INTO tbl_profiles (profile_id,family_id,surname,forename,date_of_birth,relationship,child,user_gender,is_mauritian,nic_no,passport_no,marital_status,phone_no_home,phone_no_mobile,phone_no_office,address_1,address_2,is_pensioner,card) VALUES ('${corememberid}','${memb_userid}','${surname}','${firstname}','${dob}','${relationship}','${child_type}','${profile_data.GENDER}',0,'${profile_data.NIC}','','SINGLE','${profile_data.ALTPHONENUM}','${profile_data.PHONENUM}','','${address1},${cityname},${countryname}','${address2},${cityname},${countryname}','','Physical');SELECT SCOPE_IDENTITY() AS profile_id;SET IDENTITY_INSERT tbl_profiles OFF`;
    } else {
      empprofile = `SET IDENTITY_INSERT tbl_profiles ON;INSERT INTO tbl_profiles (profile_id,family_id,surname,forename,date_of_birth,relationship,child,user_gender,is_mauritian,nic_no,passport_no,marital_status,phone_no_home,phone_no_mobile,phone_no_office,address_1,address_2,is_pensioner,card) VALUES ('${corememberid}','${memb_userid}','${surname}','${firstname}',null,'${relationship}','${child_type}','${profile_data.GENDER}',0,'${profile_data.NIC}','','SINGLE','${profile_data.ALTPHONENUM}','${profile_data.PHONENUM}','','${address1},${cityname},${countryname}','${address2},${cityname},${countryname}','','Physical');SELECT SCOPE_IDENTITY() AS profile_id;SET IDENTITY_INSERT tbl_profiles OFF`;
    }

    const getlastprofile_details = await database.request().query(empprofile);
    let memprofile_id;
    memprofile_id = getlastprofile_details.recordset[0].profile_id;
    //
    const rgpa_basic = AllPlans.recordsets[0][0].rgpa_basic_id;
    const monthly_rgpa_amount = AllPlans.recordsets[0][0].monthly_payable;
    const totalAmount = monthly_rgpa_amount + 0 + 0;
    const FSC_fee = ((0.35 / 100) * totalAmount);
    const total = totalAmount + FSC_fee;
    const monthly_premium = total.toFixed(2);
    const top_up_part1 = null;
    const top_up_part2 = null;

    const mempolicy = `INSERT INTO tbl_policy_details (family_id,member_id,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${memb_userid}','${memprofile_id}','${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}');`;

    await database.request().query(mempolicy);
    //
    const profile_no = await generateString(10);
    // const memins = `INSERT INTO tbl_insurance (family_id,policy_no,insurance_status) VALUES ('${memb_userid}','${profile_no}','NOT ACTIVE');SELECT bank_code as bank_id FROM tbl_bank_list WHERE bank_code='${profile_data.BANKID}';`;
    //

    // let getbank_id_details = await database.request().query(memins);
    let membbankid;
    membbankid = getbank_id_details.recordset[0].bank_id;
    //
    let insurenceid = '';
    const insurence_query = `SELECT insurance_id FROM tbl_insurance WHERE family_id='${memb_userid}'`;

    insurenceid = await database.request().query(insurence_query);

    if (insurenceid.recordset.length > 0) {
      insurenceid = insurenceid.recordset[0].insurance_id;

      // console.log("insurance_id,memb_userid",insurenceid,memb_userid)
      const mainmembinsdetails = `INSERT INTO tbl_insurance_details (insurance_id,family_id,member_id,effective_insurance_date,insurance_end_date,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${insurenceid}','${memb_userid}','${memprofile_id}',null,null,'${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}');`;

      await database.request().query(mainmembinsdetails);
    }
    //

    // console.log("bank,membbankid,memb_userid",memb_userid,membbankid)
    const empbank = `INSERT INTO tbl_user_bank_details (user_id,bank_id,bank_account_holder,bank_account_number) VALUES ('${memb_userid}','${membbankid}','${firstname}','${profile_data.BANKACCNO}')`;

    const empbankdetails = await database.request().query(empbank);
    if (empbankdetails.rowsAffected[0] > 0) {
      // console.log("family member added");
      resolve('family member added');
    } else {
      // console.log("family member no added");
    }
  });
}

async function getroles(req, res) {
  await oracle_database.getConnected('select * from CORPORATEMASTER', [], (role_data) => {
    if (role_data) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        'success',
        role_data,
      );
    }
  });
}

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

// TO ADD subhr to profiles
async function get_subhr_profiles() {
  return new Promise(async (resolve, reject) => {
    // const subhrquery = `SELECT usr.*,emp.company_id FROM tbl_users as usr JOIN tbl_employees emp ON emp.user_id = usr.user_id AND emp.role=2 WHERE usr.password='subhr@123#' AND usr.user_id<200`;
    const subhrquery = 'select * from tbl_users where user_id<200 and role=2';
    const subhrdetails = await database.request().query(subhrquery);
    for (let i = 0; i < subhrdetails.length; i++) {
      const subhr_details = subhrdetails[i];
      const { user_id } = subhr_details;
      let { email_id } = subhr_details;
      const { company_id } = subhr_details;
      email_id = email_id.replace(/[0-9]/g, '');
      email_id = email_id.substring(0, email_id.indexOf('@'));
      let surname = 'Mr';
      if (email_id.includes('Mr')) {
        surname = 'Mr';
      } else if (email_id.includes('Mrs')) {
        surname = 'Mrs';
      }
      email_id = email_id.replace(/Mrs|Mr/g, '');
      const forename = CapitalizeCase(email_id);

      await add_subhr_profiles(surname, forename, user_id, cityname, countryname).then(async (profileresult) => {
        if (profileresult != undefined || profileresult != '') {
          logger.info(profileresult);
          if (i + 1 === subhrdetails.length) {
            resolve('subhrdetails');
          }
        } else {
          logger.info('----');
        }
      });
    }
  });
}

async function add_subhr_profiles(surname, forename, user_id, cityname, countryname) {
  return new Promise(async (resolve, reject) => {
    const AllPlans = await policyModel.getAllPlans();

    //
    const dob = '01-01-1978';
    const relationship = 'PRIMARY';
    const child_type = '';
    const address1 = '';
    const address2 = '';
    const corememberid = user_id;
    let empprofile = '';

    empprofile = `SET IDENTITY_INSERT tbl_profiles ON;INSERT INTO tbl_profiles (profile_id,family_id,surname,forename,date_of_birth,relationship,child,user_gender,is_mauritian,nic_no,passport_no,marital_status,phone_no_home,phone_no_mobile,phone_no_office,address_1,address_2,is_pensioner,card) VALUES ('${corememberid}','${user_id}','${surname}','${forename}','${dob}','${relationship}','${child_type}','Male',0,'','','SINGLE','9999999999','8888888888','','${address1},${cityname},${countryname}','${address2},${cityname},${countryname}','','Physical');SELECT SCOPE_IDENTITY() AS profile_id;SET IDENTITY_INSERT tbl_profiles OFF`;

    const getlastprofile_details = await database.request().query(empprofile);
    let memprofile_id;
    memprofile_id = getlastprofile_details.recordset[0].profile_id;

    //
    const rgpa_basic = AllPlans.recordsets[0][0].rgpa_basic_id;
    const monthly_rgpa_amount = AllPlans.recordsets[0][0].monthly_payable;
    const totalAmount = monthly_rgpa_amount + 0 + 0;
    const FSC_fee = ((0.35 / 100) * totalAmount);
    const total = totalAmount + FSC_fee;
    const monthly_premium = total.toFixed(2);
    const top_up_part1 = null;
    const top_up_part2 = null;

    const mempolicy = `INSERT INTO tbl_policy_details (family_id,member_id,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${user_id}','${memprofile_id}','${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}');`;
    await database.request().query(mempolicy);

    //
    const profile_no = await generateString(10);
    const memins = `INSERT INTO tbl_insurance (family_id,policy_no,insurance_status) VALUES ('${user_id}','${profile_no}','NOT ACTIVE');`;
    //

    await database.request().query(memins);
    //
    let insurenceid = '';
    const insurence_query = `SELECT insurance_id FROM tbl_insurance WHERE family_id='${user_id}'`;

    insurenceid = await database.request().query(insurence_query);

    if (insurenceid.recordset.length > 0) {
      insurenceid = insurenceid.recordset[0].insurance_id;

      const mainmembinsdetails = `INSERT INTO tbl_insurance_details (insurance_id,family_id,member_id,effective_insurance_date,insurance_end_date,rgpa_basic,monthly_rgpa_amount,top_up_part1,monthly_payment_part1,top_up_part2,monthly_payment_part2,FSC_fee,monthly_premium) VALUES ('${insurenceid}','${user_id}','${memprofile_id}',null,null,'${rgpa_basic}','${monthly_rgpa_amount}',${top_up_part1},'0',${top_up_part2},'0','${FSC_fee}','${monthly_premium}')`;

      await database.request().query(mainmembinsdetails);

      resolve('Subhr Profile added');
    } else {
      resolve('Subhr Profile not added');
    }
  });
}

async function getCompanies(req, res) {
  await oracle_database.getConnected('select * from CORPORATEMASTER', [], (role_data) => {
    if (role_data) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        'success',
        role_data,
      );
    }
  });
}

module.exports = {
  datamigrate, getroles, getCompanies,
};
