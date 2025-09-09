const Owner = require('../models/ownerModel');
const jwt = require('jsonwebtoken');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

class OwnerController {

  // Add owners to existing lot
  static async addOwnersToLot(req, res) {
    try {
      const { lotId } = req.params;
      const { owners } = req.body; // array of owners
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!owners || !Array.isArray(owners)) {
        return res.status(400).json({ error: 'Owners data required' });
      }

      let processed = 0;
      for (let owner of owners) {
        let ownerId;

        // Create new owner if ID not provided
        if (!owner.id) {
          const result = await new Promise((resolve, reject) => {
            Owner.create(owner, (err, res) => err ? reject(err) : resolve(res));
          });
          ownerId = result.insertId;
        } else {
          ownerId = owner.id;
        }

        await new Promise((resolve, reject) => {
          Owner.addOwnerToLot(lotId, ownerId, userId, (err, res) => err ? reject(err) : resolve(res));
        });

        processed++;
      }

      res.status(201).json({ message: `Added ${processed} owners to lot ${lotId}` });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add owners' });
    }
  }

  // Get all owners (for dropdowns/search)
  static getAllOwners(req, res) {
    Owner.getAll((err, owners) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch owners' });
      res.json(owners);
    });
  }

  // Request OTP for landowner login
  static requestOtp(req, res) {
    const { nic, mobile } = req.body;

    // Validate input
    if (!nic || !mobile) {
      return res.status(400).json({ message: 'NIC and mobile number are required' });
    }

    if (!/^\d{12}$/.test(nic)) {
      return res.status(400).json({ message: 'Invalid NIC format' });
    }

    if (!/^\+947\d{8}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    // Check if owner exists in database
    Owner.findByNicAndMobile(nic, mobile, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Owner not found with provided NIC and mobile number' });
      }

      const owner = results[0];

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP with expiration (5 minutes)
      const otpData = {
        otp,
        ownerId: owner.id,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0
      };

      // Use NIC + mobile as key
      const key = `${nic}-${mobile}`;
      otpStore.set(key, otpData);

      // Clean up expired OTPs
      for (const [k, v] of otpStore.entries()) {
        if (v.expiresAt < Date.now()) {
          otpStore.delete(k);
        }
      }

      // In production, send SMS here
      console.log(`OTP for ${mobile}: ${otp}`);

      // For testing purposes, return OTP in response
      res.json({
        message: 'OTP sent successfully',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    });
  }

  // Verify OTP and login
  static verifyOtp(req, res) {
    const { nic, mobile, otp } = req.body;

    if (!nic || !mobile || !otp) {
      return res.status(400).json({ message: 'NIC, mobile number, and OTP are required' });
    }

    const key = `${nic}-${mobile}`;
    const otpData = otpStore.get(key);

    if (!otpData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new OTP.' });
    }

    if (otpData.expiresAt < Date.now()) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (otpData.attempts >= 3) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified successfully
    otpStore.delete(key);

    // Get owner details
    Owner.findById(otpData.ownerId, (err, owner) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to get owner details' });
      }

      // Generate JWT token for landowner
      const token = jwt.sign(
        {
          id: otpData.ownerId,
          type: 'landowner',
          nic,
          mobile
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        ownerId: otpData.ownerId,
        owner: {
          id: owner.id,
          name: owner.name,
          nic: owner.nic,
          phone: owner.phone,
          email: owner.email
        }
      });
    });
  }

  // Get landowner dashboard data
  static getLandownerDashboard(req, res) {
    const ownerId = req.user.id;

    // First get owner details
    Owner.findById(ownerId, (err, ownerResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch owner details' });
      }

      if (!ownerResults || ownerResults.length === 0) {
        return res.status(404).json({ message: 'Owner not found' });
      }

      const owner = ownerResults[0]; // Get the first (and only) result

      // Then get lots
      Owner.getLotsByOwnerId(ownerId, (err, lots) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Failed to fetch landowner data' });
        }

        res.json({
          owner: {
            id: owner.id,
            name: owner.name,
            nic: owner.nic,
            phone: owner.phone,
            email: owner.email
          },
          lots,
          totalLots: lots.length
        });
      });
    });
  }
}

module.exports = OwnerController;
