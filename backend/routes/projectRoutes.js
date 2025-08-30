const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// Project Engineer
router.post("/create", projectController.createProject);
router.put("/update/:id", projectController.updateProject);

// Chief Engineer
router.get("/pending", projectController.getPendingProjects);
router.get("/:id", projectController.getProjectById);
router.put("/approve/:id", projectController.approveProject);
router.put("/reject/:id", projectController.rejectProject);

module.exports = router;
