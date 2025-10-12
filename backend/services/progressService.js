const db = require("../config/db").pool.promise();

// Section order defines the data entry flow
const SECTION_ORDER = [
  "Owner Details",
  "Land Details",
  "Valuation",
  "Compensation"
];

// Utility to convert boolean/score to percentage safely
function clampPercent(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Compute section status helper
function sectionStatus(completeness) {
  if (completeness >= 1) return "complete";
  if (completeness > 0) return "partial";
  return "not_started";
}

// Build a concise status message for the first blocking section
function buildStatusMessage(sections) {
  // Find first section that is not complete
  for (const s of sections) {
    if (s.status !== "complete") {
      const missingText = s.missing && s.missing.length
        ? ` – Missing: ${s.missing.join(", ")}`
        : "";
      return {
        stoppedAt: s.name,
        message: `Stopped at ${s.name}${missingText}`
      };
    }
  }
  return { stoppedAt: null, message: "All sections complete" };
}

async function getLotProgress(planId, lotId) {
  // 1) Owners
  const ownersSql = `
    SELECT 
      COUNT(*) AS total_owners
    FROM lot_owners lo
    INNER JOIN owners o ON lo.owner_id = o.id
    WHERE lo.lot_id = ? AND lo.status = 'active' AND o.status = 'active'
  `;
  const [ownerRows] = await db.query(ownersSql, [lotId]);
  const totalOwners = ownerRows?.[0]?.total_owners || 0;

  // 2) Land details (from lots)
  const landSql = `
    SELECT land_type, advance_tracing_no,
           preliminary_plan_extent_ha, preliminary_plan_extent_perch
    FROM lots WHERE id = ?
  `;
  const [landRows] = await db.query(landSql, [lotId]);
  const land = landRows?.[0] || {};

  // 3) Valuation (lot_valuations)
  const valuationSql = `
    SELECT id, total_value, assessment_date, status
    FROM lot_valuations
    WHERE lot_id = ? AND plan_id = ?
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 1
  `;
  const [valRows] = await db.query(valuationSql, [lotId, planId]);
  const valuation = valRows?.[0] || null;

  // 4) Compensation (compensation_payment_details) - Enhanced with new completion criteria
  const compSql = `
    SELECT 
      COUNT(*) AS total_records,
      SUM(CASE WHEN COALESCE(final_compensation_amount, 0) > 0 THEN 1 ELSE 0 END) AS with_amount,
      SUM(CASE WHEN (
        COALESCE(compensation_full_payment_paid_amount,0) +
        COALESCE(compensation_part_payment_01_paid_amount,0) +
        COALESCE(compensation_part_payment_02_paid_amount,0)
      ) > 0 THEN 1 ELSE 0 END) AS with_payments,
      SUM(CASE WHEN COALESCE(balance_due, 0) = 0 THEN 1 ELSE 0 END) AS with_zero_balance,
      SUM(CASE WHEN COALESCE(total_paid_interest, 0) = COALESCE(calculated_interest_amount, 0) AND COALESCE(calculated_interest_amount, 0) > 0 THEN 1 ELSE 0 END) AS with_interest_complete,
      SUM(CASE WHEN send_account_division_date IS NOT NULL THEN 1 ELSE 0 END) AS with_division_date,
      SUM(CASE WHEN 
        COALESCE(balance_due, 0) = 0 AND 
        COALESCE(total_paid_interest, 0) = COALESCE(calculated_interest_amount, 0) AND
        send_account_division_date IS NOT NULL AND
        COALESCE(final_compensation_amount, 0) > 0
      THEN 1 ELSE 0 END) AS fully_complete
    FROM compensation_payment_details
    WHERE plan_id = ? AND lot_id = ?
  `;
  const [compRows] = await db.query(compSql, [planId, lotId]);
  const compAgg = compRows?.[0] || { 
    total_records: 0, 
    with_amount: 0, 
    with_payments: 0, 
    with_zero_balance: 0, 
    with_interest_complete: 0, 
    with_division_date: 0, 
    fully_complete: 0 
  };

  // Owner Details section
  const ownerMissing = totalOwners > 0 ? [] : ["At least one owner"];
  const ownerCompleteness = totalOwners > 0 ? 1 : 0;
  const ownerSection = {
    name: "Owner Details",
    status: sectionStatus(ownerCompleteness),
    completeness: ownerCompleteness,
    missing: ownerMissing
  };

  // Land Details section – require a small set of fields
  // Can only be started after Owner Details is complete
  const landMissing = [];
  let landCompleteness = 0;
  let landStatus = "not_started";
  
  if (ownerCompleteness < 1) {
    landMissing.push("Complete Owner Details first");
    landCompleteness = 0;
    landStatus = "blocked";
  } else {
    // Owner Details complete, now check land fields
    if (!land.land_type) landMissing.push("Land Type");
    if (!land.advance_tracing_no) landMissing.push("Survey/Advance Tracing No");
    if (!land.preliminary_plan_extent_ha && !land.preliminary_plan_extent_perch) {
      landMissing.push("Preliminary Plan Extent (Ha or Perch)");
    }
    const landTotalRequired = 3;
    const landFieldsPresent = landTotalRequired - landMissing.length;
    landCompleteness = landFieldsPresent / landTotalRequired;
    landStatus = sectionStatus(landCompleteness);
  }
  
  const landSection = {
    name: "Land Details",
    status: landStatus,
    completeness: landCompleteness,
    missing: landMissing
  };

  // Valuation section
  // Can only be started after Land Details is complete
  const valMissing = [];
  let valCompleteness = 0;
  let valStatus = "not_started";
  
  if (ownerCompleteness < 1 || landCompleteness < 1) {
    if (ownerCompleteness < 1) valMissing.push("Complete Owner Details first");
    if (landCompleteness < 1) valMissing.push("Complete Land Details first");
    valCompleteness = 0;
    valStatus = "blocked";
  } else {
    // Previous sections complete, now check valuation
    if (!valuation) {
      valMissing.push("Valuation record");
      valCompleteness = 0;
    } else {
      // Weight: record (0.4), total_value (0.4), assessment_date (0.2)
      let score = 0.4; // record exists
      if (valuation.total_value && Number(valuation.total_value) > 0) score += 0.4; else valMissing.push("Total Value");
      if (valuation.assessment_date) score += 0.2; else valMissing.push("Assessment Date");
      valCompleteness = score; // already in 0..1 scale
    }
    valStatus = sectionStatus(valCompleteness);
  }
  
  const valuationSection = {
    name: "Valuation",
    status: valStatus,
    completeness: valCompleteness,
    missing: valMissing
  };

  // Compensation section
  // Can only be started after Valuation is complete
  const compMissing = [];
  let compCompleteness = 0;
  let compStatus = "not_started";
  
  if (ownerCompleteness < 1 || landCompleteness < 1 || valCompleteness < 1) {
    if (ownerCompleteness < 1) compMissing.push("Complete Owner Details first");
    if (landCompleteness < 1) compMissing.push("Complete Land Details first");
    if (valCompleteness < 1) compMissing.push("Complete Valuation first");
    compCompleteness = 0;
    compStatus = "blocked";
  } else {
    // Previous sections complete, now check compensation
    if (totalOwners === 0) {
      // No owners yet; treat as not started and indicate dependency
      compMissing.push("Owners not added");
      compCompleteness = 0;
    } else {
      const totalRecords = Number(compAgg.total_records || 0);
      const withAmount = Number(compAgg.with_amount || 0);
      const withZeroBalance = Number(compAgg.with_zero_balance || 0);
      const withInterestComplete = Number(compAgg.with_interest_complete || 0);
      const withDivisionDate = Number(compAgg.with_division_date || 0);
      const fullyComplete = Number(compAgg.fully_complete || 0);
      
      // Check what's missing for 100% completion
      if (totalRecords === 0) {
        compMissing.push("Compensation records for owners");
        compCompleteness = 0;
      } else {
        // Build missing items list
        if (withAmount < totalOwners) compMissing.push("Final compensation amounts");
        if (withZeroBalance < totalOwners) compMissing.push("Balance due must be 0");
        if (withInterestComplete < totalOwners) compMissing.push("Interest payments must equal calculated interest");
        if (withDivisionDate < totalOwners) compMissing.push("Send account division date");
        
        // Calculate completion percentage based on multiple criteria
        const completionScores = [
          withAmount / totalOwners,           // 25% - Has compensation amount
          withZeroBalance / totalOwners,      // 25% - Balance is zero
          withInterestComplete / totalOwners, // 25% - Interest payments complete
          withDivisionDate / totalOwners      // 25% - Division date provided
        ];
        
        // Average of all completion criteria
        compCompleteness = completionScores.reduce((sum, score) => sum + score, 0) / completionScores.length;
        
        // Ensure we don't exceed 1.0
        compCompleteness = Math.min(1, compCompleteness);
      }
    }
    compStatus = sectionStatus(compCompleteness);
  }
  
  const compensationSection = {
    name: "Compensation",
    status: compStatus,
    completeness: compCompleteness,
    missing: compMissing
  };

  // Compose sections in order
  const sections = [ownerSection, landSection, valuationSection, compensationSection];

  // Sequential/Cumulative progress calculation
  // Each section worth 25%, but can only start after previous is complete
  let cumulativeProgress = 0;
  
  // Owner Details: 0-25%
  cumulativeProgress += ownerCompleteness * 25;
  
  // Land Details: 25-50% (only if owners complete)
  if (ownerCompleteness === 1) {
    cumulativeProgress += landCompleteness * 25;
  }
  
  // Valuation: 50-75% (only if land details complete)
  if (ownerCompleteness === 1 && landCompleteness === 1) {
    cumulativeProgress += valCompleteness * 25;
  }
  
  // Compensation: 75-100% (only if valuation complete)
  if (ownerCompleteness === 1 && landCompleteness === 1 && valCompleteness === 1) {
    cumulativeProgress += compCompleteness * 25;
  }

  const overall = clampPercent(cumulativeProgress);

  // Last completed section
  let lastCompletedSection = null;
  for (const s of sections) {
    if (s.status === "complete") lastCompletedSection = s.name; else break;
  }

  // Build status message
  const { stoppedAt, message } = buildStatusMessage(sections);

  return {
    plan_id: Number(planId),
    lot_id: Number(lotId),
    total_owners: totalOwners,
    sections,
    overall_percent: overall,
    last_completed_section: lastCompletedSection,
    stopped_at: stoppedAt,
    status_message: message,
    // Useful aggregates for UI if needed
    aggregates: {
      owners: { total: totalOwners },
      compensation: compAgg
    },
    // Sample queries for reference
    sample_sql: {
      ownersSql,
      landSql,
      valuationSql,
      compSql
    }
  };
}

// Calculate plan creation progress (10% of total)
async function getPlanCreationProgress(planId) {
  const planSql = `
    SELECT 
      plan_identifier,
      section_07_gazette_no,
      section_07_gazette_date,
      section_38_gazette_no,
      section_38_gazette_date,
      section_5_gazette_no,
      divisional_secretary
    FROM plans 
    WHERE id = ?
  `;
  
  const [planRows] = await db.query(planSql, [planId]);
  if (!planRows.length) return 0;
  
  const plan = planRows[0];
  let progress = 0;
  
  // Plan No/Cadastral No (Required - 2%)
  if (plan.plan_identifier) {
    progress += 2;
  }
  
  // Section 07 Gazette Details (3%) - Both number and date needed for full points
  if (plan.section_07_gazette_no && plan.section_07_gazette_date) {
    progress += 3;
  } else if (plan.section_07_gazette_no || plan.section_07_gazette_date) {
    progress += 1.5; // Partial credit
  }
  
  // Section 38 Gazette Details (3%) - Both number and date needed for full points
  if (plan.section_38_gazette_no && plan.section_38_gazette_date) {
    progress += 3;
  } else if (plan.section_38_gazette_no || plan.section_38_gazette_date) {
    progress += 1.5; // Partial credit
  }
  
  // Divisional Secretary (1%)
  if (plan.divisional_secretary) {
    progress += 1;
  }
  
  // Section 5 Gazette No (1%)
  if (plan.section_5_gazette_no) {
    progress += 1;
  }
  
  return clampPercent(progress);
}

async function getPlanProgress(planId) {
  // Calculate plan creation progress (10%)
  const creationProgress = await getPlanCreationProgress(planId);
  
  // Get lots for the plan
  const lotsSql = `SELECT id AS lot_id, lot_no FROM lots WHERE plan_id = ? ORDER BY lot_no ASC`;
  const [lots] = await db.query(lotsSql, [planId]);

  const items = [];
  for (const lot of lots) {
    try {
      const lp = await getLotProgress(planId, lot.lot_id);
      items.push({ lot_no: lot.lot_no, ...lp });
    } catch (e) {
      items.push({ lot_no: lot.lot_no, lot_id: lot.lot_id, error: e.message });
    }
  }

  const valid = items.filter(i => typeof i.overall_percent === 'number');
  const lotAverageProgress = valid.length ? valid.reduce((s, i) => s + i.overall_percent, 0) / valid.length : 0;
  
  // Final progress: 10% from plan creation + 90% from lot progress average
  const finalProgress = clampPercent(creationProgress + (lotAverageProgress * 0.9));

  // Find first blocking message across lots (optional)
  const pending = items.find(i => i.status_message && i.status_message !== 'All sections complete');

  return {
    plan_id: Number(planId),
    creation_progress: creationProgress,
    lot_average_progress: lotAverageProgress,
    overall_percent: finalProgress,
    lots: items,
    status_message: pending ? pending.status_message : 'All lots complete'
  };
}

// Calculate project creation progress (10% of total)
async function getProjectCreationProgress(projectId) {
  const projectSql = `
    SELECT 
      name,
      initial_estimated_cost,
      initial_extent_ha,
      section_2_order,
      section_2_com,
      advance_tracing_no,
      advance_tracing_date,
      section_5_no,
      section_5_no_date,
      compensation_type
    FROM projects 
    WHERE id = ?
  `;
  
  const [projectRows] = await db.query(projectSql, [projectId]);
  if (!projectRows.length) return 0;
  
  const project = projectRows[0];
  let progress = 0;
  
  // Project Name (Required - 2%)
  if (project.name) {
    progress += 2;
  }
  
  // Initial Estimated Cost (1%)
  if (project.initial_estimated_cost) {
    progress += 1;
  }
  
  // Initial Estimated Extent (Hectares) (1%)
  if (project.initial_extent_ha) {
    progress += 1;
  }
  
  // Section 2 Order & Completion (2%) - Both dates needed for full points
  if (project.section_2_order && project.section_2_com) {
    progress += 2;
  } else if (project.section_2_order || project.section_2_com) {
    progress += 1; // Partial credit
  }
  
  // Advance Tracing Details (2%) - Both number and date needed for full points
  if (project.advance_tracing_no && project.advance_tracing_date) {
    progress += 2;
  } else if (project.advance_tracing_no || project.advance_tracing_date) {
    progress += 1; // Partial credit
  }
  
  // Section 5 Details (2%) - Both number and date needed for full points
  if (project.section_5_no && project.section_5_no_date) {
    progress += 2;
  } else if (project.section_5_no || project.section_5_no_date) {
    progress += 1; // Partial credit
  }
  
  // Note: Compensation Type is always set (default 'regulation'), so no additional points
  
  return clampPercent(progress);
}

async function getProjectProgress(projectId) {
  // Calculate project creation progress (10%)
  const creationProgress = await getProjectCreationProgress(projectId);
  
  // Get plans for the project
  const plansSql = `SELECT id FROM plans WHERE project_id = ?`;
  const [plans] = await db.query(plansSql, [projectId]);
  
  if (plans.length === 0) {
    // No plans yet, only show creation progress
    return {
      project_id: Number(projectId),
      creation_progress: creationProgress,
      plan_average_progress: 0,
      overall_percent: creationProgress,
      total_plans: 0,
      plans_with_progress: []
    };
  }
  
  // Calculate average progress of all plans
  const planProgressData = [];
  let totalPlanProgress = 0;
  let validPlans = 0;
  
  for (const plan of plans) {
    try {
      const planProgress = await getPlanProgress(plan.id);
      planProgressData.push({
        plan_id: plan.id,
        progress: planProgress.overall_percent
      });
      totalPlanProgress += planProgress.overall_percent;
      validPlans++;
    } catch (error) {
      console.error(`Error calculating progress for plan ${plan.id}:`, error);
      planProgressData.push({
        plan_id: plan.id,
        progress: 0,
        error: error.message
      });
    }
  }
  
  const planAverageProgress = validPlans > 0 ? totalPlanProgress / validPlans : 0;
  
  // Final progress: 10% from project creation + 90% from plan progress average
  const finalProgress = clampPercent(creationProgress + (planAverageProgress * 0.9));
  
  return {
    project_id: Number(projectId),
    creation_progress: creationProgress,
    plan_average_progress: planAverageProgress,
    overall_percent: finalProgress,
    total_plans: plans.length,
    plans_with_progress: planProgressData
  };
}

// Helper function to calculate and update compensation completion fields
async function updateCompensationCompletion(planId, lotId, ownerNic) {
  const updateSql = `
    UPDATE compensation_payment_details 
    SET 
      total_paid_interest = COALESCE(interest_full_payment_paid_amount, 0) + 
                           COALESCE(interest_part_payment_01_paid_amount, 0) + 
                           COALESCE(interest_part_payment_02_paid_amount, 0),
      balance_due = GREATEST(0, 
        COALESCE(final_compensation_amount, 0) - 
        (COALESCE(compensation_full_payment_paid_amount, 0) + 
         COALESCE(compensation_part_payment_01_paid_amount, 0) + 
         COALESCE(compensation_part_payment_02_paid_amount, 0))
      ),
      completion_status = CASE 
        WHEN COALESCE(balance_due, 0) = 0 AND 
             COALESCE(total_paid_interest, 0) = COALESCE(calculated_interest_amount, 0) AND 
             send_account_division_date IS NOT NULL AND
             COALESCE(final_compensation_amount, 0) > 0
        THEN 'complete'
        WHEN COALESCE(final_compensation_amount, 0) > 0 OR 
             (COALESCE(compensation_full_payment_paid_amount, 0) + 
              COALESCE(compensation_part_payment_01_paid_amount, 0) + 
              COALESCE(compensation_part_payment_02_paid_amount, 0)) > 0
        THEN 'partial'
        ELSE 'pending'
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE plan_id = ? AND lot_id = ? AND owner_nic = ?
  `;
  
  await db.query(updateSql, [planId, lotId, ownerNic]);
}

// Helper function to calculate interest amount based on compensation and time
function calculateInterestAmount(compensationAmount, fromDate, toDate, interestRate = 0.07) {
  if (!compensationAmount || !fromDate || !toDate) return 0;
  
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const daysDiff = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  const yearsDiff = daysDiff / 365.25;
  
  return Math.round(compensationAmount * interestRate * yearsDiff * 100) / 100;
}

// Helper function to get detailed compensation progress for a lot
async function getCompensationDetails(planId, lotId) {
  const detailSql = `
    SELECT 
      owner_nic,
      owner_name,
      final_compensation_amount,
      calculated_interest_amount,
      total_paid_interest,
      balance_due,
      send_account_division_date,
      completion_status,
      (COALESCE(compensation_full_payment_paid_amount, 0) + 
       COALESCE(compensation_part_payment_01_paid_amount, 0) + 
       COALESCE(compensation_part_payment_02_paid_amount, 0)) as total_compensation_paid
    FROM compensation_payment_details
    WHERE plan_id = ? AND lot_id = ?
    ORDER BY owner_name
  `;
  
  const [rows] = await db.query(detailSql, [planId, lotId]);
  return rows;
}

module.exports = {
  getLotProgress,
  getPlanProgress,
  getPlanCreationProgress,
  getProjectCreationProgress,
  getProjectProgress,
  updateCompensationCompletion,
  calculateInterestAmount,
  getCompensationDetails,
  SECTION_ORDER
};
