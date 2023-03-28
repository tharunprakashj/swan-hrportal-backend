const nodemailer = require('nodemailer');
const logger = require('./winston');

const sendMail = (request) => new Promise((resolve, reject) => {
  const userMail = request.email_id;
  const newPwd = request.password;

  const transporter = nodemailer.createTransport({
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // service: 'gmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secureConnection: false,
    auth: {
      user: 'arunmohindhar@outlook.com',
      pass: 'Mohindhar@1207',
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });
  const mailOptions = {
    // from: 'automated.notification@swanforlife.com', // sender address
    from: 'arunmohindhar@outlook.com',
    to: userMail, // list of receivers
    subject: 'Reset Password', // Subject line
    html: `Hi Welcome to MySwan<br>Your Password is: <b>${newPwd}</b><br>Username is Your Email Address<br>Thank You`, // plain text body
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //   host: 'webmail.swanforlife.com',
  //   port: 587,
  //   secureConnection: false,
  //   auth: {
  //     user: 'saroja.thirumurugan@swanforlife.com',
  //     pass: 'Saro@8996',
  //   },
  //   tls: {
  //     ciphers: 'SSLv3',
  //   },
  // });
  // const mailOptions = {
  //   // from: 'automated.notification@swanforlife.com', // sender address
  //   from: 'saroja.thirumurugan@swanforlife.com',
  //   to: userMail, // list of receivers
  //   subject: 'Reset Password', // Subject line
  //   html: `Hi Welcome to MySwan<br>Your Password is: <b>${newPwd}</b><br>Username is Your Email Address<br>Thank You`, // plain text body
  // };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      logger.error('Error:**send email**', err);
      reject(err);
    } else {
      logger.info('Email sent successfully');
      resolve(info);
    }
  });
});

// const sendMail = (request) => new Promise((resolve, reject) => {
//   const userMail = request.email_id;
//   const newPwd = request.password;

//   const transporter = nodemailer.createTransport({
//     // service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: 'skeintechtest@gmail.com',
//       pass: 'tuwvlwiwsvjqgxfl',
//     },
//   });
//   const mailOptions = {
//     from: 'skeintechtest@gmail.com', // sender address
//     to: userMail, // list of receivers
//     subject: 'Reset Password', // Subject line
//     html: `Hi Welcome to MySwan<br>Your Password is: <b>${newPwd}</b><br>Username is Your Email Address<br>Thank You`, // plain text body
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       logger.error('Error:**send email**', err);
//       reject(err);
//     } else {
//       logger.info('Email sent successfully');
//       resolve(info);
//     }
//   });
// });

// function generatePassword() {
//   const length = 5;
//   const charset = '0123456789';
//   let retVal = '';
//   for (let i = 0, n = charset.length; i < length; ++i) {
//     retVal += charset.charAt(Math.floor(Math.random() * n));
//   }
//   return retVal;
// }

const sendOTP = (request) => new Promise((resolve, reject) => {
  const userMail = request.email_id;
  const newPwd = request.password;

  const transporter = nodemailer.createTransport({

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // service: 'gmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secureConnection: false,
    auth: {
      user: 'arunmohindhar@outlook.com',
      pass: 'Mohindhar@1207',
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });
  const mailOptions = {
    // from: 'automated.notification@swanforlife.com', // sender address
    from: 'arunmohindhar@outlook.com',
    to: userMail, // list of receivers
    subject: 'Reset Password', // Subject line
    html: `Your One Time Password is: <b>${newPwd}</b><br>Username is Your Email Address<br>Thank You`, // plain text body
  };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //   service: 'gmail',
  //   host: 'webmail.swanforlife.com',
  //   port: 587,
  //   secureConnection: false,
  //   auth: {
  //     user: 'saroja.thirumurugan@swanforlife.com',
  //     pass: 'Saro@8996',
  //   },
  //   tls: {
  //     ciphers: 'SSLv3',
  //   },
  // });
  // const mailOptions = {
  //   from: 'saroja.thirumurugan@swanforlife.com',
  //   to: userMail, // list of receivers
  //   subject: 'Forgot Password', // Subject line
  //   html: `Your One Time Password is: <b>${newPwd}</b><br>Username is Your Email Address<br>Thank You`, // plain text body
  // };

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      logger.error('Error:**send email**', err);
      reject(err);
    } else {
      logger.info('Email sent successfully');
      resolve(info);
    }
  });
});

module.exports = { sendMail, sendOTP };
