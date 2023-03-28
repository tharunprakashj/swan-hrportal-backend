// // Import Database Configuration File for connecting database dynamically
// const { databaseConnection } = require('../utils/database');

// let database;

// exports.connectDatabase = async (req, res, next) => {
//   let db_details;
//   if (req.body.db = 'swan') {
//     db_details = {
//       db: 'myswan_master_db',
//     };
//   } else if (req.body.db = 'rgpa') {
//     db_details = {
//       db: 'rgpa_hr_portal',
//     };
//   }
//   await databaseConnection(db_details)
//     .then((db) => {

//       next();
//     })
//     .catch((err) => {
//     });
//   // if(connection==true){
//   // }
//   // await databaseConnection(db_details).then(()=>{
//   //     next();
//   // }).catch((err)=>{
//   // })
// };
