/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { database } = require('../utils/database');

const QueryGenerator = require('../generators/query.generate');

const addCity = async (city) => {
  const query = `INSERT INTO tbl_city (city_id,city_name,city_code) VALUES (${city.CITYID},'${city.CITYNAME}','')`;
  return await database.request().query(query);
};
const getCity = async (city) => {
  const query = `SELECT * FROM tbl_city WHERE city_id = ${city.CITYID}`;
  return await database.request().query(query);
};
const getMauritiusCities = async () => {
  const query = 'SELECT city_id, city_name, city_code FROM tbl_city';
  return await database.request().query(query);
};

module.exports = {
  addCity,
  getCity,
  getMauritiusCities,
};
