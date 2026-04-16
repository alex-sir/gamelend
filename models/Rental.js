const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Rental = sequelize.define(
  "Rental",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lenderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actualTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Completed", "Overdue"),
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Rental;
