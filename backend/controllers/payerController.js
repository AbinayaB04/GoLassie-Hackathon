const pool = require('../config/db');
const { mapPayerDetails } = require('../services/mappingService');
const multer = require('multer'); // For file uploads
const xlsx = require('xlsx'); // For reading Excel files
const fs = require('fs'); // For file system access
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file to avoid conflicts
    }
});

const upload = multer({ storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
    fileFilter: (req, file, cb) => {
        const filetypes = /xlsx|xls/; // Allow only excel files
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only .xlsx and .xls files are allowed.'));
    } });

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
    const { name, payer_group_id, pretty_name } = req.body; // Added pretty_name
    try {
        const result = await pool.query(
            'INSERT INTO payers (name, payer_group_id, pretty_name) VALUES ($1, $2, $3) RETURNING *',
            [name, payer_group_id, pretty_name]
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
    console.log('Received file:', req.file); // Log received file info
    console.log('Received body:', req.body); // Log the entire request body

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

        console.log('Excel Data Extracted:', excelData); // Log extracted data

        // Handle additional fields if needed
        const payerNumber = req.body.payer_number;
        const payerGroupId = req.body.payer_group_id;

        console.log('Payer Number:', payerNumber);
        console.log('Payer Group ID:', payerGroupId);

        // Continue processing...
        res.status(200).json({ message: 'File uploaded successfully', data: excelData });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Export the upload middleware for use in routes
exports.upload = upload;