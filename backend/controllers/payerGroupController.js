const pool = require('../config/db');

// Get all payer groups
exports.getAllPayerGroups = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payer_groups');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payer groups:', error);
        res.status(500).json({ error: 'Failed to fetch payer groups' });
    }
};

// Add a new payer group
exports.addPayerGroup = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO payer_groups (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding payer group:', error);
        res.status(500).json({ error: 'Failed to add payer group' });
    }
};
