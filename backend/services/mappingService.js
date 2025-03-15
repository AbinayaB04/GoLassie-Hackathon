const pool = require('../config/db');
const Fuse = require('fuse.js');

const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
    keys: ['name']
};
exports.mapPayerDetails = async (excelData) => {
    try {
        console.log('Received Excel Data:', excelData);

        const results = [];
        const existingPayers = await pool.query('SELECT * FROM payers');
        console.log('Existing Payers:', existingPayers.rows);

        const fuse = new Fuse(existingPayers.rows, {
            includeScore: true,
            threshold: 0.4,
            keys: ['name']
        });

        for (const detail of excelData) {
            console.log('Processing Detail:', detail);

            let payer = await pool.query(
                'SELECT * FROM payers WHERE payer_number = $1',
                [detail.payer_number]
            );

            if (payer.rows.length === 0) {
                const search = fuse.search(detail.name);
                console.log('Fuzzy Search Results:', search);

                if (search.length > 0 && search[0].score < 0.4) {
                    payer = search[0].item;
                }
            }

            if (!payer) {
                payer = await pool.query(
                    'INSERT INTO payers (name, payer_number, payer_group_id) VALUES ($1, $2, $3) RETURNING *',
                    [detail.name, detail.payer_number, detail.payer_group_id]
                );
                console.log('Created New Payer:', payer.rows[0]);
            }

            await pool.query(
                'INSERT INTO payer_details (payer_id, payer_name, payer_number, ein) VALUES ($1, $2, $3, $4)',
                [payer.id, detail.name, detail.payer_number, detail.ein]
            );

            results.push({ payer, detail });
        }

        return results;
    } catch (error) {
        console.error('Error in mapPayerDetails:', error.message);
        throw error; // Rethrow the error to be caught in the controller
    }
};
