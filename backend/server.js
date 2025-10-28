require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const AssignmentModel = require("./models/assignmentModel");
const inquiryRoutes = require('./routes/inquiryRoutes');

console.log('🚀 Starting server...');
console.log('📝 FRONTEND_URL from env:', process.env.FRONTEND_URL);

const app = express();

// === CORS SETUP ===
// Only use relative paths in app.use(); URLs are only for origin checking
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Add production frontend URL from environment
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log('✅ Added FRONTEND_URL to allowed origins:', process.env.FRONTEND_URL);
}

console.log('Allowed CORS origins:', allowedOrigins);

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow mobile apps / Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Handle OPTIONS preflight globally
app.options('*', cors());

// === BODY PARSERS ===
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// === ROUTES ===
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

// Namespaced routes for safety
const statsRoutes = require("./routes/statsRoutes");
app.use("/api/stats", statsRoutes);

const valuationRoutes = require("./routes/valuationRoutes");
app.use("/api/valuation", valuationRoutes);

const compensationRoutes = require("./routes/compensationRoutes");
app.use("/api/compensation", compensationRoutes);

const otpRoutes = require("./routes/otpRoutes");
app.use("/api/otp", otpRoutes);

const landownerRoutes = require("./routes/landownerRoutes");
app.use("/api/landowner", landownerRoutes);

const landValuationRoutes = require("./routes/landValuationRoutes");
app.use("/api/land-valuation", landValuationRoutes);

app.use('/api/inquiries', inquiryRoutes);

const progressRoutes = require('./routes/progressRoutes');
app.use('/api/progress', progressRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// === DATABASE INIT ===
async function initializeDatabase() {
  try {
    await AssignmentModel.createTable();

    const MessageModel = require('./models/messageModel');
    await MessageModel.createTables();

    const InquiryModel = require('./models/inquiryModel');
    await InquiryModel.createTables();
  } catch (error) {
    console.log('⚠️ Database tables might already exist:', error.message);
  }
}

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await initializeDatabase();
});
