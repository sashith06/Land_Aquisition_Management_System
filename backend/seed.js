const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'lams'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Insert sample projects
  const projectsSql = `INSERT INTO projects (name, description, status, created_by, initial_estimated_cost, start_date) VALUES
    ('Colombo City Development Project', 'Urban development project in Colombo metropolitan area', 'approved', 1, 50000000.00, '2024-01-15'),
    ('Highway Expansion Project', 'Expansion of main highway connecting major cities', 'approved', 1, 75000000.00, '2024-02-01'),
    ('Rural Infrastructure Project', 'Infrastructure development in rural areas', 'approved', 1, 25000000.00, '2024-03-10')`;

  db.query(projectsSql, (err, result) => {
    if (err) {
      console.error('Error inserting projects:', err.message);
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('Projects already exist, skipping...');
      }
    } else {
      console.log('Sample projects inserted successfully');
    }

    // Insert sample plans
    const plansSql = `INSERT INTO plans (plan_number, project_id, description, location, total_extent, estimated_cost, status, created_by) VALUES
      ('PLAN-001', 1, 'Colombo North Development Plan', 'Colombo North', 50.25, 15000000.00, 'pending', 1),
      ('PLAN-002', 1, 'Colombo Central Development Plan', 'Colombo Central', 75.50, 22500000.00, 'in_progress', 1),
      ('PLAN-003', 2, 'Highway Section A Plan', 'Highway Section A', 100.00, 30000000.00, 'pending', 1),
      ('PLAN-004', 3, 'Rural Village A Plan', 'Village A', 25.75, 7500000.00, 'completed', 1)`;

    db.query(plansSql, (err, result) => {
      if (err) {
        console.error('Error inserting plans:', err.message);
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('Plans already exist, skipping...');
        }
      } else {
        console.log('Sample plans inserted successfully');
      }

      // Insert sample lots
      const lotsSql = `INSERT INTO lots (plan_id, lot_no, extent_ha, extent_perch, land_type, created_by) VALUES
        (1, 1, 5.25, 2075.00, 'Private', 1),
        (1, 2, 3.75, 1480.00, 'Private', 1),
        (2, 1, 10.50, 4145.00, 'State', 1),
        (3, 1, 15.00, 5920.00, 'Private', 1),
        (4, 1, 8.25, 3255.00, 'Private', 1)`;

      db.query(lotsSql, (err, result) => {
        if (err) {
          console.error('Error inserting lots:', err.message);
          if (err.code === 'ER_DUP_ENTRY') {
            console.log('Lots already exist, skipping...');
          }
        } else {
          console.log('Sample lots inserted successfully');
        }

        console.log('Sample data insertion completed!');
        db.end();
      });
    });
  });
});
