const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lams_complete_wampserver'
});

db.connect((err) => {
  if (err) {
    console.log('DB Error:', err);
    process.exit(1);
  }

  // Insert test project
  db.query(
    'INSERT INTO projects (name, advance_tracing_no, created_by, status) VALUES (?, ?, ?, ?)',
    ['Test Project for Advance Tracing', 'AT-2024-001', 1, 'approved'],
    (err, result) => {
      if (err) {
        console.log('Insert Error:', err);
        db.end();
        process.exit(1);
      }

      console.log('Test project inserted with ID:', result.insertId);

      // Select the project to verify
      db.query(
        'SELECT id, name, advance_tracing_no FROM projects WHERE id = ?',
        [result.insertId],
        (err2, results) => {
          if (err2) {
            console.log('Select Error:', err2);
          } else {
            console.log('Project data:', results[0]);
          }
          db.end();
        }
      );
    }
  );
});
