// const nodemailer = require('nodemailer');
// const aws = require('@aws-sdk/client-ses');
// const { defaultProvider } = require('@aws-sdk/credential-provider-node');

// const ses = new aws.SES({
//   apiVersion: '2010-12-01',
//   region: 'us-east-1',
//   defaultProvider,
// });

// // create Nodemailer SES transporter
// const transporter = nodemailer.createTransport({
//   SES: { ses, aws },
// });

// // send some mail
// transporter.sendMail(
//   {
//     from: 'sender@example.com',
//     to: 'recipient@example.com',
//     subject: 'Message',
//     text: 'I hope this message gets sent!',
//     ses: {
//       // optional extra arguments for SendRawEmail
//       Tags: [
//         {
//           Name: 'tag_name',
//           Value: 'tag_value',
//         },
//       ],
//     },
//   },
//   (err, info) => {
//     console.log(info.envelope);
//     console.log(info.messageId);
//   },
// );
