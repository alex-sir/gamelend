const sequelize = require("../config/database");

// Import all models normally
const User = require("./User");
const Listing = require("./Listing");
const Image = require("./Image");
const RentalRequest = require("./RentalRequest");
const Rental = require("./Rental");
const Report = require("./Report");

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
};
