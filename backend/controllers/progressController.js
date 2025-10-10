const progressService = require("../services/progressService");

// GET /api/progress/plan/:plan_id
async function getPlanProgress(req, res) {
  try {
    const { plan_id } = req.params;
    const progress = await progressService.getPlanProgress(plan_id);
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getPlanProgress error:", err);
    res.status(500).json({ success: false, message: "Failed to compute plan progress", error: err.message });
  }
}

// GET /api/progress/plan/:plan_id/lot/:lot_id
async function getLotProgress(req, res) {
  try {
    const { plan_id, lot_id } = req.params;
    const progress = await progressService.getLotProgress(plan_id, lot_id);
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getLotProgress error:", err);
    res.status(500).json({ success: false, message: "Failed to compute lot progress", error: err.message });
  }
}

// GET /api/progress/project/:project_id
async function getProjectProgress(req, res) {
  try {
    const { project_id } = req.params;
    const progress = await progressService.getProjectProgress(project_id);
    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getProjectProgress error:", err);
    res.status(500).json({ success: false, message: "Failed to compute project progress", error: err.message });
  }
}

module.exports = {
  getPlanProgress,
  getLotProgress,
  getProjectProgress
};
