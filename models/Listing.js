const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Listing = sequelize.define(
  "Listing",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lenderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [5, 100], // Title must be between 5 and 100 characters
      },
    },
    // category: {
    //   type: DataTypes.ENUM("Video Game", "Console", "Accessory"),
    //   allowNull: false,
    // }
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 2000], // Minimum 50 characters required
      },
    },
    dailyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 1.0,
        max: 500.0,
      },
    },
    status: {
      type: DataTypes.ENUM("Active", "Draft", "Suspended", "Deleted"),
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Listing;
