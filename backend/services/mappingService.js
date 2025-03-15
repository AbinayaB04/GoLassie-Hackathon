const pool = require('../config/db');
const Fuse = require('fuse.js'); // For fuzzy matching

// Fuzzy matching options
const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Adjust for sensitivity
    keys: ['name'] // Key for fuzzy matching
};

/**
 * Map payer details from incoming data
 * @param {Array} excelData - Raw data from Excel file
 * @returns {Array} - Mapped payer details
 */
async function mapPayerDetails(excelData) {
    try {
        const results = [];
        const existingPayers = await getAllPayers();
        const fuse = new Fuse(existingPayers, fuseOptions); // Initialize Fuse.js

        for (const detail of excelData) {
            if (!detail.name || !detail.payer_number) continue;

            const { name, payer_number, payer_group_id, ein } = detail;
            const normalizedName = name.toUpperCase().trim();

            let payer = await findPayerByNumber(payer_number);

            if (!payer) {
                const searchResults = fuse.search(normalizedName);
                if (searchResults.length > 0 && searchResults[0].score < 0.4) {
                    payer = searchResults[0].item;
                }
            }

            if (!payer) {
                payer = await createPayer(normalizedName, payer_number, payer_group_id);
            }

            await linkPayerDetail(payer.id, payer_number, detail.name, ein);
            results.push({ payer, detail });
        }

        return results;
    } catch (error) {
        console.error('Error mapping payers:', error);
        throw error;
    }
}



/**
 * Fetch all payers from the database
 * @returns {Array} - Array of payer objects
 */
async function getAllPayers() {
    try {
        const result = await pool.query('SELECT * FROM payers');
        return result.rows;
    } catch (error) {
        console.error('Error fetching payers:', error);
        throw error;
    }
}

/**
 * Find payer by payer number
 * @param {string} payer_number - Payer number to search for
 * @returns {Object|null} - Payer object if found, otherwise null
 */
async function findPayerByNumber(payer_number) {
    try {
        const result = await pool.query('SELECT * FROM payers WHERE payer_number = $1', [payer_number]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding payer by number:', error);
        throw error;
    }
}

/**
 * Create a new payer
 * @param {string} name - Payer name
 * @param {string} payer_number - Payer number
 * @param {number|null} payer_group_id - Payer group ID (optional)
 * @returns {Object} - Newly created payer object
 */
async function createPayer(name, payer_number, payer_group_id = null) {
    try {
        const result = await pool.query(
            'INSERT INTO payers (name, payer_number, payer_group_id) VALUES ($1, $2, $3) RETURNING *',
            [name, payer_number, payer_group_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating payer:', error);
        throw error;
    }
}

/**
 * Link payer details to payer
 * @param {number} payer_id - Payer ID
 * @param {string} payer_number - Payer number
 * @param {string} payer_name - Payer name
 * @param {string|null} ein - Employer Identification Number (optional)
 */
async function linkPayerDetail(payer_id, payer_number, payer_name, ein = null) {
    try {
        await pool.query(
            'INSERT INTO payer_details (payer_id, payer_number, payer_name, ein) VALUES ($1, $2, $3, $4)',
            [payer_id, payer_number, payer_name, ein]
        );
    } catch (error) {
        console.error('Error linking payer detail:', error);
        throw error;
    }
}

module.exports = { mapPayerDetails };