const express = require('express');
const {
    getAllPayers,
    addPayer,
    mapPayerDetails,
    uploadPayerDetails,upload
} = require('../controllers/payerController');

const router = express.Router();

router.get('/payers', getAllPayers);
router.post('/payer', addPayer);
router.post('/map-payer-details', mapPayerDetails);
router.post('/upload-payer-details', upload.single('file'), uploadPayerDetails);

module.exports = router;