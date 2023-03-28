// const oracledb = require('oracledb');

// const orclConnection = oracledb.getConnection(
//   {
//     user: 'HISYSTEM',
//     password: 'hisystem',
//     //   connectString: '192.168.200.128/XE',
//     connectionString: 'localhost:1521/orcl',
//   },
// ).then((connection) => {
//   if (connection) {
//     console.log('Successfully connected to DB!');
//     return connection;
//   }
// }).catch((err) => { console.log(`Error ${err}`); });

// // const orclConnection = oracledb.getConnection(
// //   {

// //     user: 'HISYSTEM',
// //     password: 'hisystem',
// //     //   connectString: '192.168.200.128/XE',
// //     connectionString: 'localhost:1521/orcl',

// //   },

// //   (err, connection) => {
// //     if (err) throw err;

// //     connection.execute(

// //       // Your database query here.
// //       sql,
// //       params,
// //       { outFormat: oracledb.OUT_FORMAT_OBJECT },

// //       // below code if you want to fetch data from database and show it on terminal
// //       (err, results) => {
// //         const metaData = {};
// //         const rows = {};
// //         console.log('error');
// //         if (err) {
// //           throw err;
// //         }
// //         metaData.name1 = results.metaData[0].name;
// //         metaData.name2 = results.metaData[1].name;

// //         rows.row1 = results.rows[0][0];
// //         rows.row2 = results.rows[0][1];
// //         rows.row3 = results.rows[0][2];
// //         console.log(`${metaData.name1} : ${rows.row1}`);
// //         console.log(`${metaData.name2} : ${rows.row2}`);

// //         console.log('Successfully connected');
// //       },

// //     );
// //   },
// // );

// module.exports = { orclConnection };
