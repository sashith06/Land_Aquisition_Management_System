require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

console.log('🔄 Starting MINIMAL LAMS application...');
console.log('📦 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

const app = express();

// Configure CORS for production and development
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173', 
  'http://localhost:5174'
];

// Add Railway domain when in production
if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_STATIC_URL) {
  allowedOrigins.push(`https://${process.env.RAILWAY_STATIC_URL}`);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HEALTH CHECK ENDPOINTS ONLY
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "LAMS System - MINIMAL VERSION",
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

app.get('/ping', (req, res) => {
  console.log('🏥 Health check pinged at', new Date().toISOString());
  res.status(200).send('pong');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "LAMS API - MINIMAL VERSION",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from frontend build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Serve frontend for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health') && !req.path.startsWith('/ping')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
      res.status(404).json({ message: 'API endpoint not found in minimal version' });
    }
  });
}

// Handle 404 for development
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    message: 'This is a minimal version for deployment testing'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 MINIMAL LAMS Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check available at: /ping`);
  console.log('✅ MINIMAL Server is ready - NO DATABASE, NO ROUTES');
});