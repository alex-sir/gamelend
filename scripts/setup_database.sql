CREATE DATABASE IF NOT EXISTS gamelend_db;
CREATE USER IF NOT EXISTS 'gamelend_user'@'localhost' IDENTIFIED BY 'gamelend_dev';
GRANT ALL PRIVILEGES ON gamelend_db.* TO 'gamelend_user'@'localhost';
FLUSH PRIVILEGES;
