const mysql = require('mysql2/promise');
const dbConfig = require('./config/db');

async function checkDates() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        id, plan_id, lot_id, owner_nic,
        compensation_full_payment_date,
        compensation_part_payment_02_date,
        interest_full_payment_date,
        interest_part_payment_01_date,
        interest_part_payment_02_date,
        account_division_sent_date
      FROM compensation_payment_details 
      WHERE plan_id = 4 AND lot_id = 4
    `);
    
    console.log('=== Current Date Values in Database ===');
    if (rows.length > 0) {
      rows.forEach(row => {
        console.log(`Record ID: ${row.id}`);
        console.log(`Owner NIC: ${row.owner_nic}`);
        console.log(`Compensation Full Payment Date: ${row.compensation_full_payment_date}`);
        console.log(`Compensation Part Payment 02 Date: ${row.compensation_part_payment_02_date}`);
        console.log(`Interest Full Payment Date: ${row.interest_full_payment_date}`);
        console.log(`Interest Part Payment 01 Date: ${row.interest_part_payment_01_date}`);
        console.log(`Interest Part Payment 02 Date: ${row.interest_part_payment_02_date}`);
        console.log(`Account Division Sent Date: ${row.account_division_sent_date}`);
        console.log('---');
      });
    } else {
      console.log('No records found for Plan 4, Lot 4');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkDates();