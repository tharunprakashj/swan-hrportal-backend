/* eslint-disable camelcase */
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // dynamic destination for different elements

    const file_type = `${file.mimetype.split('/')[0]}`;
    const destination = `${process.env.APP_BASE_PATH}/docs/${file_type}`;

    let stat = null;
    try {
      stat = fs.statSync(destination);
    } catch (err) {
      // to make directory if not found
      fs.mkdirSync(destination);
    }
    if (stat && !stat.isDirectory()) {
      throw new Error('Directory cannot be created');
    }

    req.file_destination = file_type;
    req.body[file.fieldname] = [];

    cb(null, destination);
  },
  filename(req, file, cb) {
    const req_field = file.fieldname;

    // check element to choose image name
    const file_name = `${Date.now()}_${file.originalname}`;

    // reassign request upload field to file_name
    req.body[req_field] = `${req.file_destination}/${file_name}`;

    cb(null, file_name);
  },
});

const uploads = multer({ storage });

module.exports = { uploads };
