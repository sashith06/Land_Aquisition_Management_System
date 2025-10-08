-- Land Valuation Tables
-- This table is optional - it stores valuation calculation history for reference
-- Run this SQL in your database to enable valuation history tracking

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

-- Add a unique constraint to prevent duplicate valuations at the same time
-- Comment this out if you want to allow multiple valuations per project
-- ALTER TABLE land_valuations ADD UNIQUE KEY unique_project_valuation (project_id, calculated_at);
