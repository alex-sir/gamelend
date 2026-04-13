// controllers/AuthController.js
const { User } = require("../models");
const bcrypt = require("bcrypt"); // Assuming passwords are hashed

const AuthController = {
  // Handle new user registration
  register: async (req, res) => {
    const { email, password, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render("register", { error: "Email is already in use." });
      }

      // Create the new user.
      // The plain-text password here will trigger the beforeCreate hook in User.js
      const newUser = await User.create({
        email,
        password,
        role: role || "borrower", // default to borrower if not specified
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
      res.render("register", {
        error: "An error occurred during registration.",
      });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Find the user by email
      const foundUser = await User.findOne({ where: { email } });

      // 2. If user exists, compare the provided password with the hashed password in the DB
      if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
        // 3. Passwords match! Set up the session.
        req.session.user = {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
          username: foundUser.email.split("@")[0],
        };

        // 4. Redirect based on role
        res.redirect(`/${foundUser.role}/dashboard`);
      } else {
        // Generic error message for security (don't reveal if email or password was wrong)
        res.render("login", { error: "Invalid email or password." });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("An error occurred during login.");
    }
  },
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Could not log out.");
      }
      // Clear the cookie explicitly
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  },
};

module.exports = AuthController;
