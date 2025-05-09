// src/server.js
const express = require('express');
const cors = require('cors');
const config = require('./config/config');

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes - removed auth routes!
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/docs', require('./routes/docs'));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using database: ${config.useDatabase}`);
});