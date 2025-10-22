require("dotenv").config();
const express = require("express");

console.log('🚀 ULTRA MINIMAL LAMS - Starting...');
console.log('PORT:', process.env.PORT || 5000);
console.log('Environment:', process.env.NODE_ENV || 'development');

const app = express();

// Add error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Ultra simple ping endpoint
app.get('/ping', (req, res) => {
  console.log('✅ PING received');
  res.send('pong');
});

// Ultra simple health endpoint
app.get('/health', (req, res) => {
  console.log('✅ HEALTH check received');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('✅ ROOT endpoint hit');
  res.json({ 
    message: 'ULTRA MINIMAL LAMS RUNNING', 
    status: 'OK',
    endpoints: ['/ping', '/health'] 
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ULTRA MINIMAL SERVER RUNNING ON 0.0.0.0:${PORT}`);
  console.log('✅ Ready for health checks');
  console.log('✅ Available endpoints:');
  console.log('  - GET /ping');
  console.log('  - GET /health');
  console.log('  - GET /');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

module.exports = app;