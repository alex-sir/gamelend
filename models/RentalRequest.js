const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RentalRequest = sequelize.define(
  "RentalRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    borrowerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Accepted", "Rejected", "Cancelled"),
      defaultValue: "Pending",
    },
    rejectionReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = RentalRequest;
