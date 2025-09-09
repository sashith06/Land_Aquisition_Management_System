-- ================================================
-- LAMS (Land Acquisition Management System) 
-- Complete Database Setup for WampServer
-- Updated: September 8, 2025
-- ================================================

-- Set foreign key checks off to avoid constraint issues during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS land_acqusition;
CREATE DATABASE land_acqusition;
USE land_acqusition;

-- ================================================
-- TABLE: users
-- ================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('LO','PE','FO','CE','admin') NOT NULL COMMENT 'CE is system admin - only admin@lams.gov.lk allowed',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: projects
-- ================================================
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','approved','in_progress','completed','on_hold') DEFAULT 'pending',
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `initial_estimated_cost` decimal(15,2) DEFAULT NULL,
  `final_cost` decimal(15,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: plans (Enhanced with all form fields)
-- ================================================
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_number` varchar(50) NOT NULL,
  `project_id` int NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `total_extent` decimal(10,4) DEFAULT NULL,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `estimated_extent` varchar(100) DEFAULT NULL,
  `advance_trading_no` varchar(100) DEFAULT NULL,
  `divisional_secretary` varchar(255) DEFAULT NULL,
  `current_extent_value` decimal(15,2) DEFAULT NULL,
  `section_07_gazette_no` varchar(100) DEFAULT NULL,
  `section_07_gazette_date` date DEFAULT NULL,
  `section_38_gazette_no` varchar(100) DEFAULT NULL,
  `section_38_gazette_date` date DEFAULT NULL,
  `section_5_gazette_no` varchar(100) DEFAULT NULL,
  `pending_cost_estimate` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','on_hold') DEFAULT 'pending',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `has_valuation` tinyint(1) DEFAULT '0',
  `has_compensation` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_number` (`plan_number`),
  KEY `created_by` (`created_by`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `plans_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: lots (Enhanced structure)
-- ================================================
DROP TABLE IF EXISTS `lots`;
CREATE TABLE `lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `lot_no` int NOT NULL,
  `extent_ha` decimal(10,4) DEFAULT NULL,
  `extent_perch` decimal(10,4) DEFAULT NULL,
  `land_type` enum('State','Private','Development Only') DEFAULT 'Private',
  `advance_tracing_extent_ha` decimal(10,4) DEFAULT NULL,
  `advance_tracing_extent_perch` decimal(10,4) DEFAULT NULL,
  `preliminary_plan_extent_ha` decimal(10,4) DEFAULT NULL,
  `preliminary_plan_extent_perch` decimal(10,4) DEFAULT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lot` (`plan_id`,`lot_no`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `lots_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `lots_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lots_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: project_assignments
-- ================================================
DROP TABLE IF EXISTS `project_assignments`;
CREATE TABLE `project_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `land_officer_id` int NOT NULL,
  `assigned_by` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive','completed') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_assignment` (`project_id`,`land_officer_id`),
  KEY `project_id` (`project_id`),
  KEY `land_officer_id` (`land_officer_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `project_assignments_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `project_assignments_ibfk_2` FOREIGN KEY (`land_officer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `project_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: notifications
-- ================================================
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: messages
-- ================================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: valuations (For Financial Officer functionality)
-- ================================================
DROP TABLE IF EXISTS `valuations`;
CREATE TABLE `valuations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `valuation_amount` decimal(15,2) NOT NULL,
  `valuation_date` date NOT NULL,
  `valuation_method` varchar(100) DEFAULT NULL,
  `market_rate` decimal(10,2) DEFAULT NULL,
  `government_rate` decimal(10,2) DEFAULT NULL,
  `notes` text,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `valuations_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`),
  CONSTRAINT `valuations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `valuations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `valuations_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: compensations (For Financial Officer functionality)
-- ================================================
DROP TABLE IF EXISTS `compensations`;
CREATE TABLE `compensations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `compensation_amount` decimal(15,2) NOT NULL,
  `compensation_date` date NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `bank_details` text,
  `notes` text,
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `status` enum('draft','submitted','approved','paid') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `compensations_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`),
  CONSTRAINT `compensations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `compensations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `compensations_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: lot_owners (Property owners for each lot)
-- ================================================
DROP TABLE IF EXISTS `lot_owners`;
CREATE TABLE `lot_owners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `nic` varchar(20) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `ownership_percentage` decimal(5,2) DEFAULT 100.00,
  `owner_type` enum('Individual','Company','Government','Trust') DEFAULT 'Individual',
  `status` enum('active','inactive','transferred') DEFAULT 'active',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `nic` (`nic`),
  CONSTRAINT `lot_owners_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_owners_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `lot_owners_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_owners_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: lot_valuations (Detailed valuation for each lot)
-- ================================================
DROP TABLE IF EXISTS `lot_valuations`;
CREATE TABLE `lot_valuations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `statutorily_amount` decimal(15,2) DEFAULT 0.00,
  `addition_amount` decimal(15,2) DEFAULT 0.00,
  `development_amount` decimal(15,2) DEFAULT 0.00,
  `court_amount` decimal(15,2) DEFAULT 0.00,
  `thirty_three_amount` decimal(15,2) DEFAULT 0.00,
  `board_of_review_amount` decimal(15,2) DEFAULT 0.00,
  `total_value` decimal(15,2) NOT NULL,
  `assessment_date` date NOT NULL,
  `assessor_name` varchar(255) DEFAULT NULL,
  `notes` text,
  `status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lot_valuation` (`lot_id`,`plan_id`),
  KEY `lot_id` (`lot_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `lot_valuations_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_valuations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `lot_valuations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_valuations_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_valuations_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: lot_compensations (Detailed compensation for each lot)
-- ================================================
DROP TABLE IF EXISTS `lot_compensations`;
CREATE TABLE `lot_compensations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `owner_data` longtext DEFAULT NULL,
  `compensation_payment` longtext DEFAULT NULL,
  `interest_payment` longtext DEFAULT NULL,
  `interest_voucher` longtext DEFAULT NULL,
  `account_division` longtext DEFAULT NULL,
  `total_compensation` decimal(15,2) DEFAULT 0.00,
  `status` enum('pending','in_progress','completed','approved','rejected') DEFAULT 'pending',
  `payment_status` enum('pending','processing','paid','failed') DEFAULT 'pending',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lot_compensation` (`lot_id`,`plan_id`),
  KEY `lot_id` (`lot_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `lot_compensations_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_compensations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `lot_compensations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_compensations_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_compensations_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: documents (Document management)
-- ================================================
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int DEFAULT NULL,
  `lot_id` int DEFAULT NULL,
  `document_type` enum('plan_document','survey_document','legal_document','valuation_document','compensation_document','gazette','court_order','other') NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `description` text,
  `uploaded_by` int NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `lot_id` (`lot_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `document_type` (`document_type`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: audit_logs (System audit trail)
-- ================================================
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` int NOT NULL,
  `old_values` longtext,
  `new_values` longtext,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `table_name` (`table_name`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- TABLE: system_settings (Application configuration)
-- ================================================
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `is_editable` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ================================================
-- ESSENTIAL DATA - SYSTEM ADMINISTRATOR ONLY
-- ================================================

-- Insert system administrator (CE role - only admin@lams.gov.lk allowed)
INSERT INTO `users` (`username`, `email`, `password`, `role`, `first_name`, `last_name`, `status`) VALUES
('admin', 'admin@lams.gov.lk', '$2b$10$rG8qDjF5kL3mN9pQ7tS6UuVXYZ1AB2CD3EF4GH5IJ6KL7MN8OP9QR', 'CE', 'Chief', 'Engineer', 'approved');

-- Insert essential system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_editable`) VALUES
('system_name', 'Land Acquisition Management System', 'string', 'Application name', 1),
('version', '1.0.0', 'string', 'System version', 0),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', 1),
('allowed_file_types', '["pdf","doc","docx","jpg","jpeg","png","gif","xls","xlsx"]', 'json', 'Allowed file types for document upload', 1),
('default_pagination_limit', '20', 'number', 'Default number of records per page', 1),
('system_timezone', 'Asia/Colombo', 'string', 'System default timezone', 1),
('enable_audit_logging', 'true', 'boolean', 'Enable system audit logging', 1),
('password_min_length', '8', 'number', 'Minimum password length requirement', 1),
('session_timeout', '3600', 'number', 'Session timeout in seconds (1 hour)', 1),
('backup_retention_days', '30', 'number', 'Number of days to retain database backups', 1);

-- Turn foreign key checks back on
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- DATABASE SETUP VERIFICATION
-- ================================================

-- Verify database and tables created successfully
SELECT 'LAMS Database Setup Completed Successfully!' as Status;

-- Show basic table verification
SHOW TABLES;

-- Verify essential system data
SELECT 'System Administrator Created' as Status FROM users WHERE role = 'admin' LIMIT 1;
SELECT COUNT(*) as system_settings_count FROM system_settings;

-- Show table structure for key tables
DESCRIBE users;
DESCRIBE projects;
DESCRIBE plans;
DESCRIBE lots;

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Insert sample projects
INSERT INTO `projects` (`name`, `description`, `status`, `created_by`, `initial_estimated_cost`, `start_date`) VALUES
('Colombo City Development Project', 'Urban development project in Colombo metropolitan area', 'approved', 1, 50000000.00, '2024-01-15'),
('Highway Expansion Project', 'Expansion of main highway connecting major cities', 'approved', 1, 75000000.00, '2024-02-01'),
('Rural Infrastructure Project', 'Infrastructure development in rural areas', 'approved', 1, 25000000.00, '2024-03-10');

-- Insert sample plans
INSERT INTO `plans` (`plan_number`, `project_id`, `description`, `location`, `total_extent`, `estimated_cost`, `status`, `created_by`) VALUES
('PLAN-001', 1, 'Colombo North Development Plan', 'Colombo North', 50.25, 15000000.00, 'pending', 1),
('PLAN-002', 1, 'Colombo Central Development Plan', 'Colombo Central', 75.50, 22500000.00, 'in_progress', 1),
('PLAN-003', 2, 'Highway Section A Plan', 'Highway Section A', 100.00, 30000000.00, 'pending', 1),
('PLAN-004', 3, 'Rural Village A Plan', 'Village A', 25.75, 7500000.00, 'completed', 1);

-- Insert sample lots
INSERT INTO `lots` (`plan_id`, `lot_no`, `extent_ha`, `extent_perch`, `land_type`, `created_by`) VALUES
(1, 1, 5.25, 2075.00, 'Private', 1),
(1, 2, 3.75, 1480.00, 'Private', 1),
(2, 1, 10.50, 4145.00, 'State', 1),
(3, 1, 15.00, 5920.00, 'Private', 1),
(4, 1, 8.25, 3255.00, 'Private', 1);
