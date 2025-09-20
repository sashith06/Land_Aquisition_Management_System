require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AssignmentModel = require("./models/assignmentModel");

const app = express();

// Configure CORS with more specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Add a simple test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Server is working" });
});

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


// Initialize database tables
async function initializeDatabase() {
  try {
    await AssignmentModel.createTable();
    
    // Initialize message tables
    const MessageModel = require('./models/messageModel');
    await MessageModel.createTables();
    console.log('All database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.log('Continuing without database initialization - tables may already exist');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
