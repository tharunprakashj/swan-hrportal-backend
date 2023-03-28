const express = require('express');

const locationRouter = express.Router();

const { uploads } = require('../middleware/file');

const locationController = require('../controllers/location.controller');

/* ------------------------- Get all countries ------------------------- */
locationRouter.get('/countries', locationController.getCountries);

/* ------------------------- Get all states ------------------------- */
locationRouter.get('/states', locationController.getStates);

/* ------------------------- Get all cities ------------------------- */
locationRouter.get('/cities', locationController.getCities);

// /* -------------------------Insert Cities from Excel------------------ */
locationRouter.post('/insertCities', uploads.single('cities'), locationController.insertCities);

/* --------------------------Get Mauritius Cities-------------------------------- */
locationRouter.get('/getCities', locationController.getMauritiusCities);

module.exports = locationRouter;
