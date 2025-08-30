const db = require("../config/db");

const Plan = {};

// Create new plan
Plan.create = (plan, callback) => {
  const sql = `
    INSERT INTO plans 
    (project_id, plan_no, description, estimated_cost, created_by, 
     section_38_gno, section_38_gdate, section_5_gno, section_5_gdate, section_7_gno, section_7_gdate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    plan.project_id,
    plan.plan_no,
    plan.description,
    plan.estimated_cost,
    plan.created_by,
    plan.section_38_gno,
    plan.section_38_gdate,
    plan.section_5_gno,
    plan.section_5_gdate,
    plan.section_7_gno,
    plan.section_7_gdate
  ], callback);
};

// Get all plans by project
Plan.getByProject = (project_id, callback) => {
  db.query("SELECT * FROM plans WHERE project_id = ?", [project_id], callback);
};

// Get single plan
Plan.findById = (id, callback) => {
  db.query("SELECT * FROM plans WHERE id = ?", [id], callback);
};

module.exports = Plan;
