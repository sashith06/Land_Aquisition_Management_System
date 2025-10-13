-- Add interest_to_be_paid field to compensation_payment_details table
-- This field will store the calculated interest amount using the formula:
-- (Final Compensation Amount × 7% annual rate × Days Since Gazette) ÷ 365 days

ALTER TABLE compensation_payment_details 
ADD COLUMN interest_to_be_paid DECIMAL(15,2) DEFAULT 0.00 
COMMENT 'Calculated interest amount using (Final Compensation × 7% × Days Since Gazette) ÷ 365 days';

-- Add index for better query performance
CREATE INDEX idx_interest_to_be_paid ON compensation_payment_details(interest_to_be_paid);

-- Add gazette_date field if it doesn't exist (needed for calculation)
ALTER TABLE compensation_payment_details 
ADD COLUMN gazette_date DATE NULL 
COMMENT 'Section 38 Gazette Date for interest calculation';

-- Add index for gazette_date
CREATE INDEX idx_gazette_date ON compensation_payment_details(gazette_date);