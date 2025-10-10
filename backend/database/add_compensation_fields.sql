-- Add only essential fields that frontend actually uses

ALTER TABLE compensation_payment_details 
ADD COLUMN final_compensation_amount DECIMAL(15,2) DEFAULT 0.00 AFTER owner_name,
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending' AFTER final_compensation_amount;