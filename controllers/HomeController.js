// controllers/HomeController.js
const { Listing, Image, User, Listing_VideoGame, Listing_Console, Listing_Accessory } = require("../models");
const { Op } = require("sequelize");

/** Display labels on the homepage / browse nav → DB enum values */
const CATEGORY_LABEL_TO_ENUM = {
  "Video Games": "Video Game",
  Consoles: "Console",
  Accessories: "Accessory",
};

function resolveCategoryFilter(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (CATEGORY_LABEL_TO_ENUM[trimmed]) return CATEGORY_LABEL_TO_ENUM[trimmed];
  if (["Video Game", "Console", "Accessory"].includes(trimmed)) return trimmed;
  return null;
}

const HomeController = {
  getHomePage: async (req, res) => {
    try {
      // Fetch the latest active listings to feature on the homepage
      const featuredListings = await Listing.findAll({
        where: { status: "Active" },
        include: [
          {
            model: Image,
            as: "images",
          },
        ],
        order: [["createdAt", "DESC"]], // Newest items first
        limit: 6, // Limit to 6 items so the carousel doesn't get overwhelmingly large
      });

      // Render the homepage and pass the database items to the EJS template
      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings,
      });
    } catch (error) {
      console.error("Error loading homepage data:", error);

      // Graceful fallback: If the database query fails, still load the homepage
      // but pass an empty array so the EJS file triggers its placeholder logic.
      res.render("index", {
        title: "GameLend - Rent and Lend Physical Games",
        featuredListings: [],
      });
    }
  },

  /** Public marketplace search & category filter (no login required) */
  browseMarketplace: async (req, res) => {
    const { q, category } = req.query;
    const categoryEnum = resolveCategoryFilter(category);

    try {
      const where = { status: "Active" };
      if (categoryEnum) where.category = categoryEnum;
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
        activeCategoryLabel: categoryEnum
          ? Object.keys(CATEGORY_LABEL_TO_ENUM).find((k) => CATEGORY_LABEL_TO_ENUM[k] === categoryEnum) || category
          : "",
        categoryLabels: Object.keys(CATEGORY_LABEL_TO_ENUM),
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
