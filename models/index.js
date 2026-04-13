const sequelize = require("../config/database");

// Import all models normally
const User = require("./User");
const Listing = require("./Listing");
const Image = require("./Image");
const RentalRequest = require("./RentalRequest");
const Rental = require("./Rental");

// --- Define Relationships (ER Diagram Mapping) ---

// User -> Listing (One-to-Many)
User.hasMany(Listing, { foreignKey: "lenderId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "lenderId", as: "lender" });

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

module.exports = {
  sequelize,
  User,
  Listing,
  Image,
  RentalRequest,
  Rental,
};
