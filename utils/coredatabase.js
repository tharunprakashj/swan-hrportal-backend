// // MSSQL pulgin for connecting and accessing of sql server database
// const sql = require("mssql");

// // /**
// //  * Dot env configuration
// //  */

// require("dotenv").config();

// const config = {
//   type: process.env.DB_TYPE,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   server: process.env.DB_HOST,
//   database: process.env.CORE_DB_NAME,
//   port: JSON.parse(process.env.DB_PORT),
//   requestTimeout: 500000000,
//   options: {
//     trustServerCertificate: true,
//     encrypt: false,
//     cryptoCredentialsDetails: {
//       minVersion: 'TLSv1',
//     },
//   },
// };
// // console.log("CONFIGURATION---->",config)

// const database = new sql.ConnectionPool(config);

// database
//   .connect()
//   .then((pool) => {
//     console.log("Connected to MSSQL Core Server");
//   })
//   .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

// module.exports = {
//   database,
// };

// // // MSSQL pulgin for connecting and accessing of sql server database
// // const sql = require('mssql');

// // const { LocalStorage } = require('node-localstorage');

// // localStorage = new LocalStorage('./scratch');

// // let database;

// // async function databaseConnection(dbName) {
// //   const config = {
// //     type: process.env.DB_TYPE,
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASS,
// //     server: process.env.DB_HOST,
// //     database: dbName,
// //     port: JSON.parse(process.env.DB_PORT),
// //     synchronize: true,
// //     trustServerCertificate: true,
// //     pool: {
// //       max: 10,
// //       min: 0,
// //       idleTimeoutMillis: 30000,
// //     },
// //     option: {
// //       trustServerCertificate: true,
// //       encrypt: true,
// //       cryptoCredentialsDetails: {
// //         minVersion: 'TLSv1',
// //       },
// //     },
// //   };
// //   database = new sql.ConnectionPool(config);

// //   // return database;

// //   // localStorage.setItem("db", database)
// //   return await database.connect().then((pool) => {
// //     console.log('Connected to MSSQL Server');
// //   }).catch((err) => console.log('Database Connection Failed! Bad Config: ', err));
// //   return database;
// // }

// // module.exports = {
// //   databaseConnection,
// // };
