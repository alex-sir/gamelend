// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { requireAuth } = require("../middleware/auth");

// Protect all profile routes - user must be logged in
router.use(requireAuth);

// Render the Profile Settings Page
router.get("/", (req, res) => {
  // res.locals.currentUser is already populated by app.js, so we just render the page
  res.render("profile");
});

// Handle Profile Updates
router.put("/", async (req, res) => {
  const { firstName, lastName, phoneNumber, address } = req.body;
  const userId = req.session.user.id;

  try {
    // 1. Find the user in the database
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // 2. Update the user's information in the database
    await user.update({
      firstName,
      lastName,
      phoneNumber,
      address,
    });

    // 3. Update the current session data so the UI reflects changes instantly
    req.session.user.firstName = user.firstName;
    req.session.user.lastName = user.lastName;
    req.session.user.phoneNumber = user.phoneNumber;
    req.session.user.address = user.address;
    // Update the fallback username property used in the navbar
    req.session.user.username = user.firstName;

    // 4. Re-render the page with a success message
    res.render("profile", {
      success: "Your profile has been updated successfully.",
      error: null,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.render("profile", {
      success: null,
      error: "An error occurred while updating your profile. Please try again.",
    });
  }
});

module.exports = router;
