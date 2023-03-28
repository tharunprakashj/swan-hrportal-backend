const oracledb = require('oracledb');

const getConnected = function (sql, params, callback) {
  oracledb.getConnection(
    {
      user: 'HISYSTEM',
      password: 'hisystem',
      // connectString: '192.168.200.128/XE',
      connectionString: 'localhost:1521/orcl',
    },
    (err, connection) => {
      if (err) {
        console.error(err.message);
        callback(null);
        return;
      }
      console.log(sql);
      connection.execute(
        sql,
        params,
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
        (err, result) => {
          if (err) {
            console.error(err.message);
            // doRelease(connection);
            callback(null);
            return;
          }
          rows = result.rows;
          // doRelease(connection);
          callback(rows);
          return rows;
        },
      );
    },
  );
};

// function doRelease(connection) {
//   console.log(connection);
//   connection.release(function (err) {
//     if (err) {
//       console.error(err);
//     }
//   });
// }

module.exports = { getConnected };
