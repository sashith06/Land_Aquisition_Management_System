const db = require("../config/db");

const Project = {};

// ============ CREATE NEW PROJECT ============
Project.create = (project, callback) => {
  const sql = `
    INSERT INTO projects 
    (name, initial_estimated_cost, initial_extent_ha, initial_extent_perch, 
     section_2_order, section_2_com, advance_tracing_no, compensation_type, 
     notes, advance_tracing_date, section_5_no, section_5_no_date, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    project.name,
    project.initial_estimated_cost || null,
    project.initial_extent_ha || null,
    project.initial_extent_perch || null,
    project.section_2_order || null,
    project.section_2_com || null,
    project.advance_tracing_no || null,
    project.compensation_type || null,
    project.notes || null,
    project.advance_tracing_date || null,
    project.section_5_no || null,
    project.section_5_no_date || null,
    "pending"
  ], callback);
};

// ============ UPDATE PROJECT ============
Project.update = (id, project, callback) => {
  let fields = [];
  let values = [];

  for (const [key, value] of Object.entries(project)) {
    if (value !== undefined) { // only update provided fields
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  // always update timestamp
  fields.push("updated_at = CURRENT_TIMESTAMP");

  const sql = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.query(sql, values, callback);
};

// ============ GET PROJECTS ============
Project.findById = (id, callback) => {
  db.query("SELECT * FROM projects WHERE id = ?", [id], callback);
};

Project.getPending = (callback) => {
  db.query("SELECT * FROM projects WHERE status = 'pending'", callback);
};

// ============ APPROVAL ============
Project.approve = (id, callback) => {
  db.query(
    "UPDATE projects SET status='approved', updated_at=CURRENT_TIMESTAMP WHERE id = ?",
    [id],
    callback
  );
};

Project.reject = (id, callback) => {
  db.query(
    "UPDATE projects SET status='rejected', updated_at=CURRENT_TIMESTAMP WHERE id = ?",
    [id],
    callback
  );
};

module.exports = Project;
