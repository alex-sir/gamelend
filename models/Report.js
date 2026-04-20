const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reportedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reason: {
      type: DataTypes.ENUM("fraud", "misleading", "safety", "abuse", "damage", "missing_item", "other"),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    referenceUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Submitted", "Reviewed", "Dismissed"),
      defaultValue: "Submitted",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Report;
