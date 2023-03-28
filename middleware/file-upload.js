const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const shortid = require('shortid');
const { S3Client } = require('@aws-sdk/client-s3');

const {
  AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME,
} = process.env;

// AWS.config.update({
//   region: AWS_REGION,
//   accessKeyId: AWS_KEY_ID,
//   secretAccessKey: AWS_SECRET_KEY,
// });
// const s3 = new AWS.S3({
//   accessKeyId: AWS_KEY_ID,
//   secretAccessKey: AWS_SECRET_KEY,
// });

const s3 = new S3Client(
  {
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    },
    sslEnabled: false,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  },
);

const storage = multerS3({
  s3,
  bucket: AWS_BUCKET_NAME,
  metadata(req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key(req, file, cb) {
    switch (file.fieldname) {
      case 'COMPANY_LOGO':
        cb(null, `uploads/company_logo/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'BIRTH_CERTIFICATE':
        cb(null, `uploads/documents/birth_certificate/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'NATIONAL_IDENTITY_CARD':
        cb(null, `uploads/documents/national_identity_card/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'PASSPORT':
        cb(null, `uploads/documents/passport/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'CIVIL_MARRIAGE_CERTIFICATE':
        cb(null, `uploads/documents/civil_marriage_certificate/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'WRITTEN_PROOF':
        cb(null, `uploads/documents/written_proof/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'DISABILITY_MEDICAL_REPORT':
        cb(null, `uploads/documents/disability_medical_report/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'ADOPTION_PAPER':
        cb(null, `uploads/documents/adoption_paper/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'PROOF_OF_ADDRESS':
        cb(null, `uploads/documents/proof_of_address/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'PAY_ROLL':
        cb(null, `uploads/documents/pay_roll/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      case 'XRAY_SCAN':
        cb(null, `uploads/documents/xray_scan/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
        break;
      default:
        break;
    }
    // if (file.fieldname === 'BIRTH_CERTIFICATE') {
    //   cb(null, `uploads/documents/birth_certificate/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
    // }
    // cb(null, `uploads/documents/${file.fieldname}_${new Date().toISOString().slice(0, 10)}_${shortid.generate()}`);
  },
});

const upload = multer({
  storage,
});

module.exports = { upload };
