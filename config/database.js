const { Sequelize } = require("sequelize");
require("dotenv").config();

// Configure the Sequelize connection to MariaDB
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
    logging: false, // Set to true to see SQL queries in the console
  },
);

module.exports = sequelize;
