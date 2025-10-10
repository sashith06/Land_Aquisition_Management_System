-- Compensation Payment Details Table
-- This table stores all payment information for compensation and interest payments
-- 
-- RELATIONSHIPS:
-- - plan_id references plans.id (from your existing plans table)
-- - lot_id references lots.id (from your existing lots table)  
-- - owner_nic references the landowner's NIC (from landowner records)
--
-- DATA FLOW:
-- Project -> Plan -> Lot -> Owner -> Payment Details

DROP TABLE IF EXISTS compensation_payment_details;
CREATE TABLE compensation_payment_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL REFERENCES plans(id),
    lot_id INT NOT NULL REFERENCES lots(id),
    owner_nic VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    
    -- Compensation Payment Details
    compensation_full_payment_date DATE NULL,
    compensation_full_payment_cheque_no VARCHAR(6) NULL,
    compensation_full_payment_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    compensation_full_payment_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    compensation_part_payment_01_date DATE NULL,
    compensation_part_payment_01_cheque_no VARCHAR(6) NULL,
    compensation_part_payment_01_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    compensation_part_payment_01_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    compensation_part_payment_02_date DATE NULL,
    compensation_part_payment_02_cheque_no VARCHAR(6) NULL,
    compensation_part_payment_02_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    compensation_part_payment_02_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    -- Interest Payment Details
    interest_full_payment_date DATE NULL,
    interest_full_payment_cheque_no VARCHAR(6) NULL,
    interest_full_payment_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    interest_full_payment_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    interest_part_payment_01_date DATE NULL,
    interest_part_payment_01_cheque_no VARCHAR(6) NULL,
    interest_part_payment_01_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    interest_part_payment_01_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    interest_part_payment_02_date DATE NULL,
    interest_part_payment_02_cheque_no VARCHAR(6) NULL,
    interest_part_payment_02_deducted_amount DECIMAL(15,2) DEFAULT 0.00,
    interest_part_payment_02_paid_amount DECIMAL(15,2) DEFAULT 0.00,
    
    -- Account Division Details
    account_division_sent_date DATE NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    updated_by VARCHAR(50) NULL,
    
    -- Foreign Keys
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_plan_lot_nic (plan_id, lot_id, owner_nic),
    INDEX idx_owner_nic (owner_nic),
    INDEX idx_plan_id (plan_id),
    INDEX idx_lot_id (lot_id),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint to prevent duplicate records
    UNIQUE KEY unique_payment_record (plan_id, lot_id, owner_nic)
);

-- Sample INSERT query (for reference)
/*
INSERT INTO compensation_payment_details (
    plan_id, lot_id, owner_nic, owner_name,
    compensation_full_payment_date, compensation_full_payment_cheque_no, 
    compensation_full_payment_deducted_amount, compensation_full_payment_paid_amount,
    created_by
) VALUES (
    'PLAN001', 'LOT001', '123456789V', 'John Doe',
    '2024-10-09', '123456', 5000.00, 45000.00,
    'financial_officer'
);
*/

-- Sample SELECT queries (for reference)
/*
-- Get all payment details for a specific owner
SELECT * FROM compensation_payment_details 
WHERE plan_id = 'PLAN001' AND lot_id = 'LOT001' AND owner_nic = '123456789V';

-- Get all payments for a specific plan
SELECT * FROM compensation_payment_details 
WHERE plan_id = 'PLAN001' 
ORDER BY lot_id, owner_name;

-- Get summary of all payments
SELECT 
    plan_id,
    lot_id,
    COUNT(*) as total_owners,
    SUM(compensation_full_payment_paid_amount + 
        compensation_part_payment_01_paid_amount + 
        compensation_part_payment_02_paid_amount) as total_compensation_paid,
    SUM(interest_full_payment_paid_amount + 
        interest_part_payment_01_paid_amount + 
        interest_part_payment_02_paid_amount) as total_interest_paid
FROM compensation_payment_details 
GROUP BY plan_id, lot_id;
*/