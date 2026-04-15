-- 1. Wipe the existing database and all its data
DROP DATABASE IF EXISTS gamelend;

-- 2. Recreate the fresh database
CREATE DATABASE gamelend;

-- 3. Ensure the dev user still has permissions
CREATE USER IF NOT EXISTS 'gamelend_user'@'localhost' IDENTIFIED BY 'gamelend_dev';
GRANT ALL PRIVILEGES ON gamelend.* TO 'gamelend_user'@'localhost';
FLUSH PRIVILEGES;
