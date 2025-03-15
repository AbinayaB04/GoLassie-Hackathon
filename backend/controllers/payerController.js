const pool = require('../config/db');
const { mapPayerDetails } = require('../services/mappingService');
const multer = require('multer'); // For file uploads
const xlsx = require('xlsx'); // For reading Excel files

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file to avoid conflicts
    }
});

const upload = multer({ storage });

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
        const result = await pool.query(
            'INSERT INTO payers (name, payer_group_id) VALUES ($1, $2) RETURNING *',
            [name, payer_group_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding payer:', error);
        res.status(500).json({ error: 'Failed to add payer' });
    }
};

// Map payer details from JSON data
exports.mapPayerDetails = async (req, res) => {
    try {
        const excelData = req.body.data; // Ensure this is an array

        // Validate input
        if (!Array.isArray(excelData)) {
            return res.status(400).json({ error: 'Expected data to be an array' });
        }

        // Map payer details
        const mappedData = await mapPayerDetails(excelData);

        // Return results
        res.status(200).json(mappedData);
    } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Upload Excel file and map payer details
exports.uploadPayerDetails = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

        console.log('Excel Data Extracted:', excelData); // Debugging: Log extracted data

        // Map payer details
        const mappedData = await mapPayerDetails(excelData);

        // Return the mapped data
        res.status(200).json(mappedData);
    } catch (error) {
        console.error('Error in /upload-payer-details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Export the upload middleware for use in routes
exports.upload = upload;