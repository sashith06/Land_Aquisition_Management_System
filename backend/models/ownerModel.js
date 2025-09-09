const db = require('../config/db');

class Owner {
  static create(ownerData, callback) {
    const { nic, name, address, phone, email } = ownerData;
    const sql = 'INSERT INTO owners (nic, name, address, phone, email) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nic, name, address, phone, email], callback);
  }

  static addOwnerToLot(lotId, ownerId, createdBy, callback) {
    const sql = 'INSERT INTO lot_owners (lot_id, owner_id, created_by) VALUES (?, ?, ?)';
    db.query(sql, [lotId, ownerId, createdBy], callback);
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM owners ORDER BY name ASC';
    db.query(sql, callback);
  }

  // Find owner by ID
  static findById(id, callback) {
    const sql = 'SELECT * FROM owners WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Find owner by NIC and mobile from owners table
  static findByNicAndMobile(nic, mobile, callback) {
    // Normalize phone number - remove +94 prefix if present and add 0 prefix if missing
    let normalizedMobile = mobile;
    if (mobile.startsWith('+94')) {
      normalizedMobile = '0' + mobile.substring(3);
    } else if (mobile.startsWith('94')) {
      normalizedMobile = '0' + mobile.substring(2);
    }

    const sql = 'SELECT * FROM owners WHERE nic = ? AND (phone = ? OR phone = ?) LIMIT 1';
    db.query(sql, [nic, mobile, normalizedMobile], callback);
  }

  // Get lots owned by an owner
  static getLotsByOwnerId(ownerId, callback) {
    const sql = `
      SELECT l.*, p.plan_number, pr.name as project_name, p.location
      FROM lot_owners lo
      JOIN lots l ON lo.lot_id = l.id
      JOIN plans p ON l.plan_id = p.id
      JOIN projects pr ON p.project_id = pr.id
      WHERE lo.owner_id = ?
    `;
    db.query(sql, [ownerId], callback);
  }
}

module.exports = Owner;
