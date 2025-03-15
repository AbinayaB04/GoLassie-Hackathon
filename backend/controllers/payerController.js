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
        const results = [];
        for (const detail of details) {
            const existingPayer = await pool.query('SELECT * FROM payers WHERE payer_number = $1', [detail['Payer ID']]);

            if (existingPayer.rows.length > 0) {
                results.push({ status: 'Mapped', detail, payer: existingPayer.rows[0] });
            } else {
                const newPayer = await pool.query(
                    'INSERT INTO payers (name, payer_number) VALUES ($1, $2) RETURNING *',
                    [detail['Payer Identification Information'], detail['Payer ID']]
                );
                results.push({ status: 'Inserted', detail, payer: newPayer.rows[0] });
            }
        }
        return results;
    } catch (err) {
        throw new Error('Error in mapping payers: ' + err.message);
    }
};


exports.uploadPayerDetails = async (req, res) => {
    try {
        // Step 1: Ensure a file is uploaded
        console.log('Request File:', req.file);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid field name. Use "file" as the field name.' });
        }

        // Step 2: Extract data from the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('Excel Data Extracted:', excelData);

        if (!excelData || excelData.length === 0) {
            return res.status(400).json({ error: 'Uploaded file is empty or has no valid data.' });
        }

        // Step 3: Map Excel data with the database (payer_detail table)
        const mappedPayers = [];
        for (const record of excelData) {
            // Example: Extract ID from the file record
            const payerID = record['Payer ID']; // Adjust field name based on your Excel file
            const payerName = record['Payer Identification Information']; // Adjust field name accordingly

            // Log what is being processed
            console.log('Processing Record:', { payerID, payerName });

            // Query the `payer_detail` table for matching payer
            const existingDetail = await pool.query(
                'SELECT * FROM payer_detail WHERE payer_id = $1',
                [payerID]
            );

            if (existingDetail.rows.length > 0) {
                // If a match is found, add it to the mapped payers
                mappedPayers.push({
                    status: 'Mapped',
                    fileRecord: record,
                    dbRecord: existingDetail.rows[0], // Matching database row
                });
            } else {
                // If no match is found, log and continue
                console.log(`No match found for Payer ID: ${payerID}`);
                mappedPayers.push({
                    status: 'Unmapped',
                    fileRecord: record,
                });
            }
        }

        // Step 4: Return the mapped payers as the response
        res.status(200).json({
            message: 'File processed successfully',
            mappedPayers,
        });

    } catch (err) {
        console.error('Error during upload and mapping:', err.message);
        res.status(500).json({ error: 'Failed to process file' });
    }
};


