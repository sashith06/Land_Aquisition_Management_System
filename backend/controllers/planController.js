const Plan = require("../models/planModel");

// Create a new plan
exports.createPlan = (req, res) => {
  const {
    project_id,
    plan_no,
    description,
    estimated_cost,
    created_by,
    section_38_gno,
    section_38_gdate,
    section_5_gno,
    section_5_gdate,
    section_7_gno,
    section_7_gdate
  } = req.body;

  if (!project_id || !plan_no || !created_by) {
    return res.status(400).json({ error: "Project ID, Plan number, and Created_by are required" });
  }

  Plan.create({
    project_id,
    plan_no,
    description,
    estimated_cost,
    created_by,
    section_38_gno,
    section_38_gdate,
    section_5_gno,
    section_5_gdate,
    section_7_gno,
    section_7_gdate
  }, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Plan created successfully", planId: result.insertId });
  });
};

// Get all plans under a project
exports.getPlansByProject = (req, res) => {
  const { project_id } = req.params;

  Plan.getByProject(project_id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// Get single plan
exports.getPlanById = (req, res) => {
  const { id } = req.params;

  Plan.findById(id, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    res.json(rows[0]);
  });
};
