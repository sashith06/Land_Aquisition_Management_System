require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const AssignmentModel = require("./models/assignmentModel");
const inquiryRoutes = require('./routes/inquiryRoutes');

// Add process error handlers for debugging
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🔄 Starting LAMS application...');
console.log('📦 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

const app = express();

// Configure CORS for production and development
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://127.0.0.1:3000', 
  'http://127.0.0.1:5173', 
  'http://127.0.0.1:5174'
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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve static files from frontend build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Simple health check endpoint
app.get('/health', (req, res) => {
  try {
    res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      service: "LAMS System",
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR", 
      error: error.message 
    });
  }
});

// Even simpler health check
app.get('/ping', (req, res) => {
  console.log('🏥 Health check pinged at', new Date().toISOString());
  res.status(200).send('pong');
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Application error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Handle 404 for non-existent routes
app.use((req, res) => {
  console.log(`❓ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// API health check
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      service: "LAMS API",
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR", 
      error: error.message 
    });
  }
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);



const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const projectRoutes = require("./routes/projectRoutes");
app.use("/api/projects", projectRoutes);

const planRoutes = require("./routes/planRoutes");
app.use("/api/plans", planRoutes);

const lotRoutes = require("./routes/lotRoutes");
app.use("/api/lots", lotRoutes);

const assignmentRoutes = require("./routes/assignmentRoutes");
app.use("/api/assignments", assignmentRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

const statsRoutes = require("./routes/statsRoutes");
app.use("/api/stats", statsRoutes);

const valuationRoutes = require("./routes/valuationRoutes");
app.use("/api", valuationRoutes);

const compensationRoutes = require("./routes/compensationRoutes");
app.use("/api", compensationRoutes);

const otpRoutes = require("./routes/otpRoutes");
app.use("/api/otp", otpRoutes);

const landownerRoutes = require("./routes/landownerRoutes");
app.use("/api/landowner", landownerRoutes);

const landValuationRoutes = require("./routes/landValuationRoutes");
app.use("/api/land-valuation", landValuationRoutes);

app.use('/api/inquiries', inquiryRoutes);

// Progress routes (plan/lot progress tracking)
const progressRoutes = require('./routes/progressRoutes');
app.use('/api', progressRoutes);

// Report routes (financial and physical progress reports)
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);




// Initialize database tables
async function initializeDatabase() {
  try {
    await AssignmentModel.createTable();
    
    // Initialize message tables
    const MessageModel = require('./models/messageModel');
    await MessageModel.createTables();

    // Initialize inquiry tables
    const InquiryModel = require('./models/inquiryModel');
    await InquiryModel.createTables();
  } catch (error) {
    // Tables may already exist, continue
  }
}

// Serve frontend for all non-API routes (for production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Only serve frontend for non-API routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
      res.status(404).json({ message: 'API endpoint not found' });
    }
  });
}

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0, not localhost

app.listen(PORT, HOST, () => {
  console.log(`🚀 LAMS Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check available at: http://${HOST}:${PORT}/ping`);
  console.log(`📍 Simple ping available at: http://${HOST}:${PORT}/ping`);
  console.log('✅ Server is ready and listening for connections');
  
  // Initialize database asynchronously without blocking server startup (commented out for initial deployment)
  // initializeDatabase().catch(error => {
  //   console.error('Database initialization failed, but server is still running:', error);
  // });
  
  console.log('💾 Database initialization skipped for initial deployment');
});
