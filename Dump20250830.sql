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
-- Table structure for table `lot_owners`
--

DROP TABLE IF EXISTS `lot_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lot_owners` (
  `lot_id` int NOT NULL,
  `owner_id` int NOT NULL,
  `share_percentage` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`lot_id`,`owner_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `lot_owners_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `lots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lot_owners_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lot_owners`
--

LOCK TABLES `lot_owners` WRITE;
/*!40000 ALTER TABLE `lot_owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `lot_owners` ENABLE KEYS */;
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
  `lot_no` varchar(50) NOT NULL,
  `extent_ha` decimal(10,2) DEFAULT NULL,
  `extent_perch` decimal(10,2) DEFAULT NULL,
  `land_type` enum('State','Private','Development Only') NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `lots_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lots_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lots_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lots`
--

LOCK TABLES `lots` WRITE;
/*!40000 ALTER TABLE `lots` DISABLE KEYS */;
/*!40000 ALTER TABLE `lots` ENABLE KEYS */;
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
  `nic` varchar(20) DEFAULT NULL,
  `address` text,
  `contact_no` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nic` (`nic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `plan_no` decimal(10,0) NOT NULL,
  `description` text,
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `section_38_gno` varchar(45) DEFAULT NULL,
  `section_38_gdate` date DEFAULT NULL,
  `section_5_gno` varchar(45) DEFAULT NULL,
  `section_5_gdate` date DEFAULT NULL,
  `section_7_gno` varchar(45) DEFAULT NULL,
  `section_7_gdate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plans_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,1,1001,'First plan for Project A',500000.00,2,'2025-08-28 14:01:08','2025-08-28 14:01:08','G-123','2025-08-01','S-456','2025-08-05','S7-789','2025-08-10'),(2,1,2,'First plan for Project A',500000.00,2,'2025-08-28 14:02:09','2025-08-28 14:02:09','G-123','2025-08-01','S-456','2025-08-05','S7-789','2025-08-10');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `initial_estimated_cost` decimal(12,2) NOT NULL,
  `initial_extent_ha` decimal(10,2) DEFAULT NULL,
  `initial_extent_perch` decimal(10,0) DEFAULT NULL,
  `section_2_order` date DEFAULT NULL,
  `section_2_com` date DEFAULT NULL,
  `advance_tracing_no` varchar(50) DEFAULT NULL,
  `compensation_type` enum('regulation','larc_superlarc','special_committee_decision') DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `advance_tracing_date` date DEFAULT NULL,
  `section_5_no` varchar(45) DEFAULT NULL,
  `section_5_no_date` varchar(45) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Highway Expansion Project',150000000.00,250.50,500,'2025-01-15','2025-02-20','AT-4521','regulation','Initial feasibility study completed.','2025-08-28 07:53:42','2025-08-28 07:53:42','2025-03-01','GZ-5521','2025-04-01','pending'),(2,'Bridge Construction Project',80000000.00,200.50,NULL,'2025-05-10',NULL,'AT-2002','larc_superlarc','Updated after survey','2025-08-28 08:27:16','2025-08-28 08:31:43',NULL,NULL,NULL,'pending');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `role` enum('chief_engineer','land_officer','project_engineer','financial_officer') NOT NULL DEFAULT 'land_officer',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'oliver','james','oj42070@gmail.com','$2b$10$SCICb2Eb5rpz6ewKgcu60ehsFr69d8UK1ruYExGH1KPwaumeRyCVe','approved','land_officer','2025-08-27 08:53:04',NULL,NULL,NULL,NULL,NULL,'2025-08-29 00:17:47'),(3,'Alice','Smith','alice@example.com','$2b$10$4u2SlQaxyTycm5u6uENADelZ9ni7BzfCVMM1VBz4Mqrnfk0Qair7W','approved','project_engineer','2025-08-27 13:23:00','66f1ce492da75bd47071d8ca501d138481b0e6a3','2025-08-27 21:27:18',NULL,NULL,NULL,'2025-08-29 00:17:47'),(4,'Michael','Brown','michael@example.com','$2b$10$WLVK/pSEifgmeoBzhFv50.X8HLEM3.yd0dP7esVXGVo9KUEHgykne','approved','financial_officer','2025-08-27 13:27:43',NULL,NULL,'2025-08-29 00:18:40',NULL,NULL,'2025-08-29 00:17:47'),(16,'umesh','Hiripitiya','22it0479@itum.mrt.ac.lk','$2b$10$W.zpP4IW2hsHLkRtenVx/uhqyKlH/DaBzEOs.VsUV1eg.IKM9SJva','approved','project_engineer','2025-08-30 03:09:03',NULL,NULL,'2025-08-30 08:39:22',NULL,NULL,'2025-08-30 08:39:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'land_acqusition'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-30 22:18:43
