// import express library for routing
const express = require('express');

// Data Migration Routing
const dataMigrationRouter = express.Router();

// Import Data Migration Model
const dataMigrationModel = require('../models/datamigration.model');

const migrationModel = require('../models/RGPAMigration.model');

dataMigrationRouter.get('/dataMigrationBranch', dataMigrationModel.datamigrate);

dataMigrationRouter.get('/dataMigrationroles', dataMigrationModel.getroles);

dataMigrationRouter.get('/company', dataMigrationModel.getCompanies);

dataMigrationRouter.get('/addBank', migrationModel.addBank);

dataMigrationRouter.get('/addCompanies', migrationModel.addCompanies);

dataMigrationRouter.get('/addUsers', migrationModel.addUsers);

dataMigrationRouter.get('/addSubhr', migrationModel.addSubHr);

module.exports = dataMigrationRouter;
