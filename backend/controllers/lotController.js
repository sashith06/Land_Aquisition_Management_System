const jwt = require('jsonwebtoken');
const Lot = require('../models/lotModel');
const db = require('../config/db');

// Get advance tracing numbers for dropdown
exports.getAdvanceTracingNumbers = (req, res) => {
  Lot.getAdvanceTracingNumbers((err, rows) => {
    if (err) {
      console.error('Error fetching advance tracing numbers:', err);
      return res.status(500).json({ error: 'Failed to fetch advance tracing numbers' });
    }
    const numbers = rows.map(row => row.advance_trading_no);
    res.json(numbers);
  });
};

// Get lot land details
exports.getLandDetails = (req, res) => {
  const { id } = req.params;
  
  console.log('getLandDetails controller called with id:', id);
  
  Lot.getLandDetailsById(id, (err, landDetails) => {
    if (err) {
      console.error('Controller error fetching land details:', err);
      return res.status(500).json({ error: 'Failed to fetch land details' });
    }
    
    console.log('Controller getLandDetails result:', landDetails);
    
    if (!landDetails) {
      console.log('No land details found, returning 404');
      return res.status(404).json({ error: 'Land details not found' });
    }
    
    console.log('Returning land details:', landDetails);
    res.json(landDetails);
  });
};

// Save/Create lot land details
exports.saveLandDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      land_type, 
      advance_tracing_no,
      advance_tracing_extent_ha, 
      advance_tracing_extent_perch,
      preliminary_plan_extent_ha, 
      preliminary_plan_extent_perch 
    } = req.body;
    
    console.log('saveLandDetails called with:', {
      id,
      body: req.body,
      headers: req.headers.authorization ? 'Present' : 'Missing'
    });
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error('No token provided in saveLandDetails');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    console.log('User decoded successfully:', { userId, role: decoded.role });

    const landDetails = {
      land_type,
      advance_tracing_no: advance_tracing_no || null,
      advance_tracing_extent_ha: advance_tracing_extent_ha || null,
      advance_tracing_extent_perch: advance_tracing_extent_perch || null,
      preliminary_plan_extent_ha: preliminary_plan_extent_ha || null,
      preliminary_plan_extent_perch: preliminary_plan_extent_perch || null,
      created_by: userId
    };

    console.log('Saving lot land details:', { id, landDetails });

    Lot.saveLandDetails(id, landDetails, (err, result) => {
      if (err) {
        console.error('Database error saving lot land details:', err);
        return res.status(500).json({ error: 'Failed to save lot land details', details: err.message });
      }
      
      console.log('Land details saved successfully:', result);
      res.status(201).json({ 
        message: 'Lot land details saved successfully',
        id: parseInt(id),
        landDetails
      });
    });
    
  } catch (error) {
    console.error('Error in saveLandDetails:', error);
    res.status(500).json({ error: 'Failed to save lot land details', details: error.message });
  }
};

// Update lot land details
exports.updateLotLandDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      land_type, 
      advance_tracing_no,
      advance_tracing_extent_ha, 
      advance_tracing_extent_perch,
      preliminary_plan_extent_ha, 
      preliminary_plan_extent_perch 
    } = req.body;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    if (!['land_officer', 'project_engineer', 'chief_engineer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const landDetails = {
      land_type,
      advance_tracing_no: advance_tracing_no || null,
      advance_tracing_extent_ha: advance_tracing_extent_ha || null,
      advance_tracing_extent_perch: advance_tracing_extent_perch || null,
      preliminary_plan_extent_ha: preliminary_plan_extent_ha || null,
      preliminary_plan_extent_perch: preliminary_plan_extent_perch || null,
      updated_by: userId
    };

    console.log('Updating lot land details:', { id, landDetails });

    Lot.updateLandDetails(id, landDetails, (err, result) => {
      if (err) {
        console.error('Error updating lot land details:', err);
        return res.status(500).json({ error: 'Failed to update lot land details' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lot not found' });
      }
      
      res.json({ 
        message: 'Lot land details updated successfully',
        id: parseInt(id)
      });
    });
    
  } catch (error) {
    console.error('Error in updateLotLandDetails:', error);
    res.status(500).json({ error: 'Failed to update lot land details' });
  }
};

// Create new lot
exports.createLot = async (req, res) => {
  try {
    const { plan_id, lot_number, lot_no, extent_ha, extent_perch, land_type, status, owners } = req.body;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can create lots' });
    }

    const lotData = {
      plan_id,
      lot_no: lot_number || lot_no, // Accept either field name
      extent_ha: extent_ha || 0,
      extent_perch: extent_perch || 0,
      land_type: land_type || 'Private',
      status: status || 'active',
      created_by: userId
    };



    Lot.create(lotData, (err, result) => {
      if (err) {
        console.error('Error creating lot:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Lot number already exists for this plan' });
        }
        return res.status(500).json({ error: 'Failed to create lot' });
      }
      
      const lotId = result.insertId;
      
      // If owners are provided, add them to the lot
      if (owners && Array.isArray(owners) && owners.length > 0) {
        // Check for duplicate NICs in the owners array
        const nicSet = new Set();
        const duplicateNICs = [];
        
        owners.forEach((ownerData, index) => {
          if (ownerData.nic && ownerData.nic.trim()) {
            const nic = ownerData.nic.trim().toLowerCase();
            if (nicSet.has(nic)) {
              duplicateNICs.push(nic);
            } else {
              nicSet.add(nic);
            }
          }
        });
        
        if (duplicateNICs.length > 0) {
          return res.status(400).json({ 
            error: 'Duplicate owners detected. One lot cannot have the same owner twice. Please check NIC numbers: ' + duplicateNICs.join(', ')
          });
        }
        
        let processedOwners = 0;
        const totalOwners = owners.length;
        let hasError = false;
        
        console.log(`Processing ${totalOwners} owners for lot ${lotId}`);
        
        owners.forEach((ownerData, index) => {
          console.log(`Processing owner ${index + 1}:`, ownerData);
          
          // Add owner to lot using normalized structure (owners + lot_owners bridge)
          // We need to pass plan_id and user_id for the foreign key constraints
          Lot.addOwnerToLot(lotId, ownerData, ownerData.share_percentage, userId, plan_id, (ownerErr, result) => {
            if (ownerErr && !hasError) {
              hasError = true;
              console.error('Error adding owner to lot:', ownerErr);
              return res.status(500).json({ error: 'Failed to add owner to lot' });
            }
            
            if (!hasError) {
              console.log(`Owner ${index + 1} added successfully:`, result);
              processedOwners++;
              
              if (processedOwners === totalOwners && !hasError) {
                console.log(`All ${totalOwners} owners processed successfully`);
                res.status(201).json({ 
                  message: 'Lot created successfully with owners',
                  id: lotId,
                  lotId,
                  ownersAdded: totalOwners
                });
              }
            }
          });
        });
      } else {
        // No owners provided, return success for lot creation only
        res.status(201).json({ 
          message: 'Lot created successfully',
          id: lotId,
          lotId
        });
      }
    });
  } catch (error) {
    console.error('Error in createLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get lots for a plan (original method) - now with owners
exports.getLotsByPlan = (req, res) => {
  const { planId } = req.params;
  
  Lot.getByPlanIdWithOwners(planId, (err, lots) => {
    if (err) {
      console.error('Error fetching lots:', err);
      return res.status(500).json({ error: 'Failed to fetch lots' });
    }
    
    // Sort by lot_no
    lots.sort((a, b) => {
      const numA = parseInt(a.lot_no) || 0;
      const numB = parseInt(b.lot_no) || 0;
      return numA - numB;
    });
    
    res.json(lots);
  });
};

// Get lots for a plan with role-based access control - with owners
exports.getLotsByPlanWithRole = async (req, res) => {
  try {
    const { planId } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const userRole = decoded.role;
    
    console.log('getLotsByPlanWithRole:', { planId, userId, userRole });
    
    Lot.getByPlanIdWithRoleAndOwners(planId, userId, userRole, (err, lots) => {
      if (err) {
        console.error('Error fetching lots with role:', err);
        return res.status(500).json({ error: 'Failed to fetch lots' });
      }
      
      // Sort by lot_no
      lots.sort((a, b) => {
        const numA = parseInt(a.lot_no) || 0;
        const numB = parseInt(b.lot_no) || 0;
        return numA - numB;
      });
      
      res.json(lots);
    });
  } catch (error) {
    console.error('Error in getLotsByPlanWithRole:', error);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
};

// Get all lots accessible to the current user based on their role - with owners
exports.getLotsForUser = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const userRole = decoded.role;
    
    console.log('getLotsForUser:', { userId, userRole });
    
    Lot.getByUserRoleWithOwners(userId, userRole, (err, lots) => {
      if (err) {
        console.error('Error fetching lots for user:', err);
        return res.status(500).json({ error: 'Failed to fetch lots' });
      }
      
      // Sort by project_name, then plan_name, then lot_no
      lots.sort((a, b) => {
        if (a.project_name !== b.project_name) {
          return a.project_name.localeCompare(b.project_name);
        }
        if (a.plan_name !== b.plan_name) {
          return a.plan_name.localeCompare(b.plan_name);
        }
        const numA = parseInt(a.lot_no) || 0;
        const numB = parseInt(b.lot_no) || 0;
        return numA - numB;
      });
      
      res.json(lots);
    });
  } catch (error) {
    console.error('Error in getLotsForUser:', error);
    res.status(500).json({ error: 'Failed to fetch lots' });
  }
};

// Get single lot - now with owners
exports.getLotById = (req, res) => {
  const { id } = req.params;
  
  Lot.findByIdWithOwners(id, (err, lots) => {
    if (err) {
      console.error('Error fetching lot:', err);
      return res.status(500).json({ error: 'Failed to fetch lot' });
    }
    
    if (lots.length === 0) {
      return res.status(404).json({ error: 'Lot not found' });
    }
    
    const lot = lots[0];
    res.json(lot);
  });
};

// Update lot
exports.updateLot = async (req, res) => {
  try {
    const { id } = req.params;
    const { lot_number, lot_no, extent_ha, extent_perch, land_type, status, owners } = req.body;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can update lots' });
    }

    const lotData = {
      lot_no: lot_number || lot_no, // Accept either field name
      extent_ha: extent_ha || 0,
      extent_perch: extent_perch || 0,
      land_type: land_type || 'Private',
      status: status || 'active',
      updated_by: decoded.id
    };

    // First update the basic lot information
    Lot.update(id, lotData, (err, result) => {
      if (err) {
        console.error('Error updating lot:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Lot number already exists for this plan' });
        }
        return res.status(500).json({ error: 'Failed to update lot' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lot not found' });
      }

      // If owners are provided, handle owner updates
      if (owners && Array.isArray(owners) && owners.length >= 0) {
        // Check for duplicate NICs in the owners array
        if (owners.length > 0) {
          const nicSet = new Set();
          const duplicateNICs = [];
          
          owners.forEach((ownerData, index) => {
            if (ownerData.nic && ownerData.nic.trim()) {
              const nic = ownerData.nic.trim().toLowerCase();
              if (nicSet.has(nic)) {
                duplicateNICs.push(nic);
              } else {
                nicSet.add(nic);
              }
            }
          });
          
          if (duplicateNICs.length > 0) {
            return res.status(400).json({ 
              error: 'Duplicate owners detected. One lot cannot have the same owner twice. Please check NIC numbers: ' + duplicateNICs.join(', ')
            });
          }
        }
        
        // Get the plan_id for this lot
        const getLotSql = `SELECT plan_id FROM lots WHERE id = ?`;
        db.query(getLotSql, [id], (getLotErr, lotResults) => {
          if (getLotErr) {
            console.error('Error finding lot for owner update:', getLotErr);
            return res.status(500).json({ error: 'Failed to update lot owners' });
          }
          
          if (lotResults.length === 0) {
            return res.status(404).json({ error: 'Lot not found' });
          }
          
          const planId = lotResults[0].plan_id;
          
          // Get current owners for this lot
          Lot.getOwnersById(id, (getOwnersErr, currentOwners) => {
            if (getOwnersErr) {
              console.error('Error getting current owners:', getOwnersErr);
              return res.status(500).json({ error: 'Failed to update lot owners' });
            }

            // Process owner updates
            let operationsCompleted = 0;
            const totalOperations = owners.length + currentOwners.length; // Add new + potentially remove old
            let hasError = false;

            // Add/update new owners
            if (owners.length > 0) {
              owners.forEach((ownerData, index) => {
                console.log(`Processing owner ${index + 1}/${owners.length}:`, ownerData);
                
                // Check if this owner already exists (by NIC)
                const existingOwner = currentOwners.find(co => co.nic === ownerData.nic);
                
                if (existingOwner) {
                  // Owner exists, update their information
                  console.log(`Updating existing owner:`, existingOwner);
                  // For now, we'll just ensure they're still linked (the addOwnerToLot handles updates)
                  Lot.addOwnerToLot(id, ownerData, ownerData.share_percentage, decoded.id, planId, (updateErr, result) => {
                    if (updateErr && !hasError) {
                      hasError = true;
                      console.error('Error updating owner:', updateErr);
                      return res.status(500).json({ error: 'Failed to update lot owners' });
                    }
                    
                    operationsCompleted++;
                    if (operationsCompleted >= totalOperations && !hasError) {
                      console.log('All owner operations completed successfully');
                      res.json({ message: 'Lot updated successfully with owners' });
                    }
                  });
                } else {
                  // New owner, add them
                  console.log(`Adding new owner:`, ownerData);
                  Lot.addOwnerToLot(id, ownerData, ownerData.share_percentage, decoded.id, planId, (addErr, result) => {
                    if (addErr && !hasError) {
                      hasError = true;
                      console.error('Error adding new owner:', addErr);
                      return res.status(500).json({ error: 'Failed to update lot owners' });
                    }
                    
                    operationsCompleted++;
                    if (operationsCompleted >= totalOperations && !hasError) {
                      console.log('All owner operations completed successfully');
                      res.json({ message: 'Lot updated successfully with owners' });
                    }
                  });
                }
              });
            }

            // Remove owners that are no longer in the list
            currentOwners.forEach((currentOwner) => {
              const stillExists = owners.some(no => no.nic === currentOwner.nic);
              
              if (!stillExists) {
                console.log(`Removing owner no longer in list:`, currentOwner);
                // Remove from lot_owners table
                const removeSql = `DELETE FROM lot_owners WHERE lot_id = ? AND owner_id = ?`;
                db.query(removeSql, [id, currentOwner.id], (removeErr, removeResult) => {
                  if (removeErr && !hasError) {
                    hasError = true;
                    console.error('Error removing owner:', removeErr);
                    return res.status(500).json({ error: 'Failed to update lot owners' });
                  }
                  
                  operationsCompleted++;
                  if (operationsCompleted >= totalOperations && !hasError) {
                    console.log('All owner operations completed successfully');
                    res.json({ message: 'Lot updated successfully with owners' });
                  }
                });
              } else {
                operationsCompleted++; // Count this as completed since no action needed
              }
            });

            // If no owners to process, return success immediately
            if (totalOperations === 0) {
              res.json({ message: 'Lot updated successfully' });
            }
          });
        });
      } else {
        // No owners provided, just return success for lot update
        res.json({ message: 'Lot updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error in updateLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete lot
exports.deleteLot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can delete lots' });
    }

    Lot.delete(id, (err, result) => {
      if (err) {
        console.error('Error deleting lot:', err);
        return res.status(500).json({ error: 'Failed to delete lot' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lot not found' });
      }
      
      res.json({ message: 'Lot deleted successfully' });
    });
  } catch (error) {
    console.error('Error in deleteLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add owner to existing lot
exports.addOwnerToLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { nic, name, address, phone, mobile, email, share_percentage } = req.body;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    if (!['land_officer', 'chief_engineer', 'project_engineer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to add owners' });
    }
    
    // First get the lot to find the plan_id
    const getLotSql = `SELECT plan_id FROM lots WHERE id = ?`;
    db.query(getLotSql, [lotId], (getLotErr, lotResults) => {
      if (getLotErr) {
        console.error('Error finding lot:', getLotErr);
        return res.status(500).json({ error: 'Failed to find lot' });
      }
      
      if (lotResults.length === 0) {
        return res.status(404).json({ error: 'Lot not found' });
      }
      
      const planId = lotResults[0].plan_id;
      
      const ownerData = { 
        nic, 
        name, 
        address, 
        phone: phone || mobile, // Accept either field name
        email 
      };
      
      // Add owner to lot using normalized structure (owners + lot_owners bridge)
      Lot.addOwnerToLot(lotId, ownerData, share_percentage, decoded.id, planId, (err, result) => {
        if (err) {
          console.error('Error adding owner to lot:', err);
          return res.status(500).json({ error: 'Failed to add owner to lot' });
        }
        
        res.json({ message: 'Owner added to lot successfully' });
      });
    });
  } catch (error) {
    console.error('Error in addOwnerToLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove owner from lot
exports.removeOwnerFromLot = async (req, res) => {
  try {
    const { lotId, ownerId } = req.params;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    if (!['land_officer', 'chief_engineer', 'project_engineer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to remove owners' });
    }
    
    // Remove owner association from lot_owners bridge table
    const sql = `DELETE FROM lot_owners WHERE lot_id = ? AND id = ?`;
    db.query(sql, [lotId, ownerId], (err, result) => {
      if (err) {
        console.error('Error removing owner from lot:', err);
        return res.status(500).json({ error: 'Failed to remove owner from lot' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Owner-lot relationship not found' });
      }
      
      res.json({ message: 'Owner removed from lot successfully' });
    });
  } catch (error) {
    console.error('Error in removeOwnerFromLot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all owners (for dropdown/search purposes) - from owners table (normalized structure)
exports.getAllOwners = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    if (!['land_officer', 'chief_engineer', 'project_engineer', 'financial_officer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to view owners' });
    }

    // Get owners from owners table (normalized structure)
    const sql = `
      SELECT id, name, nic, mobile as phone, address, owner_type
      FROM owners
      WHERE status = 'active'
      ORDER BY name ASC
    `;
    db.query(sql, (err, owners) => {
      if (err) {
        console.error('Error fetching owners:', err);
        return res.status(500).json({ error: 'Failed to fetch owners' });
      }

      res.json(owners);
    });
  } catch (error) {
    console.error('Error in getAllOwners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dashboard endpoints for CE and PE
// Get all lots with project/plan info for Chief Engineer
exports.getAllLotsWithProjectPlanInfo = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userRole = decoded.role;
    
    // Only CE can access this endpoint
    if (userRole !== 'CE' && userRole !== 'chief_engineer') {
      return res.status(403).json({ error: 'Access denied. Chief Engineer only.' });
    }
    
    Lot.getAllLotsWithProjectPlanInfo((err, lots) => {
      if (err) {
        console.error('Error fetching all lots:', err);
        return res.status(500).json({ error: 'Failed to fetch lots' });
      }
      res.json(lots);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get lots for Project Engineer (only their projects)
exports.getLotsForProjectEngineer = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const userRole = decoded.role;
    
    // Only PE can access this endpoint
    if (userRole !== 'PE' && userRole !== 'project_engineer') {
      return res.status(403).json({ error: 'Access denied. Project Engineer only.' });
    }
    
    Lot.getLotsForProjectEngineer(userId, (err, lots) => {
      if (err) {
        console.error('Error fetching PE lots:', err);
        return res.status(500).json({ error: 'Failed to fetch lots' });
      }
      res.json(lots);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
