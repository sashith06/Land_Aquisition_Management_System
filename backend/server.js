require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AssignmentModel = require("./models/assignmentModel");
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

// Configure CORS - Allow frontend URL from environment variable
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Add production frontend URL if specified
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log('Added FRONTEND_URL to allowed origins:', process.env.FRONTEND_URL);
}

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
