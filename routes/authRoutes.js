// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");

// --- LOGIN ROUTES ---

// Render the Login Page
router.get("/login", (req, res) => {
  const redirect = req.query.redirect;
  if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
    req.session.returnTo = redirect;
  }
  res.render("auth/login", { error: null });
});

// Handle Login Form Submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Set session data including the new name fields
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        // Fallback to email split for any older test accounts that didn't have a name
        username: user.firstName || user.email.split("@")[0],
      };

      // Redirect to their specific dashboard based on role
      const redirectUrl = req.session.returnTo || `/${user.role}/dashboard`;
      delete req.session.returnTo; // Clean up

      res.redirect(redirectUrl);
    } else {
      res.render("auth/login", { error: "Invalid email or password." });
    }
  } catch (error) {
    console.error(error);
    res.render("auth/login", { error: "An error occurred during login." });
  }
});

// --- REGISTER ROUTES ---

// Render the Register Page
router.get("/register", (req, res) => {
  const redirect = req.query.redirect;
  if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
    req.session.returnTo = redirect;
  }
  res.render("auth/register", { error: null });
});

// Handle Registration Form Submission
router.post("/register", async (req, res) => {
  // Extract the new firstName and lastName fields from the form submission
  const { email, password, role, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("auth/register", { error: "Email is already in use." });
    }

    // Create the new user with their full name
    const newUser = await User.create({
      email,
      password,
      role: role || "borrower",
      firstName,
      lastName,
    });

    // Log the user in immediately after registration
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.firstName, // Use their real first name for UI greetings
    };

    const redirectUrl = req.session.returnTo || `/${newUser.role}/dashboard`;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Registration error:", error);
    res.render("auth/register", {
      error: "An error occurred during registration.",
    });
  }
});

// --- LOGOUT ROUTE ---

// Handle Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
