const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file for local dev

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// Secure CORS configuration
const corsOptions = {
  // It's crucial to set the `CORS_ORIGIN` environment variable in your hosting provider (e.g., Render)
  // to the URL of your deployed frontend application (e.g., your Vercel URL).
  // For local development or as a fallback, it allows all origins ('*').
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200,
};

if (!process.env.CORS_ORIGIN) {
    console.warn("WARNING: CORS_ORIGIN environment variable not set. Allowing all origins. For production, you should set this to your frontend's URL.");
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

// --- In-Memory Data Store ---
// In a production environment, you would replace this with a database (e.g., MongoDB, PostgreSQL).
// This in-memory store will reset every time the server restarts.
let reports = [];
let progressStore = {}; // New store for user progress { username: progressObject }

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


// --- Progress Sync Endpoints ---

// GET /api/progress/:username - Fetches a user's saved progress
app.get('/api/progress/:username', (req, res) => {
    const { username } = req.params;
    const userProgress = progressStore[username.toLowerCase()];

    if (userProgress) {
        console.log(`[${new Date().toISOString()}] GET /api/progress/${username} - Progress found.`);
        res.status(200).json(userProgress);
    } else {
        console.log(`[${new Date().toISOString()}] GET /api/progress/${username} - No progress found.`);
        res.status(404).json({ message: 'No progress found for this user.' });
    }
});

// POST /api/progress/:username - Saves a user's progress
app.post('/api/progress/:username', (req, res) => {
    const { username } = req.params;
    const progressData = req.body;

    if (!progressData) {
        return res.status(400).json({ message: 'Invalid progress data.' });
    }

    progressStore[username.toLowerCase()] = progressData;
    console.log(`[${new Date().toISOString()}] POST /api/progress/${username} - Progress saved.`);
    res.status(200).json({ message: 'Progress saved successfully.' });
});

// DELETE /api/progress/:username - Deletes a user's progress
app.delete('/api/progress/:username', (req, res) => {
    const { username } = req.params;
    if (progressStore[username.toLowerCase()]) {
        delete progressStore[username.toLowerCase()];
        console.log(`[${new Date().toISOString()}] DELETE /api/progress/${username} - Progress deleted.`);
        res.status(200).json({ message: 'Progress deleted successfully.' });
    } else {
        console.log(`[${new Date().toISOString()}] DELETE /api/progress/${username} - No progress to delete.`);
        res.status(404).json({ message: 'No progress found to delete.' });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`IT Security API server is running on port ${PORT}`);
});