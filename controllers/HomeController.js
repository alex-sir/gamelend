// controllers/HomeController.js
const { Listing, Image, User, Listing_VideoGame, Listing_Console, Listing_Accessory, Category } = require("../models");
const { Op } = require("sequelize");

const HomeController = {
  getHomePage: async (req, res) => {
    try {
      const featuredListings = await Listing.findAll({
        where: { status: "Active" },
        include: [{ model: Image, as: "images" }],
        order: [["createdAt", "DESC"]],
        limit: 6,
      });

      const categories = await Category.findAll({ where: { status: "Active" } });

      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings,
        categories
      });
    } catch (error) {
      console.error("Error loading homepage data:", error);
      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings: [],
        categories: []
      });
    }
  },

  browseMarketplace: async (req, res) => {
    const { q, category } = req.query;

    try {
      const categories = await Category.findAll({ where: { status: "Active" } });
      const categoryNames = categories.map(c => c.name);

      const where = { status: "Active" };
      
      // If the requested category is valid, filter by it
      if (category && categoryNames.includes(category)) {
        where.category = category;
      }

      if (q && String(q).trim()) {
        const term = `%${String(q).trim()}%`;
        where[Op.or] = [
          { title: { [Op.like]: term } },
          { description: { [Op.like]: term } },
        ];
      }

      const listings = await Listing.findAll({
        where,
        include: [
          { model: Image, as: "images" },
          { model: User, as: "lender" },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("browse", {
        title: "Browse Listings - GameLend",
        listings,
        searchQuery: q ? String(q).trim() : "",
        activeCategoryLabel: category,
        categoryLabels: categoryNames,
      });
    } catch (error) {
      console.error("Browse marketplace error:", error);
      res.status(500).send("Error loading marketplace");
    }
  },

  /**
   * Public listing URL used from the homepage carousel.
   * Logged-in borrowers are sent to the authenticated borrower detail URL.
   */
  viewPublicListing: async (req, res) => {
    const user = req.session.user;
    if (user && user.role === "borrower") {
      return res.redirect(`/borrower/listings/${req.params.id}`);
    }

    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, status: "Active" },
        include: [
          { model: Image, as: "images" },
          { model: User, as: "lender" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
        order: [[{ model: Image, as: "images" }, "isPrimary", "DESC"]],
      });

      if (!listing) {
        return res.status(404).send("Listing not found or no longer available.");
      }

      res.render("borrower/item-details", {
        listing,
        error: null,
        isPublicListingView: true,
      });
    } catch (error) {
      console.error("Public listing view error:", error);
      res.status(500).send("Error loading listing");
    }
  },
};

module.exports = HomeController;
