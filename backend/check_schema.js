const db = require('./config/db');

db.query('DESCRIBE projects', (err, results) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Projects table schema:');
  results.forEach(row => {
    console.log(`- ${row.Field} (${row.Type})`);
  });
  process.exit(0);
});
