# 📱 SMS Owner Notification System - Complete Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Database Schema Changes](#database-schema-changes)
4. [System Architecture](#system-architecture)
5. [Implementation Steps](#implementation-steps)
6. [Code Files](#code-files)
7. [Flow Diagrams](#flow-diagrams)
8. [Example Scenarios](#example-scenarios)
9. [Testing Guidelines](#testing-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

### Purpose
Automatically notify land owners via SMS when they are added to a lot in the Land Acquisition Management System. Each owner receives a **notification for EVERY lot** they are assigned to, ensuring they are informed about each property acquisition.

### Key Features
- ✅ **Per-lot notification** (owner notified for each lot assignment)
- ✅ **Tracks notification history per lot** in database
- ✅ **Prevents duplicate notifications** for same lot
- ✅ **Handles existing owners** from old data
- ✅ **Graceful failure handling** (registration succeeds even if SMS fails)
- ✅ **Mobile number validation**
- ✅ **Complete notification audit trail**

### Business Rules
1. **Owner Added to Lot**: Send SMS notification with lot details
2. **Same Owner, Same Lot**: Don't send duplicate SMS (already notified for this lot)
3. **Same Owner, Different Lot**: Send new SMS (different property)
4. **No Mobile Number**: Skip SMS but allow registration
5. **SMS Failure**: Log error, allow retry, registration succeeds anyway
6. **Notification History**: Track which owner was notified for which lot and when

---

## 🎯 Requirements

### System Requirements
- Node.js backend with Express
- MySQL database
- Twilio account with SMS capability
- Existing owner and lot management system

### Environment Variables
```bash
# .env file
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number
```

### NPM Packages
```json
{
  "twilio": "^4.x.x"  // Already installed
}
```

---

## 🗄️ Database Schema Changes

### SQL Migration Script

```sql
-- ============================================
-- SMS Owner Notification System (Per-Lot)
-- Database Migration Script
-- ============================================

-- Step 1: Create notification tracking table
CREATE TABLE IF NOT EXISTS owner_lot_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  lot_id INT NOT NULL,
  plan_id INT,
  mobile_number VARCHAR(20),
  notification_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sms_sid VARCHAR(50) COMMENT 'Twilio message SID',
  error_message TEXT COMMENT 'Error details if failed',
  sent_at DATETIME NULL COMMENT 'When SMS was successfully sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  
  FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE,
  FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Prevent duplicate notifications for same owner-lot combination
  UNIQUE KEY unique_owner_lot_notification (owner_id, lot_id),
  
  INDEX idx_owner_id (owner_id),
  INDEX idx_lot_id (lot_id),
  INDEX idx_notification_status (notification_status),
  INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tracks SMS notifications sent to owners per lot';

-- Step 2: Verify table creation
DESCRIBE owner_lot_notifications;

-- Step 3: Check initial state
SELECT COUNT(*) as total_notifications FROM owner_lot_notifications;
```

### Schema After Migration

#### New Table: `owner_lot_notifications`

```sql
CREATE TABLE owner_lot_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,                    -- Which owner
  lot_id INT NOT NULL,                      -- Which lot
  plan_id INT,                              -- Which plan
  mobile_number VARCHAR(20),                -- Mobile used for SMS
  notification_status ENUM('pending', 'sent', 'failed'),  -- Status
  sms_sid VARCHAR(50),                      -- Twilio message ID
  error_message TEXT,                       -- If failed, why?
  sent_at DATETIME NULL,                    -- When successfully sent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,                           -- Who triggered
  
  UNIQUE KEY (owner_id, lot_id),           -- One notification per owner-lot
  FOREIGN KEY (owner_id) REFERENCES owners(id),
  FOREIGN KEY (lot_id) REFERENCES lots(id),
  INDEX idx_notification_status (notification_status)
);
```

### Why This Approach?

1. **Audit Trail**: Complete history of all notifications
2. **Per-Lot Tracking**: Know exactly which lot each notification was for
3. **Retry Capability**: Can retry failed notifications
4. **No Duplicates**: Unique constraint prevents duplicate notifications
5. **Reporting**: Easy to query notification statistics
6. **Legal Compliance**: Proof of communication for each property

---

## 🏗️ System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                        │
│  User adds owner to lot via form                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Backend API Layer                           │
│  lotController.addOwnerToLot()                          │
│  - Validates permissions                                 │
│  - Orchestrates the flow                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Model Layer                                 │
│  Lot.addOwnerToLot()                                    │
│  ├─→ Lot.createOrUpdateOwner()                          │
│  │   ├─→ Check if owner exists by NIC                   │
│  │   ├─→ Create new or update existing                  │
│  │   └─→ Return: isNewOwner flag                        │
│  └─→ Owner.isNotified()                                 │
│      └─→ Check notification status                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              SMS Service Layer                           │
│  smsService.sendOwnerWelcomeSMS()                       │
│  - Composes SMS message                                  │
│  - Calls Twilio API                                      │
│  - Returns success/failure                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              Twilio SMS Gateway                          │
│  - Sends SMS to owner's mobile                          │
│  - Returns delivery status                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation Steps

### Step 1: Run Database Migration
```bash
# Login to MySQL
mysql -u root -p

# Select database
USE land_acquisition_db;

# Run migration script
SOURCE path/to/migration.sql;

# Verify
DESCRIBE owners;
```

### Step 2: Create SMS Service File
Create: `backend/services/smsService.js`

### Step 3: Modify Owner Model
Edit: `backend/models/ownerModel.js`
Add: `markAsNotified()` and `isNotified()` methods

### Step 4: Modify Lot Model
Edit: `backend/models/lotModel.js`
Modify: `addOwnerToLot()` function to check notification status

### Step 5: Modify Lot Controller
Edit: `backend/controllers/lotController.js`
Modify: `addOwnerToLot()` to send SMS and mark as notified

### Step 6: Test the Implementation
Follow testing guidelines section

---

## 💻 Code Files

### File 1: SMS Service (`backend/services/smsService.js`)

```javascript
const twilioClient = require('../config/twilioClient');

/**
 * Send welcome SMS to newly registered owner
 * @param {Object} ownerData - Owner information { name, nic, mobile }
 * @param {Object} lotDetails - Lot information { lot_number, plan_name } (optional)
 * @returns {Promise<Object>} - Result { success, sid/error, message }
 */
async function sendOwnerWelcomeSMS(ownerData, lotDetails = null) {
  // Validate mobile number
  if (!ownerData.mobile || ownerData.mobile.trim() === '') {
    return {
      success: false,
      error: 'No mobile number provided'
    };
  }

  // Build SMS message
  let message = `Hello ${ownerData.name},

You have been successfully registered in the Land Acquisition Management System.

Your Details:
- NIC: ${ownerData.nic}
- Name: ${ownerData.name}`;

  // Add lot details if provided
  if (lotDetails && lotDetails.lot_number) {
    message += `
- Lot: ${lotDetails.lot_number}`;
  }
  
  if (lotDetails && lotDetails.plan_name) {
    message += `
- Plan: ${lotDetails.plan_name}`;
  }

  message += `

You will be contacted by our team regarding land acquisition and compensation details.

Thank you.
- Land Acquisition Management System`;

  try {
    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ownerData.mobile
    });
    
    console.log(`✅ SMS sent successfully`);
    console.log(`   → To: ${ownerData.mobile}`);
    console.log(`   → Owner: ${ownerData.name}`);
    console.log(`   → SID: ${result.sid}`);
    console.log(`   → Status: ${result.status}`);
    
    return { 
      success: true, 
      sid: result.sid,
      status: result.status,
      message: 'SMS sent successfully'
    };
  } catch (error) {
    console.error(`❌ SMS sending failed`);
    console.error(`   → To: ${ownerData.mobile}`);
    console.error(`   → Error: ${error.message}`);
    console.error(`   → Code: ${error.code}`);
    
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Validate Sri Lankan mobile number format
 * @param {string} mobile - Mobile number
 * @returns {boolean} - True if valid
 */
function validateMobileNumber(mobile) {
  if (!mobile) return false;
  
  // Sri Lankan mobile formats:
  // +94771234567 (with country code)
  // 0771234567 (local format)
  // 94771234567 (without +)
  
  const cleanNumber = mobile.replace(/\s+/g, '');
  const patterns = [
    /^\+94[0-9]{9}$/,      // +94771234567
    /^94[0-9]{9}$/,        // 94771234567
    /^0[0-9]{9}$/          // 0771234567
  ];
  
  return patterns.some(pattern => pattern.test(cleanNumber));
}

module.exports = { 
  sendOwnerWelcomeSMS,
  validateMobileNumber 
};
```

---

### File 2: Notification Model (`backend/models/notificationModel.js`)

Create new file for notification tracking:

```javascript
const db = require('../config/db');

const Notification = {};

/**
 * Check if owner has been notified for this specific lot
 * @param {number} ownerId - Owner ID
 * @param {number} lotId - Lot ID
 * @param {Function} callback - Callback(err, isNotified: boolean)
 */
Notification.isNotifiedForLot = (ownerId, lotId, callback) => {
  const sql = `
    SELECT id, notification_status, sent_at 
    FROM owner_lot_notifications 
    WHERE owner_id = ? AND lot_id = ?
  `;
  
  db.query(sql, [ownerId, lotId], (err, results) => {
    if (err) {
      console.error('Error checking notification status:', err);
      return callback(err);
    }
    
    const isNotified = results.length > 0 && results[0].notification_status === 'sent';
    console.log(`ℹ️ Owner ${ownerId} notification for Lot ${lotId}: ${isNotified ? 'Already sent' : 'Not sent'}`);
    
    callback(null, isNotified, results[0] || null);
  });
};

/**
 * Create notification record (initial state: pending)
 * @param {Object} data - Notification data
 * @param {Function} callback - Callback function
 */
Notification.create = (data, callback) => {
  const sql = `
    INSERT INTO owner_lot_notifications
    (owner_id, lot_id, plan_id, mobile_number, notification_status, created_by)
    VALUES (?, ?, ?, ?, 'pending', ?)
    ON DUPLICATE KEY UPDATE
    updated_at = CURRENT_TIMESTAMP
  `;
  
  db.query(
    sql, 
    [data.ownerId, data.lotId, data.planId, data.mobile, data.userId],
    (err, result) => {
      if (err) {
        console.error('Error creating notification record:', err);
        return callback(err);
      }
      
      console.log(`✅ Notification record created for Owner ${data.ownerId}, Lot ${data.lotId}`);
      callback(null, result);
    }
  );
};

/**
 * Mark notification as successfully sent
 * @param {number} ownerId - Owner ID
 * @param {number} lotId - Lot ID
 * @param {string} smsSid - Twilio message SID
 * @param {Function} callback - Callback function
 */
Notification.markAsSent = (ownerId, lotId, smsSid, callback) => {
  const sql = `
    UPDATE owner_lot_notifications 
    SET notification_status = 'sent',
        sms_sid = ?,
        sent_at = NOW()
    WHERE owner_id = ? AND lot_id = ?
  `;
  
  db.query(sql, [smsSid, ownerId, lotId], (err, result) => {
    if (err) {
      console.error('Error marking notification as sent:', err);
      return callback(err);
    }
    
    console.log(`✅ Notification marked as sent - Owner ${ownerId}, Lot ${lotId}, SID: ${smsSid}`);
    callback(null, result);
  });
};

/**
 * Mark notification as failed
 * @param {number} ownerId - Owner ID
 * @param {number} lotId - Lot ID
 * @param {string} errorMessage - Error details
 * @param {Function} callback - Callback function
 */
Notification.markAsFailed = (ownerId, lotId, errorMessage, callback) => {
  const sql = `
    UPDATE owner_lot_notifications 
    SET notification_status = 'failed',
        error_message = ?
    WHERE owner_id = ? AND lot_id = ?
  `;
  
  db.query(sql, [errorMessage, ownerId, lotId], (err, result) => {
    if (err) {
      console.error('Error marking notification as failed:', err);
      return callback(err);
    }
    
    console.log(`⚠️ Notification marked as failed - Owner ${ownerId}, Lot ${lotId}`);
    callback(null, result);
  });
};

/**
 * Get notification history for an owner
 * @param {number} ownerId - Owner ID
 * @param {Function} callback - Callback function
 */
Notification.getByOwner = (ownerId, callback) => {
  const sql = `
    SELECT 
      n.*,
      l.lot_no,
      p.plan_identifier,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM owner_lot_notifications n
    LEFT JOIN lots l ON n.lot_id = l.id
    LEFT JOIN plans p ON n.plan_id = p.id
    LEFT JOIN users u ON n.created_by = u.id
    WHERE n.owner_id = ?
    ORDER BY n.created_at DESC
  `;
  
  db.query(sql, [ownerId], callback);
};

/**
 * Get all pending notifications (for retry jobs)
 * @param {Function} callback - Callback function
 */
Notification.getPending = (callback) => {
  const sql = `
    SELECT 
      n.*,
      o.name as owner_name,
      o.mobile,
      l.lot_no,
      p.plan_identifier
    FROM owner_lot_notifications n
    INNER JOIN owners o ON n.owner_id = o.id
    INNER JOIN lots l ON n.lot_id = l.id
    LEFT JOIN plans p ON n.plan_id = p.id
    WHERE n.notification_status = 'pending'
      AND o.mobile IS NOT NULL
      AND o.mobile != ''
    ORDER BY n.created_at ASC
  `;
  
  db.query(sql, callback);
};

/**
 * Get failed notifications (for retry)
 * @param {Function} callback - Callback function
 */
Notification.getFailed = (callback) => {
  const sql = `
    SELECT 
      n.*,
      o.name as owner_name,
      o.nic,
      o.mobile,
      l.lot_no,
      p.plan_identifier
    FROM owner_lot_notifications n
    INNER JOIN owners o ON n.owner_id = o.id
    INNER JOIN lots l ON n.lot_id = l.id
    LEFT JOIN plans p ON n.plan_id = p.id
    WHERE n.notification_status = 'failed'
      AND o.mobile IS NOT NULL
      AND o.mobile != ''
    ORDER BY n.created_at DESC
  `;
  
  db.query(sql, callback);
};

module.exports = Notification;
```

---

### File 3: Lot Model Modification (`backend/models/lotModel.js`)

Modify the existing `addOwnerToLot` function (around line 310):

**Key Change**: Check if notification exists for THIS specific lot, not just if owner was ever notified.

```javascript
/**
 * Add owner to lot with notification tracking
 * @param {number} lotId - Lot ID
 * @param {Object} ownerData - Owner data
 * @param {number} sharePercentage - Ownership percentage
 * @param {number} userId - User performing action
 * @param {number} planId - Plan ID
 * @param {Function} callback - Callback function
 */
Lot.addOwnerToLot = (lotId, ownerData, sharePercentage, userId, planId, callback) => {
  const Owner = require('./ownerModel');

  // 1. Normalize mobile number
  ownerData.mobile = normalizeMobile(ownerData.mobile || ownerData.phone);

  // 2. Find or create owner
  Lot.createOrUpdateOwner(ownerData, userId, (ownerErr, ownerResult) => {
    if (ownerErr) {
      console.error('Error in createOrUpdateOwner:', ownerErr);
      return callback(ownerErr);
    }

    const ownerId = ownerResult.insertId;
    const isNewOwner = ownerResult.isNewOwner;

    console.log(`ℹ️ Owner ${ownerId} - isNewOwner: ${isNewOwner}`);

    // 3. Check if owner has been notified
    Owner.isNotified(ownerId, (notifyCheckErr, isNotified) => {
      if (notifyCheckErr) {
        console.warn('⚠️ Could not check notification status:', notifyCheckErr);
        // Assume notified to avoid duplicate SMS on error
        isNotified = true;
      }

      console.log(`ℹ️ Owner ${ownerId} - isNotified: ${isNotified}`);

      // 4. Check if owner already linked to this lot
      const checkSql = `
        SELECT id FROM lot_owners
        WHERE lot_id = ? AND owner_id = ? AND status = 'active'
      `;
      
      db.query(checkSql, [lotId, ownerId], (checkErr, existingRows) => {
        if (checkErr) {
          console.error('Error checking lot-owner link:', checkErr);
          return callback(checkErr);
        }

        // Function to link owner to lot
        const linkOwnerToLot = (linkCallback) => {
          if (existingRows.length > 0) {
            // Owner already linked to this lot - update share percentage
            console.log(`ℹ️ Updating existing lot-owner link`);
            const updateSql = `
              UPDATE lot_owners
              SET ownership_percentage = ?, 
                  updated_by = ?, 
                  updated_at = NOW()
              WHERE lot_id = ? AND owner_id = ?
            `;
            db.query(
              updateSql, 
              [sharePercentage || 100, userId, lotId, ownerId], 
              linkCallback
            );
          } else {
            // Create new lot-owner link
            console.log(`ℹ️ Creating new lot-owner link`);
            const insertSql = `
              INSERT INTO lot_owners
              (lot_id, owner_id, plan_id, ownership_percentage, status, created_by)
              VALUES (?, ?, ?, ?, 'active', ?)
            `;
            db.query(
              insertSql, 
              [lotId, ownerId, planId, sharePercentage || 100, userId], 
              linkCallback
            );
          }
        };

        // 5. Link owner to lot
        linkOwnerToLot((linkErr) => {
          if (linkErr) {
            console.error('Error linking owner to lot:', linkErr);
            return callback(linkErr);
          }
          
          console.log(`✅ Owner ${ownerId} linked to lot ${lotId}`);
          
          // 6. Return result with notification status
          callback(null, {
            success: true,
            ownerId: ownerId,
            ownerData: ownerResult.ownerData,
            isNewOwner: isNewOwner,
            needsNotification: !isNotified,  // ← KEY FLAG
            alreadyNotified: isNotified
          });
        });
      });
    });
  });
};
```

---

### File 4: Lot Controller Modification (`backend/controllers/lotController.js`)

Modify the existing `addOwnerToLot` function (around line 606):

```javascript
// Add at top of file
const { sendOwnerWelcomeSMS } = require('../services/smsService');
const Owner = require('../models/ownerModel');

/**
 * Add owner to lot with SMS notification
 * @route POST /api/lots/:lotId/owners
 */
exports.addOwnerToLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { nic, name, address, phone, mobile, email, share_percentage } = req.body;
    
    // Validate token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // Check permissions
    if (!['land_officer', 'chief_engineer', 'project_engineer'].includes(decoded.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to add owners' 
      });
    }
    
    console.log(`📝 Adding owner to lot ${lotId}`);
    console.log(`   → NIC: ${nic}`);
    console.log(`   → Name: ${name}`);
    console.log(`   → Mobile: ${mobile || phone}`);
    
    // Get lot details for SMS
    const getLotSql = `
      SELECT l.lot_no, p.plan_identifier, l.plan_id 
      FROM lots l 
      LEFT JOIN plans p ON l.plan_id = p.id 
      WHERE l.id = ?
    `;
    
    db.query(getLotSql, [lotId], async (getLotErr, lotResults) => {
      if (getLotErr) {
        console.error('❌ Error finding lot:', getLotErr);
        return res.status(500).json({ error: 'Failed to find lot' });
      }
      
      if (lotResults.length === 0) {
        console.error('❌ Lot not found:', lotId);
        return res.status(404).json({ error: 'Lot not found' });
      }
      
      const planId = lotResults[0].plan_id;
      const lotDetails = {
        lot_number: lotResults[0].lot_no,
        plan_name: lotResults[0].plan_identifier
      };
      
      console.log(`ℹ️ Lot details: ${lotDetails.lot_number}, Plan: ${lotDetails.plan_name}`);
      
      const ownerData = { 
        nic, 
        name, 
        address, 
        phone: phone || mobile,
        mobile: phone || mobile,
        email 
      };
      
      // Add owner to lot
      Lot.addOwnerToLot(
        lotId, 
        ownerData, 
        share_percentage, 
        decoded.id, 
        planId, 
        async (err, result) => {
          if (err) {
            console.error('❌ Error adding owner to lot:', err);
            return res.status(500).json({ 
              error: 'Failed to add owner to lot' 
            });
          }
          
          console.log(`✅ Owner added to lot successfully`);
          console.log(`   → Owner ID: ${result.ownerId}`);
          console.log(`   → Needs Notification: ${result.needsNotification}`);
          console.log(`   → Already Notified: ${result.alreadyNotified}`);
          
          // ✅ Check if owner needs notification
          if (result.needsNotification && ownerData.mobile) {
            console.log(`📱 Owner needs notification. Sending SMS...`);
            
            try {
              // Send SMS
              const smsResult = await sendOwnerWelcomeSMS(
                {
                  name: ownerData.name,
                  nic: ownerData.nic,
                  mobile: ownerData.mobile
                },
                lotDetails
              );
              
              if (smsResult.success) {
                // SMS sent successfully - mark owner as notified
                console.log(`✅ SMS sent successfully (SID: ${smsResult.sid})`);
                
                Owner.markAsNotified(result.ownerId, (markErr) => {
                  if (markErr) {
                    console.error('⚠️ Failed to mark owner as notified:', markErr);
                    // Don't fail the request - just log the error
                  } else {
                    console.log(`✅ Owner ${result.ownerId} marked as notified`);
                  }
                });
                
                return res.json({ 
                  message: 'Owner added successfully',
                  smsStatus: 'SMS sent',
                  smsSid: smsResult.sid,
                  notificationSent: true,
                  isNewOwner: result.isNewOwner
                });
              } else {
                // SMS failed - don't mark as notified
                console.warn(`⚠️ SMS sending failed: ${smsResult.error}`);
                
                return res.json({ 
                  message: 'Owner added successfully (SMS failed)',
                  smsStatus: 'Failed: ' + smsResult.error,
                  notificationSent: false,
                  isNewOwner: result.isNewOwner,
                  warning: 'Owner added but SMS notification failed. You may retry later.'
                });
              }
            } catch (smsError) {
              console.error('❌ SMS sending error:', smsError);
              
              return res.json({ 
                message: 'Owner added successfully (SMS error)',
                smsStatus: 'Error: ' + smsError.message,
                notificationSent: false,
                isNewOwner: result.isNewOwner,
                warning: 'Owner added but SMS notification encountered an error.'
              });
            }
          } else {
            // Owner already notified or no mobile number
            const reason = !ownerData.mobile 
              ? 'No mobile number provided'
              : 'Owner already notified';
            
            console.log(`ℹ️ No SMS sent - ${reason}`);
            
            return res.json({ 
              message: 'Owner added to lot successfully',
              smsStatus: `Not sent (${reason})`,
              notificationSent: false,
              alreadyNotified: result.alreadyNotified,
              isNewOwner: result.isNewOwner
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ Error in addOwnerToLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

## 🔄 Flow Diagrams

### Complete System Flow

```
┌─────────────────────────────────────────────────────┐
│ User submits form: Add Owner to Lot                 │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ lotController.addOwnerToLot()                       │
│ - Validates token & permissions                     │
│ - Gets lot details from database                    │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Lot.addOwnerToLot()                                 │
│ - Normalizes mobile number                          │
│ - Calls createOrUpdateOwner()                       │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Lot.createOrUpdateOwner()                           │
│ - Checks if owner exists by NIC                     │
└───────────────────────┬─────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
┌─────────────────────┐   ┌─────────────────────┐
│ Owner EXISTS        │   │ Owner NOT FOUND     │
│ (NIC found)         │   │                     │
└──────────┬──────────┘   └──────────┬──────────┘
           ↓                         ↓
┌─────────────────────┐   ┌─────────────────────┐
│ Update owner data   │   │ Create new owner    │
│ Return:             │   │ (notified = 0)      │
│ - insertId          │   │ Return:             │
│ - isNewOwner=false  │   │ - insertId          │
└──────────┬──────────┘   │ - isNewOwner=true   │
           │              └──────────┬──────────┘
           └───────────┬──────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Check notification status                           │
│ Owner.isNotified(ownerId)                          │
└───────────────────────┬─────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
┌─────────────────────┐   ┌─────────────────────┐
│ notified = 0        │   │ notified = 1        │
│ (Not notified yet)  │   │ (Already notified)  │
└──────────┬──────────┘   └──────────┬──────────┘
           ↓                         ↓
┌─────────────────────┐   ┌─────────────────────┐
│ needsNotification   │   │ needsNotification   │
│ = true              │   │ = false             │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           └───────────┬──────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Link owner to lot                                   │
│ - Check if already linked                           │
│ - Insert or Update lot_owners table                 │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Return to controller with result:                   │
│ { success, ownerId, needsNotification,             │
│   alreadyNotified, ownerData }                      │
└───────────────────────┬─────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ lotController checks needsNotification flag         │
└───────────────────────┬─────────────────────────────┘
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
┌─────────────────────┐   ┌─────────────────────┐
│ needsNotification   │   │ needsNotification   │
│ = true              │   │ = false             │
│ + has mobile        │   │ or no mobile        │
└──────────┬──────────┘   └──────────┬──────────┘
           ↓                         ↓
┌─────────────────────┐   ┌─────────────────────┐
│ Send SMS            │   │ Skip SMS            │
│ (smsService)        │   │ Return success      │
└──────────┬──────────┘   └─────────────────────┘
           ↓
┌─────────────────────┐
│ Twilio API          │
└──────────┬──────────┘
           ↓
   ┌───────┴───────┐
   ↓               ↓
┌─────────┐   ┌─────────┐
│ Success │   │ Failure │
└────┬────┘   └────┬────┘
     ↓             ↓
┌─────────┐   ┌─────────┐
│ Mark as │   │ Keep    │
│ notified│   │ notified│
│ (DB)    │   │ = 0     │
└────┬────┘   └────┬────┘
     │             │
     └──────┬──────┘
            ↓
┌─────────────────────┐
│ Return response     │
│ to frontend         │
└─────────────────────┘
```

### Notification Decision Tree

```
Owner added to lot
        ↓
    Check: Owner exists in DB?
        ↓
    ┌───┴───┐
   YES     NO
    ↓       ↓
 UPDATE   CREATE (notified=0)
    ↓       ↓
    └───┬───┘
        ↓
    Check: notified column
        ↓
    ┌───────┴───────┐
notified=0      notified=1
    ↓               ↓
Has mobile?     Skip SMS ✅
    ↓           Return success
┌───┴───┐
YES    NO
 ↓      ↓
Send  Skip
SMS   SMS
 ↓      ↓
Success? Keep
 ↓    notified=0
┌┴┐
YES NO
 ↓  ↓
Set Keep
notified notified
=1    =0
 ↓  ↓
 └┬┘
  ↓
Return
success
```

---

## 📚 Example Scenarios

### Scenario 1: Brand New Owner

**Input:**
```json
{
  "nic": "999888777V",
  "name": "John Doe",
  "mobile": "0771234567",
  "address": "Colombo"
}
```

**Database State:**
- Owner doesn't exist
- Will create new record

**Flow:**
1. ✅ Check NIC → Not found
2. ✅ Create new owner (notified=0)
3. ✅ isNewOwner = true
4. ✅ Link to Lot-001
5. ✅ Check notified → 0 (needs notification)
6. ✅ Check mobile → +94771234567 exists
7. ✅ Send SMS → Success
8. ✅ Mark as notified (notified=1, notified_at=NOW())

**Response:**
```json
{
  "message": "Owner added successfully",
  "smsStatus": "SMS sent",
  "smsSid": "SM123abc...",
  "notificationSent": true,
  "isNewOwner": true
}
```

**SMS Sent:**
```
Hello John Doe,

You have been successfully registered in the Land Acquisition Management System.

Your Details:
- NIC: 999888777V
- Name: John Doe
- Lot: LOT-001
- Plan: PLAN-A

You will be contacted by our team regarding land acquisition and compensation details.

Thank you.
- Land Acquisition Management System
```

---

### Scenario 2: Same Owner, Second Lot

**Input:**
```json
{
  "nic": "999888777V",  // Same NIC as before
  "name": "John Doe",
  "mobile": "0771234567",
  "address": "Colombo"
}
```

**Database State:**
- Owner exists (id=156)
- notified = 1 (from Scenario 1)

**Flow:**
1. ✅ Check NIC → Found (id=156)
2. ✅ Update owner data
3. ✅ isNewOwner = false
4. ✅ Link to Lot-002
5. ✅ Check notified → 1 (already notified)
6. ❌ Skip SMS (already notified before)

**Response:**
```json
{
  "message": "Owner added to lot successfully",
  "smsStatus": "Not sent (Owner already notified)",
  "notificationSent": false,
  "alreadyNotified": true,
  "isNewOwner": false
}
```

**SMS Sent:** None ❌

---

### Scenario 3: Existing Old Owner (Never Notified)

**Input:**
```json
{
  "nic": "123456789V",  // Exists from old data
  "name": "Jane Smith",
  "mobile": "0772223333",
  "address": "Kandy"
}
```

**Database State:**
- Owner exists (id=89, created 6 months ago)
- notified = 0 (old data, never notified)

**Flow:**
1. ✅ Check NIC → Found (id=89)
2. ✅ Update owner data
3. ✅ isNewOwner = false
4. ✅ Link to Lot-003
5. ✅ Check notified → 0 (never notified!)
6. ✅ Check mobile → +94772223333 exists
7. ✅ Send SMS → Success
8. ✅ Mark as notified (notified=1, notified_at=NOW())

**Response:**
```json
{
  "message": "Owner added successfully",
  "smsStatus": "SMS sent",
  "smsSid": "SM456def...",
  "notificationSent": true,
  "isNewOwner": false
}
```

**SMS Sent:** Yes ✅ (First time notification for old owner)

---

### Scenario 4: New Owner Without Mobile

**Input:**
```json
{
  "nic": "555444333V",
  "name": "Bob Williams",
  "mobile": null,  // No mobile number
  "address": "Galle"
}
```

**Database State:**
- Owner doesn't exist
- Will create new record

**Flow:**
1. ✅ Check NIC → Not found
2. ✅ Create new owner (notified=0, mobile=NULL)
3. ✅ isNewOwner = true
4. ✅ Link to Lot-004
5. ✅ Check notified → 0 (needs notification)
6. ❌ Check mobile → NULL (no mobile!)
7. ❌ Skip SMS (can't send without mobile)
8. ❌ notified stays 0 (not marked as notified)

**Response:**
```json
{
  "message": "Owner added to lot successfully",
  "smsStatus": "Not sent (No mobile number provided)",
  "notificationSent": false,
  "alreadyNotified": false,
  "isNewOwner": true
}
```

**SMS Sent:** None ❌

**Note:** If mobile is added later and owner is added to another lot, SMS will be sent then.

---

### Scenario 5: New Owner, SMS Fails

**Input:**
```json
{
  "nic": "777666555V",
  "name": "Alice Brown",
  "mobile": "0779999999",  // Invalid or unreachable
  "address": "Jaffna"
}
```

**Database State:**
- Owner doesn't exist
- Will create new record

**Flow:**
1. ✅ Check NIC → Not found
2. ✅ Create new owner (notified=0)
3. ✅ isNewOwner = true
4. ✅ Link to Lot-005
5. ✅ Check notified → 0 (needs notification)
6. ✅ Check mobile → +94779999999 exists
7. ❌ Send SMS → Twilio error (invalid number)
8. ❌ notified stays 0 (not marked since SMS failed)

**Response:**
```json
{
  "message": "Owner added successfully (SMS failed)",
  "smsStatus": "Failed: The number +94779999999 is not a valid phone number",
  "notificationSent": false,
  "isNewOwner": true,
  "warning": "Owner added but SMS notification failed. You may retry later."
}
```

**SMS Sent:** None ❌

**Important:** Registration succeeds even if SMS fails! Owner can be notified later.

---

## 🧪 Testing Guidelines

### Unit Testing

#### Test 1: Database Migration
```sql
-- Check columns exist
DESCRIBE owners;

-- Expected: notified and notified_at columns visible

-- Check default values
INSERT INTO owners (nic, name, mobile, created_by) 
VALUES ('TEST001', 'Test Owner', '+94771234567', 1);

SELECT notified, notified_at FROM owners WHERE nic = 'TEST001';
-- Expected: notified=0, notified_at=NULL

-- Cleanup
DELETE FROM owners WHERE nic = 'TEST001';
```

#### Test 2: Owner Model Methods
```javascript
// Test isNotified()
Owner.isNotified(156, (err, isNotified) => {
  console.log('Is notified:', isNotified);  // Should be true/false
});

// Test markAsNotified()
Owner.markAsNotified(156, (err, result) => {
  if (!err) console.log('Marked as notified');
});

// Verify
Owner.isNotified(156, (err, isNotified) => {
  console.log('Is notified after marking:', isNotified);  // Should be true
});
```

#### Test 3: SMS Service
```javascript
const { sendOwnerWelcomeSMS } = require('./services/smsService');

// Test with valid data
await sendOwnerWelcomeSMS(
  {
    name: 'Test Owner',
    nic: 'TEST123',
    mobile: '+94771234567'  // Use your verified number
  },
  {
    lot_number: 'LOT-001',
    plan_name: 'TEST-PLAN'
  }
);
// Check if SMS received
```

### Integration Testing

#### Test Case 1: New Owner Flow
```bash
# Setup: New owner
NIC: TEST001V
Name: Test Owner 1
Mobile: +94771234567 (your verified number)

# Action: Add to Lot-001
POST /api/lots/1/owners

# Verify:
1. Owner created in database ✓
2. notified = 0 initially ✓
3. SMS sent ✓
4. notified = 1 after SMS ✓
5. notified_at has timestamp ✓

# Check database
SELECT * FROM owners WHERE nic = 'TEST001V';
# notified should be 1
```

#### Test Case 2: Same Owner, Second Lot
```bash
# Setup: Use same owner from Test Case 1

# Action: Add to Lot-002
POST /api/lots/2/owners

# Verify:
1. Owner found (not created) ✓
2. notified = 1 (still) ✓
3. SMS NOT sent ✓
4. Response says "already notified" ✓

# Check database
SELECT * FROM owners WHERE nic = 'TEST001V';
# notified should still be 1 (not changed)
```

#### Test Case 3: Old Owner (Unnotified)
```bash
# Setup: Create old owner manually
INSERT INTO owners (nic, name, mobile, notified, created_by, created_at)
VALUES ('OLD001V', 'Old Owner', '+94772223333', 0, 1, DATE_SUB(NOW(), INTERVAL 6 MONTH));

# Action: Add to Lot-003
POST /api/lots/3/owners

# Verify:
1. Owner found (not created) ✓
2. notified = 0 initially ✓
3. SMS sent ✓
4. notified = 1 after SMS ✓

# Check database
SELECT * FROM owners WHERE nic = 'OLD001V';
# notified should now be 1
```

#### Test Case 4: No Mobile Number
```bash
# Setup: New owner without mobile
NIC: TEST002V
Name: Test Owner 2
Mobile: null

# Action: Add to Lot-004
POST /api/lots/4/owners

# Verify:
1. Owner created ✓
2. notified = 0 ✓
3. SMS NOT sent ✓
4. Response says "No mobile number" ✓

# Check database
SELECT * FROM owners WHERE nic = 'TEST002V';
# notified should be 0 (not marked since no SMS sent)
```

#### Test Case 5: SMS Failure Handling
```bash
# Setup: Invalid mobile number
NIC: TEST003V
Name: Test Owner 3
Mobile: +9471234567 (invalid format)

# Action: Add to Lot-005
POST /api/lots/5/owners

# Verify:
1. Owner created ✓
2. Registration succeeds ✓
3. SMS fails (logged) ✓
4. notified = 0 (not marked since SMS failed) ✓
5. Response includes warning ✓

# Check logs for SMS error
# Check database
SELECT * FROM owners WHERE nic = 'TEST003V';
# notified should be 0
```

### Manual Testing Checklist

- [ ] Database migration runs successfully
- [ ] New columns appear in owners table
- [ ] SMS service file created
- [ ] Owner model methods added
- [ ] Lot model modified correctly
- [ ] Lot controller modified correctly
- [ ] Twilio credentials in .env
- [ ] Test with verified number (new owner)
- [ ] Verify SMS received
- [ ] Check database notified=1
- [ ] Test same owner, different lot
- [ ] Verify no duplicate SMS
- [ ] Test old unnotified owner
- [ ] Verify SMS sent to old owner
- [ ] Test without mobile number
- [ ] Verify graceful handling
- [ ] Test with invalid mobile
- [ ] Verify registration still succeeds
- [ ] Check console logs
- [ ] Check Twilio dashboard

---

## 🔧 Troubleshooting

### Problem 1: SMS Not Sending

**Symptoms:**
- Owner added successfully
- But no SMS received
- Response says "SMS failed"

**Possible Causes & Solutions:**

1. **Twilio Credentials Wrong**
   ```bash
   # Check .env file
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   
   # Verify in Twilio console
   ```

2. **Trial Account Restrictions**
   - Twilio trial accounts can only send to verified numbers
   - Solution: Verify recipient's number in Twilio console
   - Or: Upgrade to paid account

3. **Invalid Phone Number**
   ```javascript
   // Check logs for error
   ❌ SMS Error: The number +94xxx is not a valid phone number
   
   // Solution: Validate number format
   ```

4. **Network Issues**
   ```javascript
   // Check if backend can reach Twilio
   // Test with curl
   curl -X POST https://api.twilio.com/...
   ```

---

### Problem 2: Duplicate SMS Sent

**Symptoms:**
- Same owner receives multiple SMS
- For different lots

**Possible Causes & Solutions:**

1. **notified Column Not Updated**
   ```sql
   -- Check database
   SELECT id, nic, name, notified, notified_at 
   FROM owners 
   WHERE nic = 'xxx';
   
   -- If notified=0 after SMS sent:
   -- Check if markAsNotified() is being called
   ```

2. **Database Update Failing**
   ```javascript
   // Check logs
   ⚠️ Failed to mark owner as notified: ...
   
   // Solution: Check database permissions
   ```

3. **Logic Error**
   ```javascript
   // Verify needsNotification flag logic
   // Should be: !isNotified
   needsNotification: !isNotified
   ```

---

### Problem 3: Owner Not Marked as Notified

**Symptoms:**
- SMS sent successfully
- But notified column still 0

**Solutions:**

1. **Check Database Update**
   ```sql
   -- Manually verify
   SELECT * FROM owners WHERE id = xxx;
   
   -- If notified=0, manually update
   UPDATE owners SET notified=1, notified_at=NOW() WHERE id=xxx;
   ```

2. **Check Error Logs**
   ```javascript
   // Look for
   ⚠️ Failed to mark owner as notified
   
   // Check Owner.markAsNotified() function
   ```

3. **Database Permissions**
   ```sql
   -- Check if user can UPDATE owners table
   SHOW GRANTS FOR 'your_db_user'@'localhost';
   ```

---

### Problem 4: Old Owners Not Getting Notified

**Symptoms:**
- Old owners added to new lots
- But no SMS sent

**Solutions:**

1. **Check notified Column**
   ```sql
   -- Old owners might have notified=NULL
   SELECT nic, name, notified 
   FROM owners 
   WHERE notified IS NULL;
   
   -- Fix: Set to 0
   UPDATE owners SET notified=0 WHERE notified IS NULL;
   ```

2. **Verify isNotified() Check**
   ```javascript
   // Should treat NULL as false
   const isNotified = results[0].notified === 1;
   ```

---

### Problem 5: SMS Sent But Registration Failed

**Symptoms:**
- SMS received by owner
- But owner not added to lot

**Solutions:**

1. **Check Transaction Order**
   - SMS should be sent AFTER registration succeeds
   - Never before database operations

2. **Error in Lot Linking**
   ```javascript
   // Check logs for
   ❌ Error linking owner to lot
   
   // Verify lot_owners table structure
   ```

3. **Rollback on Failure**
   ```javascript
   // If using transactions, ensure SMS is outside transaction
   // Or: Send SMS only after successful commit
   ```

---

## 📊 Monitoring & Maintenance

### Database Queries for Monitoring

```sql
-- 1. Total notification status
SELECT 
  COUNT(*) as total_owners,
  SUM(CASE WHEN notified = 1 THEN 1 ELSE 0 END) as notified_count,
  SUM(CASE WHEN notified = 0 THEN 1 ELSE 0 END) as pending_notification
FROM owners
WHERE status = 'active';

-- 2. Recent notifications
SELECT 
  id, nic, name, mobile, notified_at
FROM owners
WHERE notified = 1
ORDER BY notified_at DESC
LIMIT 20;

-- 3. Owners with mobile but not notified
SELECT 
  id, nic, name, mobile, created_at
FROM owners
WHERE notified = 0 
  AND mobile IS NOT NULL 
  AND mobile != ''
  AND status = 'active'
ORDER BY created_at DESC;

-- 4. Notification rate by date
SELECT 
  DATE(notified_at) as notification_date,
  COUNT(*) as notifications_sent
FROM owners
WHERE notified = 1
  AND notified_at IS NOT NULL
GROUP BY DATE(notified_at)
ORDER BY notification_date DESC
LIMIT 30;

-- 5. Owners added to multiple lots
SELECT 
  o.nic, o.name, o.notified, COUNT(lo.id) as lot_count
FROM owners o
LEFT JOIN lot_owners lo ON o.id = lo.owner_id
WHERE lo.status = 'active'
GROUP BY o.id
HAVING lot_count > 1
ORDER BY lot_count DESC;
```

### Twilio Dashboard Monitoring

1. **Check SMS Logs**
   - Login to Twilio Console
   - Go to Messaging → Logs
   - Filter by date/status

2. **Monitor Costs**
   - Dashboard → Usage
   - Check SMS usage and costs

3. **Delivery Status**
   - Check delivery status for each message
   - Investigate failed deliveries

---

## 🚀 Future Enhancements

### Possible Improvements

1. **Bulk Notification System**
   ```javascript
   // Notify all old unnotified owners at once
   Owner.getUnnotified((err, owners) => {
     owners.forEach(async (owner) => {
       await sendOwnerWelcomeSMS(owner);
       Owner.markAsNotified(owner.id);
     });
   });
   ```

2. **Notification Retry System**
   ```javascript
   // Add retry logic for failed SMS
   // Store failed attempts in database
   // Retry after X minutes/hours
   ```

3. **Multiple Notification Channels**
   ```javascript
   // Add email notification
   // Add WhatsApp notification (via Twilio)
   // User preference for channel
   ```

4. **Admin Dashboard**
   - View notification statistics
   - Resend notifications manually
   - Bulk operations

5. **Notification Templates**
   - Different messages for different scenarios
   - Multilingual support (Sinhala, Tamil, English)
   - Customizable templates

6. **Notification Preferences**
   ```sql
   ALTER TABLE owners 
   ADD COLUMN notification_preference ENUM('sms', 'email', 'both', 'none') DEFAULT 'sms';
   ```

---

## 📞 Support & Contact

### Technical Support
- Check logs in `backend/logs/`
- Review Twilio dashboard
- Check database notification status

### Documentation Updates
- Last Updated: October 14, 2025
- Version: 1.0
- Maintained By: Development Team

---

## ✅ Implementation Checklist

Before going live, ensure:

- [ ] Database migration completed successfully
- [ ] All code files created/modified
- [ ] Twilio credentials configured in .env
- [ ] Test environment testing completed
- [ ] All test cases passed
- [ ] SMS sending tested with real numbers
- [ ] Notification tracking verified
- [ ] Error handling tested
- [ ] Logs reviewed
- [ ] Documentation reviewed
- [ ] Team trained on new system
- [ ] Monitoring queries set up
- [ ] Rollback plan prepared

---

## 📄 Appendix

### A. Complete File List

```
backend/
├── services/
│   └── smsService.js                    [NEW FILE]
├── models/
│   ├── ownerModel.js                    [MODIFIED]
│   └── lotModel.js                      [MODIFIED]
├── controllers/
│   └── lotController.js                 [MODIFIED]
└── config/
    └── twilioClient.js                  [EXISTING]

database/
└── migrations/
    └── add_owner_notification_fields.sql [NEW FILE]
```

### B. Environment Variables Template

```bash
# .env.example

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=land_acquisition_db

# JWT
JWT_SECRET=your_secret_key

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Note: For Twilio trial accounts:
# - Only verified numbers can receive SMS
# - Message will include "Sent from a Twilio trial account" prefix
# - Upgrade to remove restrictions
```

### C. Quick Reference Commands

```bash
# Run database migration
mysql -u root -p land_acquisition_db < add_owner_notification_fields.sql

# Check notification status
mysql -u root -p -e "USE land_acquisition_db; SELECT nic, name, notified FROM owners LIMIT 10;"

# Find unnotified owners with mobile
mysql -u root -p -e "USE land_acquisition_db; SELECT COUNT(*) FROM owners WHERE notified=0 AND mobile IS NOT NULL;"

# Restart backend server
cd backend
npx nodemon server.js

# Test SMS service
node -e "const sms = require('./services/smsService'); sms.sendOwnerWelcomeSMS({name:'Test', nic:'123', mobile:'+94771234567'}, {lot_number:'TEST'}).then(console.log);"
```

---

**END OF DOCUMENTATION**

*For implementation, send this document to the development team and request: "yes, implement it"*
