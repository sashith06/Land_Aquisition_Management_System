const Project = require("../models/projectModel");
const Notification = require("../models/notificationModel");

// ================= CREATE PROJECT =================
exports.createProject = (req, res) => {
  const userId = req.user.id; // From JWT middleware
  const { name, initial_estimated_cost, initial_extent_ha, initial_extent_perch,
          section_2_order, section_2_com, advance_tracing_no,
          compensation_type, notes, advance_tracing_date,
          section_5_no, section_5_no_date } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  Project.create({
    name,
    initial_estimated_cost,
    initial_extent_ha,
    initial_extent_perch,
    section_2_order,
    section_2_com,
    advance_tracing_no,
    compensation_type,
    notes,
    advance_tracing_date,
    section_5_no,
    section_5_no_date
  }, userId, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // Create notification for Chief Engineer (user ID 1)
    Notification.create({
      type: 'project_request',
      title: 'New Project Request',
      message: `Project "${name}" has been submitted for approval`,
      user_id: 1 // Chief Engineer user ID
    }, (notifErr) => {
      if (notifErr) console.log('Notification error:', notifErr);
    });

    res.json({ 
      message: "Project created and sent for approval", 
      projectId: result.insertId 
    });
  });
};

// ================= UPDATE PROJECT =================
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const requestData = req.body;
  const userId = req.user.id;

  // First check if project exists and user has permission to update
  Project.findById(id, (findErr, projectRows) => {
    if (findErr) return res.status(500).json({ error: findErr });
    if (projectRows.length === 0) return res.status(404).json({ error: "Project not found" });
    
    const project = projectRows[0];
    
    // Only allow project creator to update their own projects
    if (project.created_by !== userId) {
      return res.status(403).json({ error: "You can only update your own projects" });
    }

    // Only update fields that exist in the database
    const validFields = {
      name: requestData.name,
      description: requestData.description || requestData.notes, // Map notes to description
      initial_estimated_cost: requestData.initial_estimated_cost,
      start_date: requestData.start_date,
      expected_completion_date: requestData.expected_completion_date
    };

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(validFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Update the project
    Project.update(id, updateData, (err, result) => {
      if (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({ 
          error: "Failed to update project. Please try again." 
        });
      }
      res.json({ message: "Project updated successfully" });
    });
  });
};

// ================= GET PROJECTS =================
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  Project.findById(id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json(rows[0]);
  });
};

exports.getAllProjects = (req, res) => {
  Project.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

exports.getApprovedProjects = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // Use role-based access control instead of just getting all approved projects
  if (userRole === 'FO' || userRole === 'financial_officer') {
    // Financial officers only need approved projects
    Project.getApproved((err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  } else {
    // For other roles, use role-based filtering
    Project.getByUserRole(userId, userRole, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      // Filter to only approved projects
      const approvedProjects = rows.filter(project => project.status === 'approved');
      res.json(approvedProjects);
    });
  }
};

exports.getMyProjects = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // Use role-based access control
  Project.getByUserRole(userId, userRole, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// Get approved projects created by the current project engineer for assignment
exports.getApprovedProjectsForAssignment = (req, res) => {
  const userId = req.user.id;
  
  Project.getApprovedProjectsByCreator(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// New endpoint for role-based project access
exports.getProjectsForUser = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  Project.getByUserRole(userId, userRole, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Add user permissions to each project
    const projectsWithPermissions = rows.map(project => ({
      ...project,
      can_edit: (userRole === 'PE' || userRole === 'project_engineer') && project.created_by === userId,
      can_delete: (userRole === 'PE' || userRole === 'project_engineer') && project.created_by === userId,
      can_approve: userRole === 'CE' || userRole === 'chief_engineer',
      can_assign: userRole === 'CE' || userRole === 'chief_engineer',
      can_view_financials: userRole === 'FO' || userRole === 'financial_officer',
      can_create_plans: userRole === 'LO' || userRole === 'land_officer'
    }));
    
    res.json(projectsWithPermissions);
  });
};

exports.getProjectStats = (req, res) => {
  Project.getStats((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows[0]);
  });
};

// Get pending projects for system admin approval
exports.getPendingProjects = (req, res) => {
  Project.getPendingProjects((err, projects) => {
    if (err) {
      console.error('Error fetching pending projects:', err);
      return res.status(500).json({ error: 'Failed to fetch pending projects' });
    }
    res.json(projects);
  });
};

// ================= APPROVAL WORKFLOW =================
exports.approveProject = (req, res) => {
  const projectId = req.params.id;
  const approverId = req.user.id; // Chief Engineer ID from JWT

  // First get project details for notification
  Project.findById(projectId, (findErr, projectRows) => {
    if (findErr) {
      console.error('Error finding project:', findErr);
      return res.status(500).json({ error: findErr });
    }
    if (projectRows.length === 0) {
      console.error('Project not found:', projectId);
      return res.status(404).json({ error: "Project not found" });
    }
    
    const project = projectRows[0];
    
    Project.approve(projectId, approverId, (err) => {
      if (err) {
        console.error('Error approving project:', err);
        return res.status(500).json({ error: err });
      }

      // Create notification for project creator
      Notification.create({
        type: 'project_approved',
        title: 'Project Approved',
        message: `Your project "${project.name}" has been approved`,
        user_id: project.created_by
      }, (notifErr) => {
        if (notifErr) console.log('Notification error:', notifErr);
      });

      res.json({ message: "Project approved successfully" });
    });
  });
};

exports.rejectProject = (req, res) => {
  const projectId = req.params.id;
  const rejecterId = req.user.id; // Chief Engineer ID from JWT
  const { rejection_reason } = req.body;

  if (!rejection_reason) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  // First get project details for notification
  Project.findById(projectId, (findErr, projectRows) => {
    if (findErr) return res.status(500).json({ error: findErr });
    if (projectRows.length === 0) return res.status(404).json({ error: "Project not found" });
    
    const project = projectRows[0];

    Project.reject(projectId, rejecterId, rejection_reason, (err) => {
      if (err) return res.status(500).json({ error: err });

      // Create notification for project creator
      Notification.create({
        type: 'project_rejected',
        title: 'Project Rejected',
        message: `Your project "${project.name}" has been rejected. Reason: ${rejection_reason}`,
        user_id: project.created_by
      }, (notifErr) => {
        if (notifErr) console.log('Notification error:', notifErr);
      });

      res.json({ message: "Project rejected successfully" });
    });
  });
};

// ================= DELETE PROJECT =================
exports.deleteProject = (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  console.log(`Delete request for project ${projectId} by user ${userId}`);

  // First check if project exists and user has permission to delete
  Project.findById(projectId, (findErr, projectRows) => {
    if (findErr) {
      console.error('Error finding project:', findErr);
      return res.status(500).json({ error: "Database error while finding project" });
    }
    
    if (projectRows.length === 0) {
      console.log(`Project ${projectId} not found`);
      return res.status(404).json({ error: "Project not found" });
    }
    
    const project = projectRows[0];
    console.log(`Found project: ${project.name}, created by: ${project.created_by}`);
    
    // Only allow project creator to delete their own projects
    if (project.created_by !== userId) {
      console.log(`Permission denied: User ${userId} trying to delete project created by ${project.created_by}`);
      return res.status(403).json({ error: "You can only delete your own projects" });
    }

    console.log(`Attempting to delete project ${projectId}...`);

    // Delete the project and all related records
    Project.delete(projectId, (err, result) => {
      if (err) {
        console.error('Error deleting project:', err);
        
        // Provide more specific error messages
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          return res.status(400).json({ 
            error: "Cannot delete project because it has related records. Please contact system administrator." 
          });
        }
        
        if (err.message === 'Project not found') {
          return res.status(404).json({ error: "Project not found" });
        }
        
        return res.status(500).json({ 
          error: "Failed to delete project. Please try again or contact support.",
          details: err.message 
        });
      }
      
      console.log(`Project ${projectId} deleted successfully`);
      res.json({ message: "Project and all related data deleted successfully" });
    });
  });
};
