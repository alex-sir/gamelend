CREATE DATABASE IF NOT EXISTS gamelend;
CREATE USER IF NOT EXISTS 'gamelend_user'@'localhost' IDENTIFIED BY 'gamelend_dev';
GRANT ALL PRIVILEGES ON gamelend.* TO 'gamelend_user'@'localhost';
FLUSH PRIVILEGES;
