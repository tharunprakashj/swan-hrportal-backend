const express = require('express');

const insuranceRouter = express.Router();

const insuranceController = require('../controllers/insurance.controller');

// Update Effective Insurance Date in Masters
insuranceRouter.put('/effectiveDate', insuranceController.updateInsuranceDate);

// Update Effective Insurance Date in Records
insuranceRouter.put('/updateEffectiveDate/:request_id', insuranceController.updateEffectiveInsuranceDate);

module.exports = insuranceRouter;
