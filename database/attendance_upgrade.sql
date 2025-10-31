-- Upgrade student_attendance table to support hybrid tracking
ALTER TABLE student_attendance 
-- ADD COLUMN method VARCHAR(20) DEFAULT 'manual' AFTER status,
ADD COLUMN marked_by BIGINT DEFAULT NULL AFTER method,
ADD COLUMN marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER marked_by,
ADD UNIQUE KEY unique_student_date (student_id, date);

-- Update status values to be more specific
ALTER TABLE student_attendance 
MODIFY COLUMN status ENUM('present', 'absent', 'late', 'excused', 'not_marked') DEFAULT 'not_marked';

-- Create student_fingerprints table for biometric data
CREATE TABLE IF NOT EXISTS student_fingerprints (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL UNIQUE,
  method VARCHAR(50) NOT NULL DEFAULT 'passkey',
  credential_id VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at VARCHAR DEFAULT NULL,
  INDEX idx_student (student_id),
  INDEX idx_credential (credential_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
