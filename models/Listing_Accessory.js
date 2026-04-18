const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Listing_Accessory = sequelize.define(
  "Listing_Accessory",
  {
    listingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    accessoryType: {
      type: DataTypes.ENUM(
        "Controller",
        "Headset",
        "VR Equipment",
        "Racing Wheel",
        "Flight Stick",
        "Charging Station",
        "Other",
      ),
      allowNull: false,
    },
    compatiblePlatforms: {
      type: DataTypes.STRING, // e.g., "PS5, PC"
    },
    isWireless: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    brand: {
      type: DataTypes.STRING,
    },
    modelNumber: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false },
);

module.exports = Listing_Accessory;
