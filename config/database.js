const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Essential for bypassing self-signed cert issues on free cloud DBs
      },
    },
    logging: false, // Optional: turns off raw SQL terminal spam
  },
);

module.exports = sequelize;
