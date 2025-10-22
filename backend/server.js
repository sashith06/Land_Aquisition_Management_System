require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const AssignmentModel = require("./models/assignmentModel");
const inquiryRoutes = require('./routes/inquiryRoutes');

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
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  await initializeDatabase();
});
