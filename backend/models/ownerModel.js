const db = require("../config/db");

const Owner = {};

// Create new owner
Owner.create = (ownerData, callback) => {
  const sql = `
    INSERT INTO owners
    (name, nic, mobile, address, owner_type, status, created_by)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
  `;

  const params = [
    ownerData.name,
    ownerData.nic,
    ownerData.mobile || ownerData.phone || null,
    ownerData.address || null,
    ownerData.owner_type || 'Individual',
    ownerData.created_by
  ];

  console.log('Creating owner:', ownerData);
  db.query(sql, params, callback);
};

// Find owner by NIC (to check for duplicates)
Owner.findByNic = (nic, callback) => {
  const sql = "SELECT * FROM owners WHERE nic = ? AND status = 'active'";
  db.query(sql, [nic], callback);
};

// Find owner by ID
Owner.findById = (id, callback) => {
  const sql = "SELECT * FROM owners WHERE id = ?";
  db.query(sql, [id], callback);
};

// Update owner
Owner.update = (id, ownerData, callback) => {
  const sql = `
    UPDATE owners
    SET name = ?, nic = ?, mobile = ?, address = ?, owner_type = ?, updated_by = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const params = [
    ownerData.name,
    ownerData.nic,
    ownerData.mobile || ownerData.phone || null,
    ownerData.address || null,
    ownerData.owner_type || 'Individual',
    ownerData.updated_by,
    id
  ];

  console.log('Updating owner:', id, ownerData);
  db.query(sql, params, callback);
};

// Get all owners
Owner.getAll = (callback) => {
  const sql = `
    SELECT o.*,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM owners o
    LEFT JOIN users u ON o.created_by = u.id
    WHERE o.status = 'active'
    ORDER BY o.name
  `;
  db.query(sql, callback);
};

// Deactivate owner (soft delete)
Owner.deactivate = (id, updatedBy, callback) => {
  const sql = "UPDATE owners SET status = 'inactive', updated_by = ?, updated_at = NOW() WHERE id = ?";
  db.query(sql, [updatedBy, id], callback);
};

// Get owners by lot (through lot_owners bridge table)
Owner.getByLotId = (lotId, callback) => {
  const sql = `
    SELECT o.*,
           lo.ownership_percentage,
           lo.status as association_status
    FROM owners o
    INNER JOIN lot_owners lo ON o.id = lo.owner_id
    WHERE lo.lot_id = ? AND lo.status = 'active' AND o.status = 'active'
    ORDER BY o.name
  `;
  db.query(sql, [lotId], callback);
};

module.exports = Owner;