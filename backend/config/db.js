const mysql = require("mysql2");
require("dotenv").config();

// Create callback-based connection for existing models
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Create promise-based connection for new models
const dbPromise = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
  console.log("Connected to MySQL database");
});

// Export both connections
module.exports = db;
module.exports.promise = dbPromise;
