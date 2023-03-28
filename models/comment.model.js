/* eslint-disable camelcase */
/* eslint-disable no-return-await */
// const { query } = require('express');
const { database } = require('../utils/database');

const insertComment = async (commentDetails) => {
  const query = `INSERT INTO tbl_comments
    (
      family_id,
      request_id,
      request_status,
      comment_title,
      comments,
      comment_type,
      commented_by
    )
    VALUES
    (
        ${commentDetails.family_id},
        ${commentDetails.request_id},
        ${commentDetails.request_status},
        '${commentDetails.comment_title}',
        '${commentDetails.comments}',
        '${commentDetails.comment_type}',
        '${commentDetails.commented_by}'
    )`;

  return await database.request().query(query);
};

// Get Individual Member comments
const getCommentByMemberId = async (familyId, request_id) => {
  let condition = '';
  if (request_id) {
    condition = ` AND com.request_id = ${request_id}`;
  }
  const query = `SELECT 
  prof.forename,prof.surname,
  com.*,
  role.role_id,role.role_type
  FROM tbl_comments com 
  JOIN tbl_users usr ON usr.user_id = com.commented_by
  JOIN tbl_roles role ON role.role_id = usr.role
  JOIN tbl_profiles prof ON prof.family_id = usr.user_id
  where com.family_id = ${familyId}${condition}`;
  return await database.request().query(query);
};

module.exports = {
  insertComment,
  getCommentByMemberId,
};
