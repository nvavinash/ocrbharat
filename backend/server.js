const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const ocrRoutes = require('./routes/ocrRoutes');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', ocrRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hindi OCR Backend Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
});
