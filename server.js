const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- In-Memory Data Store ---
// In a production environment, you would replace this with a database (e.g., MongoDB, PostgreSQL).
// This in-memory store will reset every time the server restarts.
let reports = [];

// --- API Endpoints ---

// GET /api/reports - Fetches all submitted reports
app.get('/api/reports', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /api/reports - Returning ${reports.length} reports.`);
  res.status(200).json(reports);
});

// POST /api/reports - Submits a new report
app.post('/api/reports', (req, res) => {
  const newReport = req.body;
  if (!newReport || !newReport.id || !newReport.user) {
    console.log(`[${new Date().toISOString()}] POST /api/reports - Bad request, invalid data.`);
    return res.status(400).json({ message: 'Invalid report data.' });
  }
  
  // Prevent duplicate submissions if the same report ID is sent twice
  if (!reports.some(report => report.id === newReport.id)) {
      reports.push(newReport);
      console.log(`[${new Date().toISOString()}] POST /api/reports - Report received for ${newReport.user.fullName}. Total reports: ${reports.length}.`);
  } else {
      console.log(`[${new Date().toISOString()}] POST /api/reports - Duplicate report ID received: ${newReport.id}.`);
  }
  
  res.status(201).json({ message: 'Report submitted successfully.' });
});

// DELETE /api/reports - Clears all reports
app.delete('/api/reports', (req, res) => {
  reports = [];
  console.log(`[${new Date().toISOString()}] DELETE /api/reports - All reports have been cleared.`);
  res.status(200).json({ message: 'All reports cleared successfully.' });
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`IT Security API server is running on port ${PORT}`);
});
