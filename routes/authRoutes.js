// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");

// --- LOGIN ROUTES ---

// Render the Login Page
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null }); // Updated path
});

// Handle Login Form Submission
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Set session data
      req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.email.split("@")[0],
      };

      // Redirect to their specific dashboard based on role
      const redirectUrl = req.session.returnTo || `/${user.role}/dashboard`;
      delete req.session.returnTo; // Clean up

      res.redirect(redirectUrl);
    } else {
      res.render("auth/login", { error: "Invalid email or password." }); // Updated path
    }
  } catch (error) {
    console.error(error);
    res.render("auth/login", { error: "An error occurred during login." }); // Updated path
  }
});

// --- REGISTER ROUTES ---

// Render the Register Page
router.get("/register", (req, res) => {
  res.render("auth/register", { error: null }); // Updated path
});

// Handle Registration Form Submission
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("auth/register", { error: "Email is already in use." }); // Updated path
    }

    // Create the new user (password hashing is handled by the Sequelize hook in User.js)
    const newUser = await User.create({
      email,
      password,
      role: role || "borrower",
    });

    // Log the user in immediately after registration
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      username: newUser.email.split("@")[0],
    };

    // Redirect to their respective dashboard
    res.redirect(`/${newUser.role}/dashboard`);
  } catch (error) {
    console.error("Registration error:", error);
    res.render("auth/register", {
      error: "An error occurred during registration.",
    }); // Updated path
  }
});

// --- LOGOUT ROUTE ---

// Handle Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
