require('dotenv').config();

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { SPLAT } = require('triple-beam');
const { isObject } = require('lodash');

const moment = require('moment');

const {
  combine, timestamp, label, printf, prettyPrint, colorize,
} = format;

const appPath = process.env.APP_BASE_PATH;

const formatObject = (param) => {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
};

// getting if it has multiple params
const all = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.message = `${message} ${rest}`;
  return info;
});
const timezoneFormat = () => moment().format('YYYY-MM-DDTHH:mm:ss.SSS');

const logger = new winston.createLogger({
  format: combine(
    // label({ label: process.env.APP_NAME }),
    all(),
    format.timestamp({ format: timezoneFormat }),
    colorize(),
    // timestamp(),
    prettyPrint(),
    printf((info) => `${info.timestamp} ${info.level}: ${formatObject(info.message)}`),
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: true,
      colorize: true,
    }),
    new winston.transports.File({
      filename: `${appPath}/logs/error.log`,
      level: 'error',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: true,
    }),
    new winston.transports.File({ filename: `${appPath}/logs/combined.log` }),
  ],
  exitOnError: true, //  exit on handled exceptions
});

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

module.exports = logger;
