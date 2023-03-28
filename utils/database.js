// MSSQL pulgin for connecting and accessing of sql server database
const sql = require('mssql');
const logger = require('./winston');

// /**
//  * Dot env configuration
//  */

require('dotenv').config();

const config = {
  type: process.env.DB_TYPE,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: JSON.parse(process.env.DB_PORT),
  // requestTimeout: 500000000,
  // pool: {
  //   max: 1000,
  //   min: 1,
  //   idleTimeoutMillis: 500000000,
  //   acquireTimeoutMillis: 500000000,
  //   createTimeoutMillis: 500000000,
  //   destroyTimeoutMillis: 500000000,
  //   reapIntervalMillis: 500000000,
  //   createRetryIntervalMillis: 500000000,
  // },
  options: {
    trustServerCertificate: true,
    encrypt: false,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
    },
  },
};

const database = new sql.ConnectionPool(config);

database.connect().then((pool) => {
  logger.info('Connected to MSSQL Server');
}).catch((err) => logger.error('Database Connection Failed! Bad Config: ', err));

module.exports = {
  database,
};

// // MSSQL pulgin for connecting and accessing of sql server database
// const sql = require('mssql');

// const { LocalStorage } = require('node-localstorage');

// localStorage = new LocalStorage('./scratch');

// let database;

// async function databaseConnection(dbName) {
//   const config = {
//     type: process.env.DB_TYPE,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     server: process.env.DB_HOST,
//     database: dbName,
//     port: JSON.parse(process.env.DB_PORT),
//     synchronize: true,
//     trustServerCertificate: true,
//     pool: {
//       max: 10,
//       min: 0,
//       idleTimeoutMillis: 30000,
//     },
//     option: {
//       trustServerCertificate: true,
//       encrypt: true,
//       cryptoCredentialsDetails: {
//         minVersion: 'TLSv1',
//       },
//     },
//   };
//   database = new sql.ConnectionPool(config);

//   // return database;

//   // localStorage.setItem("db", database)
//   return await database.connect().then((pool) => {
//   }).catch((err) => logger.info('Database Connection Failed! Bad Config: ', err));
//   return database;
// }

// module.exports = {
//   databaseConnection,
// };
