require('dotenv').config();
const db = require('./config/db');

console.log('Creating land_valuations table...\n');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS land_valuations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  valuation_data JSON NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  calculated_by INT NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (calculated_by) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_project_id (project_id),
  INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(createTableSQL, (err, result) => {
  if (err) {
    console.error('❌ Error creating table:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Table land_valuations created successfully!');
  console.log('');
  console.log('Features enabled:');
  console.log('  • Valuations are now stored in database');
  console.log('  • Subsequent requests will use cached results');
  console.log('  • Add ?recalculate=true to force new calculation');
  console.log('');
  console.log('You can now restart your backend server.');
  
  process.exit(0);
});
