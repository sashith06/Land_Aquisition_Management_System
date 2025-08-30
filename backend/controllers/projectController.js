const Project = require("../models/projectModel");

// ================= CREATE PROJECT =================
exports.createProject = (req, res) => {
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
  }, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Project created and sent for approval", projectId: result.insertId });
  });
};

// ================= UPDATE PROJECT =================
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const projectData = req.body;

  Project.update(id, projectData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Project updated successfully" });
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

exports.getPendingProjects = (req, res) => {
  Project.getPending((err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};

// ================= APPROVAL =================
exports.approveProject = (req, res) => {
  const { id } = req.params;
  Project.approve(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Project approved" });
  });
};

exports.rejectProject = (req, res) => {
  const { id } = req.params;
  Project.reject(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Project rejected" });
  });
};
