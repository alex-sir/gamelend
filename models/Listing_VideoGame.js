const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Listing_VideoGame = sequelize.define(
  "Listing_VideoGame",
  {
    listingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM(
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
        "PC",
      ),
      allowNull: false,
    },
    genre: {
      type: DataTypes.ENUM(
        "Action",
        "Adventure",
        "RPG",
        "Sports",
        "Racing",
        "Fighting",
        "Strategy",
        "Simulation",
      ),
    },
    esrbRating: {
      type: DataTypes.ENUM("E", "E10+", "T", "M"),
    },
    publisher: {
      type: DataTypes.STRING,
    },
    releaseYear: {
      type: DataTypes.INTEGER,
    },
  },
  { timestamps: false },
);

module.exports = Listing_VideoGame;
