const pool = require('../config/db');

async function mapPayerDetails(excelData) {
    console.log('Incoming Data:', excelData); // Debugging line
    const results = [];
    for (const detail of excelData) {
        const { source_name, payer_number, ein } = detail;
        console.log('Processing Detail:', detail); // Debugging line
        const normalizedName = source_name.toUpperCase().trim();

        // Check if payer exists by payer number
        let payer = await findPayerByNumber(payer_number);
        if (!payer) {
            // No payer found, check by name
            payer = await findPayerByName(normalizedName);
            if (!payer) {
                // Create a new payer if none found
                payer = await createPayer(normalizedName);
            }
        }

        // Link payer detail to payer
        await linkPayerDetail(payer.id, payer_number, ein);
        results.push({ payer, detail });
    }
    return results;
}

async function findPayerByNumber(payer_number) {
    const result = await pool.query('SELECT * FROM payers WHERE payer_number = $1', [payer_number]);
    return result.rows[0];
}

async function findPayerByName(name) {
    const result = await pool.query('SELECT * FROM payers WHERE name = $1', [name]);
    return result.rows[0];
}

async function createPayer(name) {
    const result = await pool.query('INSERT INTO payers (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
}

async function linkPayerDetail(payer_id, payer_number, ein) {
    await pool.query('INSERT INTO payer_details (payer_id, payer_number, ein) VALUES ($1, $2, $3)', [payer_id, payer_number, ein]);
}

module.exports = { mapPayerDetails };


