-- Add system configuration table for interest rates
-- This allows different rates for different projects or time periods

USE land_acqusition;

-- Create system configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default interest rate configuration
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('default_interest_rate', '0.07', 'Default annual interest rate for compensation calculations (7%)')
ON DUPLICATE KEY UPDATE 
config_value = VALUES(config_value),
description = VALUES(description),
updated_at = CURRENT_TIMESTAMP;

-- Optional: Project-specific interest rates
INSERT INTO system_config (config_key, config_value, description) 
VALUES ('project_1_interest_rate', '0.06', 'Interest rate for Project 1 (6%)')
ON DUPLICATE KEY UPDATE 
config_value = VALUES(config_value),
description = VALUES(description),
updated_at = CURRENT_TIMESTAMP;

-- View current configuration
SELECT * FROM system_config WHERE config_key LIKE '%interest_rate%';