const express = require('express');

const fileRouter = express.Router();

const fileController = require('../controllers/file.controller');

const { Authentication, Access } = require('../middleware/auth');

// Import Multer for uploading files to S3
const { upload } = require('../middleware/file-upload');

const { uploads } = require('../middleware/file');

// Get Images from S3 Bucket
fileRouter.get('/', fileController.getS3Image);

// Get documentType
fileRouter.get('/types', fileController.getDocumentTypes);

// Get document
fileRouter.get('/documents/:family_id', fileController.getDocument);

// get bank list
fileRouter.get('/bankList', fileController.bankList);

// upload files
fileRouter.post(
  '/uploadUserDocuments',
  upload.fields([
    {
      name: 'BIRTH_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'NATIONAL_IDENTITY_CARD',
      maxCount: 1,
    },
    {
      name: 'PASSPORT',
      maxCount: 1,
    },
    {
      name: 'CIVIL_MARRIAGE_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'WRITTEN_PROOF',
      maxCount: 1,
    },
    {
      name: 'DISABILITY_MEDICAL_REPORT',
      maxCount: 1,
    },
    {
      name: 'ADOPTION_PAPER',
      maxCount: 1,
    },
    {
      name: 'PROOF_OF_ADDRESS',
      maxCount: 1,
    },
    {
      name: 'PAY_ROLL',
      maxCount: 1,
    },
    {
      name: 'XRAY_SCAN',
      maxCount: 1,
    },
  ]),
  fileController.uploadUserDocuments,
);

// upload files records
fileRouter.post(
  '/uploadUserDocumentRecords/:request_id',
  upload.fields([
    {
      name: 'BIRTH_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'NATIONAL_IDENTITY_CARD',
      maxCount: 1,
    },
    {
      name: 'PASSPORT',
      maxCount: 1,
    },
    {
      name: 'CIVIL_MARRIAGE_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'WRITTEN_PROOF',
      maxCount: 1,
    },
    {
      name: 'DISABILITY_MEDICAL_REPORT',
      maxCount: 1,
    },
    {
      name: 'ADOPTION_PAPER',
      maxCount: 1,
    },
    {
      name: 'PROOF_OF_ADDRESS',
      maxCount: 1,
    },
    {
      name: 'PAY_ROLL',
      maxCount: 1,
    },
    {
      name: 'XRAY_SCAN',
      maxCount: 1,
    },
  ]),
  fileController.uploadUserDocumentRecords,
);

// delete Files
fileRouter.delete('/deleteDocuments', fileController.deleteDocuments);

// // upload files
// fileRouter.post(
//   '/uploadUserDocuments',
//   (req, res, next) => {
//     upload.fields([
//       {
//         name: 'BIRTH_CERTIFICATE',
//         maxCount: 1,
//       },
//       {
//         name: 'NATIONAL_IDENTITY_CARD',
//         maxCount: 1,
//       },
//       {
//         name: 'PASSPORT',
//         maxCount: 1,
//       },
//       {
//         name: 'CIVIL_MARRIAGE_CERTIFICATE',
//         maxCount: 1,
//       },
//       {
//         name: 'WRITTEN_PROOF',
//         maxCount: 1,
//       },
//       {
//         name: 'DISABILITY_MEDICAL_REPORT',
//         maxCount: 1,
//       },
//       {
//         name: 'ADOPTION_PAPER',
//         maxCount: 1,
//       },
//       {
//         name: 'PROOF_OF_ADDRESS',
//         maxCount: 1,
//       },
//       {
//         name: 'PAY_ROLL',
//         maxCount: 1,
//       },
//       {
//         name: 'XRAY_SCAN',
//         maxCount: 1,
//       },
//     ]);
//   },

//   fileController.uploadUserDocuments,
// );

// update files
fileRouter.put(
  '/updateUserDocuments',
  upload.fields([
    {
      name: 'BIRTH_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'NATIONAL_IDENTITY_CARD',
      maxCount: 1,
    },
    {
      name: 'PASSPORT',
      maxCount: 1,
    },
    {
      name: 'CIVIL_MARRIAGE_CERTIFICATE',
      maxCount: 1,
    },
    {
      name: 'WRITTEN_PROOF',
      maxCount: 1,
    },
    {
      name: 'DISABILITY_MEDICAL_REPORT',
      maxCount: 1,
    },
    {
      name: 'ADOPTION_PAPER',
      maxCount: 1,
    },
    {
      name: 'PROOF_OF_ADDRESS',
      maxCount: 1,
    },
    {
      name: 'PAY_ROLL',
      maxCount: 1,
    },
    {
      name: 'XRAY_SCAN',
      maxCount: 1,
    },
  ]),
  fileController.updateUserDocuments,
);

// upload files
fileRouter.post(
  '/uploadQuestionDocuments',
  upload.fields([
    {
      name: 'XRAY_SCAN',
      maxCount: 1,
    },
  ]),
  fileController.uploadQuestionDocuments,
);

// upload files
fileRouter.post(
  '/uploadQuestionDocumentsRecords/:request_id',
  upload.fields([
    {
      name: 'XRAY_SCAN',
      maxCount: 1,
    },
  ]),
  fileController.uploadChangePlanDocuments,
);

// upload excel Files
fileRouter.post('/bulkUpload', Authentication(), uploads.single('employees'), fileController.uploadUsers);

module.exports = fileRouter;
