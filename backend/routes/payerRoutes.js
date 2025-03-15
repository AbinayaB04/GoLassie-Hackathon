const express = require('express');
const {
    getAllPayers,
    addPayer,
    mapPayerDetails,
    uploadPayerDetails,
    upload
} = require('../controllers/payerController');

const router = express.Router();

router.get('/', getAllPayers);
router.post('/', addPayer);
router.post('/map-details', mapPayerDetails);
router.post('/upload', upload.single(), uploadPayerDetails);
const fetchUnmappedDetailsFromDatabase = async () => {
    const result = await pool.query('SELECT * FROM payer_details WHERE payer_id IS NULL');
    return result.rows;
};

// Define the /unmapped endpoint
router.get('/unmapped', async (req, res) => {
    try {
        const unmappedDetails = await fetchUnmappedDetailsFromDatabase();
        res.json(unmappedDetails || []); 
    } catch (error) {
        console.error('Failed to fetch unmapped details:', error);
        res.status(500).json({ error: 'Failed to fetch unmapped details' });
    }
});
module.exports = router;
