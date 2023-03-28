/* eslint-disable no-shadow */
/* eslint-disable no-trailing-spaces */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */
const { query } = require('mssql');
const { database } = require('../utils/database');

// const QueryGenerator = require('../generators/query.generate');

const insertNotification = async (notification) => {
  const query = `INSERT INTO tbl_notification
    (
        request_id,
        request_status,
        notify_to,
        notified_by,
        notification_description
    )
    VALUES
    (
        ${notification.request_id},
        ${notification.request_status},
        ${notification.notify_to},
        ${notification.notified_by},
        '${notification.notification_description}'
    );
    SELECT SCOPE_IDENTITY() AS notification_id;`;
  return await database.request().query(query);
};

const insertNotificationForUser = async (notification) => {
  const query = `INSERT INTO tbl_notification_for_user
    (
        notification_id,
        family_id,
        member_id
    )
    VALUES
    (
        ${notification.notification_id},
        ${notification.family_id},
        ${notification.member_id}
    )`;
  return await database.request().query(query);
};

const deleteNotification = async (id) => {
  const query = `DELETE FROM tbl_notification WHERE notification_id = ${id}`;
  return await database.request().query(query);
};

const getNotifications = async (user_id) => {
  const query = `Select 
  n.*,reqtypes.request_type, reqtypes.request_type_id,reqstatus.request_status AS status,req.family_id,
   u.is_read ,
  (select forename from tbl_profiles WHERE family_id = n.notified_by AND relationship = 'PRIMARY') AS notified_by_forename,
  (select surname from tbl_profiles WHERE family_id = n.notified_by AND relationship = 'PRIMARY') AS notified_by_surname,
  (select forename from tbl_profiles WHERE family_id = n.notify_to AND relationship = 'PRIMARY') AS notify_to_forename,
  (select surname from tbl_profiles WHERE family_id = n.notify_to AND relationship = 'PRIMARY') AS notify_to_surname
  FROM tbl_notification_for_user u 
  JOIN tbl_notification n ON n.notification_id = u.notification_id 
  JOIN tbl_requests req ON req.request_id = n.request_id
  JOIN tbl_request_status  reqstatus ON reqstatus.request_status_id = n.request_status
  LEFT JOIN tbl_request_types reqtypes on reqtypes.request_type_id = req.request_type
  WHERE u.family_id = ${user_id}
  AND n.created_at >= cast(dateadd(day, -7, getdate()) as date)
  ORDER BY u.notification_id DESC`;
  return await database.request().query(query);
};
 
const getCountByFamilyId = async (user_id) => {
  const query = `SELECT 
  COUNT(*) AS notificationCount 
  FROM tbl_notification_for_user u
  JOIN tbl_notification n ON n.notification_id = u.notification_id
  WHERE u.family_id = ${user_id} AND u.is_read = 0
  AND n.created_at >= cast(dateadd(day, -7, getdate()) as date)`;
  return await database.request().query(query);
};

const updateIsRead = async (user_id) => {
  const query = `UPDATE  tbl_notification_for_user SET is_read = 1 WHERE family_id = ${user_id}`;
  return await database.request().query(query);
};

module.exports = {
  insertNotification,
  insertNotificationForUser,
  deleteNotification,
  getNotifications,
  getCountByFamilyId,
  updateIsRead,
};
