// controllers/HomeController.js
const {
  Listing,
  Image,
  User,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
  Category,
} = require("../models");
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

      // Fetch all categories (core + dynamic)
      const categories = await Category.getAllWithCore();

      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings,
        categories,
      });
    } catch (error) {
      console.error("Error loading homepage data:", error);
      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings: [],
        categories: [],
      });
    }
  },

  browseMarketplace: async (req, res) => {
    const { q, category } = req.query;

    try {
      // Fetch all categories (core + dynamic)
      const categories = await Category.getAllWithCore();
      const dynamicCategoryNames = categories.map((c) => c.name);

      const coreCategories = ["Video Game", "Console", "Accessory"];
      const where = { status: "Active" };

      // If a category was clicked, figure out if it's a core ENUM or a dynamic "Other" category
      if (category) {
        if (coreCategories.includes(category)) {
          // It's a standard hardcoded category
          where.category = category;
        } else if (dynamicCategoryNames.includes(category)) {
          // It's a custom admin category. Filter by 'Other' AND the specific dynamic ID
          const matchedCategory = categories.find((c) => c.name === category);
          where.category = "Other";
          where.dynamicCategoryId = matchedCategory.id;
        }
      }

      if (q && String(q).trim()) {
        where.title = { [Op.like]: `%${q}%` };
      }

      const listings = await Listing.findAll({
        where,
        include: [{ model: Image, as: "images" }],
        order: [["createdAt", "DESC"]],
      });

      res.render("browse", {
        listings,
        searchQuery: q ? String(q) : "",
        activeCategoryLabel: category || "",
        categories, // <--- CRITICAL FIX: Pass the categories so browse.ejs can build its navbars
      });
    } catch (error) {
      console.error("Browse marketplace error:", error);
      res.status(500).send("Error loading marketplace");
    }
  },

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
      });

      if (!listing) {
        return res
          .status(404)
          .send("Listing not found or no longer available.");
      }

      if (listing.images && listing.images.length > 0) {
        listing.images.sort(
          (a, b) =>
            (b.isPrimary === true ? 1 : 0) - (a.isPrimary === true ? 1 : 0),
        );
      }

      res.render("borrower/item-details", {
        listing,
        error: null,
        isPublicListingView: true,
      });
    } catch (error) {
      console.error("View public listing error:", error);
      res.status(500).send("Error viewing listing");
    }
  },
};

module.exports = HomeController;
