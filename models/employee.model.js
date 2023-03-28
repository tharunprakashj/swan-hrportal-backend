/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generator');

const fetchingCompanyWithUser = async (user_id) => {
  const query = `SELECT * FROM tbl_employees WHERE user_id = ${user_id}`;

  return await database.request().query(query);
};

module.exports = {
  fetchingCompanyWithUser,
};
