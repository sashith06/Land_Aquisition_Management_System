const db = require("../config/db");

const Lot = {};

// Create new lot
Lot.create = (lotData, callback) => {
  const sql = `
    INSERT INTO lots 
    (plan_id, lot_no, extent_ha, extent_perch, land_type, 
     advance_tracing_extent_ha, advance_tracing_extent_perch,
     preliminary_plan_extent_ha, preliminary_plan_extent_perch,
     created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    lotData.plan_id,
    lotData.lot_no,
    lotData.extent_ha || null,
    lotData.extent_perch || null,
    lotData.land_type || 'Private',
    lotData.advance_tracing_extent_ha || null,
    lotData.advance_tracing_extent_perch || null,
    lotData.preliminary_plan_extent_ha || null,
    lotData.preliminary_plan_extent_perch || null,
    lotData.created_by
  ];

  db.query(sql, params, callback);
};

// Get lots with role-based access control and owners - ALL users can see all lots
Lot.getByUserRoleWithOwners = (userId, userRole, callback) => {
  const sql = `
    SELECT l.*, 
           p.plan_number,
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
    ORDER BY pr.name, p.plan_number, l.lot_no
  `;
  
  db.query(sql, [], (err, lots) => {
    if (err) return callback(err);
    
    if (lots.length === 0) return callback(null, []);
    
    // Get owners for each lot
    let completedLots = 0;
    lots.forEach((lot) => {
      Lot.getOwnersById(lot.id, (ownerErr, owners) => {
        if (ownerErr) {
          console.error('Error fetching owners for lot', lot.id, ':', ownerErr);
          lot.owners = [];
        } else {
          lot.owners = owners;
        }
        
        completedLots++;
        if (completedLots === lots.length) {
          callback(null, lots);
        }
      });
    });
  });
};

// Get lots with role-based access control (original method without owners) - ALL users can see all lots
Lot.getByUserRole = (userId, userRole, callback) => {
  const sql = `
    SELECT l.*,
           p.plan_number,
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
    ORDER BY pr.name, p.plan_number, l.lot_no
  `;

  db.query(sql, [], callback);
};

// Get lots by plan with role-based access and owners - ALL users can see lots for any plan
Lot.getByPlanIdWithRoleAndOwners = (planId, userId, userRole, callback) => {
  // All authenticated users can see lots for any plan
  Lot.getByPlanIdWithOwners(planId, callback);
};

// Get lots by plan with role-based access (original method without owners) - ALL users can see lots for any plan
Lot.getByPlanIdWithRole = (planId, userId, userRole, callback) => {
  // All authenticated users can see lots for any plan
  Lot.getByPlanId(planId, callback);
};

// Get all lots for a plan
Lot.getByPlanId = (planId, callback) => {
  const sql = `
    SELECT l.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE l.plan_id = ?
    ORDER BY l.lot_no ASC
  `;
  db.query(sql, [planId], callback);
};

// Create owner directly in lot_owners table (WAMP server structure)
Lot.createOwner = (ownerData, callback) => {
  // For WAMP server database, we don't have a separate owners table
  // Owners are stored directly in lot_owners table
  // This method is called from controller but we'll handle it in addOwnerToLot
  callback(null, { insertId: 0, message: 'Use addOwnerToLot for WAMP server database' });
};

// Add owner to lot (normalized structure with separate owners table)
Lot.addOwnerToLot = (lotId, ownerData, sharePercentage, userId, planId, callback) => {
  // First, check if owner already exists by NIC
  const findOwnerSql = `SELECT id FROM owners WHERE nic = ?`;
  db.query(findOwnerSql, [ownerData.nic], (findErr, ownerResults) => {
    if (findErr) return callback(findErr);

    if (ownerResults.length > 0) {
      // Owner exists, use existing owner_id
      const ownerId = ownerResults[0].id;
      insertLotOwner(ownerId);
    } else {
      // Owner doesn't exist, create new owner
      const createOwnerSql = `
        INSERT INTO owners (nic, name, address, phone, email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const ownerParams = [
        ownerData.nic,
        ownerData.name,
        ownerData.address,
        ownerData.mobile || ownerData.phone || null,
        ownerData.email || null
      ];

      db.query(createOwnerSql, ownerParams, (createErr, createResult) => {
        if (createErr) return callback(createErr);
        const newOwnerId = createResult.insertId;
        insertLotOwner(newOwnerId);
      });
    }

    function insertLotOwner(ownerId) {
      // Insert into lot_owners junction table
      const sql = `
        INSERT INTO lot_owners
        (lot_id, owner_id, plan_id, created_by, updated_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          updated_by = VALUES(updated_by),
          updated_at = NOW()
      `;
      const params = [lotId, ownerId, planId, userId, userId];
      db.query(sql, params, callback);
    }
  });
};

// Remove owner from lot (normalized structure)
Lot.removeOwnerFromLot = (lotId, ownerId, callback) => {
  const sql = `DELETE FROM lot_owners WHERE lot_id = ? AND owner_id = ?`;
  db.query(sql, [lotId, ownerId], callback);
};

// Get owners for a specific lot (normalized structure)
Lot.getOwnersById = (lotId, callback) => {
  console.log(`=== getOwnersById DEBUG START for lot ${lotId} ===`);

  // Query for normalized database structure with separate owners table
  const sql = `
    SELECT
      lo.id as lot_owner_id,
      o.id as owner_id,
      o.name,
      o.nic,
      o.phone,
      o.address,
      o.email
    FROM lot_owners lo
    JOIN owners o ON lo.owner_id = o.id
    WHERE lo.lot_id = ?
    ORDER BY o.name
  `;

  console.log('SQL query:', sql);
  console.log('Params:', [lotId]);

  db.query(sql, [lotId], (err, results) => {
    if (err) {
      console.error(`Error in getOwnersById for lot ${lotId}:`, err);
      return callback(err);
    }

    console.log(`Owners found for lot ${lotId}:`, results.length);
    console.log(`Owner data for lot ${lotId}:`, JSON.stringify(results, null, 2));
    console.log(`=== getOwnersById DEBUG END for lot ${lotId} ===`);

    callback(null, results);
  });
};

// Get lots with owners by plan ID
Lot.getByPlanIdWithOwners = (planId, callback) => {
  const sql = `
    SELECT l.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE l.plan_id = ?
    ORDER BY l.lot_no ASC
  `;
  
  db.query(sql, [planId], (err, lots) => {
    if (err) return callback(err);
    
    if (lots.length === 0) return callback(null, []);
    
    // Get owners for each lot
    let completedLots = 0;
    lots.forEach((lot) => {
      Lot.getOwnersById(lot.id, (ownerErr, owners) => {
        if (ownerErr) {
          console.error('Error fetching owners for lot', lot.id, ':', ownerErr);
          lot.owners = [];
        } else {
          lot.owners = owners;
        }
        
        completedLots++;
        if (completedLots === lots.length) {
          callback(null, lots);
        }
      });
    });
  });
};

// Get single lot by ID with owners
Lot.findByIdWithOwners = (id, callback) => {
  const sql = `
    SELECT l.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE l.id = ?
  `;
  
  db.query(sql, [id], (err, lots) => {
    if (err) return callback(err);
    if (lots.length === 0) return callback(null, []);
    
    const lot = lots[0];
    
    // Get owners for this lot
    Lot.getOwnersById(lot.id, (ownerErr, owners) => {
      if (ownerErr) {
        console.error('Error fetching owners for lot', lot.id, ':', ownerErr);
        lot.owners = [];
      } else {
        lot.owners = owners;
      }
      callback(null, [lot]);
    });
  });
};

// Get single lot by ID (original method without owners)
Lot.findById = (id, callback) => {
  const sql = `
    SELECT l.*, 
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE l.id = ?
  `;
  db.query(sql, [id], callback);
};

// Update lot
Lot.update = (id, lotData, callback) => {
  const sql = `
    UPDATE lots 
    SET lot_no = ?, extent_ha = ?, extent_perch = ?, land_type = ?,
        advance_tracing_extent_ha = ?, advance_tracing_extent_perch = ?,
        preliminary_plan_extent_ha = ?, preliminary_plan_extent_perch = ?,
        updated_by = ?, updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [
    lotData.lot_no,
    lotData.extent_ha || null,
    lotData.extent_perch || null,
    lotData.land_type,
    lotData.advance_tracing_extent_ha || null,
    lotData.advance_tracing_extent_perch || null,
    lotData.preliminary_plan_extent_ha || null,
    lotData.preliminary_plan_extent_perch || null,
    lotData.updated_by,
    id
  ];

  db.query(sql, params, callback);
};

// Delete lot
Lot.delete = (id, callback) => {
  const sql = "DELETE FROM lots WHERE id = ?";
  db.query(sql, [id], callback);
};

// Get advance trading numbers for dropdown
Lot.getAdvanceTracingNumbers = (callback) => {
  const sql = `
    SELECT DISTINCT advance_trading_no
    FROM plans 
    WHERE advance_trading_no IS NOT NULL AND advance_trading_no != ''
    ORDER BY advance_trading_no
  `;
  db.query(sql, callback);
};

// Update lot land details
Lot.updateLandDetails = (id, landDetails, callback) => {
  const sql = `
    UPDATE lots 
    SET land_type = ?,
        advance_tracing_extent_ha = ?, 
        advance_tracing_extent_perch = ?,
        preliminary_plan_extent_ha = ?, 
        preliminary_plan_extent_perch = ?,
        updated_by = ?, 
        updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [
    landDetails.land_type,
    landDetails.advance_tracing_extent_ha || null,
    landDetails.advance_tracing_extent_perch || null,
    landDetails.preliminary_plan_extent_ha || null,
    landDetails.preliminary_plan_extent_perch || null,
    landDetails.updated_by,
    id
  ];

  db.query(sql, params, callback);
};

// Save/Create lot land details (same as update for lots table)
Lot.saveLandDetails = (id, landDetails, callback) => {
  const sql = `
    UPDATE lots 
    SET land_type = ?,
        advance_tracing_extent_ha = ?, 
        advance_tracing_extent_perch = ?,
        preliminary_plan_extent_ha = ?, 
        preliminary_plan_extent_perch = ?,
        updated_by = ?, 
        updated_at = NOW()
    WHERE id = ?
  `;
  
  const params = [
    landDetails.land_type,
    landDetails.advance_tracing_extent_ha || null,
    landDetails.advance_tracing_extent_perch || null,
    landDetails.preliminary_plan_extent_ha || null,
    landDetails.preliminary_plan_extent_perch || null,
    landDetails.created_by,
    id
  ];

  console.log('saveLandDetails SQL:', sql);
  console.log('saveLandDetails params:', params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Database error in saveLandDetails:', err);
      return callback(err);
    }
    console.log('saveLandDetails result:', result);
    callback(null, result);
  });
};

// Get lot land details by ID
Lot.getLandDetailsById = (id, callback) => {
  const sql = `
    SELECT id, land_type, 
           advance_tracing_extent_ha, advance_tracing_extent_perch,
           preliminary_plan_extent_ha, preliminary_plan_extent_perch,
           created_by, updated_by, created_at, updated_at
    FROM lots 
    WHERE id = ?
  `;
  
  console.log('getLandDetailsById called with id:', id);
  console.log('getLandDetailsById SQL:', sql);
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error in getLandDetailsById:', err);
      return callback(err);
    }
    
    console.log('getLandDetailsById results:', results);
    
    if (results.length === 0) {
      console.log('No lot found with id:', id);
      return callback(null, null);
    }
    
    const lot = results[0];
    console.log('Found lot:', lot);
    
    // Return only if there are land details (not just default values)
    if (lot.land_type || lot.advance_tracing_extent_ha || lot.advance_tracing_extent_perch ||
        lot.preliminary_plan_extent_ha || lot.preliminary_plan_extent_perch) {
      console.log('Returning land details for lot:', lot.id);
      callback(null, lot);
    } else {
      console.log('No land details found for lot:', lot.id);
      callback(null, null);
    }
  });
};

module.exports = Lot;
