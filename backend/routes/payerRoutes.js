const express = require('express');
const { getAllPayers, addPayer, mapPayerDetails } = require('../controllers/payerController');
const { validatePayer } = require('../middlewares/validate');

const router = express.Router();

router.get('/', getAllPayers);
router.post('/', validatePayer, addPayer);
router.post('/map', mapPayerDetails);

module.exports = router;