-- MySQL dump 10.13  Distrib 9.3.0, for Win64 (x86_64)
--
-- Host: localhost    Database: gritcomicdb
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'Volume Cover','image','/uploads/1752929722817-851291108.png'),(2,'Chapter Page Description','text','<p>In a fractured cyberpunk city ruled by corporations and surveillance, a rogue hacker named Ryn stumbles upon a digital ghost—an AI thought long destroyed in the last uprising. With bounty hunters, corrupted tech, and a resistance on the edge of collapse, Ryn must decide: expose the truth and burn the system down, or disappear into the shadows like everyone else who dared to defy it.<br><em>Issue #1 begins a gritty, high-stakes saga of rebellion, memory, and machine loyalty.</em></p>');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,'Characters'),(1,'General'),(3,'World');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `chapterNum` int NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`chapterNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES (1,'Drive'),(2,'No Longer Driving');
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq`
--

DROP TABLE IF EXISTS `faq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq`
--

LOCK TABLES `faq` WRITE;
/*!40000 ALTER TABLE `faq` DISABLE KEYS */;
INSERT INTO `faq` VALUES (1,'What is Grit Comic?','Grit Comic is a webcomic platform that allows users to read and create comics online.'),(2,'How do I create an account?','You can create an account by clicking on the \"Sign Up\" button on the homepage and filling out the registration form.'),(3,'Is Grit Comic free to use?','Yes, Grit Comic is free to use. However, some features may require a premium subscription in the future.');
/*!40000 ALTER TABLE `faq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pageNum` int NOT NULL,
  `chapterNum` int NOT NULL,
  `image` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `chapterNum` (`chapterNum`),
  CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`chapterNum`) REFERENCES `chapters` (`chapterNum`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (114,1,1,'\\uploads\\1752162685513-225599476.jpg'),(115,2,1,'\\uploads\\1752162685537-422504817.jpg'),(116,3,1,'\\uploads\\1752162685560-327311757.jpg'),(117,4,1,'\\uploads\\1752162685579-217700485.jpg'),(118,5,1,'\\uploads\\1752162685594-835460507.jpg'),(119,6,1,'\\uploads\\1752162685612-439940402.jpg'),(120,7,1,'\\uploads\\1752162685640-524057166.jpg'),(121,8,1,'\\uploads\\1752162685649-929448736.jpg'),(122,9,1,'\\uploads\\1752162685666-725275018.jpg'),(123,10,1,'\\uploads\\1752162685684-306515110.jpg'),(124,11,1,'\\uploads\\1752162685707-841778055.jpg'),(125,12,1,'\\uploads\\1752162685722-966482691.jpg'),(126,13,1,'\\uploads\\1752162685733-696563431.jpg'),(127,14,1,'\\uploads\\1752162685756-659782282.jpg'),(128,15,1,'\\uploads\\1752162685767-280522152.jpg'),(129,16,1,'\\uploads\\1752162685778-900295143.jpg'),(130,17,1,'\\uploads\\1752162685788-154155436.jpg'),(131,18,1,'\\uploads\\1752162685808-282847826.jpg'),(132,19,1,'\\uploads\\1752162685883-454460514.jpg'),(133,20,1,'\\uploads\\1752162685911-548339449.jpg'),(134,21,1,'\\uploads\\1752162685949-28462171.jpg'),(135,22,1,'\\uploads\\1752162685969-278251981.jpg'),(136,23,1,'\\uploads\\1752162686001-950362647.jpg'),(137,1,2,'\\uploads\\1752163360857-128694723.jpg'),(138,2,2,'\\uploads\\1752163360857-201462612.jpg'),(139,3,2,'\\uploads\\1752163360858-20021926.jpg'),(140,4,2,'\\uploads\\1752163360859-997259711.jpg'),(141,5,2,'\\uploads\\1752163360859-754291801.jpg'),(142,6,2,'\\uploads\\1752163360860-48397684.jpg'),(143,7,2,'\\uploads\\1752163360860-553767830.jpg'),(144,8,2,'\\uploads\\1752163360861-716387297.jpg');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `updates`
--

DROP TABLE IF EXISTS `updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `updates`
--

LOCK TABLES `updates` WRITE;
/*!40000 ALTER TABLE `updates` DISABLE KEYS */;
INSERT INTO `updates` VALUES (2,'Initial Update 2','<p>Hello <strong>THIS IS </strong><em><u>an initial update</u></em></p><ul><li><p>BANG</p></li></ul>','2025-08-14 16:35:19','2025-08-14 16:35:19'),(3,'Test Update','<p>This is a deliberately long sentence designed to reach exactly five hundred characters, and in doing so it continues onward with descriptive phrasing, unnecessary repetition, and a certain rhythm that ensures the count is accurate, neither falling short of the requested total nor exceeding it by a single symbol, all while remaining one single continuous sentence without breaks, crafted carefully to illustrate what five hundred characters actually looks like here.</p>','2025-08-19 11:52:22','2025-08-19 12:20:45'),(4,'Test Update 2','<p>This is an extended demonstration sentence created to illustrate the approximate size and visual appearance of one thousand characters in a single continuous piece of writing, carefully constructed to be coherent enough for reading while also intentionally verbose and repetitive in order to reach the exact length requested, which is important because when setting limits for fields such as update posts, announcements, or status messages, developers often want to see how much real estate such a nu</p>','2025-08-19 12:21:21','2025-08-19 12:21:21'),(5,'Test Update 3','<p>This is a deliberately long demonstration text designed to be exactly one thousand characters in length so that it can be safely pasted into a TipTap editor with a character limit set to one thousand. It carefully includes letters, spaces, punctuation, and enough content to reach the limit without breaking words unnaturally. The purpose of this text is to test the full functionality of character counting within the editor, ensuring that the user can type, edit, and see the live character count properly update as changes are made. By structuring the text as one continuous paragraph and avoiding any line breaks or special characters beyond standard punctuation, it guarantees that the editor correctly interprets the content, counts the characters accurately, and prevents the user from exceeding the maximum allowed length while still displaying all content clearly for reading, editing, and testing purposes in a realistic use-case scenario for update posts or similar applications.</p><p></p>','2025-08-19 12:22:54','2025-08-19 14:40:18');
/*!40000 ALTER TABLE `updates` ENABLE KEYS */;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'OscarLad','oscar.cawley@outlook.com','$2b$10$c/DQoTPhWvsvI5Ktkn46QuWVcwLz7oszwYGc9RXgIIEQmwVlQeok2','2025-05-04 16:29:53',NULL,NULL),(7,'emmaharte','emma.louise.harte@googlemail.com','$2b$10$undZPWRk.2KUL.h9YRXIGOGXooDsPTk9nXd4tLi8sR1Cqa0eS8zwG','2025-07-09 11:27:15',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wiki`
--

DROP TABLE IF EXISTS `wiki`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wiki` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `wiki_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wiki`
--

LOCK TABLES `wiki` WRITE;
/*!40000 ALTER TABLE `wiki` DISABLE KEYS */;
INSERT INTO `wiki` VALUES (19,'The Violet Vault Heist','the-violet-vault-heist','<p>The <strong>Violet Vault Heist</strong> was a high-profile art and gemstone theft that took place on <strong>March 14, 2023</strong>, at the <strong>Kronen Museum of Antiquities</strong> in <strong>New Vienna</strong>, Austria. The operation resulted in the disappearance of the <em>Violet Star</em>, a 140-carat amethyst of extraordinary historical and cultural value. The heist is widely considered one of the most sophisticated and mysterious thefts of the 21st century.</p><h2>Background</h2><p>The <em>Violet Star</em> was discovered in 1897 in Sri Lanka and acquired by the Kronen Museum in 1981. The gem was stored in the museum’s <strong>Vault X</strong>, a private sublevel chamber outfitted with motion-detecting lasers, biometric locks, pressure-sensitive flooring, and a proprietary AI surveillance system named <strong>Cerberus</strong>.</p><p>The vault was believed to be impenetrable and had thwarted multiple attempted thefts in the past.</p><h2>The Heist</h2><p><strong>Timeline of Events</strong></p><ul><li><p><strong>March 14, 2023, 02:17 AM CET</strong> – A power anomaly disables external communications in Sector B of the Kronen Museum for 11 seconds.</p></li><li><p><strong>02:19 AM</strong> – Surveillance cameras show brief flickering, then static. Cerberus logs a false-positive maintenance protocol and disables alert routines for exactly 18 minutes.</p></li><li><p><strong>02:32 AM</strong> – Pressure sensors in Vault X report a 0.003 kg variance, well below alarm thresholds.</p></li><li><p><strong>02:47 AM</strong> – Motion detection is restored. The <em>Violet Star</em> is missing from its enclosure.</p></li></ul><p>No alarms were triggered. Security staff did not become aware of the theft until the museum reopened at 9:00 AM.</p><h2>Suspects</h2><p>Authorities believe the heist was orchestrated by the elusive crew known as <strong>The Mantis Syndicate</strong>, a collective of high-level thieves known for precision jobs involving minimal force and maximum misdirection.</p><p>Suspected members include:</p><ul><li><p><strong>Cassian Vale</strong> – Ex-security consultant turned rogue, expert in bypassing AI systems.</p></li><li><p><strong>\"Echo\" Liu</strong> – Surveillance hacker responsible for previous museum network breaches in Tokyo and São Paulo.</p></li><li><p><strong>Tariq al-Nasser</strong> – Engineering prodigy and explosives specialist, known for using non-destructive entry methods.</p></li><li><p><strong>Juliette \"Rook\" Varnier</strong> – Master of social engineering and disguise, possibly infiltrated the museum weeks in advance as an intern.</p></li></ul><p>None of the suspects have been apprehended. Interpol has issued red notices for Vale, Liu, and al-Nasser, though no formal charges have been made.</p><h2>Aftermath and Theories</h2><p>The <em>Violet Star</em> has not resurfaced on the black market. Its unique coloration and historical notches make it extremely difficult to resell without detection. Some theorists believe it was stolen on behalf of a private collector; others speculate it was destroyed or recut into smaller stones.</p><p>A minority theory suggests the heist was an elaborate hoax orchestrated by museum insiders to claim insurance money, though this has been publicly denied by museum officials.</p><h2>Cultural Impact</h2><p>The Violet Vault Heist has been the subject of:</p><ul><li><p>The 2024 documentary <em>Ghosts of Vault X</em></p></li><li><p>The bestselling novel <em>Cerberus Down</em> by Mila Dae</p></li><li><p>A miniseries adaptation announced by Sky Atlantic in 2025</p></li></ul><p>It remains one of the most infamous and enigmatic heists in modern criminal history.</p>',1,'2025-06-26 11:05:46','2025-07-09 11:36:18','/uploads/1752057378551-375550798.jpg'),(20,'Hello','hello','<p>hello</p>',3,'2025-06-26 11:29:16','2025-07-09 11:36:30','/uploads/1752057390068-632364881.png'),(21,'Jack Lowden','jack-lowden','<p>Hello im <strong><u>JACK LOWDEN</u></strong></p>',2,'2025-07-04 13:09:00','2025-07-09 11:36:37','/uploads/1752057397626-653549361.jpg');
/*!40000 ALTER TABLE `wiki` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-21 12:23:50
