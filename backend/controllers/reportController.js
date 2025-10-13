const db = require("../config/db").promise;
const progressService = require("../services/progressService");

// Generate Financial Progress Report 
async function getFinancialProgressReport(req, res) {
  try {
    const { project_id, plan_id } = req.query;
    
    if (!project_id && !plan_id) {
      return res.status(400).json({
        success: false,
        message: "Either project_id or plan_id is required"
      });
    }

    let reportData;
    
    if (plan_id) {
      // Get financial progress for a specific plan
      reportData = await getFinancialProgressByPlan(plan_id);
    } else if (project_id) {
      // Get financial progress for all plans in a project
      reportData = await getFinancialProgressByProject(project_id);
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Financial Progress Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate financial progress report",
      error: error.message
    });
  }
}

// Generate Physical Progress Report
async function getPhysicalProgressReport(req, res) {
  try {
    const { project_id, plan_id } = req.query;
    
    if (!project_id && !plan_id) {
      return res.status(400).json({
        success: false,
        message: "Either project_id or plan_id is required"
      });
    }

    let reportData;
    
    if (plan_id) {
      // Get physical progress for a specific plan
      reportData = await getPhysicalProgressByPlan(plan_id);
    } else if (project_id) {
      // Get physical progress for all plans in a project
      reportData = await getPhysicalProgressByProject(project_id);
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Physical Progress Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate physical progress report",
      error: error.message
    });
  }
}

// Helper function to get financial progress data for a specific plan
async function getFinancialProgressByPlan(planId) {
  const sql = `
    SELECT 
      p.name as project_name,
      pl.plan_identifier as plan_name,
      p.name as name_of_road,  -- Use project name as Name of Road from Report Filters
      COUNT(DISTINCT lo.owner_id) as acquired_lots,
      
      -- Compensation Paid: Sum from compensation_payment_details table (actual payments made)
      COALESCE(SUM(
        cpd.compensation_full_payment_paid_amount +
        cpd.compensation_part_payment_01_paid_amount +
        cpd.compensation_part_payment_02_paid_amount
      ), 0) as compensation_paid_lots_rs,
      
      -- Calculate compensation under section 17 (using lot valuation)
      COALESCE(AVG(lv.total_value), 0) as compensation_under_sec_17_rs_mn,
      
      -- Development costs (using initial estimated cost from project)
      COALESCE(p.initial_estimated_cost / COUNT(DISTINCT l.id), 0) as development_cost_rs_mn,
      
      -- Court deposit amounts (using court_amount from lot_valuations)
      COALESCE(SUM(lv.court_amount), 0) as court_deposit_rs_mn,
      
      -- Total Compensation Paid: Sum of final compensation amounts from compensation_payment_details
      COALESCE(SUM(cpd.final_compensation_amount), 0) as compensation_paid_rs_mn,
      
      -- Interest Paid: Sum from Interest Payment Details in compensation_payment_details
      COALESCE(SUM(
        cpd.interest_full_payment_paid_amount +
        cpd.interest_part_payment_01_paid_amount +
        cpd.interest_part_payment_02_paid_amount
      ), 0) as interest_paid_rs_mn,
      
      -- Calculate workers in hectares (using lot extent)
      COALESCE(SUM(l.preliminary_plan_extent_ha), 0) as workers_in_hectares,
      
      -- Progress percentages calculated based on payments vs total compensation from compensation_payment_details
      CASE 
        WHEN SUM(cpd.final_compensation_amount) > 0 
        THEN ROUND((SUM(
          cpd.compensation_full_payment_paid_amount +
          cpd.compensation_part_payment_01_paid_amount +
          cpd.compensation_part_payment_02_paid_amount
        ) / SUM(cpd.final_compensation_amount)) * 100, 2)
        ELSE 0 
      END as payment_progress_percentage,
      
      pl.created_at as report_date
      
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    LEFT JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN lot_owners lo ON lo.lot_id = l.id AND lo.status = 'active'
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    LEFT JOIN lot_valuations lv ON lv.plan_id = pl.id AND lv.lot_id = l.id
    WHERE pl.id = ?
    GROUP BY pl.id, pl.plan_identifier, p.name
    ORDER BY p.name ASC
  `;

  const [rows] = await db.query(sql, [planId]);
  
  if (rows.length === 0) {
    throw new Error(`No data found for plan ID: ${planId}`);
  }

  // Get plan details for report header
  const planDetailsSql = `
    SELECT 
      pl.plan_identifier,
      p.name as project_name,
      p.description as project_description,
      pl.created_at as plan_created_date,
      COUNT(DISTINCT l.id) as total_lots,
      COALESCE(SUM(l.preliminary_plan_extent_ha), 0) as total_extent_ha
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    LEFT JOIN lots l ON l.plan_id = pl.id
    WHERE pl.id = ?
    GROUP BY pl.id, pl.plan_identifier, p.name, p.description, pl.created_at
  `;

  const [planDetails] = await db.query(planDetailsSql, [planId]);

  // Get actual project progress using progress service
  let actualProgress = 0;
  try {
    const progressData = await progressService.getPlanProgress(planId);
    actualProgress = progressData.totalProgress || 0;
  } catch (error) {
    console.error(`Error getting progress for plan ${planId}:`, error);
    // Fallback to payment-based progress calculation
    actualProgress = rows.length > 0 ? 
      (rows.reduce((sum, row) => sum + parseFloat(row.payment_progress_percentage || 0), 0) / rows.length) : 0;
  }

  return {
    report_type: "Financial Progress Report",
    report_date: new Date().toISOString().split('T')[0],
    plan_details: planDetails[0] || {},
    financial_data: rows,
    summary: {
      total_lots: rows.length,
      // Total Compensation Allocated: Sum of final compensation amounts
      total_compensation_allocated: rows.reduce((sum, row) => sum + parseFloat(row.compensation_paid_rs_mn || 0), 0),
      // Total Compensation Paid: Sum of actual compensation payments made
      total_compensation_paid: rows.reduce((sum, row) => sum + parseFloat(row.compensation_paid_lots_rs || 0), 0),
      // Total Interest Paid: Sum of actual interest payments made
      total_interest_paid: rows.reduce((sum, row) => sum + parseFloat(row.interest_paid_rs_mn || 0), 0),
      // Overall Progress: Get from project progress service
      overall_payment_progress: actualProgress.toFixed(2)
    }
  };
}

// Helper function to get financial progress data for all plans in a project
async function getFinancialProgressByProject(projectId) {
  const projectDetailsSql = `
    SELECT 
      p.name as project_name,
      p.description as project_description,
      p.initial_estimated_cost,
      p.created_at as project_created_date,
      COUNT(DISTINCT pl.id) as total_plans
    FROM projects p
    LEFT JOIN plans pl ON pl.project_id = p.id
    WHERE p.id = ?
    GROUP BY p.id, p.name, p.description, p.initial_estimated_cost, p.created_at
  `;

  const [projectDetails] = await db.query(projectDetailsSql, [projectId]);
  
  if (projectDetails.length === 0) {
    throw new Error(`No project found with ID: ${projectId}`);
  }

  // Get aggregated financial data for the entire project using compensation_payment_details
  const financialDataSql = `
    SELECT 
      p.name as project_name,
      p.name as name_of_road,  -- Use project name as Name of Road from Report Filters
      COUNT(DISTINCT l.id) as acquired_lots,
      
      -- Compensation Paid: Sum from compensation_payment_details table (actual payments made)
      COALESCE(SUM(
        cpd.compensation_full_payment_paid_amount +
        cpd.compensation_part_payment_01_paid_amount +
        cpd.compensation_part_payment_02_paid_amount
      ), 0) as compensation_paid_lots_rs,
      
      -- Calculate compensation under section 17 (using lot valuation)
      COALESCE(AVG(lv.total_value), 0) as compensation_under_sec_17_rs_mn,
      
      -- Development costs (using initial estimated cost from project)
      COALESCE(p.initial_estimated_cost, 0) as development_cost_rs_mn,
      
      -- Court deposit amounts (using court_amount from lot_valuations)
      COALESCE(SUM(lv.court_amount), 0) as court_deposit_rs_mn,
      
      -- Total Compensation Paid: Sum of final compensation amounts from compensation_payment_details
      COALESCE(SUM(cpd.final_compensation_amount), 0) as compensation_paid_rs_mn,
      
      -- Interest Paid: Sum from Interest Payment Details in compensation_payment_details
      COALESCE(SUM(
        cpd.interest_full_payment_paid_amount +
        cpd.interest_part_payment_01_paid_amount +
        cpd.interest_part_payment_02_paid_amount
      ), 0) as interest_paid_rs_mn,
      
      -- Calculate workers in hectares (using lot extent)
      COALESCE(SUM(l.preliminary_plan_extent_ha), 0) as workers_in_hectares
      
    FROM projects p
    LEFT JOIN plans pl ON pl.project_id = p.id
    LEFT JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    LEFT JOIN lot_valuations lv ON lv.plan_id = pl.id AND lv.lot_id = l.id
    WHERE p.id = ?
    GROUP BY p.id, p.name
  `;

  const [financialData] = await db.query(financialDataSql, [projectId]);

  return {
    report_type: "Financial Progress Report - Project Level",
    report_date: new Date().toISOString().split('T')[0],
    project_details: projectDetails[0],
    financial_data: financialData,
    project_summary: {
      total_plans: projectDetails[0].total_plans,
      total_project_cost: projectDetails[0].initial_estimated_cost || 0,
      total_compensation_allocated: financialData[0]?.compensation_paid_rs_mn || 0,
      total_compensation_paid: financialData[0]?.compensation_paid_lots_rs || 0,
      total_interest_paid: financialData[0]?.interest_paid_rs_mn || 0
    }
  };
}

// Helper function to get physical progress data for a specific plan
async function getPhysicalProgressByPlan(planId) {
  // Get plan and project details including Divisional Secretary
  const planDetailsSql = `
    SELECT 
      pl.plan_identifier,
      p.id as project_id,
      p.name as project_name,
      p.description as project_description,
      pl.divisional_secretary,
      pl.created_at as plan_created_date,
      p.compensation_type
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    WHERE pl.id = ?
  `;

  const [planDetails] = await db.query(planDetailsSql, [planId]);
  
  if (planDetails.length === 0) {
    throw new Error(`No plan found with ID: ${planId}`);
  }

  // Get detailed lot progress data using existing tables and compensation_payment_details
  const physicalProgressSql = `
    SELECT 
      p.name as area_name,  -- Use project name as Area/Project Name from Report Filters
      pl.plan_identifier as plan_survey_number,
      
      -- Total extent (Ha)
      COALESCE(SUM(l.preliminary_plan_extent_ha), 0) as total_extent_ha,
      
      -- Total lots count  
      COUNT(DISTINCT l.id) as total_lots,
      
      -- Acquired lots (100% project progress lots - use progress service)
      -- For now, use compensation completion as proxy for 100% progress
      COUNT(DISTINCT CASE 
        WHEN cpd.final_compensation_amount IS NOT NULL 
        AND (cpd.compensation_full_payment_paid_amount > 0 
             OR cpd.compensation_part_payment_01_paid_amount > 0 
             OR cpd.compensation_part_payment_02_paid_amount > 0)
        THEN l.id 
        ELSE NULL 
      END) as acquired_lots_count,
      
      -- Progress calculation (based on 100% project progress)
      CASE 
        WHEN COUNT(DISTINCT l.id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE 
          WHEN cpd.final_compensation_amount IS NOT NULL 
          AND (cpd.compensation_full_payment_paid_amount > 0 
               OR cpd.compensation_part_payment_01_paid_amount > 0 
               OR cpd.compensation_part_payment_02_paid_amount > 0)
          THEN l.id 
          ELSE NULL 
        END) / COUNT(DISTINCT l.id)) * 100, 1)
        ELSE 0 
      END as acquisition_progress_percent,
      
      -- Owner details count
      COUNT(DISTINCT lo.owner_id) as total_owners,
      
      -- Court cases (using court_amount from valuations as indicator)
      COUNT(DISTINCT CASE 
        WHEN lv.court_amount IS NOT NULL AND lv.court_amount > 0 
        THEN l.id 
        ELSE NULL 
      END) as court_cases,
      
      -- Compensation Type from Project Details (compensation_type field)
      p.compensation_type as compensation_type,
      
      -- Compensation Paid: Sum from Compensation Payment Details
      COALESCE(SUM(
        cpd.compensation_full_payment_paid_amount +
        cpd.compensation_part_payment_01_paid_amount +
        cpd.compensation_part_payment_02_paid_amount
      ), 0) as total_compensation_paid,
      
      -- Interest Paid: Sum from Interest Payment Details in compensation_payment_details
      COALESCE(SUM(
        cpd.interest_full_payment_paid_amount +
        cpd.interest_part_payment_01_paid_amount +
        cpd.interest_part_payment_02_paid_amount
      ), 0) as total_interest_paid,
      
      -- Latest update date
      MAX(COALESCE(cpd.updated_at, l.updated_at)) as last_updated
      
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN lot_owners lo ON lo.lot_id = l.id AND lo.status = 'active'
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    LEFT JOIN lot_valuations lv ON lv.lot_id = l.id AND lv.plan_id = pl.id
    WHERE pl.id = ?
    GROUP BY p.id, p.name, pl.plan_identifier, p.compensation_type
    ORDER BY p.name ASC
  `;

  const [physicalData] = await db.query(physicalProgressSql, [planId]);

  // Calculate summary statistics
  const totalLots = physicalData.reduce((sum, row) => sum + parseInt(row.total_lots || 0), 0);
  const totalAcquiredLots = physicalData.reduce((sum, row) => sum + parseInt(row.acquired_lots_count || 0), 0);
  const totalExtent = physicalData.reduce((sum, row) => sum + parseFloat(row.total_extent_ha || 0), 0);
  
  // Get actual project progress using progress service for Overall Progress
  let overallProgress = 0;
  try {
    const progressData = await progressService.getProjectProgress(planDetails[0].project_id);
    overallProgress = Math.round(progressData.totalProgress || 0);
  } catch (error) {
    console.error(`Error getting project progress for project ${planDetails[0].project_id}:`, error);
    // Fallback to acquisition progress calculation
    overallProgress = totalLots > 0 ? Math.round((totalAcquiredLots / totalLots) * 100) : 0;
  }

  return {
    report_type: "Physical Progress Report",
    report_date: new Date().toISOString().split('T')[0],
    plan_details: planDetails[0],
    physical_progress_data: physicalData,
    summary: {
      total_lots: totalLots,
      total_acquired_lots: totalAcquiredLots,
      total_extent_ha: totalExtent,
      overall_progress_percent: overallProgress,
      total_owners: physicalData.reduce((sum, row) => sum + parseInt(row.total_owners || 0), 0),
      total_court_cases: physicalData.reduce((sum, row) => sum + parseInt(row.court_cases || 0), 0),
      total_compensation_paid: physicalData.reduce((sum, row) => sum + parseFloat(row.total_compensation_paid || 0), 0),
      total_interest_paid: physicalData.reduce((sum, row) => sum + parseFloat(row.total_interest_paid || 0), 0),
      report_period: "Physical Progress Report"
    }
  };
}

// Helper function to get physical progress data for all plans in a project  
async function getPhysicalProgressByProject(projectId) {
  // Get project details including Divisional Secretary from plans
  const projectDetailsSql = `
    SELECT 
      p.name as project_name,
      p.description as project_description,
      pl.divisional_secretary,
      p.created_at as project_created_date,
      p.compensation_type
    FROM projects p
    LEFT JOIN plans pl ON pl.project_id = p.id
    WHERE p.id = ?
    LIMIT 1
  `;

  const [projectDetails] = await db.query(projectDetailsSql, [projectId]);
  
  if (projectDetails.length === 0) {
    throw new Error(`No project found with ID: ${projectId}`);
  }

  // Get all plans for this project
  const plansSql = `SELECT id, plan_identifier FROM plans WHERE project_id = ? ORDER BY plan_identifier`;
  const [plans] = await db.query(plansSql, [projectId]);

  const allPhysicalData = [];
  let projectSummary = {
    total_lots: 0,
    total_acquired_lots: 0,
    total_extent_ha: 0,
    total_court_cases: 0,
    total_owners: 0,
    total_compensation_paid: 0,
    total_interest_paid: 0
  };
  
  for (const plan of plans) {
    try {
      const planPhysicalData = await getPhysicalProgressByPlan(plan.id);
      allPhysicalData.push({
        plan_id: plan.id,
        plan_identifier: plan.plan_identifier,
        ...planPhysicalData
      });
      
      // Aggregate project summary
      projectSummary.total_lots += planPhysicalData.summary.total_lots;
      projectSummary.total_acquired_lots += planPhysicalData.summary.total_acquired_lots;
      projectSummary.total_extent_ha += planPhysicalData.summary.total_extent_ha;
      projectSummary.total_court_cases += planPhysicalData.summary.total_court_cases;
      projectSummary.total_owners += planPhysicalData.summary.total_owners;
      projectSummary.total_compensation_paid += planPhysicalData.summary.total_compensation_paid;
      projectSummary.total_interest_paid += planPhysicalData.summary.total_interest_paid;
      
    } catch (error) {
      console.error(`Error getting physical data for plan ${plan.id}:`, error);
      allPhysicalData.push({
        plan_id: plan.id,
        plan_identifier: plan.plan_identifier,
        error: error.message
      });
    }
  }

  // Calculate overall project progress
  projectSummary.overall_progress_percent = projectSummary.total_lots > 0 ? 
    Math.round((projectSummary.total_acquired_lots / projectSummary.total_lots) * 100) : 0;

  return {
    report_type: "Physical Progress Report - Project Level",
    report_date: new Date().toISOString().split('T')[0],
    project_details: projectDetails[0],
    plans_data: allPhysicalData,
    project_summary: {
      ...projectSummary,
      total_plans: plans.length,
      plans_with_data: allPhysicalData.filter(plan => !plan.error).length,
      report_period: "Physical Progress Report"
    }
  };
}

module.exports = {
  getFinancialProgressReport,
  getPhysicalProgressReport
};