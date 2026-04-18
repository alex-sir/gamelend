// controllers/HomeController.js
const { Listing, Image } = require("../models");

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
};

module.exports = HomeController;
