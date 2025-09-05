const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken, requireChiefEngineer, requireProjectEngineer, requireAll } = require("../middleware/authMiddleware");

// Project Engineer routes
router.post("/create", verifyToken, requireProjectEngineer, projectController.createProject);
router.put("/update/:id", verifyToken, requireProjectEngineer, projectController.updateProject);

// Chief Engineer routes
router.get("/pending", verifyToken, requireChiefEngineer, projectController.getPendingProjects);
router.put("/approve/:id", verifyToken, requireChiefEngineer, projectController.approveProject);
router.put("/reject/:id", verifyToken, requireChiefEngineer, projectController.rejectProject);

// All authenticated users can view project details
router.get("/:id", verifyToken, requireAll, projectController.getProjectById);

module.exports = router;
