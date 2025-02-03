// server/database.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost', // Your database host
    user: 'root', // Your database username
    password: '', // Your database password
    database: 'towerdb' // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

module.exports = db;