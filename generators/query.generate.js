/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

// Insert Method
const insert = async (table_name, data) => {
  if (typeof data === 'object') {
    data = JSON.parse(JSON.stringify(data));
    const keys = JSON.stringify(Object.keys(data)).slice(1, -1).replaceAll('"', '');
    // eslint-disable-next-line quotes
    const values = JSON.stringify(Object.values(data)).slice(1, -1).replaceAll('"', `'`);
    const query = `INSERT INTO ${table_name} (${keys}) VALUES (${values});SELECT SCOPE_IDENTITY() AS insertedId;`;
    return query;
  }
};

// Update Method
const update = async (table_name, data, params_value) => {
  if (typeof data === 'object') {
    data = JSON.parse(JSON.stringify(data));
    let query = `UPDATE ${table_name} SET `;
    keysAndValues = Object.entries(data);
    for (let i = 0; i < keysAndValues.length; i++) {
      for (let j = 0; j < keysAndValues[i].length; j++) {
        if (j === 0) {
          query = `${query}${keysAndValues[i][j]} = `;
        } else {
          if (i === keysAndValues.length - 1) {
            if (typeof (keysAndValues[i][j]) === 'string') {
              query = `${query}'${keysAndValues[i][j]}'`;
            } else {
              query = `${query}${keysAndValues[i][j]}`;
            }
          } else {
            if (typeof (keysAndValues[i][j]) === 'string') {
              query = `${query}'${keysAndValues[i][j]}',`;
            } else {
              query = `${query}${keysAndValues[i][j]},`;
            }
          }
        }
      }
    }
    if (params_value !== 'undefined') {
      if (typeof params_value === 'object') {
        params_value = JSON.parse(JSON.stringify(params_value));
        keysAndValues = Object.entries(params_value);
        for (let i = 0; i < keysAndValues.length; i++) {
          for (let j = 0; j < keysAndValues[i].length; j++) {
            if (j === 0 && i === 0) {
              query = `${query} WHERE ${keysAndValues[i][j]} = `;
            } else if (j === 0) {
              query = `${query} AND ${keysAndValues[i][j]} = `;
            } else {
              if (typeof (keysAndValues[i][j]) === 'string') {
                query = `${query}${keysAndValues[i][j]}`;
              } else {
                query = `${query}${JSON.parse(keysAndValues[i][j])}`;
              }
            }
          }
        }
      }
    }
    return query;
  }
};

module.exports = {
  insert,
  update,
};
