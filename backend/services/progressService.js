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
    if (s.status === "blocked") {
      const missingText = s.missing && s.missing.length
        ? ` – ${s.missing.join(", ")}`
        : "";
      return {
        stoppedAt: s.name,
        message: `Blocked at ${s.name}${missingText}`
      };
    }
    if (s.status !== "complete") {
      const missingText = s.missing && s.missing.length
        ? ` – Missing: ${s.missing.join(", ")}`
        : "";
      return {
        stoppedAt: s.name,
        message: `In Progress: ${s.name}${missingText}`
      };
    }
  }
  return { stoppedAt: null, message: "All sections complete" };
}

async function getLotProgress(planId, lotId) {
  console.log(`\n=== DEBUG: Calculating progress for Plan ${planId}, Lot ${lotId} ===`);
  console.log(`QUERY PARAMETERS: planId=${planId}, lotId=${lotId}`);
  
  // 1) Owners - Get detailed owner information including status
  const ownersSql = `
    SELECT 
      COUNT(*) AS total_owners,
      SUM(CASE WHEN o.status = 'active' AND lo.status = 'active' THEN 1 ELSE 0 END) AS active_owners,
      SUM(CASE WHEN o.status = 'inactive' OR lo.status = 'inactive' THEN 1 ELSE 0 END) AS inactive_owners,
      SUM(CASE WHEN lo.status = 'transferred' THEN 1 ELSE 0 END) AS transferred_owners
    FROM lot_owners lo
    INNER JOIN owners o ON lo.owner_id = o.id
    WHERE lo.lot_id = ?
  `;
  const [ownerRows] = await db.query(ownersSql, [lotId]);
  const ownerStats = ownerRows?.[0] || { total_owners: 0, active_owners: 0, inactive_owners: 0, transferred_owners: 0 };
  const totalOwners = parseInt(ownerStats.total_owners) || 0;
  const activeOwners = parseInt(ownerStats.active_owners) || 0;
  
  console.log(`Owner Stats:`, ownerStats);
  console.log(`Total Owners: ${totalOwners}, Active Owners: ${activeOwners}`);

  // 2) Land details (from lots)
  const landSql = `
    SELECT land_type, advance_tracing_no,
           preliminary_plan_extent_ha, preliminary_plan_extent_perch
    FROM lots WHERE id = ?
  `;
  const [landRows] = await db.query(landSql, [lotId]);
  const land = landRows?.[0] || {};
  
  console.log(`Land Details:`, land);

  // 3) Valuation (lot_valuations)
  const valuationSql = `
    SELECT id, total_value, assessment_date, status
    FROM lot_valuations
    WHERE lot_id = ? AND plan_id = ?
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 1
  `;
  console.log(`Executing valuation query with lotId=${lotId}, planId=${planId}`);
  const [valRows] = await db.query(valuationSql, [lotId, planId]);
  const valuation = valRows?.[0] || null;
  
  console.log(`Valuation Data:`, valuation);
  console.log(`Valuation rows found:`, valRows?.length || 0);

  // 4) Compensation (compensation_payment_details)
  const compSql = `
    SELECT 
      COUNT(*) AS total_records,
      SUM(CASE WHEN COALESCE(final_compensation_amount, 0) > 0 THEN 1 ELSE 0 END) AS with_amount,
      SUM(CASE WHEN (
        COALESCE(compensation_full_payment_paid_amount,0) +
        COALESCE(compensation_part_payment_01_paid_amount,0) +
        COALESCE(compensation_part_payment_02_paid_amount,0)
      ) > 0 THEN 1 ELSE 0 END) AS with_payments
    FROM compensation_payment_details
    WHERE plan_id = ? AND lot_id = ?
  `;
  console.log(`Executing compensation query with planId=${planId}, lotId=${lotId}`);
  const [compRows] = await db.query(compSql, [planId, lotId]);
  const compAgg = compRows?.[0] || { total_records: 0, with_amount: 0, with_payments: 0 };
  console.log(`Compensation rows found:`, compRows?.length || 0);
  
  console.log(`Compensation Data:`, compAgg);

  // Owner Details section - Use actual owner status from database
  const ownerMissing = [];
  let ownerCompleteness = 0;
  
  if (totalOwners === 0) {
    ownerMissing.push("At least one owner");
    ownerCompleteness = 0;
  } else {
    // If no owners are marked as active but owners exist, 
    // treat all existing owners as potentially active for backward compatibility
    if (activeOwners === 0 && totalOwners > 0) {
      console.log("WARNING: No active owners found, but owners exist. Treating as active for compatibility.");
      // For backward compatibility, treat all owners as active if none are marked active
      ownerCompleteness = 1;
      // Still add missing info about status
      ownerMissing.push(`${totalOwners} owner(s) need status verification (defaulting to active)`);
    } else {
      // Calculate completeness based on active owners vs total owners
      ownerCompleteness = activeOwners / totalOwners;
      
      if (activeOwners < totalOwners) {
        const inactiveCount = totalOwners - activeOwners;
        if (inactiveCount > 0) {
          ownerMissing.push(`${inactiveCount} owner(s) not active or transferred`);
        }
      }
    }
  }
  
  const ownerSection = {
    name: "Owner Details",
    status: sectionStatus(ownerCompleteness),
    completeness: ownerCompleteness,
    missing: ownerMissing,
    details: {
      total: totalOwners,
      active: activeOwners,
      inactive: parseInt(ownerStats.inactive_owners) || 0,
      transferred: parseInt(ownerStats.transferred_owners) || 0
    }
  };

  // Land Details section – require a small set of fields
  // Can only be started after Owner Details is complete
  const landMissing = [];
  let landCompleteness = 0;
  let landStatus = "not_started";
  
  // Use effective active owners (for backward compatibility)
  const effectiveActiveOwners = activeOwners === 0 && totalOwners > 0 ? totalOwners : activeOwners;
  
  if (effectiveActiveOwners === 0) {
    landMissing.push("Complete Owner Details first - need active owners");
    landCompleteness = 0;
    landStatus = "blocked";
  } else {
    // Owner Details have active owners, now check land fields
    const landFields = [];
    if (land.land_type) landFields.push("Land Type");
    if (land.advance_tracing_no) landFields.push("Survey/Advance Tracing No");
    if (land.preliminary_plan_extent_ha || land.preliminary_plan_extent_perch) {
      landFields.push("Preliminary Plan Extent");
    }
    
    // Additional optional fields for higher completion
    if (land.advance_tracing_extent_ha || land.advance_tracing_extent_perch) {
      landFields.push("Advance Tracing Extent");
    }
    
    const landTotalRequired = 3; // Minimum required fields
    const landFieldsPresent = landFields.length;
    
    if (landFieldsPresent === 0) {
      landMissing.push("Land Type", "Survey/Advance Tracing No", "Preliminary Plan Extent");
      landCompleteness = 0;
    } else {
      // Calculate missing fields
      if (!land.land_type) landMissing.push("Land Type");
      if (!land.advance_tracing_no) landMissing.push("Survey/Advance Tracing No");
      if (!land.preliminary_plan_extent_ha && !land.preliminary_plan_extent_perch) {
        landMissing.push("Preliminary Plan Extent");
      }
      
      landCompleteness = Math.min(1, landFieldsPresent / landTotalRequired);
    }
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
  
  if (effectiveActiveOwners === 0 || landCompleteness < 1) {
    if (effectiveActiveOwners === 0) valMissing.push("Need active owners in Owner Details");
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
  
  if (effectiveActiveOwners === 0 || landCompleteness < 1 || valCompleteness < 1) {
    if (effectiveActiveOwners === 0) compMissing.push("Need active owners in Owner Details");
    if (landCompleteness < 1) compMissing.push("Complete Land Details first");
    if (valCompleteness < 1) compMissing.push("Complete Valuation first");
    compCompleteness = 0;
    compStatus = "blocked";
    } else {
      // Previous sections complete, now check compensation
      if (effectiveActiveOwners === 0) {
        // No active owners yet; treat as not started and indicate dependency
        compMissing.push("No active owners for compensation");
        compCompleteness = 0;
      } else {
        const totalRecords = Number(compAgg.total_records || 0);
        const withAmount = Number(compAgg.with_amount || 0);
        const withPayments = Number(compAgg.with_payments || 0);
        
        if (totalRecords === 0) {
          // No compensation records created yet
          compMissing.push("Compensation records not created");
          compCompleteness = 0;
        } else if (withAmount === 0) {
          // Records exist but no amounts set
          compMissing.push("Final Compensation Amounts not set");
          compCompleteness = 0.2; // Give some credit for having records
        } else {
          // Calculate coverage based on effective active owners vs records with amounts
          const coverage = withAmount / effectiveActiveOwners;
          if (coverage >= 1) {
            // All active owners have compensation amounts
            compCompleteness = withPayments > 0 ? 1 : 0.8; // Full if payments made, 80% if just amounts set
          } else {
            // Partial coverage
            compMissing.push(`Compensation for ${effectiveActiveOwners - withAmount} more active owner(s)`);
            compCompleteness = Math.min(0.8, Math.max(coverage * 0.6, withPayments > 0 ? 0.3 : 0));
          }
        }
      }
      compStatus = sectionStatus(compCompleteness);
    }  const compensationSection = {
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
  
  // Owner Details: 0-25% (based on active owners ratio)
  cumulativeProgress += ownerCompleteness * 25;
  
  // Land Details: 25-50% (only if effective active owners exist)
  if (effectiveActiveOwners > 0) {
    cumulativeProgress += landCompleteness * 25;
  }
  
  // Valuation: 50-75% (only if land details complete and effective active owners exist)
  if (effectiveActiveOwners > 0 && landCompleteness === 1) {
    cumulativeProgress += valCompleteness * 25;
  }
  
  // Compensation: 75-100% (only if valuation complete and effective active owners exist)
  if (effectiveActiveOwners > 0 && landCompleteness === 1 && valCompleteness === 1) {
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
  
  console.log(`\n=== FINAL CALCULATION ===`);
  console.log(`Cumulative Progress: ${cumulativeProgress}`);
  console.log(`Overall Percent: ${overall}`);
  console.log(`Last Completed Section: ${lastCompletedSection}`);
  console.log(`Status Message: ${message}`);
  console.log(`Sections Status:`, sections.map(s => ({ name: s.name, status: s.status, completeness: s.completeness })));
  console.log(`=== END DEBUG ===\n`);

  return {
    plan_id: Number(planId),
    lot_id: Number(lotId),
    total_owners: totalOwners,
    active_owners: activeOwners,
    sections,
    overall_percent: overall,
    last_completed_section: lastCompletedSection,
    stopped_at: stoppedAt,
    status_message: message,
    // Useful aggregates for UI if needed
    aggregates: {
      owners: { 
        total: totalOwners,
        active: activeOwners,
        effective_active: effectiveActiveOwners,
        inactive: parseInt(ownerStats.inactive_owners) || 0,
        transferred: parseInt(ownerStats.transferred_owners) || 0
      },
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

// Get stage participation for all lots (for chart display)
async function getAllLotsStageParticipation(projectId = null, planId = null) {
  console.log('\n=== CALCULATING STAGE PARTICIPATION FOR FILTERED LOTS ===');
  console.log('Filters applied - projectId:', projectId, 'planId:', planId);
  
  // Build dynamic SQL with filters
  let lotsSql = `
    SELECT l.id, l.lot_no, l.plan_id, l.status,
           p.plan_identifier, p.project_id, pr.name as project_name
    FROM lots l
    LEFT JOIN plans p ON l.plan_id = p.id  
    LEFT JOIN projects pr ON p.project_id = pr.id
    WHERE l.status IN ('active', 'pending')
  `;
  
  const params = [];
  
  // Apply project filter
  if (projectId && projectId !== 'all') {
    lotsSql += ` AND pr.id = ?`;
    params.push(projectId);
  }
  
  // Apply plan filter  
  if (planId && planId !== 'all') {
    lotsSql += ` AND p.id = ?`;
    params.push(planId);
  }
  
  lotsSql += ` ORDER BY l.id`;
  
  console.log('Executing SQL:', lotsSql, 'with params:', params);
  const [allLots] = await db.query(lotsSql, params);
  
  console.log(`Found ${allLots.length} lots after filtering`);
  if (allLots.length > 0) {
    console.log('Sample lots:', allLots.slice(0, 3).map(lot => ({
      id: lot.id,
      lot_no: lot.lot_no,
      project_id: lot.project_id,
      plan_id: lot.plan_id,
      project_name: lot.project_name,
      plan_identifier: lot.plan_identifier
    })));
  }
  
  const stageParticipation = {
    'Owner Details': 0,
    'Land Details': 0, 
    'Valuation': 0,
    'Compensation': 0,
    'Completed': 0
  };
  
  for (const lot of allLots) {
    console.log(`\nProcessing Lot ${lot.lot_no} (ID: ${lot.id}, Plan: ${lot.plan_id})`);
    
    // 1. Owner Details - Check if lot has owners
    const [ownerRows] = await db.query(
      'SELECT COUNT(*) as count FROM lot_owners WHERE lot_id = ?', 
      [lot.id]
    );
    const hasOwners = ownerRows[0].count > 0;
    if (hasOwners) {
      stageParticipation['Owner Details']++;
      console.log(`  ✓ Has Owner Details`);
    }
    
    // 2. Land Details - Check if lot has land data
    const [landRows] = await db.query(
      'SELECT COUNT(*) as count FROM lots WHERE id = ? AND (advance_tracing_no IS NOT NULL OR preliminary_plan_extent_ha IS NOT NULL)', 
      [lot.id]
    );
    const hasLandDetails = landRows[0].count > 0;
    if (hasLandDetails) {
      stageParticipation['Land Details']++;
      console.log(`  ✓ Has Land Details`);
    }
    
    // 3. Valuation - Check if lot has valuation
    const [valuationRows] = await db.query(
      'SELECT COUNT(*) as count FROM lot_valuations WHERE lot_id = ? AND plan_id = ?', 
      [lot.id, lot.plan_id]
    );
    const hasValuation = valuationRows[0].count > 0;
    if (hasValuation) {
      stageParticipation['Valuation']++;
      console.log(`  ✓ Has Valuation`);
    }
    
    // 4. Compensation - Check if lot has compensation
    const [compensationRows] = await db.query(
      'SELECT COUNT(*) as count FROM compensation_payment_details WHERE lot_id = ? AND plan_id = ?', 
      [lot.id, lot.plan_id]
    );
    const hasCompensation = compensationRows[0].count > 0;
    if (hasCompensation) {
      stageParticipation['Compensation']++;
      console.log(`  ✓ Has Compensation`);
    }
    
    // 5. Completed - Check if lot is fully complete (has all stages)
    if (hasOwners && hasLandDetails && hasValuation && hasCompensation) {
      stageParticipation['Completed']++;
      console.log(`  ✓ Fully Completed`);
    }
  }
  
  console.log('\n=== FINAL STAGE PARTICIPATION COUNTS ===');
  console.log(stageParticipation);
  console.log('=== END STAGE PARTICIPATION ===\n');
  
  return stageParticipation;
}

module.exports = {
  getLotProgress,
  getPlanProgress,
  getPlanCreationProgress,
  getProjectCreationProgress,
  getProjectProgress,
  getAllLotsStageParticipation,
  SECTION_ORDER
};
