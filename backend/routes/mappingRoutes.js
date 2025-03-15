const express = require('express');
const { mapPayers } = require('../services/mappingService');
const router = express.Router();

router.post('/map', async (req, res) => {
    try {
        await mapPayers();
        res.status(200).send('Mapping completed successfully');
    } catch (err) {
        res.status(500).send('Error in mapping');
    }
});

module.exports = router;
