const db = require("../config/db");

const Lot = {};

// Utility function to normalize mobile numbers
function normalizeMobile(mobile) {
  if (!mobile) return null;
  mobile = mobile.replace(/\D/g, '');
  if (mobile.startsWith('0')) mobile = '+94' + mobile.slice(1);
  else if (mobile.startsWith('94')) mobile = '+' + mobile;
  else if (!mobile.startsWith('+')) mobile = '+' + mobile;
  return mobile;
}

// Create new lot
Lot.create = (lotData, callback) => {
  const sql = `
    INSERT INTO lots 
    (plan_id, lot_no, extent_ha, extent_perch, land_type, status,
     advance_tracing_extent_ha, advance_tracing_extent_perch,
     preliminary_plan_extent_ha, preliminary_plan_extent_perch,
     created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const params = [
    lotData.plan_id,
    lotData.lot_no,
    lotData.extent_ha || null,
    lotData.extent_perch || null,
    lotData.land_type || 'Private',
    lotData.status || 'active',
    lotData.advance_tracing_extent_ha || null,
    lotData.advance_tracing_extent_perch || null,
    lotData.preliminary_plan_extent_ha || null,
    lotData.preliminary_plan_extent_perch || null,
    lotData.created_by
  ];

  db.query(sql, params, callback);
};

// Get lots with role-based access control and owners
Lot.getByUserRoleWithOwners = (userId, userRole, callback) => {
  let sql = `
    SELECT l.*, 
           p.plan_identifier,
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
  `;
  
  let whereCondition = '';
  let params = [];
  
  switch(userRole) {
    case 'CE': // Chief Engineer - can see all lots
    case 'chief_engineer':
      whereCondition = '';
      break;
      
    case 'PE': // Project Engineer - only lots for projects they created
    case 'project_engineer':
      whereCondition = 'WHERE pr.created_by = ?';
      params = [userId];
      break;
      
    case 'FO': // Financial Officer - only lots for approved projects
    case 'financial_officer':
      whereCondition = 'WHERE pr.status = "approved"';
      break;
      
    case 'LO': // Land Officer - only lots for assigned projects
    case 'land_officer':
      whereCondition = `WHERE pr.status = 'approved' AND EXISTS (
        SELECT 1 FROM project_assignments pa 
        WHERE pa.project_id = pr.id 
          AND pa.land_officer_id = ? 
          AND pa.status = 'active'
      )`;
      params = [userId];
      break;
      
    default:
      whereCondition = 'WHERE 1=0'; // No access
      break;
  }
  
  if (whereCondition) {
    sql += ' ' + whereCondition;
  }
  
  sql += ' ORDER BY pr.name, p.plan_identifier, l.lot_no';
  
  console.log('getByUserRoleWithOwners SQL:', sql);
  console.log('getByUserRoleWithOwners params:', params);
  
  db.query(sql, params, (err, lots) => {
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

// Get lots with role-based access control (original method without owners)
Lot.getByUserRole = (userId, userRole, callback) => {
  let sql = `
    SELECT l.*, 
           p.plan_identifier,
           pr.name as project_name,
           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
  `;
  
  let whereCondition = '';
  let params = [];
  
  switch(userRole) {
    case 'CE': // Chief Engineer - can see all lots
    case 'chief_engineer':
      whereCondition = '';
      break;
      
    case 'PE': // Project Engineer - only lots for projects they created
    case 'project_engineer':
      whereCondition = 'WHERE pr.created_by = ?';
      params = [userId];
      break;
      
    case 'FO': // Financial Officer - only lots for approved projects
    case 'financial_officer':
      whereCondition = 'WHERE pr.status = ?';
      params = ['approved'];
      break;
      
    case 'LO': // Land Officer - only lots for assigned projects or lots they created
    case 'land_officer':
      sql = `
        SELECT DISTINCT l.*, 
               p.plan_identifier,
               pr.name as project_name,
               CONCAT(u.first_name, ' ', u.last_name) as created_by_name
        FROM lots l
        LEFT JOIN plans p ON l.plan_id = p.id
        LEFT JOIN projects pr ON p.project_id = pr.id
        LEFT JOIN users u ON l.created_by = u.id
        LEFT JOIN project_assignments pa ON pr.id = pa.project_id
        WHERE (pa.land_officer_id = ? AND pa.status = 'active' AND pr.status = 'approved')
           OR l.created_by = ?
      `;
      params = [userId, userId];
      break;
      
    default:
      return callback(new Error('Invalid user role'));
  }
  
  const finalSql = sql + whereCondition + ' ORDER BY pr.name, p.plan_identifier, l.lot_no ASC';
  db.query(finalSql, params, callback);
};

// Get lots by plan with role-based access and owners
Lot.getByPlanIdWithRoleAndOwners = (planId, userId, userRole, callback) => {
  // First check if user has access to this plan
  const accessCheckSql = `
    SELECT p.id, p.created_by, pr.status, pr.created_by as project_creator
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN project_assignments pa ON pr.id = pa.project_id
    WHERE p.id = ? AND (
      ? IN ('CE', 'chief_engineer') OR 
      (? IN ('PE', 'project_engineer') AND pr.created_by = ?) OR
      (? IN ('FO', 'financial_officer') AND pr.status = 'approved') OR
      (? IN ('LO', 'land_officer') AND ((pa.land_officer_id = ? AND pa.status = 'active') OR p.created_by = ?))
    )
  `;
  
  db.query(accessCheckSql, [planId, userRole, userRole, userId, userRole, userRole, userId, userId], (accessErr, accessRows) => {
    if (accessErr) return callback(accessErr);
    if (accessRows.length === 0) {
      return callback(new Error('Access denied: You do not have permission to view lots for this plan'));
    }
    
    // If access is granted, get the lots with owners
    Lot.getByPlanIdWithOwners(planId, callback);
  });
};

// Get lots by plan with role-based access (original method without owners)
Lot.getByPlanIdWithRole = (planId, userId, userRole, callback) => {
  // First check if user has access to this plan
  const accessCheckSql = `
    SELECT p.id, p.created_by, pr.status, pr.created_by as project_creator
    FROM plans p
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN project_assignments pa ON pr.id = pa.project_id
    WHERE p.id = ? AND (
      ? IN ('CE', 'chief_engineer') OR 
      (? IN ('PE', 'project_engineer') AND pr.created_by = ?) OR
      (? IN ('FO', 'financial_officer') AND pr.status = 'approved') OR
      (? IN ('LO', 'land_officer') AND ((pa.land_officer_id = ? AND pa.status = 'active') OR p.created_by = ?))
    )
  `;
  
  db.query(accessCheckSql, [planId, userRole, userRole, userId, userRole, userRole, userId, userId], (accessErr, accessRows) => {
    if (accessErr) return callback(accessErr);
    if (accessRows.length === 0) {
      return callback(new Error('Access denied: You do not have permission to view lots for this plan'));
    }
    
    // If access is granted, get the lots
    Lot.getByPlanId(planId, callback);
  });
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

// Create owner in owners table (normalized structure)
Lot.createOwner = (ownerData, userId, callback) => {
  const Owner = require('./ownerModel');

  // First check if owner already exists by NIC
  Owner.findByNic(ownerData.nic, (err, existingOwners) => {
    if (err) return callback(err);

    if (existingOwners && existingOwners.length > 0) {
      // Owner already exists, return existing owner
      return callback(null, { insertId: existingOwners[0].id, message: 'Owner already exists' });
    }

    // Create new owner
    const ownerDataWithUser = { ...ownerData, created_by: userId };
    Owner.create(ownerDataWithUser, callback);
  });
};

// Create or update owner in owners table (normalized structure)
Lot.createOrUpdateOwner = (ownerData, userId, callback) => {
  const Owner = require('./ownerModel');

  Owner.findByNic(ownerData.nic, (err, existingOwners) => {
    if (err) return callback(err);

    if (existingOwners && existingOwners.length > 0) {
      const ownerId = existingOwners[0].id;

      // Update existing owner details
      const updateSql = `
        UPDATE owners
        SET name = ?, mobile = ?, address = ?, owner_type = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      const params = [
        ownerData.name,
        ownerData.mobile,
        ownerData.address,
        ownerData.owner_type || existingOwners[0].owner_type,
        userId,
        ownerId
      ];

      db.query(updateSql, params, (updateErr, result) => {
        if (updateErr) return callback(updateErr);
        callback(null, { insertId: ownerId, message: 'Owner updated' });
      });
    } else {
      // Create new owner
      const ownerDataWithUser = { ...ownerData, created_by: userId };
      Owner.create(ownerDataWithUser, callback);
    }
  });
};

// Add owner to lot (normalized structure with bridge table)
Lot.addOwnerToLot = (lotId, ownerData, sharePercentage, userId, planId, callback) => {
  const Owner = require('./ownerModel');

  // 1. Find or create the owner
  ownerData.mobile = normalizeMobile(ownerData.mobile || ownerData.phone);

  Lot.createOrUpdateOwner(ownerData, userId, (ownerErr, ownerResult) => {
    if (ownerErr) return callback(ownerErr);

    const ownerId = ownerResult.insertId;

    // 2. Check if this owner is already assigned to the lot
    const checkSql = `
      SELECT id FROM lot_owners
      WHERE lot_id = ? AND owner_id = ? AND status = 'active'
    `;
    db.query(checkSql, [lotId, ownerId], (checkErr, existingRows) => {
      if (checkErr) return callback(checkErr);

      if (existingRows.length > 0) {
        // Owner already exists in this lot → update the share percentage
        const updateSql = `
          UPDATE lot_owners
          SET ownership_percentage = ?, updated_by = ?, updated_at = NOW()
          WHERE lot_id = ? AND owner_id = ?
        `;
        db.query(updateSql, [sharePercentage || ownerData.share_percentage || 100, userId, lotId, ownerId], callback);
      } else {
        // Owner not in lot → insert new record
        const insertSql = `
          INSERT INTO lot_owners
          (lot_id, owner_id, plan_id, ownership_percentage, status, created_by)
          VALUES (?, ?, ?, ?, 'active', ?)
        `;
        db.query(insertSql, [lotId, ownerId, planId, sharePercentage || ownerData.share_percentage || 100, userId], callback);
      }
    });
  });
};

// Remove owner from lot (WAMP server structure)
Lot.removeOwnerFromLot = (lotId, ownerId, callback) => {
  const sql = `DELETE FROM lot_owners WHERE lot_id = ? AND id = ?`;
  db.query(sql, [lotId, ownerId], callback);
};

// Get owners for a specific lot (normalized structure)
Lot.getOwnersById = (lotId, callback) => {
  console.log(`=== getOwnersById DEBUG START for lot ${lotId} ===`);

  // Updated query for normalized database structure
  // Join lot_owners (bridge) with owners table
  const sql = `
    SELECT
      o.id,
      o.name,
      o.nic,
      o.mobile as phone,
      o.address,
      lo.ownership_percentage as share_percentage,
      o.owner_type,
      lo.status,
      lo.id as lot_owner_id
    FROM lot_owners lo
    INNER JOIN owners o ON lo.owner_id = o.id
    WHERE lo.lot_id = ? AND lo.status = 'active' AND o.status = 'active'
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
    SET lot_no = ?, extent_ha = ?, extent_perch = ?, land_type = ?, status = ?,
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
    lotData.status || 'active',
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
        advance_tracing_no = ?,
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
    landDetails.advance_tracing_no || null,
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
        advance_tracing_no = ?,
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
    landDetails.advance_tracing_no || null,
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
    SELECT id, land_type, advance_tracing_no,
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
    if (lot.land_type || lot.advance_tracing_no || lot.advance_tracing_extent_ha || lot.advance_tracing_extent_perch ||
        lot.preliminary_plan_extent_ha || lot.preliminary_plan_extent_perch) {
      console.log('Returning land details for lot:', lot.id);
      callback(null, lot);
    } else {
      console.log('No land details found for lot:', lot.id);
      callback(null, null);
    }
  });
};

// Dashboard-specific methods for CE and PE viewing
Lot.getAllLotsWithProjectPlanInfo = (callback) => {
  const sql = `
    SELECT 
      l.*, 
      p.plan_identifier,
      p.description as plan_description,
      pr.name as project_name,
      pr.status as project_status,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      CONCAT(pe.first_name, ' ', pe.last_name) as project_engineer_name,
      (SELECT COUNT(*) FROM lot_owners lo WHERE lo.lot_id = l.id AND lo.status = 'active') as owners_count
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
    LEFT JOIN users pe ON pr.created_by = pe.id
    ORDER BY pr.name ASC, p.plan_identifier ASC, l.lot_no ASC
  `;
  db.query(sql, [], callback);
};

// Get lots for a specific Project Engineer (only their assigned projects)
Lot.getLotsForProjectEngineer = (projectEngineerId, callback) => {
  const sql = `
    SELECT 
      l.*, 
      p.plan_identifier,
      p.description as plan_description,
      pr.name as project_name,
      pr.status as project_status,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      (SELECT COUNT(*) FROM lot_owners lo WHERE lo.lot_id = l.id AND lo.status = 'active') as owners_count
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id
    LEFT JOIN projects pr ON p.project_id = pr.id
    LEFT JOIN users u ON l.created_by = u.id
    WHERE pr.created_by = ?
    ORDER BY pr.name ASC, p.plan_identifier ASC, l.lot_no ASC
  `;
  db.query(sql, [projectEngineerId], callback);
};

module.exports = Lot;
