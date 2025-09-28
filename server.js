const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // allow frontend
app.use(bodyParser.json());

// Simple in-memory storage
let reports = [];

// GET all reports
app.get("/api/reports", (req, res) => {
  res.json(reports);
});

// POST a new report
app.post("/api/reports", (req, res) => {
  const report = { id: Date.now(), ...req.body };
  reports.push(report);
  res.status(201).json(report);
});

// Use Render's port
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
