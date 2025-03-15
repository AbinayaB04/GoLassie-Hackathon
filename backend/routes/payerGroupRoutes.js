const express = require('express');
const { getAllPayerGroups, addPayerGroup } = require('../controllers/payerGroupController');
const { validatePayerGroup } = require('../middlewares/validate');

const router = express.Router();

router.get('/', getAllPayerGroups);
router.post('/', validatePayerGroup, addPayerGroup);

module.exports = router;