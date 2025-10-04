const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool for better connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
  queueLimit: 0
});

// Create callback-based connection for existing models
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 20000 // 20 seconds
});

// Create promise-based connection for new models
const dbPromise = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 20000 // 20 seconds
}).promise();

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    console.error("Please ensure MySQL server is running and credentials are correct");
    console.error("Connection details:");
    console.error("- Host:", process.env.DB_HOST);
    console.error("- Port:", process.env.DB_PORT);
    console.error("- Database:", process.env.DB_NAME);
    console.error("- User:", process.env.DB_USER);
    
    // Don't throw the error, just log it and continue
    // This allows the server to start even if DB is temporarily unavailable
    process.exit(1); // Exit gracefully instead of crashing
  }
  console.log("Connected to MySQL database");
});

// Test the pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Pool connection failed:", err);
  } else {
    console.log("Database pool created successfully");
    connection.release();
  }
});

// Export both connections and pool
module.exports = db;
module.exports.promise = dbPromise;
module.exports.pool = pool;
