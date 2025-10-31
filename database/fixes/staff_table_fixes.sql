-- Fix BIGINT syntax errors in staff_attendance table
ALTER TABLE staff_attendance 
MODIFY COLUMN staff_id BIGINT NOT NULL;

-- Fix fee_payments table syntax errors  
ALTER TABLE fee_payments
MODIFY COLUMN student_id BIGINT NOT NULL,
MODIFY COLUMN term_id BIGINT NOT NULL;

-- Add missing department_id column to staff table if it doesn't exist
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS department_id BIGINT DEFAULT NULL AFTER staff_no;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department_id, status);
