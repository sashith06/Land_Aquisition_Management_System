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
      p.name as name_of_road,  -- Name of Road
      
      -- Individual Lot Details (AGGREGATED BY LOT)
      l.lot_no as lot_number,
      l.id as lot_id,
      
      -- Full Compensation: SUM of all final compensation amounts for this lot
      COALESCE(SUM(cpd.final_compensation_amount), 0) as full_compensation,
      
      -- Payment Done: SUM of all actual payments made for this lot (all owners)
      COALESCE(SUM(
        COALESCE(cpd.compensation_full_payment_paid_amount, 0) +
        COALESCE(cpd.compensation_part_payment_01_paid_amount, 0) +
        COALESCE(cpd.compensation_part_payment_02_paid_amount, 0)
      ), 0) as payment_done,
      
      -- Balance Due: Full Compensation - Payment Done for this lot
      COALESCE(SUM(cpd.final_compensation_amount), 0) - COALESCE(SUM(
        COALESCE(cpd.compensation_full_payment_paid_amount, 0) +
        COALESCE(cpd.compensation_part_payment_01_paid_amount, 0) +
        COALESCE(cpd.compensation_part_payment_02_paid_amount, 0)
      ), 0) as balance_due,
      
      -- Interest to be paid: Calculate 7% annual interest from gazette_date to today
      COALESCE(SUM(
        CASE 
          WHEN cpd.gazette_date IS NOT NULL AND cpd.final_compensation_amount > 0 
          THEN cpd.final_compensation_amount * 0.07 * (DATEDIFF(CURDATE(), cpd.gazette_date) / 365.0)
          ELSE 0 
        END
      ), 0) as interest_7_percent,
      
      -- Interest Paid: SUM of all interest payments for this lot (all owners)
      COALESCE(SUM(
        COALESCE(cpd.interest_full_payment_paid_amount, 0) +
        COALESCE(cpd.interest_part_payment_01_paid_amount, 0) +
        COALESCE(cpd.interest_part_payment_02_paid_amount, 0)
      ), 0) as interest_paid,
      
      pl.created_at as report_date
      
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    WHERE pl.id = ?
    GROUP BY l.id, l.lot_no, p.name, pl.plan_identifier, pl.created_at
    ORDER BY l.lot_no ASC
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
  try {
    console.log('=== Getting physical progress for plan:', planId);
    
    // Get plan and project details
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
    console.log('Plan details found:', planDetails.length);
    
    if (planDetails.length === 0) {
      throw new Error(`No plan found with ID: ${planId}`);
    }

  // Get lot-wise physical progress data - simplified version
  const physicalProgressSql = `
    SELECT DISTINCT
      p.name as project_name,
      pl.plan_identifier as plan_no,
      l.lot_no as lot_no,
      l.id as lot_id,
      COALESCE(l.preliminary_plan_extent_ha, 0) as lot_extent_ha,
      CASE 
        WHEN cpd.final_compensation_amount IS NOT NULL 
        AND (cpd.compensation_full_payment_paid_amount > 0 
             OR cpd.compensation_part_payment_01_paid_amount > 0 
             OR cpd.compensation_part_payment_02_paid_amount > 0)
        THEN 'Acquired'
        ELSE 'Not Acquired' 
      END as acquisition_status,
      CASE 
        WHEN lv.court_amount IS NOT NULL AND lv.court_amount > 0 
        THEN 'Yes'
        ELSE 'No' 
      END as court_case,
      COALESCE(p.compensation_type, 'regulation') as compensation_type
    FROM plans pl
    JOIN projects p ON pl.project_id = p.id
    JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    LEFT JOIN lot_valuations lv ON lv.lot_id = l.id AND lv.plan_id = pl.id
    WHERE pl.id = ?
    ORDER BY l.lot_no + 0 ASC
  `;

  const [physicalData] = await db.query(physicalProgressSql, [planId]);
  console.log('Physical data found:', physicalData.length);

  // Get owner information for each lot
  const ownerDataSql = `
    SELECT 
      l.id as lot_id,
      COUNT(DISTINCT lo.owner_id) as owners_count,
      GROUP_CONCAT(o.name SEPARATOR ', ') as owner_names
    FROM lots l
    LEFT JOIN lot_owners lo ON lo.lot_id = l.id AND lo.status = 'active'
    LEFT JOIN owners o ON o.id = lo.owner_id
    WHERE l.plan_id = ?
    GROUP BY l.id
  `;

  const [ownerData] = await db.query(ownerDataSql, [planId]);
  console.log('Owner data found:', ownerData.length);

  // Create a map for quick lookup
  const ownerMap = new Map();
  ownerData.forEach(row => {
    ownerMap.set(row.lot_id, {
      owners_count: row.owners_count || 0,
      primary_owner_name: row.owner_names ? row.owner_names.split(', ')[0] : 'No Owner Assigned'
    });
  });

  // Get project progress using progress service
  let projectProgress = 0;
  try {
    const progressData = await progressService.getProjectProgress(planDetails[0].project_id);
    projectProgress = Math.round(progressData.overall_percent || 0);
  } catch (error) {
    console.error(`Error getting project progress:`, error);
    // Fallback calculation
    const totalLots = physicalData.length;
    const totalAcquiredLots = physicalData.filter(row => row.acquisition_status === 'Acquired').length;
    projectProgress = totalLots > 0 ? Math.round((totalAcquiredLots / totalLots) * 100) : 0;
  }

  // Format data for the new table structure
  const tableData = physicalData.map((row, index) => {
    const ownerInfo = ownerMap.get(row.lot_id) || { owners_count: 0, primary_owner_name: 'No Owner Assigned' };
    
    return {
      no: index + 1,
      project_name: row.project_name,
      plan_no: row.plan_no,
      lot_no: row.lot_no,
      owner_name: ownerInfo.primary_owner_name,
      lot_extent_ha: parseFloat(row.lot_extent_ha).toFixed(2),
      acquisition_status: row.acquisition_status,
      owners_count: ownerInfo.owners_count,
      court_case: row.court_case,
      compensation_type: row.compensation_type
    };
  });

  return {
    report_type: "Physical Progress Details",
    report_date: new Date().toISOString().split('T')[0],
    project_name: planDetails[0].project_name,
    plan_no: planDetails[0].plan_identifier,
    overall_project_progress: projectProgress,
    plan_details: {
      ...planDetails[0],
      overall_progress_percent: projectProgress
    },
    physical_progress_data: tableData,
    summary: {
      total_lots: physicalData.length,
      total_acquired_lots: physicalData.filter(row => row.acquisition_status === 'Acquired').length,
      total_extent_ha: physicalData.reduce((sum, row) => sum + parseFloat(row.lot_extent_ha || 0), 0),
      overall_progress_percent: projectProgress,
      total_owners: physicalData.reduce((sum, row) => sum + parseInt(row.owners_count || 0), 0),
      total_court_cases: physicalData.filter(row => row.court_case === 'Yes').length
    }
  };
  } catch (error) {
    console.error('Error in getPhysicalProgressByPlan:', error);
    throw error;
  }
}

// Helper function to get physical progress data for all plans in a project  
async function getPhysicalProgressByProject(projectId) {
  // Get project details
  const projectDetailsSql = `
    SELECT 
      p.name as project_name,
      p.description as project_description,
      p.created_at as project_created_date,
      p.compensation_type
    FROM projects p
    WHERE p.id = ?
  `;

  const [projectDetails] = await db.query(projectDetailsSql, [projectId]);
  
  if (projectDetails.length === 0) {
    throw new Error(`No project found with ID: ${projectId}`);
  }

  // Get aggregated physical progress data grouped by plans
  const physicalProgressSql = `
    SELECT DISTINCT
      p.name as project_name,
      pl.plan_identifier as plan_no,
      l.lot_no as lot_no,
      l.id as lot_id,
      COALESCE(l.preliminary_plan_extent_ha, 0) as lot_extent_ha,
      CASE 
        WHEN cpd.final_compensation_amount IS NOT NULL 
        AND (cpd.compensation_full_payment_paid_amount > 0 
             OR cpd.compensation_part_payment_01_paid_amount > 0 
             OR cpd.compensation_part_payment_02_paid_amount > 0)
        THEN 'Acquired'
        ELSE 'Not Acquired' 
      END as acquisition_status,
      CASE 
        WHEN lv.court_amount IS NOT NULL AND lv.court_amount > 0 
        THEN 'Yes'
        ELSE 'No' 
      END as court_case,
      COALESCE(p.compensation_type, 'regulation') as compensation_type,
      pl.id as plan_id
    FROM projects p
    JOIN plans pl ON pl.project_id = p.id
    JOIN lots l ON l.plan_id = pl.id
    LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
    LEFT JOIN lot_valuations lv ON lv.lot_id = l.id AND lv.plan_id = pl.id
    WHERE p.id = ?
    ORDER BY pl.plan_identifier, l.lot_no + 0 ASC
  `;

  const [physicalData] = await db.query(physicalProgressSql, [projectId]);

  // Get owner information for all lots in the project
  const ownerDataSql = `
    SELECT 
      l.id as lot_id,
      COUNT(DISTINCT lo.owner_id) as owners_count,
      GROUP_CONCAT(o.name SEPARATOR ', ') as owner_names
    FROM lots l
    LEFT JOIN lot_owners lo ON lo.lot_id = l.id AND lo.status = 'active'
    LEFT JOIN owners o ON o.id = lo.owner_id
    JOIN plans pl ON l.plan_id = pl.id
    WHERE pl.project_id = ?
    GROUP BY l.id
  `;

  const [ownerData] = await db.query(ownerDataSql, [projectId]);

  // Create a map for quick lookup
  const ownerMap = new Map();
  ownerData.forEach(row => {
    ownerMap.set(row.lot_id, {
      owners_count: row.owners_count || 0,
      primary_owner_name: row.owner_names ? row.owner_names.split(', ')[0] : 'No Owner Assigned'
    });
  });

  // Get project progress using progress service
  let projectProgress = 0;
  try {
    const progressData = await progressService.getProjectProgress(projectId);
    projectProgress = Math.round(progressData.overall_percent || 0);
  } catch (error) {
    console.error(`Error getting project progress:`, error);
    // Fallback calculation
    const totalLots = physicalData.length;
    const totalAcquiredLots = physicalData.filter(row => row.acquisition_status === 'Acquired').length;
    projectProgress = totalLots > 0 ? Math.round((totalAcquiredLots / totalLots) * 100) : 0;
  }

  // Group data by plans for hierarchical display
  const plansMap = new Map();
  let lotCounter = 1;

  physicalData.forEach((row) => {
    if (!plansMap.has(row.plan_no)) {
      plansMap.set(row.plan_no, {
        plan_no: row.plan_no,
        lots: []
      });
    }
    
    const ownerInfo = ownerMap.get(row.lot_id) || { owners_count: 0, primary_owner_name: 'No Owner Assigned' };
    
    plansMap.get(row.plan_no).lots.push({
      no: lotCounter++,
      project_name: row.project_name,
      plan_no: row.plan_no,
      lot_no: row.lot_no,
      owner_name: ownerInfo.primary_owner_name,
      lot_extent_ha: parseFloat(row.lot_extent_ha).toFixed(2),
      acquisition_status: row.acquisition_status,
      owners_count: ownerInfo.owners_count,
      court_case: row.court_case,
      compensation_type: row.compensation_type
    });
  });

  // Convert to array for frontend
  const tableData = [];
  for (const [planNo, planData] of plansMap) {
    tableData.push(...planData.lots);
  }

  return {
    report_type: "Physical Progress Details - Project Level",
    report_date: new Date().toISOString().split('T')[0],
    project_name: projectDetails[0].project_name,
    plan_no: plansMap.size > 1 ? 'Multiple Plans' : Array.from(plansMap.keys())[0],
    overall_project_progress: projectProgress,
    project_details: projectDetails[0],
    plans_structure: Array.from(plansMap.values()),
    physical_progress_data: tableData,
    summary: {
      total_lots: physicalData.length,
      total_acquired_lots: physicalData.filter(row => row.acquisition_status === 'Acquired').length,
      total_extent_ha: physicalData.reduce((sum, row) => sum + parseFloat(row.lot_extent_ha || 0), 0),
      overall_progress_percent: projectProgress,
      total_owners: physicalData.reduce((sum, row) => sum + parseInt(row.owners_count || 0), 0),
      total_court_cases: physicalData.filter(row => row.court_case === 'Yes').length,
      total_plans: plansMap.size
    }
  };
}

module.exports = {
  getFinancialProgressReport,
  getPhysicalProgressReport
};