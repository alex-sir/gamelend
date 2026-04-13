const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PlatformSettings = sequelize.define(
  "PlatformSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    settingCategory: {
      type: DataTypes.ENUM("Payments", "Rentals", "Listings", "Notifications"),
      allowNull: false,
    },
    settingKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    settingValue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = PlatformSettings;