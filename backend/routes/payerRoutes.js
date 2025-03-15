const express = require('express');
const { getAllPayers, addPayer, mapPayerDetails,uploadPayerDetails} = require('../controllers/payerController');
const { validatePayer } = require('../middlewares/validate');
const payerController = require('../controllers/payerController');

const router = express.Router();
router.get('/payers', getAllPayers);

// Add a new payer
router.post('/payer', addPayer);

// Map payer details from JSON data
router.post('/map-payer-details', mapPayerDetails);

// Upload Excel file and map payer details
router.post('/upload-payer-details', payerController.upload.single('file'), uploadPayerDetails);

module.exports = router;