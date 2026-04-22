/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: gamelend
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `AuditLogs`
--

DROP TABLE IF EXISTS `AuditLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adminId` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `targetType` varchar(255) NOT NULL,
  `targetId` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adminId` (`adminId`),
  CONSTRAINT `1` FOREIGN KEY (`adminId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditLogs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `AuditLogs` WRITE;
/*!40000 ALTER TABLE `AuditLogs` DISABLE KEYS */;
INSERT INTO `AuditLogs` VALUES
(1,1,'Platform Setup','System',NULL,'Initial system seeding and platform configuration completed.','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,1,'Category Creation','Category',NULL,'Standard categories (Console, Video Game, Accessory) initialized.','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,1,'Security Policy','User',NULL,'Admin and test accounts secured with default credentials.','2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `AuditLogs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentId` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES
(1,NULL,'Console',NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,NULL,'Video Game',NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,NULL,'Accessory',NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Images`
--

DROP TABLE IF EXISTS `Images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listingId` int(11) NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `isPrimary` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listingId` (`listingId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Images`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Images` WRITE;
/*!40000 ALTER TABLE `Images` DISABLE KEYS */;
INSERT INTO `Images` VALUES
(1,1,'https://media.gamestop.com/i/gamestop/20009351_ALT05?$pdp$?w=1256&h=664&fmt=auto',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,1,'https://media.wired.com/photos/5fa9dbb7ed97b6b30c266262/master/pass/games_gear_ps5-disc.jpg',0,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,2,'https://thesunflower.com/wp-content/uploads/2024/02/Tears-of-the-Kingdom-wallpaper-1170x720-1.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(4,2,'https://static0.pocketlintimages.com/wordpress/wp-content/uploads/2023/05/legend-of-zelda-tears-of-the-kingdom-9.jpg?w=1600&h=900&fit=crop',0,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(5,3,'https://m.media-amazon.com/images/I/717XTm0moDL._AC_UF1000,1000_QL80_.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(6,3,'https://i.extremetech.com/imagery/content-types/04K176NzQ8xAqEfIXArLIHe/hero-image.fit_lim.v1678673188.jpg',0,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(7,4,'https://m.media-amazon.com/images/I/81-6ZsysglL.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(8,5,'https://m.media-amazon.com/images/I/8139kZStJ6L._AC_UF1000,1000_QL80_.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(9,5,'https://static01.nyt.com/images/2024/02/22/multimedia/22finalfantasy-review-bjzf/22finalfantasy-review-bjzf-superJumbo.jpg',0,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(10,6,'https://m.media-amazon.com/images/M/MV5BN2IyY2VjMDctNGMzYS00ZWEwLTkyNTgtNTdkNDQ3MzA0MDhmXkEyXkFqcGc@._V1_.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(11,7,'https://m.media-amazon.com/images/I/81kN3ZgSSGL.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(12,8,'https://www.nintendo.com/my/hardware/detail/switch-oled/img/01-bgdark/main_pic_sp.png',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(13,9,'https://cms-assets.xboxservices.com/assets/bc/40/bc40fdf3-85a6-4c36-af92-dca2d36fc7e5.png?n=642227_Hero-Gallery-0_A1_857x676.png',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(14,10,'https://gmedia.playstation.com/is/image/SIEPDC/PSVR2-thumbnail-01-en-22feb22?$facebook$',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(15,11,'https://gmedia.playstation.com/is/image/SIEPDC/dualsense-edge-listing-thumb-01-en-23aug22?$facebook$',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(16,12,'https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164bb5f33069b37e49fba1a572ea3b89971ee7b.jpg',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(17,13,'https://assets-prd.ignimgs.com/2023/06/12/dragonsdogma2-1686609309622.jpg?crop=1%3A1%2Csmart&format=jpg&auto=webp&quality=80',1,'2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `Images` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Listing_Accessories`
--

DROP TABLE IF EXISTS `Listing_Accessories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Listing_Accessories` (
  `listingId` int(11) NOT NULL,
  `accessoryType` enum('Controller','Headset','VR Equipment','Racing Wheel','Flight Stick','Charging Station','Other') NOT NULL,
  `compatiblePlatforms` varchar(255) DEFAULT NULL,
  `isWireless` tinyint(1) DEFAULT 0,
  `brand` varchar(255) DEFAULT NULL,
  `modelNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`listingId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Listing_Accessories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Listing_Accessories` WRITE;
/*!40000 ALTER TABLE `Listing_Accessories` DISABLE KEYS */;
INSERT INTO `Listing_Accessories` VALUES
(3,'Controller','Xbox Series X/S, Xbox One, PC',1,'Microsoft','FST-00001'),
(10,'VR Equipment','PS5',0,'Sony','CFI-ZVR1W'),
(11,'Controller','PS5, PC',1,'Sony','CFI-ZCP1');
/*!40000 ALTER TABLE `Listing_Accessories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Listing_Consoles`
--

DROP TABLE IF EXISTS `Listing_Consoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Listing_Consoles` (
  `listingId` int(11) NOT NULL,
  `consoleType` enum('PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch') NOT NULL,
  `storageCapacity` varchar(255) DEFAULT NULL,
  `controllersIncluded` tinyint(1) DEFAULT 0,
  `controllerQuantity` int(11) DEFAULT 0,
  `cablesIncluded` tinyint(1) DEFAULT 0,
  `serialNumber` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`listingId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Listing_Consoles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Listing_Consoles` WRITE;
/*!40000 ALTER TABLE `Listing_Consoles` DISABLE KEYS */;
INSERT INTO `Listing_Consoles` VALUES
(1,'PlayStation 5','825GB NVMe SSD',1,2,1,'PS5-987654321-XYZ'),
(4,'Nintendo Switch','N/A',1,1,1,NULL),
(8,'Nintendo Switch','256GB',1,2,1,NULL),
(9,'Xbox Series X/S','1TB SSD',1,1,1,NULL);
/*!40000 ALTER TABLE `Listing_Consoles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Listing_VideoGames`
--

DROP TABLE IF EXISTS `Listing_VideoGames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Listing_VideoGames` (
  `listingId` int(11) NOT NULL,
  `platform` enum('PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','PC') NOT NULL,
  `genre` enum('Action','Adventure','RPG','Sports','Racing','Fighting','Strategy','Simulation') DEFAULT NULL,
  `esrbRating` enum('E','E10+','T','M') DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `releaseYear` int(11) DEFAULT NULL,
  PRIMARY KEY (`listingId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Listing_VideoGames`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Listing_VideoGames` WRITE;
/*!40000 ALTER TABLE `Listing_VideoGames` DISABLE KEYS */;
INSERT INTO `Listing_VideoGames` VALUES
(2,'Nintendo Switch','Adventure','E10+','Nintendo',2023),
(5,'PlayStation 5','RPG','T','Square Enix',2024),
(6,'PlayStation 5','Action','M','Sony Interactive Entertainment',2024),
(7,'Nintendo Switch','Adventure','E','Nintendo',2023),
(12,'PlayStation 5','RPG','M','Larian Studios',2023),
(13,'Xbox Series X/S','RPG','M','Capcom',2024);
/*!40000 ALTER TABLE `Listing_VideoGames` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Listings`
--

DROP TABLE IF EXISTS `Listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Listings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lenderId` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `condition` enum('New','Like New','Very Good','Good','Acceptable') NOT NULL DEFAULT 'Good',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `description` text NOT NULL,
  `dailyRate` decimal(10,2) NOT NULL,
  `dynamicCategoryId` int(11) DEFAULT NULL,
  `status` enum('Draft','Active','Suspended','Deleted') NOT NULL DEFAULT 'Draft',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lenderId` (`lenderId`),
  KEY `dynamicCategoryId` (`dynamicCategoryId`),
  CONSTRAINT `1` FOREIGN KEY (`lenderId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`dynamicCategoryId`) REFERENCES `Categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Listings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Listings` WRITE;
/*!40000 ALTER TABLE `Listings` DISABLE KEYS */;
INSERT INTO `Listings` VALUES
(1,2,'PlayStation 5 Console - Disk Edition','Console','Like New',5,'Hardly used PS5 with two controllers. 4K gaming ready! Comes in original box with all HDMI and power cables. Perfectly quiet, no fan coil whine.',7.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,2,'The Legend of Zelda: Tears of the Kingdom','Video Game','Very Good',1,'Physical cartridge for Nintendo Switch. Case is included and in perfect condition. Dive into the massive world of Hyrule and the skies above!',1.50,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,2,'Xbox Elite Wireless Controller Series 2','Accessory','Good',2,'Pro-level Xbox controller with adjustable-tension thumbsticks, wrap-around rubberized grip, and shorter hair trigger locks. Includes carrying case.',2.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(4,2,'Nintendo 64 - Original Charcoal','Console','Acceptable',1,'Classic N64 console. Works great, but missing the expansion pak cover. Comes with one gray controller and AV cables.',10.00,NULL,'Draft','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(5,2,'Final Fantasy VII Rebirth','Video Game','Like New',1,'The unknown journey continues. Physical copy for PS5. Comes with both the Data Disc and the Play Disc in pristine condition.',2.50,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(6,2,'Helldivers 2','Video Game','Good',3,'Join the Helldivers and fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person shooter.',1.50,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(7,2,'Super Mario Bros. Wonder','Video Game','Very Good',2,'Find wonder in the next evolution of Mario fun! Physical Switch cartridge.',1.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(8,2,'Nintendo Switch OLED Model - White Joy-Con','Console','Good',3,'Includes dock, HDMI cable, power adapter, and Joy-Con grip. Perfect for a weekend party or testing before you buy.',5.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(9,2,'Xbox Series X','Console','Very Good',4,'Microsoft\'s most powerful console. Includes 1 standard wireless controller and a high-speed HDMI cable.',6.50,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(10,2,'PlayStation VR2 Headset & Horizon Call of the Mountain','Accessory','Like New',2,'Next-gen virtual reality for the PS5. Includes the VR headset, two Sense controllers, and stereo headphones. Note: Requires a PS5 to operate.',15.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(11,2,'DualSense Edge Wireless Controller','Accessory','Like New',7,'Pro controller for the PS5. Comes with the carrying case, braided USB cable, and all interchangeable back buttons and stick caps.',3.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(12,2,'Baldur\'s Gate 3 - Deluxe Edition','Video Game','Very Good',9,'Gather your party and return to the Forgotten Realms. Physical PS5 edition. Huge game with hundreds of hours of content.',2.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(13,2,'Dragon\'s Dogma 2','Video Game','New',5,'Brand new condition. Action-RPG for the Xbox Series X. Lead your Pawns and slay legendary monsters.',2.00,NULL,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `Listings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `PlatformSettings`
--

DROP TABLE IF EXISTS `PlatformSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlatformSettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `settingCategory` enum('Payments','Rentals','Listings','Notifications') NOT NULL,
  `settingKey` varchar(255) NOT NULL,
  `settingValue` varchar(255) NOT NULL,
  `updatedBy` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settingKey` (`settingKey`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlatformSettings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `PlatformSettings` WRITE;
/*!40000 ALTER TABLE `PlatformSettings` DISABLE KEYS */;
INSERT INTO `PlatformSettings` VALUES
(1,'Payments','platformFeePercent','10',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,'Rentals','maintenanceMode','false',1,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,'Listings','maxImagesPerListing','8',1,'2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `PlatformSettings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `RentalRequests`
--

DROP TABLE IF EXISTS `RentalRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RentalRequests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listingId` int(11) NOT NULL,
  `borrowerId` int(11) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` enum('Pending','Accepted','Rejected','Cancelled') DEFAULT 'Pending',
  `rejectionReason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listingId` (`listingId`),
  KEY `borrowerId` (`borrowerId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`borrowerId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RentalRequests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `RentalRequests` WRITE;
/*!40000 ALTER TABLE `RentalRequests` DISABLE KEYS */;
INSERT INTO `RentalRequests` VALUES
(1,2,3,'2026-04-07','2026-04-11','Accepted',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,1,3,'2026-04-19','2026-04-24','Accepted',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,8,3,'2026-04-23','2026-04-26','Pending',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(4,2,3,'2026-04-28','2026-05-01','Rejected',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(5,1,3,'2026-03-22','2026-03-24','Cancelled',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(6,5,3,'2026-04-22','2026-04-28','Pending',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(7,6,3,'2026-04-20','2026-04-28','Accepted',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(8,3,3,'2026-04-16','2026-04-24','Accepted',NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `RentalRequests` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Rentals`
--

DROP TABLE IF EXISTS `Rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rentals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requestId` int(11) NOT NULL,
  `lenderId` int(11) NOT NULL,
  `actualTotal` decimal(10,2) NOT NULL,
  `status` enum('Active','Completed','Overdue') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `requestId` (`requestId`),
  KEY `lenderId` (`lenderId`),
  CONSTRAINT `1` FOREIGN KEY (`requestId`) REFERENCES `RentalRequests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`lenderId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rentals`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Rentals` WRITE;
/*!40000 ALTER TABLE `Rentals` DISABLE KEYS */;
INSERT INTO `Rentals` VALUES
(1,1,2,6.00,'Completed','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(2,2,2,21.00,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,7,2,1.50,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38'),
(4,8,2,14.00,'Active','2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `Rentals` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Reports`
--

DROP TABLE IF EXISTS `Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `listingId` int(11) DEFAULT NULL,
  `reporterId` int(11) NOT NULL,
  `reportedUserId` int(11) DEFAULT NULL,
  `reason` enum('fraud','misleading','safety','abuse','damage','missing_item','other') NOT NULL,
  `details` text NOT NULL,
  `referenceUrl` varchar(255) DEFAULT NULL,
  `status` enum('Submitted','Reviewed','Dismissed') DEFAULT 'Submitted',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listingId` (`listingId`),
  KEY `reporterId` (`reporterId`),
  KEY `reportedUserId` (`reportedUserId`),
  CONSTRAINT `1` FOREIGN KEY (`listingId`) REFERENCES `Listings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`reporterId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `3` FOREIGN KEY (`reportedUserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reports`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Reports` WRITE;
/*!40000 ALTER TABLE `Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reports` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('borrower','lender','admin') DEFAULT 'borrower',
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `isSuspended` tinyint(1) DEFAULT 0,
  `suspensionReason` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES
(1,'peach@admin.com','$2b$10$PQ1s3.ajLBdXY40mq0CrauJBtwnw2o0GLRviuJa5b8jpcYkd0L6Vq','admin','Princess','Peach',NULL,NULL,0,NULL,'2026-04-22 00:58:37','2026-04-22 00:58:37'),
(2,'mario@lender.com','$2b$10$h3BdsjEAxapkTYL9XjqdaOjcJxXqqC9zS6OuRV/RVp4NZbA7vER8.','lender','Mario','Bros',NULL,NULL,0,NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38'),
(3,'luigi@borrower.com','$2b$10$i3vMyPPxqU6pSkUiwAMSp.MVmnZySTWYO0POxsYGQn/35JfU8PzTq','borrower','Luigi','Bros',NULL,NULL,0,NULL,'2026-04-22 00:58:38','2026-04-22 00:58:38');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-04-21 17:59:11
