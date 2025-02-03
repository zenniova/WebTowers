// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Menyajikan file statis dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint 1: Mendapatkan lokasi tower dan informasi dasarnya
app.get('/api/towers', (req, res) => {
    db.query(`SELECT site_id, latitude, longitude FROM towers`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint 2: Mendapatkan informasi tower berdasarkan site_id
app.get('/api/tower/:site_id', (req, res) => {
    const { site_id } = req.params;
    db.query(`
        SELECT site_id, sector, jumlah_antenna,
               l900, l1800, l2100, l2300,
               l900_power, l1800_power, l2100_power, l2300_power
        FROM towers 
        WHERE site_id = ?
    `, [site_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows[0]);
    });
});

// Endpoint 3: Mendapatkan azimuth dan informasinya
app.get('/api/tower/azimuth/:site_id', (req, res) => {
    const { site_id } = req.params;
    db.query(`SELECT azimuth FROM towers WHERE site_id = ?`, [site_id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API endpoint untuk mendapatkan data sites
app.get('/api/sites', (req, res) => {
    const query = 'SELECT site_id, latitude, longitude FROM towers';
    
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching towers:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log('towers data fetched:', results);
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});