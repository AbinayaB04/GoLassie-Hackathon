const express = require('express');
const cors = require('cors');
const payerRoutes = require('./routes/payerRoutes');
const payerGroupRoutes = require('./routes/payerGroupRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/payers', payerRoutes);
app.use('/api/payer-groups', payerGroupRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});