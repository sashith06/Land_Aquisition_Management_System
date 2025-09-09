const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken, requireChiefEngineer, requireProjectEngineer, requireAll, requireSystemAdmin, authorize } = require("../middleware/authMiddleware");

// ================= PROJECT CREATION & MANAGEMENT =================
// Project Engineer routes
router.post("/create", verifyToken, requireProjectEngineer, projectController.createProject);
router.put("/update/:id", verifyToken, requireProjectEngineer, projectController.updateProject);
router.delete("/delete/:id", verifyToken, requireProjectEngineer, projectController.deleteProject);
router.get("/my-projects", verifyToken, requireProjectEngineer, projectController.getMyProjects);
router.get("/user-projects", verifyToken, authorize('project_engineer', 'chief_engineer'), projectController.getMyProjects); // Alias for assignment page
router.get("/approved-for-assignment", verifyToken, requireProjectEngineer, projectController.getApprovedProjectsForAssignment); // Only approved projects for assignment

// ================= SYSTEM ADMIN APPROVAL (only admin@lams.gov.lk) =================
// System Admin routes  
router.get("/pending", verifyToken, requireSystemAdmin, projectController.getPendingProjects);
router.put("/approve/:id", verifyToken, requireSystemAdmin, projectController.approveProject);
router.put("/reject/:id", verifyToken, requireSystemAdmin, projectController.rejectProject);

// ================= GENERAL PROJECT ACCESS =================
// All authenticated users can view projects
router.get("/stats", verifyToken, requireAll, projectController.getProjectStats);
router.get("/approved", verifyToken, requireAll, projectController.getApprovedProjects);
router.get("/all", verifyToken, requireAll, projectController.getAllProjects);

// Role-based project access - get projects based on user role and permissions
router.get("/user/projects", verifyToken, requireAll, projectController.getProjectsForUser);

router.get("/:id", verifyToken, requireAll, projectController.getProjectById);


// Get advance tracing number for a project by projectId
const db = require('../config/db');
router.get('/:projectId/advance-tracing-number', (req, res) => {
	const { projectId } = req.params;
	const sql = 'SELECT advance_tracing_no FROM projects WHERE id = ?';
	db.query(sql, [projectId], (err, results) => {
		if (err) {
			return res.status(500).json({ error: 'Failed to fetch advance tracing number' });
		}
		if (!results.length) {
			return res.status(404).json({ error: 'Project not found' });
		}
		res.json({ advance_tracing_no: results[0].advance_tracing_no });
	});
});

module.exports = router;
