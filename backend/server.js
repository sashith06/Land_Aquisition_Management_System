const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'your_secret_key'; // For production, use env variables

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'land_acqusition',
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database');
});

const otpStore = {};

// Request OTP endpoint (same as before)
app.post('/request-otp', (req, res) => {
  const { nic, mobile } = req.body;

  if (!nic || !mobile) {
    return res.status(400).json({ message: 'NIC and mobile are required' });
  }

  db.query(
    'SELECT * FROM landowners WHERE nic = ? AND mobile = ?',
    [nic, mobile],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length === 0) {
        return res.status(404).json({ message: 'Landowner not found' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[`${nic}_${mobile}`] = { otp, expires: Date.now() + 5 * 60 * 1000 };

      // For testing, send OTP in response (remove in production)
      console.log(`Generated OTP for ${nic}: ${otp}`);

      res.json({ message: 'OTP sent successfully' });
    }
  );
});

// Verify OTP endpoint with JWT token generation
app.post('/verify-otp', (req, res) => {
  const { nic, mobile, otp } = req.body;

  if (!nic || !mobile || !otp) {
    return res.status(400).json({ message: 'NIC, mobile and OTP are required' });
  }

  const record = otpStore[`${nic}_${mobile}`];
  if (!record) {
    return res.status(400).json({ message: 'No OTP requested for this user' });
  }

  if (Date.now() > record.expires) {
    delete otpStore[`${nic}_${mobile}`];
    return res.status(400).json({ message: 'OTP expired, please request again' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP valid, delete from store
  delete otpStore[`${nic}_${mobile}`];

  // Generate JWT token
  const token = jwt.sign({ nic, mobile }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Protected dashboard data endpoint
app.get('/landowner-dashboard', authenticateToken, (req, res) => {
  const { nic } = req.user;

  db.query(
    'SELECT status, last_update FROM land_acquisition_status WHERE nic = ?',
    [nic],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'No data found' });

      res.json(results[0]);
    }
  );
});

app.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
