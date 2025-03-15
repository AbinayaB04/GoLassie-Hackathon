const Fuse = require('fuse.js');
const pool = require('../config/db');

exports.mapPayerDetails = async (details) => {
    try {
        const results = [];

        // Fetch all existing payers and details
        const existingDetails = await pool.query('SELECT * FROM payer_details');
        const existingPayers = await pool.query('SELECT * FROM payers');

        // Configure Fuse.js for fuzzy matching
        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: ['name', 'payer_number']
        };
        const fuse = new Fuse(existingDetails.rows, options);

        for (const detail of details) {
            const payerID = detail['Payer ID'];
            const payerName = detail['Payer Identification Information'];

            // Validate record fields
            if (!payerID && !payerName) {
                results.push({ status: 'Invalid', detail });
                continue;
            }

            // Perform fuzzy matching
            const matches = fuse.search({ name: payerName, payer_number: payerID });

            if (matches.length > 0 && matches[0].score < 0.4) {
                results.push({ status: 'Mapped', detail, matchedPayer: matches[0].item });
            } else {
                // Insert new payer detail if no match found
                const newDetail = await pool.query(
                    `INSERT INTO payer_details (name, payer_number, source) VALUES ($1, $2, $3) RETURNING *`,
                    [payerName, payerID, 'Uploaded Data']
                );
                results.push({ status: 'Inserted', detail, matchedPayer: newDetail.rows[0] });
            }
        }

        return results;
    } catch (error) {
        console.error('Error mapping payer details:', error.message);
        throw error;
    }
};
