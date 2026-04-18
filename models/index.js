// models/index.js
const sequelize = require("../config/database");

// Import all models normally
const User = require("./User");
const Listing = require("./Listing");
const Image = require("./Image");
const RentalRequest = require("./RentalRequest");
const Rental = require("./Rental");
const Report = require("./Report");
const Listing_VideoGame = require("./Listing_VideoGame");
const Listing_Console = require("./Listing_Console");
const Listing_Accessory = require("./Listing_Accessory");

// --- Define Relationships (ER Diagram Mapping) ---

// User -> Listing (One-to-Many)
User.hasMany(Listing, { foreignKey: "lenderId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "lenderId", as: "lender" });

// Listing -> Sub-Types (One-to-One)
Listing.hasOne(Listing_VideoGame, {
  foreignKey: "listingId",
  as: "videoGameDetails",
  onDelete: "CASCADE",
});
Listing_VideoGame.belongsTo(Listing, { foreignKey: "listingId" });

Listing.hasOne(Listing_Console, {
  foreignKey: "listingId",
  as: "consoleDetails",
  onDelete: "CASCADE",
});
Listing_Console.belongsTo(Listing, { foreignKey: "listingId" });

Listing.hasOne(Listing_Accessory, {
  foreignKey: "listingId",
  as: "accessoryDetails",
  onDelete: "CASCADE",
});
Listing_Accessory.belongsTo(Listing, { foreignKey: "listingId" });

// Listing -> Image (One-to-Many)
Listing.hasMany(Image, {
  foreignKey: "listingId",
  as: "images",
  onDelete: "CASCADE",
});
Image.belongsTo(Listing, { foreignKey: "listingId" });

// Listing -> RentalRequest (One-to-Many)
Listing.hasMany(RentalRequest, { foreignKey: "listingId", as: "requests" });
RentalRequest.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

// User -> RentalRequest (Borrower makes many requests)
User.hasMany(RentalRequest, {
  foreignKey: "borrowerId",
  as: "borrowedRequests",
});
RentalRequest.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

// RentalRequest -> Rental (One-to-One)
RentalRequest.hasOne(Rental, { foreignKey: "requestId", as: "rental" });
Rental.belongsTo(RentalRequest, { foreignKey: "requestId", as: "request" });

// User -> Rental (Lender has many historical rentals)
User.hasMany(Rental, { foreignKey: "lenderId", as: "lendedRentals" });
Rental.belongsTo(User, { foreignKey: "lenderId", as: "lender" });

// Listing -> Report (One-to-Many)
Listing.hasMany(Report, {
  foreignKey: "listingId",
  as: "reports",
  onDelete: "CASCADE",
});
Report.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

// User -> Report (Borrower files many reports)
User.hasMany(Report, { foreignKey: "borrowerId", as: "reports" });
Report.belongsTo(User, { foreignKey: "borrowerId", as: "borrower" });

module.exports = {
  sequelize,
  User,
  Listing,
  Image,
  RentalRequest,
  Rental,
  Report,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
};
