const { sequelize } = require("../models");

async function cleanup() {
  try {
    console.log("Dropping Reports table to resolve sync conflicts...");
    await sequelize.query("DROP TABLE IF EXISTS Reports;");
    console.log("Success! You can now restart nodemon.");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping table:", error);
    process.exit(1);
  }
}

cleanup();
