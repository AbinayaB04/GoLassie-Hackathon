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
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: (req, file, cb) => {
        const filetypes = /xlsx|xls/; // Accept only Excel files
        const extname = filetypes.test(file.originalname.toLowerCase());
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const mimetype = allowedMimeTypes.includes(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
});


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
exports.mapPayerDetails = async (details) => {
    try {
        // Ensure details is an array
        if (!Array.isArray(details)) {
            throw new Error('Expected details to be an array, but received: ' + typeof details);
        }

        const results = [];
        for (const detail of details) {
            const existingPayer = await pool.query(
                'SELECT * FROM payer_details WHERE payer_number = $1',
                [detail['Payer ID']]
            );

            if (existingPayer.rows.length > 0) {
                results.push({
                    status: 'Mapped',
                    detail,
                    payer: existingPayer.rows[0],
                });
            } else {
                const newPayer = await pool.query(
                    'INSERT INTO payer_details (payer_name, payer_number, ein) VALUES ($1, $2, $3) RETURNING *',
                    [
                        detail['Payer Identification Information'], // Maps to payer_name
                        detail['Payer ID'], // Maps to payer_number
                        null, // Placeholder for ein (if not in your details)
                    ]
                );
                results.push({
                    status: 'Inserted',
                    detail,
                    payer: newPayer.rows[0],
                });
            }
        }
        return results;
    } catch (err) {
        throw new Error('Error in mapping payers: ' + err.message);
    }
};

exports.uploadPayerDetails = async (req, res) => {
    try {
        // Ensure a file is uploaded
        console.log('Request File:', req.file);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid field name. Use "file" as the field name.' });
        }

        // Extract data from the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('Excel Data Extracted:', excelData);

        if (!excelData || excelData.length === 0) {
            return res.status(400).json({ error: 'Uploaded file is empty or has no valid data.' });
        }

        // Format and map Excel data
        const details = excelData.map(record => ({
            'Payer ID': record['Payer ID'],
            'Payer Identification Information': record['Payer Identification Information']
        }));

        console.log('Details to map:', details);

        // Call mapPayerDetails with validated data
        const mappedPayers = await mapPayerDetails(details);

        // Return the mapped payers as the response
        res.status(200).json({
            message: 'File processed successfully',
            mappedPayers,
        });
    } catch (err) {
        console.error('Error during upload and mapping:', err.message);
        res.status(500).json({ error: 'Failed to process file: ' + err.message });
    }
};
