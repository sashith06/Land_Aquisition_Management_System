-- Add new fields for enhanced compensation progress tracking
-- Date: October 12, 2025

USE land_acqusition;

-- Add new fields to compensation_payment_details table
ALTER TABLE compensation_payment_details 
ADD COLUMN IF NOT EXISTS final_compensation_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Total compensation amount for this owner',
ADD COLUMN IF NOT EXISTS calculated_interest_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Calculated interest amount',
ADD COLUMN IF NOT EXISTS total_paid_interest DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Total interest paid (sum of all interest payments)',
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Remaining balance to be paid',
ADD COLUMN IF NOT EXISTS interest_calculation_date DATE NULL COMMENT 'Date when interest was calculated',
ADD COLUMN IF NOT EXISTS send_account_division_date DATE NULL COMMENT 'Date when account division was sent (required for completion)',
ADD COLUMN IF NOT EXISTS completion_status ENUM('pending', 'partial', 'complete') DEFAULT 'pending' COMMENT 'Overall completion status';

-- Update existing records to calculate total_paid_interest
UPDATE compensation_payment_details SET 
total_paid_interest = COALESCE(interest_full_payment_paid_amount, 0) + 
                     COALESCE(interest_part_payment_01_paid_amount, 0) + 
                     COALESCE(interest_part_payment_02_paid_amount, 0);

-- Create a view for easy progress tracking
CREATE OR REPLACE VIEW compensation_progress_view AS
SELECT 
    plan_id,
    lot_id,
    owner_nic,
    owner_name,
    final_compensation_amount,
    calculated_interest_amount,
    total_paid_interest,
    balance_due,
    send_account_division_date,
    CASE 
        WHEN balance_due = 0 AND 
             total_paid_interest = calculated_interest_amount AND 
             send_account_division_date IS NOT NULL 
        THEN 'complete'
        WHEN final_compensation_amount > 0 OR total_paid_interest > 0 
        THEN 'partial'
        ELSE 'pending'
    END as auto_completion_status,
    created_at,
    updated_at
FROM compensation_payment_details;

-- Add index for better performance on new fields (after columns are added)
-- Note: Using ALTER TABLE ADD INDEX since CREATE INDEX IF NOT EXISTS is not supported in older MySQL versions
ALTER TABLE compensation_payment_details ADD INDEX idx_balance_due (balance_due);
ALTER TABLE compensation_payment_details ADD INDEX idx_completion_status (completion_status);
ALTER TABLE compensation_payment_details ADD INDEX idx_send_account_division_date (send_account_division_date);

-- Sample query to check progress
/*
SELECT 
    plan_id,
    lot_id,
    COUNT(*) as total_owners,
    SUM(CASE WHEN auto_completion_status = 'complete' THEN 1 ELSE 0 END) as completed_owners,
    SUM(CASE WHEN auto_completion_status = 'partial' THEN 1 ELSE 0 END) as partial_owners,
    ROUND(
        (SUM(CASE WHEN auto_completion_status = 'complete' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
        2
    ) as completion_percentage
FROM compensation_progress_view
GROUP BY plan_id, lot_id;
*/