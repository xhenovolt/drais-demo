-- Feature Flags and Enhanced Notifications System
-- Version: 1.0.0
-- Date: 2024-12-20

-- Enhanced notifications table (building on existing)
-- Add DRAIS notifications system tables if they don't exist
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id BIGINT DEFAULT NULL,
  actor_user_id BIGINT DEFAULT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(50) DEFAULT NULL,
  entity_id BIGINT DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  message TEXT DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  priority ENUM('low','normal','high','critical') DEFAULT 'normal',
  channel VARCHAR(50) DEFAULT 'in_app',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_count INT DEFAULT 0,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_notifications_school_created (school_id, created_at),
  INDEX idx_notifications_actor (actor_user_id),
  INDEX idx_notifications_action (action),
  INDEX idx_notifications_entity (entity_type, entity_id),
  INDEX idx_notifications_priority (priority, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Core notifications storage';

-- Feature flags table for managing new features
CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  school_id BIGINT DEFAULT NULL,
  route_name VARCHAR(255) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  is_new BOOLEAN DEFAULT FALSE,
  is_enabled BOOLEAN DEFAULT TRUE,
  version_tag VARCHAR(50) DEFAULT 'v_current',
  category VARCHAR(100) DEFAULT 'general',
  priority INT DEFAULT 0,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_school_route (school_id, route_name),
  INDEX idx_feature_flags_new (is_new, is_enabled),
  INDEX idx_feature_flags_school (school_id, is_enabled),
  INDEX idx_feature_flags_expires (expires_at),
  INDEX idx_feature_flags_category (category, is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Feature flags for new functionality';

-- User feature interactions tracking
CREATE TABLE IF NOT EXISTS user_feature_interactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  feature_flag_id BIGINT NOT NULL,
  interaction_type ENUM('viewed','clicked','dismissed') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_features (user_id, feature_flag_id),
  INDEX idx_feature_interactions (feature_flag_id, interaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Track user interactions with new features';

-- Insert current DRAIS feature flags for new/updated modules
INSERT INTO feature_flags (
  school_id, route_name, route_path, label, description, is_new, category, priority, expires_at
) VALUES
-- Students module features
(NULL, 'students-list', '/students/list', 'Student List', 'Enhanced student list with fingerprint support and advanced filtering', TRUE, 'students', 10, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'students-attendance', '/attendance', 'Student Attendance', 'New comprehensive attendance tracking system', TRUE, 'students', 9, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'students-requirements', '/students/requirements', 'Requirements', 'Track and manage student requirements per term', TRUE, 'students', 8, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'students-contacts', '/students/contacts', 'Contacts', 'Manage guardian and family contact information', TRUE, 'students', 7, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'students-documents', '/students/documents', 'Documents', 'Upload and manage student documents', TRUE, 'students', 6, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'students-history', '/students/history', 'Academic History', 'View comprehensive academic performance records', TRUE, 'students', 5, DATE_ADD(NOW(), INTERVAL 14 DAY)),

-- Staff module features
(NULL, 'staff-overview', '/staff', 'Staff Overview', 'New comprehensive staff dashboard with analytics', TRUE, 'staff', 10, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'staff-list', '/staff/list', 'Staff List', 'Enhanced staff management with new capabilities', TRUE, 'staff', 9, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'staff-add', '/staff/add', 'Add Staff', 'Streamlined staff onboarding process', TRUE, 'staff', 8, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'staff-attendance', '/staff/attendance', 'Staff Attendance', 'New staff attendance tracking system', TRUE, 'staff', 7, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'departments', '/departments', 'Departments', 'Manage school departments and hierarchies', TRUE, 'staff', 6, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'workplans', '/work-plans', 'Work Plans', 'Create and track departmental work plans', TRUE, 'staff', 5, DATE_ADD(NOW(), INTERVAL 14 DAY)),

-- Tahfiz module (existing but enhanced)
(NULL, 'tahfiz-overview', '/tahfiz', 'Tahfiz System', 'Complete Quranic memorization tracking system', TRUE, 'academics', 10, DATE_ADD(NOW(), INTERVAL 14 DAY)),
(NULL, 'notifications-system', '/notifications', 'Notifications', 'New real-time notification system', TRUE, 'system', 10, DATE_ADD(NOW(), INTERVAL 14 DAY))

ON DUPLICATE KEY UPDATE 
  is_new = VALUES(is_new),
  expires_at = VALUES(expires_at),
  updated_at = CURRENT_TIMESTAMP;

-- Insert system notification about new features
INSERT INTO notifications (
  school_id, action, entity_type, title, message, priority, metadata
) VALUES
(NULL, 'system_update', 'system', 'New DRAIS Update Available!', 
 'Exciting new modules and features have been added to DRAIS! 🎉\n\nNew Features:\n• Enhanced Student List with fingerprint support\n• Complete Student Attendance system\n• Requirements tracking\n• Contact management\n• Document management\n• Academic History tracking\n• Staff Overview dashboard\n• Enhanced Staff management\n• Department management\n• Work Plans system\n• Real-time notifications\n\nLook for the NEW badges in the sidebar to explore these features!', 
 'normal',
 JSON_OBJECT(
   'version', 'v2.1.0',
   'features_count', 12,
   'categories', JSON_ARRAY('students', 'staff', 'academics', 'system'),
   'link', '/dashboard',
   'dismissible', true,
   'auto_read_after', 3600
 )
);

-- Create scheduled cleanup procedure for expired feature flags
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupExpiredFeatureFlags()
BEGIN
  UPDATE feature_flags 
  SET is_new = FALSE, updated_at = CURRENT_TIMESTAMP
  WHERE expires_at IS NOT NULL 
    AND expires_at <= NOW() 
    AND is_new = TRUE;
    
  INSERT INTO audit_log (action, entity_type, changes_json) 
  SELECT 'feature_flag_expired', 'feature_flag', 
         JSON_OBJECT('expired_count', ROW_COUNT(), 'cleanup_date', NOW());
END //
DELIMITER ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(school_id, created_at DESC);

-- Migration log
INSERT INTO audit_log (action, entity_type, entity_id, changes_json) VALUES
('feature_flags_system_installed', 'system', 1, JSON_OBJECT(
  'tables_created', JSON_ARRAY('feature_flags', 'user_feature_interactions'),
  'features_added', 12,
  'version', 'v2.1.0',
  'expires_after_days', 14
));
