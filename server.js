const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure DB exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '[]');
}

// Helpers
const readData = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeData = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// API Endpoints

// Get all reports
app.get('/api/reports', (req, res) => {
    const reports = readData();
    res.json(reports);
});

// Save or Update Report
app.post('/api/reports', (req, res) => {
    const newReport = req.body;
    let reports = readData();
    
    // Check if updating existing by ID
    const existingIndexById = reports.findIndex(r => r.id === newReport.id);
    
    if (existingIndexById >= 0) {
        // Full overwrite (Editing mode)
        reports[existingIndexById] = newReport;
    } else {
        // Add new
        reports.unshift(newReport);
    }
    
    writeData(reports);
    res.json({ success: true, report: newReport });
});

// Update entire list (for merging logic handled on client or bulk updates)
app.post('/api/reports/sync', (req, res) => {
    const updatedReports = req.body;
    writeData(updatedReports);
    res.json({ success: true });
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});