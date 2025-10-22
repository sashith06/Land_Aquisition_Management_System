require("dotenv").config();
const express = require("express");

console.log('� ULTRA MINIMAL LAMS - Starting...');
console.log('PORT:', process.env.PORT || 5000);

const app = express();

// Ultra simple ping endpoint
app.get('/ping', (req, res) => {
  console.log('PING received');
  res.send('pong');
});

// Ultra simple health endpoint
app.get('/health', (req, res) => {
  console.log('HEALTH check received');
  res.json({ status: 'OK' });
});

// Catch all other routes
app.get('*', (req, res) => {
  console.log('Route hit:', req.path);
  res.json({ message: 'ULTRA MINIMAL VERSION RUNNING', path: req.path });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ULTRA MINIMAL SERVER RUNNING ON 0.0.0.0:${PORT}`);
  console.log('✅ Ready for health checks');
});