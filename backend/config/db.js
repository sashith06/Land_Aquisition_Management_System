const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool for better connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create callback-based connection for existing models
const db = mysql.createConnection({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  connectTimeout: 20000, // 20 seconds
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create promise-based connection for new models
const dbPromise = mysql.createConnection({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  connectTimeout: 20000, // 20 seconds
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}).promise();

// Comment out database connection for initial deployment
// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//     console.error("Please ensure MySQL server is running and credentials are correct");
//     console.error("Connection details:");
//     console.error("- Host:", process.env.DB_HOST || process.env.MYSQLHOST);
//     console.error("- Port:", process.env.DB_PORT || process.env.MYSQLPORT);
//     console.error("- Database:", process.env.DB_NAME || process.env.MYSQLDATABASE);
//     console.error("- User:", process.env.DB_USER || process.env.MYSQLUSER);
    
//     // For Railway deployment, don't exit immediately - let the app start and retry later
//     if (process.env.NODE_ENV === 'production') {
//       console.log("Railway deployment detected - continuing without DB connection");
//       console.log("Database will retry connection on first API call");
//     } else {
//       process.exit(1); // Exit gracefully in development
//     }
//   } else {
//     console.log("Connected to MySQL database");
//   }
// });

console.log("Database connection skipped for initial deployment");

// Test the pool connection (also commented out)
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("Pool connection failed:", err);
//   } else {
//     console.log("Database pool created successfully");
//     connection.release();
//   }
// });

console.log("Pool connection test skipped for initial deployment");

// Export both connections and pool
module.exports = db;
module.exports.promise = dbPromise;
module.exports.pool = pool;
