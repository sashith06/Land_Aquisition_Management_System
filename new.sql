-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: land_acqusition
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compensation_payment_details`
--

DROP TABLE IF EXISTS `compensation_payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compensation_payment_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `lot_id` int NOT NULL,
  `owner_nic` varchar(20) NOT NULL,
  `owner_name` varchar(100) NOT NULL,
  `final_compensation_amount` decimal(15,2) DEFAULT '0.00',
  `payment_status` varchar(50) DEFAULT 'pending',
  `compensation_full_payment_date` date DEFAULT NULL,
  `compensation_full_payment_cheque_no` varchar(6) DEFAULT NULL,
  `compensation_full_payment_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `compensation_full_payment_paid_amount` decimal(15,2) DEFAULT '0.00',
  `compensation_part_payment_01_date` date DEFAULT NULL,
  `compensation_part_payment_01_cheque_no` varchar(6) DEFAULT NULL,
  `compensation_part_payment_01_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `compensation_part_payment_01_paid_amount` decimal(15,2) DEFAULT '0.00',
  `compensation_part_payment_02_date` date DEFAULT NULL,
  `compensation_part_payment_02_cheque_no` varchar(6) DEFAULT NULL,
  `compensation_part_payment_02_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `compensation_part_payment_02_paid_amount` decimal(15,2) DEFAULT '0.00',
  `interest_full_payment_date` date DEFAULT NULL,
  `interest_full_payment_cheque_no` varchar(6) DEFAULT NULL,
  `interest_full_payment_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `interest_full_payment_paid_amount` decimal(15,2) DEFAULT '0.00',
  `interest_part_payment_01_date` date DEFAULT NULL,
  `interest_part_payment_01_cheque_no` varchar(6) DEFAULT NULL,
  `interest_part_payment_01_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `interest_part_payment_01_paid_amount` decimal(15,2) DEFAULT '0.00',
  `interest_part_payment_02_date` date DEFAULT NULL,
  `interest_part_payment_02_cheque_no` varchar(6) DEFAULT NULL,
  `interest_part_payment_02_deducted_amount` decimal(15,2) DEFAULT '0.00',
  `interest_part_payment_02_paid_amount` decimal(15,2) DEFAULT '0.00',
  `account_division_sent_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `calculated_interest_amount` decimal(15,2) DEFAULT '0.00' COMMENT 'Calculated interest amount',
  `total_paid_interest` decimal(15,2) DEFAULT '0.00' COMMENT 'Total interest paid (sum of all interest payments)',
  `balance_due` decimal(15,2) DEFAULT '0.00' COMMENT 'Remaining balance to be paid',
  `interest_calculation_date` date DEFAULT NULL COMMENT 'Date when interest was calculated',
  `send_account_division_date` date DEFAULT NULL COMMENT 'Date when account division was sent (required for completion)',
  `completion_status` enum('pending','partial','complete') DEFAULT 'pending' COMMENT 'Overall completion status',
  `interest_to_be_paid` decimal(15,2) DEFAULT '0.00' COMMENT 'Calculated interest amount using (Final Compensation × 7% × Days Since Gazette) ÷ 365 days',
  `gazette_date` date DEFAULT NULL COMMENT 'Section 38 Gazette Date for interest calculation',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payment_record` (`plan_id`,`lot_id`,`owner_nic`),
  KEY `idx_plan_lot_nic` (`plan_id`,`lot_id`,`owner_nic`),
  KEY `idx_owner_nic` (`owner_nic`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_lot_id` (`lot_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_balance_due` (`balance_due`),
  KEY `idx_completion_status` (`completion_status`),
  KEY `idx_send_account_division_date` (`send_account_division_date`),
  KEY `idx_interest_to_be_paid` (`interest_to_be_paid`),
  KEY `idx_gazette_date` (`gazette_date`),
  CONSTRAINT `compensation_payment_details_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `compensation_payment_details_ibfk_2` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compensation_payment_details`
--

LOCK TABLES `compensation_payment_details` WRITE;
/*!40000 ALTER TABLE `compensation_payment_details` DISABLE KEYS */;
INSERT INTO `compensation_payment_details` VALUES (1,14,21,'198934567890','Nadeesha Fernando',1000000.00,'pending','2025-10-14','5345',0.00,434345.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,'2025-10-09 12:37:30','2025-10-15 10:19:10','4','6',122740.00,0.00,0.00,'2025-10-15',NULL,'pending',122740.00,'2024-01-15'),(2,14,21,'200012345678','Saman Perera',140000.00,'pending',NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,'2025-10-09 16:01:46','2025-10-15 10:19:10','4','4',17184.00,0.00,0.00,'2025-10-15',NULL,'pending',17184.00,'2024-01-15'),(9,31,388,'200129004750','Umesh Hiripitiya',3500000.00,'pending','2025-10-13','111111',0.00,2500000.00,'2025-10-14','123456',0.00,1000000.00,NULL,NULL,0.00,0.00,'2025-10-14','159753',0.00,191.78,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,'2025-10-14','2025-10-14 10:35:30','2025-10-14 16:11:28','4','4',0.00,0.00,0.00,NULL,NULL,'pending',0.00,NULL),(10,31,389,'200129004750','Umesh Hiripitiya',1000000.00,'pending','2025-10-13','111111',0.00,500000.00,'2025-10-14',NULL,0.00,500000.00,NULL,NULL,0.00,0.00,'2025-10-14',NULL,0.00,95.89,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,'2025-10-14','2025-10-14 14:47:16','2025-10-14 16:11:00','4','4',0.00,0.00,0.00,NULL,NULL,'pending',0.00,NULL),(11,31,388,'200120012456','heshan tharushika',2500000.00,'pending','2025-10-13',NULL,0.00,2500000.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,'2025-10-14','2025-10-14 17:12:08','2025-10-14 17:14:33','4','4',0.00,0.00,0.00,NULL,NULL,'pending',0.00,NULL),(12,33,391,'200129004750','Umesh Hiripitiya',54444444.00,'pending','2025-10-15','3345',0.00,5455345.00,NULL,NULL,0.00,48989099.00,NULL,NULL,0.00,0.00,'2025-10-17','554',0.00,646467.00,NULL,NULL,0.00,0.00,NULL,NULL,0.00,0.00,NULL,'2025-10-15 10:22:59','2025-10-15 10:26:03','6','6',0.00,0.00,0.00,NULL,NULL,'pending',0.00,NULL),(14,35,394,'200129004750','Umesh Hiripitiya',1000000.00,'pending','2025-10-14','123456',0.00,100000.00,'2025-10-15',NULL,0.00,900000.00,NULL,NULL,0.00,0.00,'2025-10-15',NULL,0.00,2000.00,'2025-10-15',NULL,0.00,7000.00,NULL,NULL,0.00,0.00,NULL,'2025-10-15 12:45:57','2025-10-15 12:49:00','6','6',0.00,0.00,0.00,NULL,NULL,'pending',0.00,NULL);
/*!40000 ALTER TABLE `compensation_payment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `compensation_progress_view`
--

DROP TABLE IF EXISTS `compensation_progress_view`;
/*!50001 DROP VIEW IF EXISTS `compensation_progress_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `compensation_progress_view` AS SELECT 
 1 AS `plan_id`,
 1 AS `lot_id`,
 1 AS `owner_nic`,
 1 AS `owner_name`,
 1 AS `final_compensation_amount`,
 1 AS `calculated_interest_amount`,
 1 AS `total_paid_interest`,
 1 AS `balance_due`,
 1 AS `send_account_division_date`,
 1 AS `auto_completion_status`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `compensations`
--

DROP TABLE IF EXISTS `compensations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compensations`
--

LOCK TABLES `compensations` WRITE;
/*!40000 ALTER TABLE `compensations` DISABLE KEYS */;
/*!40000 ALTER TABLE `compensations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `is_active` tinyint(1) DEFAULT '1',
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquiries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `landowner_id` int NOT NULL,
  `inquiry_text` text NOT NULL,
  `status` enum('pending','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiries`
--

LOCK TABLES `inquiries` WRITE;
/*!40000 ALTER TABLE `inquiries` DISABLE KEYS */;
INSERT INTO `inquiries` VALUES (1,1,1,'vvvvvvvvvv','pending','2025-09-15 06:40:35',1),(2,1,1,'kkkkkkkkkkkkk','pending','2025-09-15 07:59:43',1),(3,2,1,'chhhhhhkhkhkkk','pending','2025-09-15 08:35:01',0),(4,1,1,'hhhhhhhhhhhhhhh','pending','2025-09-15 08:36:36',1),(5,1,1,'dhhhhhhggjhghghg','pending','2025-09-15 08:38:06',1),(6,1,1,'hdhhhhddd','pending','2025-09-15 08:40:48',1),(7,1,1,'dhggdgdghghghhhgd','pending','2025-09-15 08:46:38',0),(8,2,1,'vfggggjgjhgjgjgj','pending','2025-09-15 08:52:04',1),(9,1,1,'hi \r\ni want to know the value of my land','pending','2025-09-23 08:53:28',1),(10,7,1,'hi there','pending','2025-09-23 08:54:24',1),(11,7,5,'ehrrhhirhewwhhjrrerherhererrrrr','pending','2025-09-23 09:17:19',1),(12,8,1,'I am reaching out to request detailed information regarding the availability of a large parcel of land for potential acquisition. I am particularly interested in understanding the total area of the land, its exact location, current ownership status, and any existing legal or regulatory conditions associated with it. In addition, I would appreciate information on accessibility (including road connections and transportation facilities), available infrastructure such as water, electricity, and communication lines, as well as permitted land use and zoning regulations. It would also be helpful to know if the land is free of disputes, mortgages, or encumbrances. Furthermore, kindly provide details regarding the asking price, payment terms, and any possibilities for negotiation or installment arrangements. If available, I would also request a site map, survey plan, and any documentation that outlines the land’s development potential for residential, commercial, or industrial purposes. This information will greatly assist in evaluating the suitability of the land for investment and long-term development planning.','pending','2025-09-23 09:22:49',1),(13,1,1,'ffffffffff','pending','2025-09-23 20:09:47',1),(14,1,1,'uuuuuuuuuuu','pending','2025-09-23 20:11:25',1),(15,1,1,'uuuuuuuu','pending','2025-09-23 20:11:45',1),(16,15,6,'Need Compensation timeline','pending','2025-09-24 08:57:01',1),(17,15,6,'when will valuation details available?','pending','2025-09-24 08:58:41',1),(18,1,1,'fffffffffffffffffffff','pending','2025-10-09 07:03:39',0),(19,27,1,'hello there','pending','2025-10-15 09:17:25',0);
/*!40000 ALTER TABLE `inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiry_attachments`
--

DROP TABLE IF EXISTS `inquiry_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inquiry_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inquiry_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inquiry_id` (`inquiry_id`),
  CONSTRAINT `inquiry_attachments_ibfk_1` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiry_attachments`
--

LOCK TABLES `inquiry_attachments` WRITE;
/*!40000 ALTER TABLE `inquiry_attachments` DISABLE KEYS */;
INSERT INTO `inquiry_attachments` VALUES (1,6,'Wednesday-S02E07-Sinhala-Subtitles.zip','uploads\\1757925648327-994941761.zip','2025-09-15 08:40:48'),(2,9,'diagrams.docx','uploads\\1758617608499-374882988.docx','2025-09-23 08:53:28'),(3,10,'meme 1.gif','uploads\\1758617664633-54488434.gif','2025-09-23 08:54:24'),(4,13,'22IT0479.pbix','uploads\\1758658187858-987029806.pbix','2025-09-23 20:09:47'),(5,14,'iris.ows','uploads\\1758658285459-340065464.ows','2025-09-23 20:11:25'),(6,15,'RStudio-2025.09.0-387.exe','uploads\\1758658303713-416411490.exe','2025-09-23 20:11:45'),(7,16,'Doc1.pdf','uploads\\1758704221021-447188906.pdf','2025-09-24 08:57:01'),(8,19,'Screenshot 2025-10-15 143622.png','uploads\\1760519845018-962257478.png','2025-10-15 09:17:25');
/*!40000 ALTER TABLE `inquiry_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `land_valuations`
--

DROP TABLE IF EXISTS `land_valuations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `land_valuations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `valuation_data` json NOT NULL,
  `total_value` decimal(15,2) NOT NULL,
  `calculated_by` int NOT NULL,
  `calculated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `calculated_by` (`calculated_by`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_calculated_at` (`calculated_at`),
  CONSTRAINT `land_valuations_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `land_valuations_ibfk_2` FOREIGN KEY (`calculated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `land_valuations`
--

LOCK TABLES `land_valuations` WRITE;
/*!40000 ALTER TABLE `land_valuations` DISABLE KEYS */;
INSERT INTO `land_valuations` VALUES (1,7,'{\"plans\": [{\"extent\": null, \"planId\": 7, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T15:12:22.878Z\", \"pricePerPerch\": 100000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"insights\": \"Unable to generate insights at this time.\", \"locations\": 1, \"projectId\": \"7\", \"totalValue\": 0, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T15:12:22.878Z\", \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 100000}], \"totalExtentPerches\": 0, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 15:12:23',NULL),(9,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Unable to generate insights at this time.\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T15:39:14.285Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 15:39:15',NULL),(10,7,'{\"plans\": [{\"extent\": null, \"planId\": 7, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T15:40:56.740Z\", \"pricePerPerch\": 100000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"insights\": \"Unable to generate insights at this time.\", \"locations\": 1, \"projectId\": \"7\", \"totalValue\": 0, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T15:40:56.741Z\", \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 100000}], \"totalExtentPerches\": 0, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 15:40:57',NULL),(11,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Unable to generate insights at this time.\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T15:41:10.423Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 15:41:10',NULL),(23,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Okay, here are some brief insights based on the limited information provided:\\n\\n**1. Value Reasonableness:**\\n\\n*   A value of LKR 0 against a 25.5 \\\"unknown unit\\\" is immediately suspect. Needs serious investigation into the \\\"unknown\\\" unit and supporting documentation. The valuation is likely incorrect.\\n\\n**2. Location Factors:**\\n\\n*   Diyagama and Walgama areas are experiencing growth. Assess specific land use regulations, accessibility, proximity to amenities (schools, hospitals), and infrastructure (electricity, water) along the road.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Sri Lanka\'s land market is sensitive to economic conditions. Consider recent inflation, interest rates, and investment trends impacting land values in the immediate Diyagama-Walgama corridor.\\n\\n**4. Risk Factors:**\\n\\n*   Unclear titles, boundary disputes, environmental restrictions (protected areas), and resettlement issues are significant risks. Due diligence is crucial before any land acquisition.\\n\\n**5. Recommendations:**\\n\\n*   Clarify the unit of measurement for plan 8890. Engage a qualified local valuer familiar with Diyagama-Walgama to determine accurate market value and identify potential issues. Obtain comprehensive documentation.\\n\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T16:12:14.215Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:12:17',NULL),(24,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Okay, here are some brief insights as a land valuation expert for the Diyagama - Walgama Road Project based on the limited information provided:\\n\\n**1. Value Reasonableness:**\\n\\n*   LKR 0 valuation for 25.5 units (unknown unit) is highly unlikely. Investigation needed to determine the \'unit\' type (perch, sq ft, etc.) and if it\'s a placeholder. Conduct initial market screening for comparable land values.\\n\\n**2. Location Factors:**\\n\\n*   Diyagama-Walgama corridor needs assessment. Consider proximity to industrial zones (Diyagama), residential areas (Walgama), and the impact of the road project on accessibility and future development potential along the route.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Assess recent land value appreciation/depreciation trends in the Homagama region. Factor in current economic conditions (inflation, interest rates) and potential future infrastructure developments influencing land prices.\\n\\n**4. Risk Factors:**\\n\\n*   Delays in project completion, unforeseen environmental issues, or opposition from landowners could negatively impact the final compensation amounts. Clarify land ownership details and potential title disputes.\\n\\n**5. Recommendations:**\\n\\n*   Immediately determine the land unit of measurement. Conduct a thorough land survey, and a detailed market valuation using comparable sales data. Engage a qualified valuer for accurate assessment.\\n\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T16:15:36.414Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:15:40',NULL),(25,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Okay, here are some concise insights for the Diyagama - Walgama Road Project, based on the limited information provided:\\n\\n**1. Value Reasonableness:**\\n\\n*   LKR 0 valuation for any land acquisition is highly improbable. It suggests missing data or a preliminary stage. Further investigation is needed to establish baseline land values through comparable sales.\\n\\n**2. Location Factors:**\\n\\n*   Diyagama and Walgama\'s proximity to Colombo and industrial zones likely impacts land value. Consider accessibility, infrastructure, and potential for commercial/residential development. Precise location along the road matters significantly.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Land values in the Western Province are generally appreciating. Assess recent price increases in similar areas due to infrastructure development or increased accessibility to predict future value uplift.\\n\\n**4. Risk Factors:**\\n\\n*   Delays in the project can increase land acquisition costs. Disputes over ownership or inadequate compensation can also lead to project delays and higher overall expenditure.\\n\\n**5. Recommendations:**\\n\\n*   Conduct a thorough land valuation survey, considering comparable sales data, location attributes, and market trends. Engage experienced local land surveyors and valuers to avoid undervaluation.\\n\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T16:17:51.115Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:17:54',NULL),(28,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"confidence\": \"unknown\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"pricePerPerch\": 0, \"estimatedValue\": 0, \"extentInPerches\": 4080, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"locations\": 0, \"projectId\": \"2\", \"totalValue\": 0, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T16:21:40.976Z\", \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 4080, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:21:42',NULL),(30,7,'{\"plans\": [{\"extent\": null, \"planId\": 7, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T16:30:46.505Z\", \"pricePerPerch\": 100000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"insights\": \"Okay, based on the limited information provided for the Homagama-Kottawa project, here are some brief insights:\\n\\n**1. Value Reasonableness:**\\n\\n*   The LKR 0 value raises serious concerns.  Further investigation is crucial to determine if this is an error, a pro-bono valuation, or if the land lacks any marketable title. Verify ownership and encumbrances immediately.\\n\\n**2. Location Factors:**\\n\\n*   Homagama and Kottawa are developing suburban areas.  Proximity to the Southern Expressway interchange (Kottawa) significantly boosts value. Assess infrastructure access (roads, utilities) and accessibility to Colombo.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Land values in the Greater Colombo region are generally appreciating, but economic instability and political uncertainties could impact demand. Analyze recent transaction data in the specific Homagama locality (e.g., prices per perch).\\n\\n**4. Risk Factors:**\\n\\n*   Legal issues (title disputes, zoning restrictions) can significantly devalue land. Ensure clear title and compliance with planning regulations.  Environmental risks (flooding, landslides) should also be investigated.\\n\\n**5. Recommendations:**\\n\\n*   Conduct a thorough site inspection and title search. Obtain comparable sales data from recent transactions in similar Homagama locations.  Engage a surveyor to verify boundaries and land extent.\\n\", \"locations\": 1, \"projectId\": \"7\", \"totalValue\": 0, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T16:30:46.505Z\", \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 100000}], \"totalExtentPerches\": 0, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:30:49',NULL),(31,7,'{\"plans\": [{\"extent\": null, \"planId\": 7, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T16:30:46.505Z\", \"pricePerPerch\": 100000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"insights\": \"Okay, here\'s a brief land valuation analysis for the Homagama-Kottawa project, based on the limited information provided:\\n\\n**Project: Homagama - Kottawa (Single Plan)**\\n\\n*   **Total Estimated Value: LKR 0**\\n*   **Plan Breakdown:**\\n    *   **8896: null (Homagama) = LKR 0**\\n\\n**Analysis:**\\n\\n1.  **Value Reasonableness:** LKR 0 is unlikely. Needs further investigation into land size, zoning, accessibility, and comparable sales to establish a realistic baseline value. *This may be a placeholder value that is yet to be determined.*\\n\\n2.  **Location Factors:** Homagama-Kottawa benefits from proximity to Colombo and the Southern Expressway. However, specific micro-location within Homagama significantly impacts value (e.g., distance to town center, amenities, main roads).\\n\\n3.  **Market Trends Consideration:** Property values in the Colombo suburbs have generally seen appreciation. However, market activity is sensitive to economic conditions, interest rates, and government policies. *Currently, there is volatility with rates and land sales.*\\n\\n4.  **Risk Factors:** Lack of clear land title, disputes, environmental constraints (flooding, etc.), and zoning restrictions pose significant risks to valuation. Due diligence is crucial.\\n\\n5.  **Recommendations:** Obtain detailed property information (land extent, survey plan, zoning), conduct site inspection, analyze comparable land sales in Homagama, and engage a licensed surveyor or valuer for accurate valuation.\\n\", \"locations\": 1, \"projectId\": \"7\", \"totalValue\": 0, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T16:58:56.071Z\", \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 100000}], \"totalExtentPerches\": 0, \"averagePricePerPerch\": 0}',0.00,1,'2025-10-07 16:58:59',NULL),(39,7,'{\"plans\": [{\"extent\": \"5.00\", \"planId\": 7, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T18:14:59.910Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 100000, \"estimatedValue\": 500000, \"extentInPerches\": 5, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 1, \"projectId\": \"7\", \"plansTotal\": 1, \"totalValue\": 500000, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T18:14:59.910Z\", \"plansWithData\": 1, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 100000}], \"totalExtentPerches\": 5, \"averagePricePerPerch\": 100000}',500000.00,1,'2025-10-07 18:15:00',NULL),(47,7,'{\"plans\": [{\"extent\": \"5.00\", \"planId\": 7, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2100000, \"min\": 800000}, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T18:51:45.192Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1450000, \"estimatedValue\": 7250000, \"extentInPerches\": 5, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 1, \"projectId\": \"7\", \"plansTotal\": 1, \"totalValue\": 7250000, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T18:51:45.193Z\", \"plansWithData\": 1, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1450000}], \"totalExtentPerches\": 5, \"averagePricePerPerch\": 1450000}',7250000.00,1,'2025-10-07 18:51:45',NULL),(49,2,'{\"plans\": [{\"extent\": \"25.5000\", \"planId\": 2, \"warning\": null, \"confidence\": \"estimated\", \"createdDate\": \"2025-09-14T19:04:12.000Z\", \"description\": \"Plan for Diyagama - Walgama area\", \"extentSource\": \"total_extent\", \"pricePerPerch\": 50000, \"estimatedValue\": 1275000, \"extentInPerches\": 25.5, \"plan_identifier\": \"8890\", \"divisional_secretary\": \"Unknown\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 0, \"projectId\": \"2\", \"plansTotal\": 1, \"totalValue\": 1275000, \"projectName\": \"Diyagama - Walgama Road Project\", \"calculatedAt\": \"2025-10-07T18:52:14.594Z\", \"plansWithData\": 1, \"projectStatus\": \"in_progress\", \"locationBreakdown\": [], \"totalExtentPerches\": 26, \"averagePricePerPerch\": 50000}',1275000.00,1,'2025-10-07 18:52:15',NULL),(51,7,'{\"plans\": [{\"extent\": \"5.00\", \"planId\": 7, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2100000, \"min\": 800000}, \"createdDate\": \"2025-10-06T18:40:38.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-07T18:51:45.192Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1450000, \"estimatedValue\": 7250000, \"extentInPerches\": 5, \"plan_identifier\": \"8896\", \"divisional_secretary\": \"homagama\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 1, \"projectId\": \"7\", \"plansTotal\": 1, \"totalValue\": 7250000, \"projectName\": \"Homagama - Kottawa\", \"calculatedAt\": \"2025-10-07T18:52:31.635Z\", \"plansWithData\": 1, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1450000}], \"totalExtentPerches\": 5, \"averagePricePerPerch\": 1450000}',7250000.00,1,'2025-10-07 18:52:32',NULL),(55,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T03:51:43.564Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 2449500, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T03:51:44.962Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T03:51:46.046Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 109309500, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T03:51:46.046Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 670652}',109309500.00,5,'2025-10-08 03:51:46',NULL),(56,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:29.416Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 2449500, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:30.577Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:34.926Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 3000000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here are some brief insights for the Elpitiya-Kahaduwa land valuation project, keeping it concise and practical:\\n\\n**1. Value Reasonableness:**\\n\\n*   The per-acre valuation varies significantly. Plan 8033 (Karandeniya) appears disproportionately high compared to the other two, potentially indicating a premium factor (e.g., specific use, road frontage). Scrutinize the justification for this difference.\\n\\n**2. Location Factors:**\\n\\n*   Kahaduwa, Karandeniya, and Elpitiya have different levels of accessibility, infrastructure, and proximity to urban centers. Karandeniya\'s higher value may reflect better accessibility or recent development in that specific area.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Given the current economic climate in Sri Lanka, market fluctuations and inflation are key concerns. The valuations should be benchmarked against recent comparable land sales and adjusted for current market sentiment.\\n\\n**4. Risk Factors:**\\n\\n*   Land ownership disputes, unclear land boundaries, or environmental regulations could negatively impact value. Due diligence on ownership and zoning is crucial. Any potential land subsidence or flooding risks should be identified.\\n\\n**5. Recommendations:**\\n\\n*   Conduct a thorough comparative market analysis (CMA) focusing on Karandeniya to validate Plan 8033\'s valuation. Verify road access, utility availability, and obtain independent legal verification of land titles for all three plans.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 33259500, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:11:34.928Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 204059}',33259500.00,1,'2025-10-08 08:11:38',NULL),(57,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:29.416Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 2449500, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:30.577Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:11:34.926Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 3000000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here\'s a brief analysis based on the provided information:\\n\\n**1. Value Reasonableness:**\\n\\n*   LKR 33,259,500 seems disproportionately weighted towards plan 8033 (Karandeniya). Investigate why 8033 commands such a high percentage of the total value given its land size compared to Elpitiya (8032). Check if the location or improvements are significantly better.\\n\\n**2. Location Factors:**\\n\\n*   Consider access to infrastructure (roads, electricity, water), proximity to Elpitiya town, schools, hospitals, and commercial centres. Different locations (Elpitiya vs. Kahaduwa vs. Karandeniya) command different premiums. Also factor in topography and land use zone.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Current rubber prices will significantly influence agricultural land values, especially in Elpitiya and Kahaduwa. Tourist activity near Elpitiya could be a positive factor. Investigate recent land sales of comparable properties in each area for accurate pricing.\\n\\n**4. Risk Factors:**\\n\\n*   Land tenure issues, potential for flooding or landslides (common in the region), or environmental regulations are crucial risks. Legal due diligence is paramount. Consider potential estate sector land reforms that may impact certain types of properties.\\n\\n**5. Recommendations:**\\n\\n*   A detailed on-site inspection and comparative sales analysis are crucial to justify the allocated values, particularly for plan 8033. Review zoning regulations and development potential of each property. Consult a local surveyor to clarify land boundaries.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 33259500, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:12:52.615Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 204059}',33259500.00,1,'2025-10-08 08:12:56',NULL),(58,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 375000, \"min\": 375000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:04.265Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 375000, \"estimatedValue\": 18371250, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:05.280Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:09.252Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here are some brief insights, as a land valuation expert in Sri Lanka, regarding the Elpitiya-Kahaduwa project:\\n\\n**1. Value Reasonableness:**\\n\\n*   The average per-perch value differs significantly across plans, warranting investigation. Focus on comparable sales data in each specific location (Kahaduwa, Karandeniya, Elpitiya) to justify discrepancies.\\n\\n**2. Location Factors:**\\n\\n*   Elpitiya\'s higher value likely reflects its central location, proximity to amenities, and better infrastructure compared to Kahaduwa and Karandeniya. Access to main roads and tea/rubber factories should be considered.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Assess current demand for agricultural land and residential plots in each area. Is there a growing interest from local investors or expatriates? Check recent transaction data for similar land parcels in the region.\\n\\n**4. Risk Factors:**\\n\\n*   Land tenure issues (ownership, encumbrances), susceptibility to flooding/landslides, and potential regulatory changes (zoning, environmental restrictions) could negatively impact value. Thorough title search and soil testing are crucial.\\n\\n**5. Recommendations:**\\n\\n*   Conduct a detailed market analysis for each location to validate per-perch values. Prioritize accurate surveys to confirm land extent. Document comparable sales used in the valuation process transparently.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 125231250, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:54:09.254Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 375000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 768337}',125231250.00,1,'2025-10-08 08:54:12',NULL),(60,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 375000, \"min\": 375000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:04.265Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 375000, \"estimatedValue\": 18371250, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:05.280Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:09.252Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here are some brief insights, keeping in mind the limited information provided and focusing on practical considerations for a Sri Lankan land valuation expert:\\n\\n**1. Value Reasonableness:**\\n\\n*   **Comparable Sales Crucial:** LKR 125M total hinges on recent, similar land sales in Elpitiya, Kahaduwa, and Karandeniya. Thorough investigation of transactions of similar sizes and land use is vital to validate the per perch values.\\n*   **Discrepancies?** Consider potential reasons for value differences between plans. Elpitiya\'s higher value needs justification.\\n\\n**2. Location Factors:**\\n\\n*   **Accessibility & Infrastructure:** Proximity to main roads, schools, hospitals, and utility connections significantly impacts value. Assess the quality of these amenities in each location.\\n*   **Micro-location:** Specific location within each town matters. Is it a residential area, agricultural land, or commercial zone? Proximity to scenic views or tourist attractions can further increase value.\\n\\n**3. Market Trends Consideration:**\\n\\n*   **Post-Economic Crisis Impact:** Current economic conditions in Sri Lanka are uncertain. Assess how inflation, interest rates, and currency fluctuations impact land demand and prices. Talk to local brokers and developers.\\n*   **Property Development Activity:** Look at ongoing or planned development projects in each area. New infrastructure or housing schemes will impact the long term property values.\\n\\n**4. Risk Factors:**\\n\\n*   **Land Title & Clearances:** Verify land ownership, boundaries, and any existing encumbrances (e.g., mortgages, legal disputes). Confirm necessary development permits are obtainable.\\n*   **Environmental Concerns:** Check for flood risks, landslide susceptibility, and environmental regulations affecting land use.\\n\\n**5. Recommendations:**\\n\\n*   **Detailed Site Inspections:** Conduct on-site assessments of each plan to verify land characteristics, topography, and accessibility.\\n*   **Engage Local Expertise:** Consult with local real estate agents, surveyors, and legal professionals for accurate market data and regulatory insights.\\n*   **Independent Valuation:** Seek independent valuation opinion to support your analysis and findings.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 125231250, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:54:39.994Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 375000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 768337}',125231250.00,1,'2025-10-08 08:54:43',NULL),(62,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 375000, \"min\": 375000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:04.265Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 375000, \"estimatedValue\": 18371250, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:05.280Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:54:09.252Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 125231250, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:54:52.872Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 375000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 768337}',125231250.00,1,'2025-10-08 08:54:53',NULL),(64,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here\'s a brief analysis of the Elpitiya-Kahaduwa land valuation project, focusing on practical considerations:\\n\\n**1. Value Reasonableness:**\\n\\n*   Given the breakdown, the Elpitiya land (8032) contributes significantly to the total value. Review comparable sales in each specific area (Kahaduwa, Karandeniya, and Elpitiya) to confirm reasonableness based on per-perch rates and land use potential.\\n\\n**2. Location Factors:**\\n\\n*   Consider accessibility (road frontage, distance to main roads), infrastructure availability (water, electricity), soil fertility, and proximity to amenities (schools, hospitals, markets) in each location. Elpitiya might command a premium due to its established town status.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Assess recent land price fluctuations in the Galle district. Are land prices appreciating, depreciating, or stable? Factor in the impact of national economic conditions (inflation, interest rates) and potential future development plans on land values.\\n\\n**4. Risk Factors:**\\n\\n*   Identify potential issues like land ownership disputes, unclear title documents, environmental concerns (flooding, landslides), or restricted land usage regulations. Conduct thorough title checks and site inspections.\\n\\n**5. Recommendations:**\\n\\n*   Conduct independent site visits and comparable sales analysis. Verify the planned land use for each parcel to ascertain its highest and best use and support the valuations. Focus on accurate data collection and transparent valuation methodology.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:56:36.659Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:56:39',NULL),(65,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Here\'s a concise breakdown for your Elpitiya-Kahaduwa land valuation project:\\n\\n**1. Value Reasonableness:**\\n\\n*   The significant value difference between the plans warrants careful scrutiny. Investigate potential zoning discrepancies, access, and development potential impacting Elpitiya (8032) valuation specifically. Check for comparable sales in each respective location.\\n\\n**2. Location Factors:**\\n\\n*   Elpitiya (8032) likely benefits from better infrastructure, proximity to commercial hubs, and possibly higher demand compared to Kahaduwa and Karandeniya. Assess accessibility to main roads, amenities, and local employment opportunities for each location.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Assess current rubber/tea prices and their impact on land value in these agricultural regions. Analyze recent transaction data for similar properties in Elpitiya, Kahaduwa, and Karandeniya, taking into account market sentiment shifts.\\n\\n**4. Risk Factors:**\\n\\n*   Consider potential risks like land tenure issues, susceptibility to landslides or flooding (given the region), and the impact of future infrastructure development on land values in all three locations. Verify land ownership documents and environmental reports.\\n\\n**5. Recommendations:**\\n\\n*   Conduct thorough site inspections for each plan. Review all available documentation (zoning, surveys) before finalizing the valuation. Re-evaluate Elpitiya\'s (8032) valuation and provide justification for the high price.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:56:51.285Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:56:59',NULL),(68,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Here\'s a concise analysis for your Elpitiya - Kahaduwa land valuation project:\\n\\n**1. Value Reasonableness:**\\n\\n*   Values appear to vary significantly per perch. Investigate potential reasons: zoning differences, access, topography, soil quality, and proximity to amenities. Per-perch rates should be compared to recent comparable sales in each specific locality.\\n\\n**2. Location Factors:**\\n\\n*   Assess accessibility to key infrastructure (roads, utilities, public transport) in Elpitiya, Karandeniya, and Kahaduwa. Note the impact of surrounding land use (residential, agricultural, commercial) on value for each plan.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Consider current demand for land in each area, driven by residential, agricultural, or commercial development. Track any recent price fluctuations and government policies affecting land value in the Southern Province.\\n\\n**4. Risk Factors:**\\n\\n*   Identify potential risks like land tenure issues, environmental concerns (flooding, soil erosion), and any pending legal disputes that might affect marketability or value of any of the three plans.\\n\\n**5. Recommendations:**\\n\\n*   Conduct thorough site inspections for each property. Obtain and analyze recent comparable sales data from Elpitiya, Karandeniya, and Kahaduwa separately. Consult with local real estate agents for on-the-ground market intelligence.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:57:32.391Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:57:35',NULL),(70,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here\'s a brief land valuation expert perspective on the Elpitiya-Kahaduwa project, broken down by requested categories:\\n\\n**1. Value Reasonableness:**\\n\\n*   Values appear potentially reasonable given the variations in land size and location, but a thorough site visit and comparative sales analysis are *crucial*. Investigate per-perch values for each location to confirm.\\n\\n**2. Location Factors:**\\n\\n*   Elpitiya likely commands a higher value due to better infrastructure, accessibility, and potential for commercial or residential development compared to Kahaduwa and Karandeniya, which might be more rural/agricultural.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Current economic climate in Sri Lanka significantly impacts land values. Consider factors like inflation, interest rates, and investor confidence levels in the area when assessing future value growth. Track recent land transactions.\\n\\n**4. Risk Factors:**\\n\\n*   Land ownership disputes, environmental restrictions (e.g., conservation zones), and potential infrastructure development limitations pose significant risks. Due diligence is vital to identify these before final valuation.\\n\\n**5. Recommendations:**\\n\\n*   Conduct comprehensive due diligence, including title searches, environmental assessments, and market analysis. Employ localized comparative sales data and a detailed site inspection to refine the valuations. Consider external factors such as political stability and global market impacts.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:57:56.663Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:57:59',NULL),(72,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here\'s a concise assessment of the Elpitiya-Kahaduwa land valuation project, keeping in mind Sri Lankan market dynamics:\\n\\n**1. Value Reasonableness:**\\n\\n*   **Reasonableness:** Values appear potentially plausible but require scrutiny against comparable sales in each specific micro-location. Discrepancies could arise from differing accessibility, topography, or infrastructure.\\n*   **Unit Rates:** Calculate per perch/acre rates for each plan and compare them to recent transaction data of comparable land. Discrepancies should be carefully reviewed.\\n\\n**2. Location Factors:**\\n\\n*   **Accessibility and Infrastructure:** Elpitiya\'s higher value likely reflects better access to services, roads, and town centers compared to Kahaduwa and Karandeniya, which should be considered.\\n*   **Land Use and Development Potential:** Identify zoning regulations and potential permitted uses (residential, commercial, agricultural) in each area. This heavily impacts land value.\\n\\n**3. Market Trends Consideration:**\\n\\n*   **Tea & Rubber Industry:** Consider the health of the tea and rubber industries, as land value may be influenced by their performance, especially in areas reliant on these crops.\\n*   **Inflation & Interest Rates:** Account for prevailing inflation rates and lending interest rates, which directly impact property investment sentiment and purchasing power.\\n\\n**4. Risk Factors:**\\n\\n*   **Land Tenure and Title Clarity:** Thoroughly investigate land ownership documents and potential disputes. Unclear titles significantly decrease value and create legal risks.\\n*   **Environmental & Natural Hazards:** Assess risks related to flooding, landslides (common in hilly areas), and soil erosion, impacting suitability and value.\\n\\n**5. Recommendations:**\\n\\n*   **Comparable Sales Data:** Prioritize obtaining recent and accurate comparable sales data within Kahaduwa, Karandeniya, and Elpitiya to validate the proposed valuations.\\n*   **On-site Inspections:** Conduct thorough on-site inspections to assess the actual conditions, topography, access, and any potential encumbrances on each property.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:58:15.919Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:58:19',NULL),(73,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 600000, \"min\": 600000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:33.249Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 600000, \"estimatedValue\": 29394000, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 515000, \"min\": 515000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:34.445Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 515000, \"estimatedValue\": 27810000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 2400000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T08:56:36.657Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1317500, \"estimatedValue\": 79050000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here are some brief insights for your Elpitiya – Kahaduwa land valuation project:\\n\\n**1. Value Reasonableness:**\\n\\n*   Values appear broadly reasonable, but further investigation is needed. The Elpitiya plan has a significantly higher value/unit area; this requires justification (e.g., development potential, zoning). Confirm recent comparable sales in each locality.\\n\\n**2. Location Factors:**\\n\\n*   Elpitiya\'s higher value suggests better access to amenities, infrastructure, and market opportunities compared to Kahaduwa and Karandeniya. Proximity to key roads, schools, hospitals, and town centers should be analyzed for each location.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Consider current interest rates, inflation, and overall economic stability which can impact land demand and prices. Tea and rubber prices if related industries must be factored in. Review recent land price indices for the Southern Province.\\n\\n**4. Risk Factors:**\\n\\n*   Title issues, land disputes, and environmental concerns (e.g., flooding, soil erosion) are significant risks. Due diligence, including title searches and site inspections, is crucial before finalizing value estimates.\\n\\n**5. Recommendations:**\\n\\n*   Conduct thorough site inspections and gather detailed information on comparable land sales in each area. Engage local real estate agents and surveyors for more granular market insights. Consider highest and best use for each parcel.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 136254000, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-08T08:59:03.483Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 600000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 515000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1317500}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 835965}',136254000.00,1,'2025-10-08 08:59:06',NULL),(74,8,'{\"plans\": [{\"extent\": \"86.00\", \"planId\": 10, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 70000, \"min\": 70000}, \"createdDate\": \"2025-10-07T17:39:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:50.233Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 70000, \"estimatedValue\": 6020000, \"extentInPerches\": 86, \"plan_identifier\": \"9978\", \"divisional_secretary\": \"Hingurakgoda\"}, {\"extent\": \"84.00\", \"planId\": 9, \"warning\": null, \"confidence\": \"medium\", \"priceRange\": {\"max\": 600000, \"min\": 265000}, \"createdDate\": \"2025-10-07T17:38:12.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:53.528Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 432500, \"estimatedValue\": 36330000, \"extentInPerches\": 84, \"plan_identifier\": \"9977\", \"divisional_secretary\": \"Medirigiriya\"}, {\"extent\": \"90.00\", \"planId\": 8, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-07T17:36:39.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:55.631Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 60000, \"estimatedValue\": 5400000, \"extentInPerches\": 90, \"plan_identifier\": \"9976\", \"divisional_secretary\": \"Thambuttegama\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 3, \"projectId\": \"8\", \"plansTotal\": 3, \"totalValue\": 47750000, \"projectName\": \"Anuradhapura - Polonnaruwa\", \"calculatedAt\": \"2025-10-08T09:01:55.631Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Hingurakgoda\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 70000}, {\"location\": \"Medirigiriya\", \"confidence\": \"medium\", \"plansCount\": 1, \"pricePerPerch\": 432500}, {\"location\": \"Thambuttegama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 60000}], \"totalExtentPerches\": 260, \"averagePricePerPerch\": 183654}',47750000.00,1,'2025-10-08 09:01:55',NULL),(75,8,'{\"plans\": [{\"extent\": \"86.00\", \"planId\": 10, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-07T17:39:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:46.892Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 60000, \"estimatedValue\": 5160000, \"extentInPerches\": 86, \"plan_identifier\": \"9978\", \"divisional_secretary\": \"Hingurakgoda\"}, {\"extent\": \"84.00\", \"planId\": 9, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-07T17:38:12.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:51.540Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 60000, \"estimatedValue\": 5040000, \"extentInPerches\": 84, \"plan_identifier\": \"9977\", \"divisional_secretary\": \"Medirigiriya\"}, {\"extent\": \"90.00\", \"planId\": 8, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-07T17:36:39.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T09:01:54.846Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 60000, \"estimatedValue\": 5400000, \"extentInPerches\": 90, \"plan_identifier\": \"9976\", \"divisional_secretary\": \"Thambuttegama\"}], \"stored\": false, \"insights\": \"Okay, here\'s a concise analysis of the Anuradhapura-Polonnaruwa land valuation project, as a land valuation expert in Sri Lanka:\\n\\n**1. Value Reasonableness:**\\n\\n*   Values appear reasonable if based on recent sales in comparable areas. Verify comparable sales data for Hingurakgoda, Medirigiriya, and Thambuttegama. A quick check on land size to LKR value ratio could easily identify discrepancies.\\n\\n**2. Location Factors:**\\n\\n*   Consider proximity to main roads, irrigation sources (vital in the Dry Zone), schools, and markets. Access to essential infrastructure greatly influences value. Check for town planning restrictions.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Factor in recent increases in land demand in the North Central Province due to agricultural expansion, tourism development, and infrastructure projects. Consider the current overall economic situation and its impact on land prices.\\n\\n**4. Risk Factors:**\\n\\n*   Land ownership issues (encroachments, unclear deeds) are common. Conduct thorough title searches. Ensure compliance with environmental regulations (water bodies, protected areas). Agricultural productivity, especially in these areas where water shortages might be an issue.\\n\\n**5. Recommendations:**\\n\\n*   Conduct site visits for all locations. Confirm zoning regulations and development potential with local authorities. Investigate access to utilities like water and electricity, as they significantly impact value.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"8\", \"plansTotal\": 3, \"totalValue\": 15600000, \"projectName\": \"Anuradhapura - Polonnaruwa\", \"calculatedAt\": \"2025-10-08T09:01:54.848Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Hingurakgoda\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 60000}, {\"location\": \"Medirigiriya\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 60000}, {\"location\": \"Thambuttegama\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 60000}], \"totalExtentPerches\": 260, \"averagePricePerPerch\": 60000}',15600000.00,1,'2025-10-08 09:01:58',NULL),(76,8,'{\"plans\": [{\"extent\": \"86.00\", \"planId\": 10, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-07T17:39:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T13:17:13.186Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 60000, \"estimatedValue\": 5160000, \"extentInPerches\": 86, \"plan_identifier\": \"9978\", \"divisional_secretary\": \"Hingurakgoda\"}, {\"extent\": \"84.00\", \"planId\": 9, \"warning\": null, \"confidence\": \"high\", \"priceRange\": {\"max\": 400000, \"min\": 265000}, \"createdDate\": \"2025-10-07T17:38:12.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T13:17:15.231Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 338333.33, \"estimatedValue\": 28420000, \"extentInPerches\": 84, \"plan_identifier\": \"9977\", \"divisional_secretary\": \"Medirigiriya\"}, {\"extent\": \"90.00\", \"planId\": 8, \"warning\": null, \"confidence\": \"medium\", \"priceRange\": {\"max\": 3000000, \"min\": 375000}, \"createdDate\": \"2025-10-07T17:36:39.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-08T13:17:16.283Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1708333, \"estimatedValue\": 153749970, \"extentInPerches\": 90, \"plan_identifier\": \"9976\", \"divisional_secretary\": \"Thambuttegama\"}], \"stored\": false, \"insights\": \"Unable to generate AI insights at this time. The valuation calculation completed successfully, but AI analysis is temporarily unavailable.\", \"warnings\": [], \"locations\": 3, \"projectId\": \"8\", \"plansTotal\": 3, \"totalValue\": 187329970, \"projectName\": \"Anuradhapura - Polonnaruwa\", \"calculatedAt\": \"2025-10-08T13:17:16.284Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Hingurakgoda\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 60000}, {\"location\": \"Medirigiriya\", \"confidence\": \"high\", \"plansCount\": 1, \"pricePerPerch\": 338333.33}, {\"location\": \"Thambuttegama\", \"confidence\": \"medium\", \"plansCount\": 1, \"pricePerPerch\": 1708333}], \"totalExtentPerches\": 260, \"averagePricePerPerch\": 720500}',187329970.00,1,'2025-10-08 13:17:16',NULL),(77,9,'{\"plans\": [{\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"high\", \"priceRange\": {\"max\": 3000000, \"min\": 1700000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-10T05:31:08.829Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 2350000, \"estimatedValue\": 115126500, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"medium\", \"priceRange\": {\"max\": 29000000, \"min\": 100000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-10T05:31:11.816Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 14550000, \"estimatedValue\": 785700000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"estimated\", \"priceRange\": null, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-10T05:31:16.107Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 50000, \"estimatedValue\": 3000000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here\'s a brief analysis for the Elpitiya-Kahaduwa land valuation project:\\n\\n**1. Value Reasonableness:**\\n\\n*   Plan 8033 (Karandeniya) dominates the overall value. Scrutinize the valuation method and comparable sales used for this plan as its impact is substantial. Significant value discrepancy between plans requires further investigation.\\n\\n**2. Location Factors:**\\n\\n*   Elpitiya and Kahaduwa are distinct locations. Assess accessibility, infrastructure (roads, utilities), and proximity to amenities differently for each plan. Consider the impact of tea estates or other agricultural activities.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Staying updated on current land prices for similar plots in Elpitiya, Kahaduwa, and Karandeniya is crucial. Research recent transactions to identify trends driving land value, such as tourism potential or industrial development.\\n\\n**4. Risk Factors:**\\n\\n*   Land ownership disputes, zoning regulations, environmental restrictions (e.g., buffer zones for water bodies), and potential for future infrastructure projects can all negatively impact land value and should be considered.\\n\\n**5. Recommendations:**\\n\\n*   Obtain detailed site surveys and conduct thorough due diligence on land titles. Investigate the reasons for the substantial valuation difference between the plans. Secure multiple independent market valuations, especially for the Karandeniya property.\\n\", \"warnings\": [], \"locations\": 3, \"projectId\": \"9\", \"plansTotal\": 3, \"totalValue\": 903826500, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-10T05:31:16.109Z\", \"plansWithData\": 3, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kahaduwa\", \"confidence\": \"high\", \"plansCount\": 1, \"pricePerPerch\": 2350000}, {\"location\": \"Karandeniya\", \"confidence\": \"medium\", \"plansCount\": 1, \"pricePerPerch\": 14550000}, {\"location\": \"Elpitiya\", \"confidence\": \"estimated\", \"plansCount\": 1, \"pricePerPerch\": 50000}], \"totalExtentPerches\": 163, \"averagePricePerPerch\": 5545288}',903826500.00,1,'2025-10-10 05:31:18',NULL),(78,9,'{\"plans\": [{\"extent\": null, \"planId\": 17, \"warning\": \"Missing extent data - value calculated as 0\", \"confidence\": \"low\", \"priceRange\": {\"max\": 800000, \"min\": 800000}, \"createdDate\": \"2025-10-10T19:00:14.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:04.767Z\", \"extentSource\": \"total_extent\", \"pricePerPerch\": 800000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8096\", \"divisional_secretary\": \"Galle\"}, {\"extent\": null, \"planId\": 16, \"warning\": \"Missing extent data - value calculated as 0\", \"confidence\": \"low\", \"priceRange\": {\"max\": 800000, \"min\": 800000}, \"createdDate\": \"2025-10-10T18:41:44.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:04.767Z\", \"extentSource\": \"total_extent\", \"pricePerPerch\": 800000, \"estimatedValue\": 0, \"extentInPerches\": 0, \"plan_identifier\": \"8095\", \"divisional_secretary\": \"Galle\"}, {\"extent\": \"90.00\", \"planId\": 15, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 800000, \"min\": 800000}, \"createdDate\": \"2025-10-10T17:29:17.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:04.767Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 800000, \"estimatedValue\": 72000000, \"extentInPerches\": 90, \"plan_identifier\": \"8045\", \"divisional_secretary\": \"Galle\"}, {\"extent\": \"48.99\", \"planId\": 14, \"warning\": null, \"confidence\": \"medium\", \"priceRange\": {\"max\": 3000000, \"min\": 1700000}, \"createdDate\": \"2025-10-08T03:47:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:07.194Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 2350000, \"estimatedValue\": 115126500, \"extentInPerches\": 48.99, \"plan_identifier\": \"8039\", \"divisional_secretary\": \"Kahaduwa\"}, {\"extent\": \"54.00\", \"planId\": 12, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 29000000, \"min\": 100000}, \"createdDate\": \"2025-10-08T03:43:55.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:09.808Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 14550000, \"estimatedValue\": 785700000, \"extentInPerches\": 54, \"plan_identifier\": \"8033\", \"divisional_secretary\": \"Karandeniya\"}, {\"extent\": \"60.00\", \"planId\": 11, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 235000, \"min\": 235000}, \"createdDate\": \"2025-10-08T03:39:05.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-11T01:59:11.195Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 235000, \"estimatedValue\": 14100000, \"extentInPerches\": 60, \"plan_identifier\": \"8032\", \"divisional_secretary\": \"Elpitiya\"}], \"stored\": false, \"insights\": \"Okay, here are some concise bullet points regarding the Elpitiya – Kahaduwa project land valuation, considering your provided data:\\n\\n**1. Value Reasonableness:**\\n\\n*   Significant disparity exists. Plan 8033\'s value per acre is excessively high compared to others. Requires immediate scrutiny.\\n*   Plans 8096 & 8095 having zero value could indicate errors or unbuildable land; investigate the cause.\\n\\n**2. Location Factors:**\\n\\n*   Proximity to major roads, infrastructure, and amenities in each location (Galle, Kahaduwa, Karandeniya, Elpitiya) must be considered for justification.\\n*   Land use zoning and allowed development types greatly influence values. Check relevant local council regulations.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Review recent land sales data within a 1-2km radius of each site to benchmark value. Focus on comparable land characteristics.\\n*   Current economic conditions and investor sentiment towards specific regions (e.g., tourism impacts in Galle) need assessment.\\n\\n**4. Risk Factors:**\\n\\n*   Title issues, environmental restrictions, or legal disputes could significantly reduce land value. Due diligence is crucial.\\n*   Accessibility challenges and potential for natural disasters (flooding, landslides) in these areas must be considered.\\n\\n**5. Recommendations:**\\n\\n*   Obtain independent valuations for Plan 8033 and the zero-value plans (8096 & 8095) by other qualified valuers.\\n*   Conduct thorough site inspections and confirm zoning regulations with local authorities before finalising any investment decisions.\\n\", \"warnings\": [{\"type\": \"missing_extent\", \"plans\": [{\"id\": 17, \"identifier\": \"8096\", \"description\": null}, {\"id\": 16, \"identifier\": \"8095\", \"description\": null}], \"message\": \"2 plan(s) missing extent data\"}], \"locations\": 4, \"projectId\": \"9\", \"plansTotal\": 6, \"totalValue\": 986926500, \"projectName\": \"Elpitiya – Kahaduwa\", \"calculatedAt\": \"2025-10-11T01:59:11.196Z\", \"plansWithData\": 4, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Galle\", \"confidence\": \"low\", \"plansCount\": 3, \"pricePerPerch\": 800000}, {\"location\": \"Kahaduwa\", \"confidence\": \"medium\", \"plansCount\": 1, \"pricePerPerch\": 2350000}, {\"location\": \"Karandeniya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 14550000}, {\"location\": \"Elpitiya\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 235000}], \"totalExtentPerches\": 253, \"averagePricePerPerch\": 3901049}',986926500.00,1,'2025-10-11 01:59:14',NULL),(81,11,'{\"plans\": [{\"extent\": \"100.00\", \"planId\": 31, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 1400000, \"min\": 1400000}, \"createdDate\": \"2025-10-14T10:25:28.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-14T10:58:59.112Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1400000, \"estimatedValue\": 140000000, \"extentInPerches\": 100, \"plan_identifier\": \"1234\", \"divisional_secretary\": \"Kottawa\"}], \"stored\": false, \"insights\": \"Okay, here are some brief insights as a land valuation expert in Sri Lanka, considering the Kottawa-Maharagama project details:\\n\\n**1. Value Reasonableness:**\\n\\n*   **LKR 140M for 100 perch in Kottawa needs thorough justification.** Perch value of LKR 1.4M is high. Comparable sales data is critical to support this valuation. Check recent transactions in immediate vicinity.\\n\\n**2. Location Factors:**\\n\\n*   **Kottawa benefits from Southern Expressway access.** Proximity to the highway, public transport hubs, and amenities (schools, hospitals) significantly influences land value. Evaluate accessibility.\\n\\n**3. Market Trends Consideration:**\\n\\n*   **Land prices in Kottawa are influenced by real estate demand radiating from Colombo.** Track recent price appreciation in the area. Monitor overall economic conditions and interest rates affecting land demand.\\n\\n**4. Risk Factors:**\\n\\n*   **Zoning regulations and development restrictions can impact value.** Confirm permissible land use, building height restrictions, and any environmental concerns affecting development potential.\\n\\n**5. Recommendations:**\\n\\n*   **Conduct independent site visit and detailed comparative market analysis (CMA).** Review title documents for any encumbrances. Engage a registered surveyor to confirm the boundaries and dimensions of the land.\\n\", \"warnings\": [], \"locations\": 1, \"projectId\": \"11\", \"plansTotal\": 1, \"totalValue\": 140000000, \"projectName\": \"kottawa - maharagama\", \"calculatedAt\": \"2025-10-14T10:58:59.113Z\", \"plansWithData\": 1, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"Kottawa\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1400000}], \"totalExtentPerches\": 100, \"averagePricePerPerch\": 1400000}',140000000.00,1,'2025-10-14 10:59:02',NULL),(83,12,'{\"plans\": [{\"extent\": \"6565.00\", \"planId\": 33, \"warning\": null, \"confidence\": \"low\", \"priceRange\": {\"max\": 1400000, \"min\": 1400000}, \"createdDate\": \"2025-10-15T10:20:29.000Z\", \"description\": \"\", \"lastUpdated\": \"2025-10-15T11:26:39.830Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 1400000, \"estimatedValue\": 9191000000, \"extentInPerches\": 6565, \"plan_identifier\": \"7894\", \"divisional_secretary\": \"homagama\"}, {\"extent\": \"100.00\", \"planId\": 32, \"warning\": null, \"confidence\": \"high\", \"priceRange\": {\"max\": 1250000, \"min\": 324500}, \"createdDate\": \"2025-10-15T05:31:26.000Z\", \"description\": null, \"lastUpdated\": \"2025-10-15T11:26:06.972Z\", \"extentSource\": \"current_extent_value\", \"pricePerPerch\": 655900, \"estimatedValue\": 65590000, \"extentInPerches\": 100, \"plan_identifier\": \"1546\", \"divisional_secretary\": \"Homagama\"}], \"stored\": false, \"insights\": \"Okay, here\'s a concise assessment of the Diyagama-Homagama land valuation project based on the provided data:\\n\\n**1. Value Reasonableness:**\\n\\n*   Averages LKR 1.4 million/perch for Plan 7894 and LKR 655,900/perch for Plan 1546. These are significantly different and warrants detailed due diligence of property characteristics & comparable sales data to confirm feasibility, considering potential development plans/zoning.\\n\\n**2. Location Factors:**\\n\\n*   Homagama is experiencing rapid development. Proximity to industrial zones, the NSBM Green University, transportation hubs, and existing infrastructure significantly influences land value. Confirm access, utilities, and environmental impact assessments.\\n\\n**3. Market Trends Consideration:**\\n\\n*   Land values in the Greater Colombo area, including Homagama, have been historically increasing, but economic instability may cause short-term fluctuations. Analyze current sale data and inflation trends within the specific micro-market for adjustments.\\n\\n**4. Risk Factors:**\\n\\n*   Political and economic uncertainty poses a significant risk to long-term property investments. Unclear land titles, potential disputes, and government regulations concerning land use are other risk considerations, warranting in-depth legal due diligence.\\n\\n**5. Recommendations:**\\n\\n*   Conduct detailed site inspections and obtain professional building plans, and building approvals to fully understand the land\'s development potential. Review comparable sales data within a 1km radius, considering similar land size and usage to validate the asking prices.\\n\", \"warnings\": [], \"locations\": 2, \"projectId\": \"12\", \"plansTotal\": 2, \"totalValue\": 9256590000, \"projectName\": \"Diyagama - Homagama\", \"calculatedAt\": \"2025-10-15T11:26:39.831Z\", \"plansWithData\": 2, \"projectStatus\": \"approved\", \"locationBreakdown\": [{\"location\": \"homagama\", \"confidence\": \"low\", \"plansCount\": 1, \"pricePerPerch\": 1400000}, {\"location\": \"Homagama\", \"confidence\": \"high\", \"plansCount\": 1, \"pricePerPerch\": 655900}], \"totalExtentPerches\": 6665, \"averagePricePerPerch\": 1388836}',9256590000.00,1,'2025-10-15 11:26:43',NULL);
/*!40000 ALTER TABLE `land_valuations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landowner_documents`
--

DROP TABLE IF EXISTS `landowner_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `landowner_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `landowner_id` int NOT NULL,
  `document_type` enum('id_card','bank_book') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_landowner_document` (`landowner_id`,`document_type`),
  CONSTRAINT `landowner_documents_ibfk_1` FOREIGN KEY (`landowner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landowner_documents`
--

LOCK TABLES `landowner_documents` WRITE;
/*!40000 ALTER TABLE `landowner_documents` DISABLE KEYS */;
INSERT INTO `landowner_documents` VALUES (5,9,'bank_book','9_bank_book_1759726302512.pdf','uploads\\Bank\\9_bank_book_1759726302512.pdf',360996,'application/pdf','2025-10-06 04:51:42','2025-10-06 04:51:42'),(6,9,'id_card','9_id_card_1759726308259.jpg','uploads\\ID\\9_id_card_1759726308259.jpg',151254,'image/jpeg','2025-10-06 04:51:48','2025-10-06 04:51:48'),(9,1,'bank_book','1_bank_book_1760519876099.png','uploads\\Bank\\1_bank_book_1760519876099.png',71503,'image/png','2025-10-15 09:17:56','2025-10-15 09:17:56'),(10,1,'id_card','1_id_card_1760519881684.png','uploads\\ID\\1_id_card_1760519881684.png',71503,'image/png','2025-10-15 09:18:01','2025-10-15 09:18:01');
/*!40000 ALTER TABLE `landowner_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `landowner_otps`
--

DROP TABLE IF EXISTS `landowner_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `landowner_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nic` varchar(12) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `otp_code` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `attempts` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `nic` (`nic`),
  KEY `mobile` (`mobile`),
  KEY `expires_at` (`expires_at`),
  KEY `is_used` (`is_used`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `landowner_otps`
--

LOCK TABLES `landowner_otps` WRITE;
/*!40000 ALTER TABLE `landowner_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `landowner_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lot_compensations`
--

DROP TABLE IF EXISTS `lot_compensations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lot_compensations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `owner_data` longtext,
  `compensation_payment` longtext,
  `interest_payment` longtext,
  `interest_voucher` longtext,
  `account_division` longtext,
  `total_compensation` decimal(15,2) DEFAULT '0.00',
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lot_compensations`
--

LOCK TABLES `lot_compensations` WRITE;
/*!40000 ALTER TABLE `lot_compensations` DISABLE KEYS */;
/*!40000 ALTER TABLE `lot_compensations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lot_owners`
--

DROP TABLE IF EXISTS `lot_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lot_owners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `owner_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `ownership_percentage` decimal(5,2) DEFAULT '100.00',
  `status` enum('active','inactive','transferred') DEFAULT 'active',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_lot_owner` (`lot_id`,`owner_id`),
  KEY `lot_id` (`lot_id`),
  KEY `owner_id` (`owner_id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `lot_owners_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_owners_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_owners_ibfk_3` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `lot_owners_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lot_owners_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lot_owners`
--

LOCK TABLES `lot_owners` WRITE;
/*!40000 ALTER TABLE `lot_owners` DISABLE KEYS */;
INSERT INTO `lot_owners` VALUES (30,21,11,14,100.00,'active',3,NULL,'2025-10-09 09:12:42','2025-10-09 09:12:42'),(31,21,12,14,100.00,'active',3,NULL,'2025-10-09 09:12:42','2025-10-09 09:12:42'),(32,22,13,14,100.00,'active',3,NULL,'2025-10-09 09:13:19','2025-10-09 09:13:19'),(33,23,14,14,100.00,'active',3,NULL,'2025-10-09 09:14:25','2025-10-09 09:14:25'),(34,24,15,14,100.00,'active',3,NULL,'2025-10-09 09:15:27','2025-10-09 09:15:27'),(35,25,11,14,100.00,'active',3,NULL,'2025-10-09 09:16:40','2025-10-09 09:16:40'),(36,25,14,14,100.00,'active',3,NULL,'2025-10-09 09:16:40','2025-10-09 09:16:40'),(37,27,1,12,100.00,'active',3,NULL,'2025-10-10 09:16:12','2025-10-10 09:16:12'),(111,388,1,31,100.00,'active',3,3,'2025-10-14 10:27:19','2025-10-14 16:28:35'),(112,389,1,31,100.00,'active',3,NULL,'2025-10-14 14:43:02','2025-10-14 14:43:02'),(113,388,67,31,100.00,'active',3,NULL,'2025-10-14 16:28:35','2025-10-14 16:28:35'),(114,390,1,32,100.00,'active',3,NULL,'2025-10-15 05:31:48','2025-10-15 05:31:48'),(115,391,1,33,100.00,'active',3,NULL,'2025-10-15 10:21:06','2025-10-15 10:21:06'),(116,392,68,33,100.00,'active',3,NULL,'2025-10-15 10:58:07','2025-10-15 10:58:07'),(118,394,1,35,100.00,'active',3,NULL,'2025-10-15 12:42:18','2025-10-15 12:42:18');
/*!40000 ALTER TABLE `lot_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lot_valuations`
--

DROP TABLE IF EXISTS `lot_valuations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lot_valuations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `statutorily_amount` decimal(15,2) DEFAULT '0.00',
  `addition_amount` decimal(15,2) DEFAULT '0.00',
  `development_amount` decimal(15,2) DEFAULT '0.00',
  `court_amount` decimal(15,2) DEFAULT '0.00',
  `thirty_three_amount` decimal(15,2) DEFAULT '0.00',
  `board_of_review_amount` decimal(15,2) DEFAULT '0.00',
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lot_valuations`
--

LOCK TABLES `lot_valuations` WRITE;
/*!40000 ALTER TABLE `lot_valuations` DISABLE KEYS */;
INSERT INTO `lot_valuations` VALUES (15,390,32,1000000.00,0.00,0.00,0.00,0.00,0.00,1000000.00,'2025-10-15','Financial Officer',NULL,'draft',6,NULL,NULL,'2025-10-15 05:34:19','2025-10-15 05:34:19'),(16,391,33,446546.00,5654556.00,655656.00,565465.00,5566.00,0.00,7327789.00,'2025-10-15','Financial Officer',NULL,'draft',6,NULL,NULL,'2025-10-15 10:22:19','2025-10-15 10:22:19'),(18,394,35,1000000.01,0.00,0.00,0.00,0.00,0.00,1000000.01,'2025-10-15','Financial Officer',NULL,'draft',6,NULL,NULL,'2025-10-15 12:44:16','2025-10-15 12:44:16');
/*!40000 ALTER TABLE `lot_valuations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lots`
--

DROP TABLE IF EXISTS `lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `lot_no` int NOT NULL,
  `extent_ha` decimal(10,4) DEFAULT NULL,
  `extent_perch` decimal(10,4) DEFAULT NULL,
  `land_type` enum('State','Private','Development Only') DEFAULT 'Private',
  `advance_tracing_no` varchar(100) DEFAULT NULL,
  `advance_tracing_extent_ha` decimal(10,4) DEFAULT NULL,
  `advance_tracing_extent_perch` decimal(10,4) DEFAULT NULL,
  `preliminary_plan_extent_ha` decimal(10,4) DEFAULT NULL,
  `preliminary_plan_extent_perch` decimal(10,4) DEFAULT NULL,
  `status` enum('active','pending','completed') DEFAULT 'active',
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
) ENGINE=InnoDB AUTO_INCREMENT=395 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lots`
--

LOCK TABLES `lots` WRITE;
/*!40000 ALTER TABLE `lots` DISABLE KEYS */;
INSERT INTO `lots` VALUES (3,2,4,2.5000,15.0000,'Private',NULL,NULL,NULL,NULL,NULL,'active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(4,2,5,3.0000,20.0000,'Private',NULL,NULL,NULL,NULL,NULL,'active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(5,2,6,1.8000,12.0000,'Private',NULL,NULL,NULL,NULL,NULL,'active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(21,14,1,NULL,NULL,'Private','65610',0.0304,12.0000,0.0304,12.0000,'active',3,3,'2025-10-09 09:12:42','2025-10-09 09:39:17'),(22,14,2,NULL,NULL,'Private','65610',0.0278,11.0000,0.0278,11.0000,'active',3,5,'2025-10-09 09:13:19','2025-10-09 13:40:33'),(23,14,3,NULL,NULL,'Private','65610',0.0329,13.0000,0.0329,13.0000,'active',3,3,'2025-10-09 09:14:25','2025-10-09 09:40:24'),(24,14,4,NULL,NULL,'Private','65610',0.0354,14.0000,0.0354,14.0000,'active',3,3,'2025-10-09 09:15:26','2025-10-09 09:40:36'),(25,14,5,NULL,NULL,'Private','65610',0.0253,10.0000,0.0253,10.0000,'active',3,3,'2025-10-09 09:16:40','2025-10-09 09:40:52'),(26,14,6,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 05:26:01','2025-10-10 05:26:01'),(27,12,1,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,3,'2025-10-10 09:02:36','2025-10-10 09:16:12'),(28,12,2,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 09:16:45','2025-10-10 09:16:45'),(29,12,3,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 09:17:00','2025-10-10 09:17:00'),(30,12,4,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 09:17:31','2025-10-10 09:17:31'),(31,12,5,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:31:21','2025-10-10 17:31:21'),(32,12,6,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:31:35','2025-10-10 17:31:35'),(33,12,7,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:31:43','2025-10-10 17:31:43'),(34,12,8,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:31:51','2025-10-10 17:31:51'),(35,12,9,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:31:58','2025-10-10 17:31:58'),(38,12,10,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-10 17:32:38','2025-10-10 17:32:38'),(388,31,1,NULL,NULL,'Private','565',0.0253,10.0000,0.0253,10.0000,'active',3,3,'2025-10-14 10:27:19','2025-10-14 16:29:12'),(389,31,2,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,3,'2025-10-14 10:45:04','2025-10-14 14:43:02'),(390,32,1,NULL,NULL,'Private',NULL,0.0253,10.0000,0.0253,10.0000,'active',3,3,'2025-10-15 05:31:48','2025-10-15 05:32:19'),(391,33,8,NULL,NULL,'Private','445',44.9999,17791.6105,65.0000,25699.0500,'active',3,3,'2025-10-15 10:21:06','2025-10-15 10:21:21'),(392,33,1,NULL,NULL,'Private',NULL,NULL,NULL,NULL,NULL,'active',3,NULL,'2025-10-15 10:58:07','2025-10-15 10:58:07'),(394,35,1,NULL,NULL,'Private','323',0.0253,10.0000,0.0253,10.0000,'active',3,3,'2025-10-15 12:42:18','2025-10-15 12:43:40');
/*!40000 ALTER TABLE `lots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_type` enum('image','document','pdf','other') DEFAULT 'other',
  `upload_status` enum('uploading','completed','failed') DEFAULT 'completed',
  `uploaded_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `message_id` (`message_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `file_type` (`file_type`),
  CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_attachments`
--

LOCK TABLES `message_attachments` WRITE;
/*!40000 ALTER TABLE `message_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `has_attachments` tinyint(1) DEFAULT '0',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `message_type` enum('general','project_related','official') DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (2,3,5,'Re: nnn','nnnnnnnnnnn',1,0,'normal','general','2025-09-25 15:41:17','2025-09-25 15:41:53'),(5,6,20,'helo','hello',0,0,'normal','general','2025-10-15 12:53:22','2025-10-15 12:53:22');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nic` varchar(20) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text,
  `owner_type` enum('Individual','Company','Government','Trust') DEFAULT 'Individual',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic` (`nic`),
  UNIQUE KEY `nic_2` (`nic`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `owners_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `owners_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES (1,'Umesh Hiripitiya','200129004750','+94769829976','no 237','Individual','active',3,3,'2025-09-14 18:24:01','2025-10-15 12:42:18'),(2,'John Doe','123456789012','+94771234567','123 Main Street, Colombo','Individual','active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(3,'Jane Smith','987654321098','+94776543210','456 Oak Avenue, Kandy','Individual','active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(4,'Robert Johnson','456789123045','+94779876543','789 Pine Road, Galle','Individual','active',1,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12'),(5,'Sashith Thushan','200234101127','+94760169369','280/5/1 puwakwatta road meegoda','Individual','active',3,3,'2025-09-23 09:12:12','2025-09-23 10:54:34'),(6,'deshan','200112341234','+94771234567','385 pitipana homagama','Individual','active',3,3,'2025-09-24 04:03:21','2025-09-24 08:46:31'),(7,'W.W Piyasili Fernando','1959000011460 ','+94771234568',NULL,'Individual','active',3,3,'2025-09-26 10:49:17','2025-10-06 04:50:42'),(8,'p. widana pathirana','197011008086','+94771234569',NULL,'Individual','active',3,NULL,'2025-09-26 10:53:22','2025-09-26 10:53:22'),(9,'Umesh Hiripitiya','200129004751','+94769829975','no 237','Individual','active',3,NULL,'2025-10-06 04:50:42','2025-10-06 04:50:42'),(10,'heshan','000000000000','+94000000000','','Individual','active',3,3,'2025-10-06 18:19:25','2025-10-06 18:19:39'),(11,'Saman Perera','200012345678','+94712345678','No. 45, Temple Rd, Elpitiya','Individual','active',3,3,'2025-10-09 09:06:47','2025-10-09 09:16:40'),(12,'Nadeesha Fernando','198934567890','+94769876543','No. 23, College Rd, Elpitiya','Individual','active',3,3,'2025-10-09 09:07:23','2025-10-09 09:12:42'),(13,'Dinesh Kumara','199845678901','+94773456789','No. 8, Main St, Elpitiya','Individual','active',3,NULL,'2025-10-09 09:13:19','2025-10-09 09:13:19'),(14,'Chamila Ranasinghe','200045678912','+94756789012','No. 102, Udawatta Rd, Elpitiya','Individual','active',3,3,'2025-10-09 09:14:25','2025-10-09 09:16:40'),(15,'Kasun Wijesinghe','199956789023','+94742345678','No. 55, Mahagedara, Elpitiya','Individual','active',3,NULL,'2025-10-09 09:15:27','2025-10-09 09:15:27'),(16,'Owner 1','100000000001','+94712345001','Address 1','Individual','active',3,3,'2025-10-10 19:01:09','2025-10-10 19:11:52'),(17,'Owner 2','100000000002','+94712345002','Address 2','Individual','active',3,3,'2025-10-10 19:01:10','2025-10-10 19:11:52'),(18,'Owner 3','100000000003','+94712345003','Address 3','Individual','active',3,3,'2025-10-10 19:01:12','2025-10-10 19:11:52'),(19,'Owner 4','100000000004','+94712345004','Address 4','Individual','active',3,3,'2025-10-10 19:01:14','2025-10-10 19:11:52'),(20,'Owner 5','100000000005','+94712345005','Address 5','Individual','active',3,3,'2025-10-10 19:01:16','2025-10-10 19:11:52'),(21,'Owner 6','100000000006','+94712345006','Address 6','Individual','active',3,3,'2025-10-10 19:01:18','2025-10-10 19:11:52'),(22,'Owner 7','100000000007','+94712345007','Address 7','Individual','active',3,3,'2025-10-10 19:01:20','2025-10-10 19:11:52'),(23,'Owner 8','100000000008','+94712345008','Address 8','Individual','active',3,3,'2025-10-10 19:01:21','2025-10-10 19:11:52'),(24,'Owner 9','100000000009','+94712345009','Address 9','Individual','active',3,3,'2025-10-10 19:01:23','2025-10-10 19:11:52'),(25,'Owner 10','100000000010','+94712345010','Address 10','Individual','active',3,3,'2025-10-10 19:01:25','2025-10-10 19:11:52'),(26,'Owner 11','100000000011','+94712345011','Address 11','Individual','active',3,3,'2025-10-10 19:01:27','2025-10-10 19:11:52'),(27,'Owner 12','100000000012','+94712345012','Address 12','Individual','active',3,3,'2025-10-10 19:01:28','2025-10-10 19:11:52'),(28,'Owner 13','100000000013','+94712345013','Address 13','Individual','active',3,3,'2025-10-10 19:01:30','2025-10-10 19:11:52'),(29,'Owner 14','100000000014','+94712345014','Address 14','Individual','active',3,3,'2025-10-10 19:01:32','2025-10-10 19:11:52'),(30,'Owner 15','100000000015','+94712345015','Address 15','Individual','active',3,3,'2025-10-10 19:01:34','2025-10-10 19:11:52'),(31,'Owner 16','100000000016','+94712345016','Address 16','Individual','active',3,3,'2025-10-10 19:01:36','2025-10-10 19:11:52'),(32,'Owner 17','100000000017','+94712345017','Address 17','Individual','active',3,3,'2025-10-10 19:01:37','2025-10-10 19:11:52'),(33,'Owner 18','100000000018','+94712345018','Address 18','Individual','active',3,3,'2025-10-10 19:01:39','2025-10-10 19:11:52'),(34,'Owner 19','100000000019','+94712345019','Address 19','Individual','active',3,3,'2025-10-10 19:01:41','2025-10-10 19:11:52'),(35,'Owner 20','100000000020','+94712345020','Address 20','Individual','active',3,3,'2025-10-10 19:01:43','2025-10-10 19:11:52'),(36,'Owner 1021','100000000021','+94712345021','Address 1021','Individual','active',3,NULL,'2025-10-10 19:01:44','2025-10-10 19:01:44'),(37,'Owner 1022','100000000022','+94712345022','Address 1022','Individual','active',3,NULL,'2025-10-10 19:01:46','2025-10-10 19:01:46'),(38,'Owner 1023','100000000023','+94712345023','Address 1023','Individual','active',3,NULL,'2025-10-10 19:01:48','2025-10-10 19:01:48'),(39,'Owner 1024','100000000024','+94712345024','Address 1024','Individual','active',3,NULL,'2025-10-10 19:01:50','2025-10-10 19:01:50'),(40,'Owner 1025','100000000025','+94712345025','Address 1025','Individual','active',3,NULL,'2025-10-10 19:01:51','2025-10-10 19:01:51'),(41,'Owner 1026','100000000026','+94712345026','Address 1026','Individual','active',3,NULL,'2025-10-10 19:01:53','2025-10-10 19:01:53'),(42,'Owner 1027','100000000027','+94712345027','Address 1027','Individual','active',3,NULL,'2025-10-10 19:01:55','2025-10-10 19:01:55'),(43,'Owner 1028','100000000028','+94712345028','Address 1028','Individual','active',3,NULL,'2025-10-10 19:01:57','2025-10-10 19:01:57'),(44,'Owner 1029','100000000029','+94712345029','Address 1029','Individual','active',3,NULL,'2025-10-10 19:01:58','2025-10-10 19:01:58'),(45,'Owner 1030','100000000030','+94712345030','Address 1030','Individual','active',3,NULL,'2025-10-10 19:02:00','2025-10-10 19:02:00'),(46,'Owner 1031','100000000031','+94712345031','Address 1031','Individual','active',3,NULL,'2025-10-10 19:02:02','2025-10-10 19:02:02'),(47,'Owner 1032','100000000032','+94712345032','Address 1032','Individual','active',3,NULL,'2025-10-10 19:02:04','2025-10-10 19:02:04'),(48,'Owner 1033','100000000033','+94712345033','Address 1033','Individual','active',3,NULL,'2025-10-10 19:02:05','2025-10-10 19:02:05'),(49,'Owner 1034','100000000034','+94712345034','Address 1034','Individual','active',3,NULL,'2025-10-10 19:02:07','2025-10-10 19:02:07'),(50,'Owner 1035','100000000035','+94712345035','Address 1035','Individual','active',3,NULL,'2025-10-10 19:02:09','2025-10-10 19:02:09'),(51,'Owner 1036','100000000036','+94712345036','Address 1036','Individual','active',3,NULL,'2025-10-10 19:02:11','2025-10-10 19:02:11'),(52,'Owner 1037','100000000037','+94712345037','Address 1037','Individual','active',3,NULL,'2025-10-10 19:02:12','2025-10-10 19:02:12'),(53,'Owner 1038','100000000038','+94712345038','Address 1038','Individual','active',3,NULL,'2025-10-10 19:02:14','2025-10-10 19:02:14'),(54,'Owner 1039','100000000039','+94712345039','Address 1039','Individual','active',3,NULL,'2025-10-10 19:02:16','2025-10-10 19:02:16'),(55,'Owner 1040','100000000040','+94712345040','Address 1040','Individual','active',3,NULL,'2025-10-10 19:02:17','2025-10-10 19:02:17'),(56,'Owner 1041','100000000041','+94712345041','Address 1041','Individual','active',3,NULL,'2025-10-10 19:02:19','2025-10-10 19:02:19'),(57,'Owner 1042','100000000042','+94712345042','Address 1042','Individual','active',3,NULL,'2025-10-10 19:02:21','2025-10-10 19:02:21'),(58,'Owner 1043','100000000043','+94712345043','Address 1043','Individual','active',3,NULL,'2025-10-10 19:02:23','2025-10-10 19:02:23'),(59,'Owner 1044','100000000044','+94712345044','Address 1044','Individual','active',3,NULL,'2025-10-10 19:02:24','2025-10-10 19:02:24'),(60,'Owner 1045','100000000045','+94712345045','Address 1045','Individual','active',3,NULL,'2025-10-10 19:02:26','2025-10-10 19:02:26'),(61,'Owner 1046','100000000046','+94712345046','Address 1046','Individual','active',3,NULL,'2025-10-10 19:02:28','2025-10-10 19:02:28'),(62,'Owner 1047','100000000047','+94712345047','Address 1047','Individual','active',3,NULL,'2025-10-10 19:02:30','2025-10-10 19:02:30'),(63,'Owner 1048','100000000048','+94712345048','Address 1048','Individual','active',3,NULL,'2025-10-10 19:02:32','2025-10-10 19:02:32'),(64,'Owner 1049','100000000049','+94712345049','Address 1049','Individual','active',3,NULL,'2025-10-10 19:02:33','2025-10-10 19:02:33'),(65,'Owner 1050','100000000050','+94712345050','Address 1050','Individual','active',3,NULL,'2025-10-10 19:02:35','2025-10-10 19:02:35'),(66,'Swarna Ranjani','197019701970','+94781742799','no 237','Individual','active',3,NULL,'2025-10-12 11:17:16','2025-10-12 11:17:16'),(67,'heshan tharushika','200120012456','+94761234985','pitipana','Individual','active',3,NULL,'2025-10-14 16:28:35','2025-10-14 16:28:35'),(68,'kadda kumara','200126702093','+94779504969','1st mile post, pituwala road, elpitiya.','Individual','active',3,NULL,'2025-10-15 10:58:07','2025-10-15 10:58:07');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `attempts` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email` (`email`),
  KEY `expires_at` (`expires_at`),
  KEY `is_used` (`is_used`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
INSERT INTO `password_reset_otps` VALUES (1,'umeshsandeepa1@gmail.com','$2b$10$7hCH3cmDHqE7J33BWuSfgu06/sbTB01eRAMk.iGFp5ct14i1ifqbC','2025-10-13 15:38:34',0,0,'2025-10-13 15:28:34'),(2,'umeshsandeepa1@gmail.com','$2b$10$osTJAbSaajKia5wZOxHnSOsNrIgyrcWFdzDdkq.qOEiN/wTLUFq4a','2025-10-13 15:47:37',0,0,'2025-10-13 15:37:36'),(3,'umeshsandeepa1@gmail.com','$2b$10$BI/b9igvM7OdPKXSR6kCjuUzBhidTHod7NZCsmrQIMaVaaTEDcHRm','2025-10-14 17:01:02',0,0,'2025-10-14 16:51:02'),(4,'sashiththushan19@gmail.com','$2b$10$vgAPQGim9/8sgSzVrPkgSukFMJ0VXE.JNw/Mqh5SS7Fq8gHgOXw2e','2025-10-15 14:36:21',0,0,'2025-10-15 14:26:20'),(5,'sashiththushan19@gmail.com','$2b$10$zZtJVjK6sqS7.ououWt6HuzotmwmzWpfhvDbicFkofYdtm19/cStm','2025-10-15 14:37:29',1,0,'2025-10-15 14:27:29');
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_identifier` varchar(100) NOT NULL COMMENT 'Combined Plan No / Cadastral No',
  `project_id` int NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `total_extent` decimal(10,4) DEFAULT NULL,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `estimated_extent` varchar(100) DEFAULT NULL,
  `advance_tracing_no` varchar(100) DEFAULT NULL,
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
  UNIQUE KEY `plan_identifier` (`plan_identifier`,`project_id`),
  KEY `created_by` (`created_by`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `plans_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (2,'8890',2,'Plan for Diyagama - Walgama area','Diyagama, Walgama',25.5000,50000000.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'in_progress',1,'2025-09-14 19:04:12','2025-09-14 19:04:12',0,0),(7,'8896',7,NULL,'homagama',NULL,5555555555.00,'5','555','homagama',5.00,'44','2025-10-01','45','2025-10-01','25',225555555.00,'pending',3,'2025-10-06 18:40:38','2025-10-06 18:40:38',0,0),(8,'9976',8,NULL,'Thambuttegama',NULL,13500000.00,'90','212','Thambuttegama',90.00,'44','2025-10-06','22','2025-10-06','25',13500000.00,'pending',3,'2025-10-07 17:36:39','2025-10-07 17:36:39',0,0),(9,'9977',8,NULL,'Medirigiriya',NULL,12600000.00,'84','212','Medirigiriya',84.00,'44','2025-10-06','45','2025-10-06','02',12600000.00,'pending',3,'2025-10-07 17:38:12','2025-10-07 17:38:12',0,0),(10,'9978',8,NULL,'Hingurakgoda',NULL,12900000.00,'86','212','Hingurakgoda',86.00,'44','2025-10-06','22','2025-10-06','02',12900000.00,'pending',3,'2025-10-07 17:39:26','2025-10-07 17:39:26',0,0),(11,'8032',9,NULL,'Elpitiya',NULL,6000000.00,'60','65610','Elpitiya',60.00,'44','2025-10-07','22','2025-10-07','02',6000000.00,'pending',3,'2025-10-08 03:39:05','2025-10-08 03:39:05',0,0),(12,'8033',9,NULL,'Karandeniya',NULL,5400000.00,'54',NULL,'Karandeniya',54.00,NULL,NULL,NULL,NULL,'515',5400000.00,'pending',3,'2025-10-08 03:43:55','2025-10-08 03:43:55',0,0),(14,'8039',9,NULL,'Kahaduwa',NULL,4899999.99,'49','65610','Kahaduwa',48.99,'55','2025-10-07','54','2025-10-07','25',4900000.00,'pending',3,'2025-10-08 03:47:26','2025-10-08 03:47:26',0,0),(24,'9999',8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending',3,'2025-10-14 08:41:59','2025-10-14 08:41:59',0,0),(31,'1234',11,NULL,'Kottawa',NULL,10000.00,'100','565','Kottawa',100.00,'46666','2025-09-30','44/1','2025-10-13','02',10000.00,'pending',3,'2025-10-14 10:25:28','2025-10-14 10:25:28',0,0),(32,'1546',12,NULL,'Homagama',NULL,1000000.00,'100',NULL,'Homagama',100.00,NULL,NULL,NULL,NULL,NULL,NULL,'pending',3,'2025-10-15 05:31:26','2025-10-15 05:31:26',0,0),(33,'7894',12,'','homagama',NULL,457.00,'8688','445','homagama',6565.00,'4434','2025-10-14','657','2025-10-01','456',757.00,'pending',3,'2025-10-15 10:20:29','2025-10-15 10:23:30',0,0),(35,'9987',14,NULL,'homagama',NULL,NULL,'90','323','homagama',NULL,NULL,NULL,'456','2025-10-01',NULL,NULL,'pending',3,'2025-10-15 12:42:00','2025-10-15 12:42:00',0,0);
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_assignments`
--

DROP TABLE IF EXISTS `project_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_assignments`
--

LOCK TABLES `project_assignments` WRITE;
/*!40000 ALTER TABLE `project_assignments` DISABLE KEYS */;
INSERT INTO `project_assignments` VALUES (4,7,3,5,'2025-10-06 18:39:04','active'),(5,8,3,5,'2025-10-07 17:34:07','active'),(6,9,3,5,'2025-10-08 03:35:47','active'),(7,11,3,9,'2025-10-14 10:19:31','active'),(8,12,3,17,'2025-10-15 05:29:11','active'),(10,14,3,20,'2025-10-15 12:39:46','active');
/*!40000 ALTER TABLE `project_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_documents`
--

DROP TABLE IF EXISTS `project_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `document_type` enum('proposal','approval','gazette','plan','survey','legal','other') DEFAULT 'other',
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_type` enum('image','document','pdf','dwg','other') DEFAULT 'other',
  `description` text,
  `upload_status` enum('uploading','completed','failed') DEFAULT 'completed',
  `uploaded_by` int NOT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `document_type` (`document_type`),
  KEY `file_type` (`file_type`),
  CONSTRAINT `project_documents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_documents`
--

LOCK TABLES `project_documents` WRITE;
/*!40000 ALTER TABLE `project_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('pending','approved','in_progress','completed','on_hold','rejected') DEFAULT 'pending',
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `rejected_by` int DEFAULT NULL,
  `rejection_reason` text,
  `initial_estimated_cost` decimal(15,2) DEFAULT NULL,
  `final_cost` decimal(15,2) DEFAULT NULL,
  `initial_extent_ha` decimal(10,4) DEFAULT NULL,
  `initial_extent_perch` decimal(10,4) DEFAULT NULL,
  `section_2_order` date DEFAULT NULL,
  `section_2_com` date DEFAULT NULL,
  `advance_tracing_no` varchar(100) DEFAULT NULL,
  `advance_tracing_date` date DEFAULT NULL,
  `section_5_no` varchar(100) DEFAULT NULL,
  `section_5_no_date` date DEFAULT NULL,
  `compensation_type` enum('regulation','larc/super larc','special Committee Decision') DEFAULT 'regulation',
  `notes` text,
  `start_date` date DEFAULT NULL,
  `expected_completion_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `approved_by` (`approved_by`),
  KEY `rejected_by` (`rejected_by`),
  KEY `status` (`status`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`rejected_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (2,'Diyagama - Walgama Road Project','Road development project in Diyagama area','in_progress',1,NULL,NULL,NULL,50000000.00,NULL,25.5000,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'regulation',NULL,'2024-01-01',NULL,NULL,'2025-09-14 19:04:12','2025-09-14 19:04:12',NULL,NULL),(4,'diyagama - walgama',NULL,'rejected',5,1,NULL,'duplicate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'regulation',NULL,NULL,NULL,NULL,'2025-09-26 10:26:41','2025-09-26 10:37:53',NULL,NULL),(6,'walgama- diyagama',NULL,'rejected',5,1,NULL,'duplicate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'regulation',NULL,NULL,NULL,NULL,'2025-09-26 10:35:40','2025-09-26 10:38:03',NULL,NULL),(7,'Homagama - Kottawa',NULL,'approved',5,1,NULL,NULL,1111111111111.00,NULL,12.0000,4744.4400,NULL,NULL,NULL,NULL,NULL,NULL,'regulation',NULL,NULL,NULL,NULL,'2025-10-06 18:38:11','2025-10-06 18:38:29',NULL,NULL),(8,'Anuradhapura - Polonnaruwa',NULL,'approved',5,1,NULL,NULL,39000000.00,NULL,0.6576,259.9900,'2025-10-01','2025-10-06','212','2025-10-06','213','2025-10-06','regulation',NULL,NULL,NULL,NULL,'2025-10-07 17:33:25','2025-10-07 17:33:45',NULL,NULL),(9,'Elpitiya – Kahaduwa',NULL,'approved',5,1,NULL,NULL,16700000.00,NULL,0.4123,163.0000,NULL,NULL,'65610','2025-10-06','86','2025-10-06','regulation',NULL,NULL,NULL,NULL,'2025-10-08 03:31:43','2025-10-15 10:38:23',NULL,NULL),(11,'kottawa - maharagama',NULL,'approved',9,1,NULL,NULL,100000.00,NULL,12.0000,4744.4400,'2025-10-09',NULL,'565','2025-10-01',NULL,NULL,'larc/super larc',NULL,NULL,NULL,NULL,'2025-10-14 10:14:54','2025-10-14 10:17:24',NULL,NULL),(12,'Diyagama - Homagama',NULL,'approved',17,1,NULL,NULL,10000000.00,NULL,1.2646,499.9900,NULL,NULL,NULL,NULL,NULL,NULL,'regulation',NULL,NULL,NULL,NULL,'2025-10-15 05:26:58','2025-10-15 05:27:34',NULL,NULL),(14,'walgama- diyagama',NULL,'approved',20,1,NULL,NULL,100000.00,NULL,2.5293,1000.0000,'2025-10-14','2025-10-14','323','2025-10-14',NULL,NULL,'regulation',NULL,NULL,NULL,NULL,'2025-10-15 12:39:00','2025-10-15 12:39:20',NULL,NULL);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `is_editable` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'system_name','Land Acquisition Management System','string','Application name',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(2,'version','1.0.0','string','System version',0,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(3,'max_file_size','10485760','number','Maximum file upload size in bytes (10MB)',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(4,'allowed_file_types','[\"pdf\",\"doc\",\"docx\",\"jpg\",\"jpeg\",\"png\",\"gif\",\"xls\",\"xlsx\"]','json','Allowed file types for document upload',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(5,'default_pagination_limit','20','number','Default number of records per page',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(6,'system_timezone','Asia/Colombo','string','System default timezone',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(7,'enable_audit_logging','true','boolean','Enable system audit logging',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(8,'password_min_length','8','number','Minimum password length requirement',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(9,'session_timeout','3600','number','Session timeout in seconds (1 hour)',1,'2025-09-14 18:15:22','2025-09-14 18:15:22'),(10,'backup_retention_days','30','number','Number of days to retain database backups',1,'2025-09-14 18:15:22','2025-09-14 18:15:22');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@lams.gov.lk','$2b$10$rG8qDjF5kL3mN9pQ7tS6UuVXYZ1AB2CD3EF4GH5IJ6KL7MN8OP9QR','CE','Chief','Engineer',NULL,NULL,'approved','2025-09-14 18:15:22','2025-09-14 18:15:22'),(3,'oj42070','oj42070@gmail.com','$2b$10$i4k5ThXXITRT2ZoRdUccjO/joa0FcrHPIlKUnvcoerN4MdeSOGX0G','LO','oliver ','james',NULL,NULL,'approved','2025-09-14 18:18:13','2025-09-14 18:18:53'),(5,'22it0543','22IT0543@itum.mrt.ac.lk','$2b$10$tcn3zX1l5RdjTDJk6jZSAO9xlMf.ZYI0m9UqNNWDLA32Cc14xoylq','PE','sashith ','thushan',NULL,NULL,'approved','2025-09-16 08:26:00','2025-09-16 08:26:21'),(6,'22it0544','22IT0544@itum.mrt.ac.lk','$2b$10$ebK0WrcHsEfu7DlmY1tnQO6oiSQF/trZ6FN6aJHv97R5C6zDAcWVS','FO','avishka','uda',NULL,NULL,'approved','2025-09-23 05:33:03','2025-09-23 05:33:23'),(7,'umeshsandeepa2','umeshsandeepa2@email.com','$2b$10$UWbFLXqodTbpJfzLLDkAw.Kb0Q.XvoBoOCXB0SEZLDOjSklrs8bTG','PE','Umesh','Hiripitiya',NULL,NULL,'rejected','2025-09-23 17:43:57','2025-10-15 03:54:50'),(8,'umeshsandeepa3','umeshsandeepa3@email.com','$2b$10$8IBh.gwiC3D9GXc1cNfyAue5OCmHSTBtdL7p3hOCDW5DYQxyFkWVO','PE','Umesh','Hiripitiya',NULL,NULL,'rejected','2025-09-23 17:44:36','2025-10-14 11:24:48'),(9,'hasangaanawarathna','hasangaanawarathna@gmail.com','$2b$10$D8PQbsuNInFzN8A2vdAWPOPeSNg3GUUY9a7UV1ojyvCYNuBScc1w.','PE','Hasanga','Anawe',NULL,NULL,'approved','2025-10-14 10:07:30','2025-10-14 10:08:02'),(10,'umeshsandeepa1','umeshsandeepa1@gmail.com','$2b$10$T9X7hKHW9e1BwOVIWIrDVe4keXpRIXD8UZZhUpOy0ud6017tT99QK','PE','Umesh','Hiripitiya',NULL,NULL,'rejected','2025-10-15 03:54:17','2025-10-15 03:54:56'),(16,'umeshsandeepa23','umeshsandeepa23@gmail.com','$2b$10$ezg730.uHKFOhOLEzeWMme1F0IeC0fOeXGMXL.sqbhoZIg2z.fXcG','PE','Umesh','Hiripitiya',NULL,NULL,'pending','2025-10-15 05:14:04','2025-10-15 05:14:04'),(17,'22it0479','22IT0479@itum.mrt.ac.lk','$2b$10$f1bOy5GwpvWHtbl13sgbt.F9JVQudux0BYQVPHOFw6tDniYNNjamS','PE','Umesh','Hiripitiya',NULL,NULL,'approved','2025-10-15 05:23:48','2025-10-15 05:25:09'),(20,'sashiththushan19','sashiththushan19@gmail.com','$2b$10$oswD5OOOxfcJ8.RKvPU9BON0PcfhR2nECx7qbyChCRZF.cT3P1K0.','PE','sashith','thushan',NULL,NULL,'approved','2025-10-15 12:37:34','2025-10-15 12:38:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valuations`
--

DROP TABLE IF EXISTS `valuations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valuations`
--

LOCK TABLES `valuations` WRITE;
/*!40000 ALTER TABLE `valuations` DISABLE KEYS */;
/*!40000 ALTER TABLE `valuations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `compensation_progress_view`
--

/*!50001 DROP VIEW IF EXISTS `compensation_progress_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `compensation_progress_view` AS select `compensation_payment_details`.`plan_id` AS `plan_id`,`compensation_payment_details`.`lot_id` AS `lot_id`,`compensation_payment_details`.`owner_nic` AS `owner_nic`,`compensation_payment_details`.`owner_name` AS `owner_name`,`compensation_payment_details`.`final_compensation_amount` AS `final_compensation_amount`,`compensation_payment_details`.`calculated_interest_amount` AS `calculated_interest_amount`,`compensation_payment_details`.`total_paid_interest` AS `total_paid_interest`,`compensation_payment_details`.`balance_due` AS `balance_due`,`compensation_payment_details`.`send_account_division_date` AS `send_account_division_date`,(case when ((`compensation_payment_details`.`balance_due` = 0) and (`compensation_payment_details`.`total_paid_interest` = `compensation_payment_details`.`calculated_interest_amount`) and (`compensation_payment_details`.`send_account_division_date` is not null)) then 'complete' when ((`compensation_payment_details`.`final_compensation_amount` > 0) or (`compensation_payment_details`.`total_paid_interest` > 0)) then 'partial' else 'pending' end) AS `auto_completion_status`,`compensation_payment_details`.`created_at` AS `created_at`,`compensation_payment_details`.`updated_at` AS `updated_at` from `compensation_payment_details` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-23  9:13:28
