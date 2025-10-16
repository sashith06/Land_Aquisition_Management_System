const mysql = require('mysql2');
require('dotenv').config();

// Create promise-based connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

console.log('=== DEBUGGING REPORT DATA ISSUE ===\n');

async function debugReportData() {
  try {
    const planId = '8039'; // Plan identifier from your image
    
    // First, let's get the actual plan_id from plan_identifier
    console.log('🔍 Step 1: Finding plan ID from identifier...');
    const planIdQuery = `SELECT id, plan_identifier FROM plans WHERE plan_identifier = ?`;
    const [planResult] = await db.query(planIdQuery, [planId]);
    
    if (planResult.length === 0) {
      console.log('❌ No plan found with identifier:', planId);
      return;
    }
    
    const actualPlanId = planResult[0].id;
    console.log(`✅ Found plan: ${planResult[0].plan_identifier} (ID: ${actualPlanId})\n`);
    
    // Step 2: Check what lots exist for this plan
    console.log('🔍 Step 2: Checking lots for this plan...');
    const lotsQuery = `SELECT id, lot_no FROM lots WHERE plan_id = ? ORDER BY lot_no`;
    const [lots] = await db.query(lotsQuery, [actualPlanId]);
    
    console.log(`📊 Found ${lots.length} lots:`);
    lots.forEach(lot => {
      console.log(`   - Lot ${lot.lot_no} (ID: ${lot.id})`);
    });
    console.log();
    
    // Step 3: Check compensation payment details
    console.log('🔍 Step 3: Checking compensation payment details...');
    const compensationQuery = `
      SELECT 
        cpd.plan_id,
        cpd.lot_id,
        l.lot_no,
        cpd.owner_nic,
        cpd.owner_name,
        cpd.final_compensation_amount,
        cpd.calculated_interest_amount,
        cpd.compensation_full_payment_paid_amount,
        cpd.compensation_part_payment_01_paid_amount,
        cpd.compensation_part_payment_02_paid_amount,
        cpd.interest_full_payment_paid_amount,
        cpd.interest_part_payment_01_paid_amount,
        cpd.interest_part_payment_02_paid_amount
      FROM compensation_payment_details cpd
      JOIN lots l ON cpd.lot_id = l.id
      WHERE cpd.plan_id = ?
      ORDER BY l.lot_no, cpd.owner_name
    `;
    
    const [compensationData] = await db.query(compensationQuery, [actualPlanId]);
    
    if (compensationData.length === 0) {
      console.log('❌ No compensation payment details found!');
      console.log('💡 This explains why report shows zeros.');
      console.log('📝 Make sure you are saving compensation data with the correct plan_id and lot_id.');
      return;
    }
    
    console.log(`📊 Found ${compensationData.length} compensation records:`);
    compensationData.forEach(record => {
      console.log(`\n   📍 Lot ${record.lot_no} - ${record.owner_name} (${record.owner_nic})`);
      console.log(`      Final Compensation: Rs. ${parseFloat(record.final_compensation_amount || 0).toLocaleString()}`);
      console.log(`      Calculated Interest: Rs. ${parseFloat(record.calculated_interest_amount || 0).toLocaleString()}`);
      
      const totalCompPaid = (parseFloat(record.compensation_full_payment_paid_amount || 0) + 
                            parseFloat(record.compensation_part_payment_01_paid_amount || 0) + 
                            parseFloat(record.compensation_part_payment_02_paid_amount || 0));
      console.log(`      Total Compensation Paid: Rs. ${totalCompPaid.toLocaleString()}`);
      
      const totalInterestPaid = (parseFloat(record.interest_full_payment_paid_amount || 0) + 
                                parseFloat(record.interest_part_payment_01_paid_amount || 0) + 
                                parseFloat(record.interest_part_payment_02_paid_amount || 0));
      console.log(`      Total Interest Paid: Rs. ${totalInterestPaid.toLocaleString()}`);
    });
    console.log();
    
    // Step 4: Test the exact SQL query used by the report
    console.log('🔍 Step 4: Testing the actual report SQL query...');
    const reportSql = `
      SELECT 
        p.name as project_name,
        pl.plan_identifier as plan_name,
        p.name as name_of_road,
        l.lot_no as lot_number,
        l.id as lot_id,
        COALESCE(cpd.final_compensation_amount, 0) as full_compensation,
        COALESCE(
          cpd.compensation_full_payment_paid_amount +
          cpd.compensation_part_payment_01_paid_amount +
          cpd.compensation_part_payment_02_paid_amount, 0
        ) as payment_done,
        COALESCE(cpd.final_compensation_amount, 0) - COALESCE(
          cpd.compensation_full_payment_paid_amount +
          cpd.compensation_part_payment_01_paid_amount +
          cpd.compensation_part_payment_02_paid_amount, 0
        ) as balance_due,
        COALESCE(cpd.calculated_interest_amount, 0) as interest_7_percent,
        COALESCE(
          cpd.interest_full_payment_paid_amount +
          cpd.interest_part_payment_01_paid_amount +
          cpd.interest_part_payment_02_paid_amount, 0
        ) as interest_paid
      FROM plans pl
      JOIN projects p ON pl.project_id = p.id
      JOIN lots l ON l.plan_id = pl.id
      LEFT JOIN compensation_payment_details cpd ON cpd.plan_id = pl.id AND cpd.lot_id = l.id
      WHERE pl.id = ?
      ORDER BY l.lot_no ASC
    `;
    
    const [reportData] = await db.query(reportSql, [actualPlanId]);
    
    console.log(`📊 Report SQL returned ${reportData.length} rows:`);
    reportData.forEach(row => {
      console.log(`\n   📄 ${row.name_of_road} - Plan ${row.plan_name} - Lot ${row.lot_number}`);
      console.log(`      Full Compensation: Rs. ${parseFloat(row.full_compensation).toLocaleString()}`);
      console.log(`      Payment Done: Rs. ${parseFloat(row.payment_done).toLocaleString()}`);
      console.log(`      Balance Due: Rs. ${parseFloat(row.balance_due).toLocaleString()}`);
      console.log(`      Interest to be Paid: Rs. ${parseFloat(row.interest_7_percent).toLocaleString()}`);
      console.log(`      Interest Paid: Rs. ${parseFloat(row.interest_paid).toLocaleString()}`);
    });
    
    // Step 5: Check for data aggregation issues
    console.log('\n🔍 Step 5: Analyzing potential issues...');
    
    if (compensationData.length > reportData.length) {
      console.log('⚠️  ISSUE FOUND: Multiple owners per lot detected!');
      console.log('   The current report query returns one row per lot, but you have multiple owners.');
      console.log('   This might cause data aggregation issues.');
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Aggregate compensation by lot (sum all owners)');
      console.log('   2. Show owner-by-owner breakdown');
      console.log('   3. Use GROUP BY to sum compensation per lot');
    }
    
    // Check for NULL values that might be causing issues
    const nullChecks = compensationData.filter(record => 
      !record.final_compensation_amount && 
      !record.calculated_interest_amount &&
      !record.compensation_full_payment_paid_amount &&
      !record.interest_full_payment_paid_amount
    );
    
    if (nullChecks.length > 0) {
      console.log('⚠️  ISSUE FOUND: Some records have all NULL values');
      console.log(`   ${nullChecks.length} records are completely empty`);
    }
    
    console.log('\n✅ Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    process.exit(0);
  }
}

debugReportData();