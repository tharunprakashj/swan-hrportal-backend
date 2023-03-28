const createError = require('http-errors');

const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { StatusCodes } = require('http-status-codes');
const { token } = require('morgan');
const moment = require('moment');

// const helmet = require('helmet');
const winston = require('./utils/winston');

const indexRouter = require('./routes/index.route');
const Response = require('./utils/response');
const { Message } = require('./utils/message');
const { deleteFile } = require('./controllers/file.controller');

const app = express();

// Import Token Module for configure JWT options and JWT Secret
const tokenModule = require('./utils/token');
const dataMigrationRouter = require('./routes/datamigration.route');

const { orclConnection } = require('./utils/oracleDatabase');

// combined logs
app.use(morgan('combined', { stream: winston.stream }));

// app.use(helmet.frameguard({ action: 'DENY' }));

// const corsOpts = {
//   origin: '*',

//   methods: [
//     'GET',
//     'POST',
//   ],

//   allowedHeaders: [
//     'Content-Type',
//   ],
// };

// app.use(cors(corsOpts));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// setting json support
app.use(express.json());

// setting url eccoded support
app.use(express.urlencoded({ extended: false }));

// setting cookie-parser to app
app.use(cookieParser());

// ANCHOR setting app end point as myswan
app.use('/swan', indexRouter);


app.get('/action-test', async (req, res) => {
  res.send('Hi Tharun Prakash');
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  new Response(
    res,
    StatusCodes.BAD_REQUEST,
  ).ErrorMessage(
    Message.Common.FailureMessage.UrlNotValid,
  );
  next(err);
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// Set JWT Option
tokenModule.setJwtOptions({
  expiresIn: process.env.JWT_EXPIRE_TIME,
  issuer: process.env.JWT_ISSUER,
});

// Set JWT Secret
tokenModule.setJwtSecret(process.env.JWT_SECRET);

module.exports = app;
