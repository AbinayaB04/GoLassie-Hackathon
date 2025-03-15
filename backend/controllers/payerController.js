const pool = require('../config/db');
const { mapPayerDetails } = require('../services/mappingService');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

exports.upload = upload;

// Get all payers
exports.getAllPayers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payers');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch payers' });
    }
};

// Add payer
exports.addPayer = async (req, res) => {
    const { name, payer_group_id, pretty_name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO payers (name, payer_group_id, pretty_name) VALUES ($1, $2, $3) RETURNING *',
            [name, payer_group_id, pretty_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to add payer' });
    }
};

exports.mapPayerDetails = async (req, res) => {
    try {
        const excelData = req.body.data;

        // Validate the request body
        if (!excelData || !Array.isArray(excelData)) {
            console.error('Invalid data format:', excelData);
            return res.status(400).json({ error: 'Invalid data format. Expected an array in "data" field.' });
        }

        console.log('Received Excel Data:', excelData);

        // Perform mapping logic (assumes mappingService.js is implemented correctly)
        const mappedData = await mapPayerDetails(excelData);
        res.status(200).json(mappedData);
    } catch (error) {
        console.error('Error in mapPayerDetails:', error.message);
        res.status(500).json({ error: 'Failed to map details' });
    }
};


exports.uploadPayerDetails = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid field name. Use "file" as the field name.' });
        }

        console.log('Uploaded File:', req.file);

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('Excel Data:', excelData);

        // Process the Excel data
        const mappedData = await mapPayerDetails(excelData);
        res.status(200).json({ message: 'File processed successfully', data: mappedData });
    } catch (err) {
        console.error('Error processing file:', err.message);
        res.status(500).json({ error: 'Failed to process file' });
    }
};


