/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
const { getHr, getAllAdmins } = require('../models/user.model');
const { getCompanyIds } = require('./company.services');
const { insertNotification, insertNotificationForUser } = require('../models/notification.model');
const { Role } = require('../utils/role');

// const addNotification = async (req, res) => {
//   const notification = req.body;
// if (notification) {
//   const notificationTable = await notificationModel.insertNotification(notification.notification_details);
//   if (notificationTable.recordset[0].notification_id) {
//     const { notification_id } = notificationTable.recordset[0];
//     notification.notification_id = notification_id;
//     // for (let i = 0; i < notification.notification_for.length; i++) {}
//     const notificationForUserTable = await notificationModel.insertNotificationForUser(notification);
//     if (notificationForUserTable.rowsAffected[0] > 0) {
//       // return true;
//     }
//     const deleteNotification = await notificationModel.deleteNotification(notification_id);
//     if (deleteNotification.rowsAffected[0] > 0) {
//       return false;
//     }
//   } else {
//     return false;
//   }
// }
// };

const getUserCount = async (user_id) => {
  const users = [];
  users.push(user_id);
  const companies = await getCompanyIds(user_id);
  const subhr = await getHr(companies, [Role.SUB_HR, Role.HR_EXECUTIVE]);
  const data = subhr.recordset;
  const admin = await getAllAdmins();
  const adminData = admin.recordset;
  for (let i = 0; i < adminData.length; i++) {
    users.push(adminData[i].user_id);
  }
  for (let i = 0; i < data.length; i++) {
    users.push(data[i].user_id);
  }
  return users;
};

const createNotification = async (notification) => {
  const notificationTable = await insertNotification(notification);
  if (notificationTable.recordset[0].notification_id) {
    const { notification_id } = notificationTable.recordset[0];
    notification.notification_id = notification_id;
    const users = await getUserCount(notification.family_id);
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        insertNotificationForUser({ notification_id, family_id: users[i], member_id: null });
        if (users.length === i + 1) {
          return true;
        }
      }
    }
  } else {
    return false;
  }
};

module.exports = {
  // addNotification,
  getUserCount,
  createNotification,
};
