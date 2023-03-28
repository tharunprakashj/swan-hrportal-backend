/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const { Country, State, City } = require('country-state-city');

const { StatusCodes } = require('http-status-codes');
const Response = require('../utils/response');
const logger = require('../utils/winston');
const { Message } = require('../utils/message');

const fileController = require('./file.controller');

// Import location model
const locationModel = require('../models/location.model');

exports.getCountries = async (req, res) => {
  try {
    logger.info('fetching countries');
    let countries = Country.getAllCountries();
    countries = countries.map(({
      name,
      flag,
      isoCode,
    }) => ({
      name,
      flag,
      code: isoCode,
    }));
    new Response(
      res,
    ).SuccessResponse(
      Message.Common.SuccessMessage.Fetch('Countries'),
      countries,
    );
  } catch (err) {
    logger.error('fetching countries', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

exports.getStates = async (req, res) => {
  try {
    const {
      country_code,
    } = req.query;
    let states = State.getStatesOfCountry(
      country_code,
    );

    states = states.map(({
      name,
      flag,
      isoCode,
      countryCode,
    }) => ({
      name,
      code: isoCode,
      country_code: countryCode,
    }));
    new Response(
      res,
    ).SuccessResponse(
      Message.Common.SuccessMessage.Fetch('States'),
      states,
    );
  } catch (err) {
    logger.error('fetching states', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

exports.getCities = async (req, res) => {
  try {
    const {
      state_code,
      country_code,
    } = req.query;
    const cities = City.getCitiesOfState(
      country_code,
      state_code,
    );
    new Response(
      res,
    ).SuccessResponse(
      Message.Common.SuccessMessage.Fetch('Cities'),
      cities,
    );
  } catch (err) {
    logger.error('fetching cities', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

exports.insertCities = async (req, res) => {
  try {
    const {
      cities,
    } = req.body;
    const path = `${process.env.APP_BASE_PATH}/docs/${cities}`;
    const data = await fileController.fetchingDocData(path);
    for (let i = 0; i < data.length; i++) {
      if (data[i].CITYNAME.includes("'")) {
        data[i].CITYNAME = data[i].CITYNAME.replace("'", "''");
      }
      const checkCity = await locationModel.getCity(data[i]);
      if (checkCity.recordset.length > 0) {
        if (i + 1 === data.length) {
          new Response(
            res,
            StatusCodes.OK,
          ).SuccessResponse(
            Message.Common.SuccessMessage.Creation('Cities'),
          );
        }
      } else {
        const addCities = await locationModel.addCity(data[i]);
        if (addCities.rowsAffected[0] > 0) {
          if (i + 1 === data.length) {
            new Response(
              res,
              StatusCodes.OK,
            ).SuccessResponse(
              Message.Common.SuccessMessage.Creation('Cities'),
            );
          }
        } else {
          new Response(
            res,
            StatusCodes.OK,
          ).ErrorMessage(
            Message.Common.FailureMessage.Creation('Cities'),
          );
        }
      }
    }
  } catch (err) {
    logger.error('fetching cities', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};

exports.getMauritiusCities = async (req, res) => {
  try {
    const cities = await locationModel.getMauritiusCities();
    if (cities.recordset.length > 0) {
      new Response(
        res,
        StatusCodes.OK,
      ).SuccessResponse(
        Message.Common.SuccessMessage.Fetch('Cities'),
        cities.recordset,
      );
    } else {
      new Response(
        res,
        StatusCodes.OK,
      ).ErrorMessage(
        Message.Common.FailureMessage.Fetch('Cities'),
      );
    }
  } catch (err) {
    logger.error('fetching cities', err);
    new Response(
      res,
      StatusCodes.BAD_REQUEST,
    ).ErrorMessage(
      Message.Common.FailureMessage.InternalServerError,
    );
  }
};
