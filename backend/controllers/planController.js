const Plan = require("../models/planModel");
const AssignmentModel = require("../models/assignmentModel");
const jwt = require('jsonwebtoken');
const progressService = require('../services/progressService');

// Create a new plan - Land Officers only for assigned projects
exports.createPlan = async (req, res) => {
  try {
    const {
      project_id,
      plan_no,
      description,
      estimated_cost,
      estimated_extent,
      advance_tracing_no,
      divisional_secretary,
      current_extent_value,
      section_07_gazette_no,
      section_07_gazette_date,
      section_38_gazette_no,
      section_38_gazette_date,
      section_5_gazette_no,
      pending_cost_estimate
    } = req.body;
    
    // Get the current user from the token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    // Verify that the current user is a land officer
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can create plans' });
    }
    
    // Check if the land officer is assigned to this project
    const canEdit = await AssignmentModel.canEditProject(userId, project_id);
    if (!canEdit) {
      return res.status(403).json({ error: 'You are not assigned to this project' });
    }

    if (!project_id || !plan_no) {
      return res.status(400).json({ error: "Project ID and Plan Identifier are required" });
    }

    // Map frontend fields to actual database columns - save ALL form data
    const planData = {
      project_id: project_id,
      plan_identifier: plan_no,  // Use single identifier field
      description: description || null,
      location: divisional_secretary || null,
      total_extent: null,  // Fixed: Don't use estimated_extent for total_extent
      estimated_cost: estimated_cost ? parseFloat(estimated_cost) : null,
      estimated_extent: estimated_extent || null,
      advance_tracing_no: advance_tracing_no || null,
      divisional_secretary: divisional_secretary || null,
      current_extent_value: current_extent_value ? parseFloat(current_extent_value) : null,
      section_07_gazette_no: section_07_gazette_no || null,
      section_07_gazette_date: section_07_gazette_date || null,
      section_38_gazette_no: section_38_gazette_no || null,
      section_38_gazette_date: section_38_gazette_date || null,
      section_5_gazette_no: section_5_gazette_no || null,
      pending_cost_estimate: pending_cost_estimate ? parseFloat(pending_cost_estimate) : null,
      status: 'pending'
    };

    Plan.create(planData, userId, (err, result) => {
      if (err) {
        console.error('Error creating plan:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Plan with this Plan Identifier already exists in this project' });
        }
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          console.error('Database field error - likely missing columns from migration');
          return res.status(500).json({ error: 'Database schema error - missing required columns' });
        }
        return res.status(500).json({ error: 'Failed to create plan' });
      }
      
      res.json({ message: "Plan created successfully", planId: result.insertId });
    });
  } catch (error) {
    console.error('Error in createPlan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all plans for current user based on role
exports.getPlansForUser = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const userRole = decoded.role;
    
    Plan.getByUserRole(userId, userRole, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Add role-based permissions to each plan
      const plansWithPermissions = rows.map(plan => ({
        ...plan,
        can_edit: (userRole === 'LO' || userRole === 'land_officer') && plan.created_by === userId,
        can_delete: (userRole === 'LO' || userRole === 'land_officer') && plan.created_by === userId,
        can_create_lots: userRole === 'LO' || userRole === 'land_officer',
        can_view_financials: userRole === 'FO' || userRole === 'financial_officer',
        can_add_valuation: userRole === 'FO' || userRole === 'financial_officer',
        can_add_compensation: userRole === 'FO' || userRole === 'financial_officer',
        can_view_all: true
      }));
      
      res.json(plansWithPermissions);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all plans under a project with role-based permissions
exports.getPlansByProject = async (req, res) => {
  const { project_id } = req.params;
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Debug logging
  console.log('=== DEBUG: getPlansByProject ===');
  console.log('Project ID:', project_id);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userRole = decoded.role;
    const userId = decoded.id;
    
    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    
    // Use role-based access control
    Plan.getByProjectWithRole(project_id, userId, userRole, async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Raw database results:', rows);
      console.log('Number of plans found:', rows.length);
      
      try {
        // Add role-based permissions and progress to each plan
        const plansWithPermissionsAndProgress = await Promise.all(rows.map(async (plan) => {
          const basePermissions = {
            ...plan,
            can_edit: false,
            can_delete: false,
            can_add_valuation: false,
            can_add_compensation: false,
            can_view_all: true
          };

          // Set permissions based on user role
          if (userRole === 'land_officer' || userRole === 'LO') {
            basePermissions.can_edit = plan.created_by === userId;
            basePermissions.can_delete = plan.created_by === userId;
          } else if (userRole === 'financial_officer' || userRole === 'FO') {
            basePermissions.can_add_valuation = true;
            basePermissions.can_add_compensation = true;
          } else if (userRole === 'project_engineer' || userRole === 'PE') {
            // Project engineers can view all plans but not edit
            basePermissions.can_view_details = true;
          } else if (userRole === 'chief_engineer' || userRole === 'CE') {
            // Chief engineers have full view access
            basePermissions.can_view_details = true;
            basePermissions.can_approve = true;
          }

          // Calculate progress for this plan
          try {
            console.log(`=== Calculating progress for plan ${plan.id} ===`);
            const planProgress = await progressService.getPlanProgress(plan.id);
            console.log(`Plan ${plan.id} progress breakdown:`, {
              creation_progress: planProgress.creation_progress,
              lot_average_progress: planProgress.lot_average_progress,
              overall_percent: planProgress.overall_percent,
              total_lots: planProgress.lots?.length || 0
            });
            basePermissions.progress = planProgress.overall_percent || 0;
            console.log(`Plan ${plan.id} final progress: ${basePermissions.progress}%`);
          } catch (progressErr) {
            console.error(`Error calculating progress for plan ${plan.id}:`, progressErr);
            basePermissions.progress = 0; // Default to 0 if progress calculation fails
          }

          return basePermissions;
        }));
        
        console.log('Final plans with permissions and progress:', plansWithPermissionsAndProgress);
        console.log('=== END DEBUG ===');
        
        res.json(plansWithPermissionsAndProgress);
      } catch (progressError) {
        console.error('Error calculating plan progress:', progressError);
        return res.status(500).json({ error: 'Failed to calculate plan progress' });
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get single plan
exports.getPlanById = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid plan ID' });
  }

  Plan.findById(id, (err, rows) => {
    if (err) {
      console.error('Error fetching plan:', err);
      return res.status(500).json({ error: 'Failed to fetch plan details' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const plan = rows[0];

    // Add some computed fields for frontend compatibility
    plan.plan_no = plan.plan_identifier; // Map database field to frontend expectation

    res.json(plan);
  });
};

// Get plans created by current user (for Land Officers)
exports.getMyPlans = async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    Plan.getByCreator(userId, async (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      
      // Import progress service to get real-time progress
      const progressService = require('../services/progressService');
      
      // Add progress data and permissions for each plan
      const plansWithProgress = await Promise.all(rows.map(async (plan) => {
        try {
          // Get real-time progress for this plan
          const progressData = await progressService.getPlanProgress(plan.id);
          
          return {
            ...plan,
            can_edit: true,
            can_delete: true,
            is_own_plan: true,
            progress: Math.round(progressData.overall_percent || 0) // Round to integer for display
          };
        } catch (progressErr) {
          console.error(`Error calculating progress for plan ${plan.id}:`, progressErr);
          // Return plan without progress if calculation fails
          return {
            ...plan,
            can_edit: true,
            can_delete: true,
            is_own_plan: true,
            progress: 0
          };
        }
      }));
      
      res.json(plansWithProgress);
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all plans for assigned projects (for Land Officers - read-only for others' plans)
exports.getAllViewablePlans = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    const userRole = decoded.role;
    
    if (userRole === 'land_officer') {
      // Get all plans for projects assigned to this land officer
      Plan.getAllPlansForAssignedProjects(userId, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        
        // Add permissions based on ownership
        const plansWithPermissions = rows.map(plan => ({
          ...plan,
          can_edit: plan.created_by === userId,
          can_delete: plan.created_by === userId,
          is_own_plan: plan.created_by === userId
        }));
        
        res.json(plansWithPermissions);
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};// Update plan - Only creators can edit their own plans
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    
    console.log('=== UPDATE PLAN DEBUG START ===');
    console.log('Plan ID:', id);
    console.log('Received planData:', JSON.stringify(planData, null, 2));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    console.log('User ID:', userId);
    console.log('User role:', decoded.role);
    
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can update plans' });
    }

    // Check if the plan exists and belongs to the current user
    Plan.findById(id, (findErr, planRows) => {
      if (findErr) {
        return res.status(500).json({ error: 'Error checking plan ownership' });
      }
      
      if (planRows.length === 0) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      
      if (planRows[0].created_by !== userId) {
        return res.status(403).json({ error: 'You can only update plans you created' });
      }

      // Map plan_no to plan_identifier for database compatibility
      if (planData.plan_no) {
        planData.plan_identifier = planData.plan_no;
        delete planData.plan_no;
      }
      
      Plan.update(id, planData, userId, (err, result) => {
        console.log('Plan.update called with:', { id, planData, userId });
        
        if (err) {
          console.error('Error updating plan:', err);
          console.log('=== UPDATE PLAN DEBUG END (ERROR) ===');
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Plan with this Plan Identifier already exists in this project' });
          }
          return res.status(500).json({ error: 'Failed to update plan' });
        }
        
        console.log('Plan update result:', result);
        
        if (result.affectedRows === 0) {
          console.log('No rows affected - plan not found or no permission');
          console.log('=== UPDATE PLAN DEBUG END (NO ROWS) ===');
          return res.status(404).json({ error: 'Plan not found or you do not have permission to update it' });
        }
        
        console.log('Plan updated successfully');
        console.log('=== UPDATE PLAN DEBUG END (SUCCESS) ===');
        res.json({ message: "Plan updated successfully" });
      });
    });
  } catch (error) {
    console.error('Error in updatePlan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete plan
exports.deletePlan = async (req, res) => {
  try {
    console.log('=== DELETE PLAN DEBUG ===');
    const { id } = req.params;
    console.log('Plan ID to delete:', id);
    
    // The middleware has already verified the token and role
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log('User ID from middleware:', userId, 'Role:', userRole);

    console.log('Calling Plan.delete with:', { id, userId });
    Plan.delete(id, userId, (err, result) => {
      console.log('Plan.delete callback - err:', err, 'result:', result);
      if (err) {
        console.error('Error deleting plan:', err);
        return res.status(500).json({ error: 'Failed to delete plan' });
      }
      
      console.log('Delete result affectedRows:', result?.affectedRows);
      if (result.affectedRows === 0) {
        console.log('No rows affected - plan not found or no permission');
        return res.status(404).json({ error: 'Plan not found or you do not have permission to delete it' });
      }
      
      console.log('Plan deleted successfully');
      res.json({ message: "Plan deleted successfully" });
    });
  } catch (error) {
    console.error('Error in deletePlan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get assigned projects for current land officer
exports.getAssignedProjects = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userId = decoded.id;
    
    if (decoded.role !== 'land_officer') {
      return res.status(403).json({ error: 'Only land officers can access this endpoint' });
    }
    
    const projects = await AssignmentModel.getAssignedProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error getting assigned projects:', error);
    res.status(500).json({ error: 'Failed to get assigned projects' });
  }
};

// Update plan status - for workflow progression
exports.updatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const userRole = decoded.role;
    
    // Define allowed status transitions by role
    const allowedStatusByRole = {
      'land_officer': ['created'],
      'financial_officer': ['valuation_pending', 'valuation_completed', 'compensation_pending', 'compensation_completed'],
      'project_engineer': ['completed'],
      'chief_engineer': ['completed']
    };
    
    if (!allowedStatusByRole[userRole] || !allowedStatusByRole[userRole].includes(status)) {
      return res.status(403).json({ error: 'You are not authorized to set this status' });
    }
    
    Plan.updateStatus(id, status, (err, result) => {
      if (err) {
        console.error('Error updating plan status:', err);
        return res.status(500).json({ error: 'Failed to update plan status' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      
      res.json({ message: "Plan status updated successfully" });
    });
  } catch (error) {
    console.error('Error in updatePlanStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dashboard endpoints for CE and PE
// Get all plans with project info for Chief Engineer
exports.getAllPlansWithProjectInfo = (req, res) => {
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
    
    Plan.getAllPlansWithProjectInfo((err, plans) => {
      if (err) {
        console.error('Error fetching all plans:', err);
        return res.status(500).json({ error: 'Failed to fetch plans' });
      }
      res.json(plans);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get plans for Project Engineer (only their projects)
exports.getPlansForProjectEngineer = (req, res) => {
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
    
    Plan.getPlansForProjectEngineer(userId, (err, plans) => {
      if (err) {
        console.error('Error fetching PE plans:', err);
        return res.status(500).json({ error: 'Failed to fetch plans' });
      }
      res.json(plans);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
