require("dotenv").config();
const mysql = require("mysql2/promise");

// Create promise-based connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function insertSampleData() {
  try {
    console.log("Inserting sample data...");

    // Insert sample landowners
    const landowners = [
      ['John Doe', '123456789012', '+94771234567', '123 Main Street, Colombo', 'Individual', 'active', 1],
      ['Jane Smith', '987654321098', '+94776543210', '456 Oak Avenue, Kandy', 'Individual', 'active', 1],
      ['Robert Johnson', '456789123045', '+94779876543', '789 Pine Road, Galle', 'Individual', 'active', 1]
    ];

    for (const landowner of landowners) {
      await db.query(
        'INSERT INTO owners (name, nic, mobile, address, owner_type, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        landowner
      );
    }
    console.log("✓ Landowners inserted");

    // Insert sample project
    const project = ['Diyagama - Walgama Road Project', 'Road development project in Diyagama area', 'in_progress', 1, 50000000.00, 25.5, '2024-01-01'];
    const [projectResult] = await db.query(
      'INSERT INTO projects (name, description, status, created_by, initial_estimated_cost, initial_extent_ha, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      project
    );
    const projectId = projectResult.insertId;
    console.log("✓ Project inserted");

    // Insert sample plan
    const plan = ['8890', projectId, 'Plan for Diyagama - Walgama area', 'Diyagama, Walgama', 25.5, 50000000.00, 'in_progress', 1];
    const [planResult] = await db.query(
      'INSERT INTO plans (plan_identifier, project_id, description, location, total_extent, estimated_cost, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      plan
    );
    const planId = planResult.insertId;
    console.log("✓ Plan inserted");

    // Insert sample lots
    const lots = [
      [planId, 4, 2.5, 15.0, 'Private', 'active', 1],
      [planId, 5, 3.0, 20.0, 'Private', 'active', 1],
      [planId, 6, 1.8, 12.0, 'Private', 'active', 1]
    ];

    const lotIds = [];
    for (const lot of lots) {
      const [lotResult] = await db.query(
        'INSERT INTO lots (plan_id, lot_no, extent_ha, extent_perch, land_type, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        lot
      );
      lotIds.push(lotResult.insertId);
    }
    console.log("✓ Lots inserted");

    // Link landowners to lots
    const lotOwners = [
      [lotIds[0], 1, planId, 100.00, 'active', 1],  // John Doe owns Lot 4
      [lotIds[1], 1, planId, 60.00, 'active', 1],   // John Doe owns 60% of Lot 5
      [lotIds[1], 2, planId, 40.00, 'active', 1],   // Jane Smith owns 40% of Lot 5
      [lotIds[2], 3, planId, 100.00, 'active', 1]   // Robert Johnson owns Lot 6
    ];

    for (const lotOwner of lotOwners) {
      await db.query(
        'INSERT INTO lot_owners (lot_id, owner_id, plan_id, ownership_percentage, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        lotOwner
      );
    }
    console.log("✓ Lot owners linked");

    // Insert sample valuations
    const valuations = [
      [lotIds[0], planId, 800000.00, 400000.00, 1200000.00, '2024-06-01', 'approved', 1],
      [lotIds[1], planId, 900000.00, 600000.00, 1500000.00, '2024-06-01', 'approved', 1],
      [lotIds[2], planId, 600000.00, 300000.00, 900000.00, '2024-06-01', 'approved', 1]
    ];

    for (const valuation of valuations) {
      await db.query(
        'INSERT INTO lot_valuations (lot_id, plan_id, statutorily_amount, addition_amount, total_value, assessment_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        valuation
      );
    }
    console.log("✓ Valuations inserted");

    // Insert sample compensations
    const compensations = [
      [lotIds[0], planId, 1200000.00, 'completed', 1],
      [lotIds[1], planId, 1500000.00, 'in_progress', 1],
      [lotIds[2], planId, 900000.00, 'pending', 1]
    ];

    for (const compensation of compensations) {
      await db.query(
        'INSERT INTO lot_compensations (lot_id, plan_id, total_compensation, status, created_by) VALUES (?, ?, ?, ?, ?)',
        compensation
      );
    }
    console.log("✓ Compensations inserted");

    console.log("\n🎉 Sample data inserted successfully!");
    console.log("\nTest landowners:");
    console.log("- John Doe: NIC=123456789012, Mobile=+94771234567");
    console.log("- Jane Smith: NIC=987654321098, Mobile=+94776543210");
    console.log("- Robert Johnson: NIC=456789123045, Mobile=+94779876543");

  } catch (error) {
    console.error("Error inserting sample data:", error);
  } finally {
    process.exit();
  }
}

insertSampleData();