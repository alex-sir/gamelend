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
        len: [5, 100],
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
    condition: {
      type: DataTypes.ENUM(
        "New",
        "Like New",
        "Very Good",
        "Good",
        "Acceptable",
      ),
      allowNull: false,
      defaultValue: "Good",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 99,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 2000],
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
