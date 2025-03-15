const pool = require('../config/db');
const { mapPayerDetails } = require('../services/mappingService');

// Get all payers
exports.getAllPayers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payers');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payers:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
};

// Add a new payer
exports.addPayer = async (req, res) => {
    const { name, payer_group_id } = req.body;
    try {
        const result = await pool.query('INSERT INTO payers (name, payer_group_id) VALUES ($1, $2) RETURNING *', [name, payer_group_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding payer:', error);
        res.status(500).json({ error: 'Failed to add payer' });
    }
};

// Map payer details from incoming data
exports.mapPayerDetails = async (req, res) => {
    const excelData = req.body; // Assume data comes from the frontend
    try {
        const result = await mapPayerDetails(excelData);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error mapping payer details:', error);
        res.status(500).json({ error: 'Mapping failed' });
    }
};