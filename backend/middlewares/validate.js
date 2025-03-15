const validatePayerGroup = (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Payer group name is required and must be a valid string.' });
    }
    next();
};

const validatePayer = (req, res, next) => {
    const { name, payer_group_id } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Payer name is required and must be a valid string.' });
    }
    if (!payer_group_id || typeof payer_group_id !== 'number') {
        return res.status(400).json({ error: 'Valid payer group ID is required.' });
    }
    next();
};

module.exports = { validatePayerGroup, validatePayer };