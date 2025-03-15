const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await pool.end();
    }
};

testConnection();