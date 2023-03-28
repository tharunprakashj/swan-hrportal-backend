const uniqid = require('uniqid');
const mysql = require('mysql2');
const mssql = require('mssql');
const { Message } = require('../utils/message');

const logger = require('../utils/winston');

const QueryGenerator = {

  insert(table_name, data = [], duplication = []) {
    if (!(data instanceof Array)) {
      data = [data];
    }

    const keys = Object.keys(data[0]).join();
    const values = data.map((item) => `(${Object.values(item).map(() => '?').join()})`);
    let actual_insert_data = data.map((item) => Object.values(item));

    actual_insert_data = [].concat.apply([], actual_insert_data);

    let query = mysql.format(`INSERT INTO ${table_name} (${keys}) VALUES ${values}`, actual_insert_data, ';SELECT SCOPE_IDENTITY();');
    // logger.info(`PREPARING ${query}`)
    if (duplication.length) {
      duplication = duplication.length ? ` ${duplication.map((item) => `${item} = VALUES(${item})}`)} ` : '';
      query += duplication;
    }

    logger.info(`PREPARING ${query.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ')}`);
    return query;
  },

  update(table_name, data, where = null, type = null) {
    const update_sequence = Object.keys(data).filter((item) => data[item] != null).map((item) => {
      if (type == 'increment') {
        return `${item} = ${item} + ?`;
      } if (type == 'decrement') {
        return `${item} = ${item} - ?`;
      }
      return `${item} = ?`;
    }).join();

    let values = Object.values(data).filter((item) => item != null);

    if (where) {
      values = [...values, ...Object.values(where)];

      where = Object.keys(where).map((item) => `${item} = ?`);

      // where = where.length ? ` WHERE ${where.join()} ` : '';
      where = where.length ? ` WHERE ${where.join(' and ')} ` : '';
    }

    const query = mysql.format(`UPDATE ${table_name} SET ${update_sequence} ${where}`, values);

    logger.info(`PREPARING ${query}`);
    return query;
  },

  delete(table_name, where) {
    if (where) {
      where = Object.keys(where).map((item) => `${item} = ?`);
    } else {
      throw new Error(Message.Common.FailureMessage.NoAccessToDelete);
    }
  },

  format(query, values) {
    if (values instanceof Array) {
      query = mysql.format(query, values);
    } else {
      query = query.replace(/\:(\w+)/g, (txt, key) => {
        if (values.hasOwnProperty(key)) {
          return mysql.escape(values[key]);
        }

        return txt;
      });
    }

    logger.info(`PREPARING ${query.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ')}`);

    return query;
  },
  CURRENT_TIMESTAMP: {
    toSqlString() {
      return 'CURRENT_TIMESTAMP()';
    },
  },
  LAST_INSERTID: {
    toSqlString() {
      return 'LAST_INSERT_ID()';
    },
  },

  RANDOM_UNIQID: `SP_${uniqid.time().toUpperCase()}`,

};

module.exports = QueryGenerator;
