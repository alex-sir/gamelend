const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Listing_Console = sequelize.define(
  "Listing_Console",
  {
    listingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    consoleType: {
      type: DataTypes.ENUM(
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
      ),
      allowNull: false,
    },
    storageCapacity: {
      type: DataTypes.STRING, // e.g., "1TB"
    },
    controllersIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    controllerQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cablesIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    serialNumber: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false },
);

module.exports = Listing_Console;
