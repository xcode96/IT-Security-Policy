// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let reports = [];

app.get('/api/reports', (req, res) => res.json(reports));
app.post('/api/reports', (req, res) => {
  const report = { id: Date.now(), ...req.body };
  reports.push(report);
  res.status(201).json(report);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
