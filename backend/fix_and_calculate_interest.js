const db = require('./config/db');
const { calculateInterestAmount } = require('./services/progressService');

console.log('=== FIXING PLAN 8039 - SETTING GAZETTE DATE & CALCULATING INTEREST ===\n');

// Example gazette date - CHANGE THIS to your actual gazette date!
const GAZETTE_DATE = '2024-01-15'; // Format: YYYY-MM-DD
const TODAY = new Date().toISOString().split('T')[0];
const INTEREST_RATE = 0.07; // 7%

console.log(`📅 Using Gazette Date: ${GAZETTE_DATE}`);
console.log(`📅 Calculating Interest Until: ${TODAY}`);
console.log(`💰 Interest Rate: ${(INTEREST_RATE * 100)}%\n`);

// Step 1: Update gazette_date for all records in Plan 8039
const updateGazetteDateQuery = `
  UPDATE compensation_payment_details 
  SET gazette_date = ?
  WHERE plan_id = (SELECT id FROM plans WHERE plan_identifier = '8039')
    AND final_compensation_amount > 0
`;

db.query(updateGazetteDateQuery, [GAZETTE_DATE], (err, updateResult) => {
  if (err) {
    console.error('❌ Error updating gazette date:', err);
    process.exit(1);
  }

  console.log(`✅ Updated gazette_date for ${updateResult.affectedRows} record(s)\n`);

  // Step 2: Get all records and calculate interest
  const getRecordsQuery = `
    SELECT 
      cpd.plan_id,
      cpd.lot_id,
      cpd.owner_nic,
      cpd.owner_name,
      l.lot_no,
      cpd.final_compensation_amount,
      cpd.gazette_date
    FROM compensation_payment_details cpd
    JOIN lots l ON cpd.lot_id = l.id
    WHERE cpd.plan_id = (SELECT id FROM plans WHERE plan_identifier = '8039')
      AND cpd.final_compensation_amount > 0
    ORDER BY l.lot_no, cpd.owner_name
  `;

  db.query(getRecordsQuery, (err, records) => {
    if (err) {
      console.error('❌ Error fetching records:', err);
      process.exit(1);
    }

    console.log('🧮 CALCULATING INTEREST FOR EACH OWNER:\n');
    console.log('='.repeat(70));

    let completed = 0;
    const total = records.length;

    records.forEach((record, index) => {
      // Calculate interest
      const interestAmount = calculateInterestAmount(
        parseFloat(record.final_compensation_amount),
        record.gazette_date,
        TODAY,
        INTEREST_RATE
      );

      const daysBetween = Math.ceil(
        (new Date(TODAY) - new Date(record.gazette_date)) / (1000 * 60 * 60 * 24)
      );

      console.log(`\n${index + 1}. ${record.owner_name} (${record.owner_nic})`);
      console.log(`   Lot: ${record.lot_no}`);
      console.log(`   Compensation: Rs. ${parseFloat(record.final_compensation_amount).toLocaleString()}`);
      console.log(`   Days: ${daysBetween} (${record.gazette_date} to ${TODAY})`);
      console.log(`   Calculated Interest: Rs. ${parseFloat(interestAmount).toLocaleString()}`);

      // Update the record with calculated interest
      const updateInterestQuery = `
        UPDATE compensation_payment_details 
        SET 
          calculated_interest_amount = ?,
          interest_calculation_date = ?,
          interest_to_be_paid = ?
        WHERE plan_id = ? 
          AND lot_id = ? 
          AND owner_nic = ?
      `;

      db.query(
        updateInterestQuery,
        [interestAmount, TODAY, interestAmount, record.plan_id, record.lot_id, record.owner_nic],
        (err, result) => {
          if (err) {
            console.error(`   ❌ Error updating interest for ${record.owner_name}:`, err);
          } else {
            console.log(`   ✅ Interest saved to database`);
          }

          completed++;

          // When all records are processed
          if (completed === total) {
            console.log('\n' + '='.repeat(70));
            console.log('\n✅ ALL DONE! Interest calculated for all owners.');
            console.log('\n📊 NOW CHECK YOUR REPORT - The interest values will appear!\n');
            console.log('🔄 Refresh your financial progress report to see:');
            console.log('   • Interest to be Paid: Updated with calculated amounts');
            console.log('   • Interest Paid: Still Rs. 0 (until payments are made)\n');
            
            db.end();
          }
        }
      );
    });

    if (total === 0) {
      console.log('\n⚠️  No records found to calculate interest.\n');
      db.end();
    }
  });
});
