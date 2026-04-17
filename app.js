const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { requireAuth } = require("./middleware/auth");
require("dotenv").config();

const { sequelize } = require("./models");
const lenderRoutes = require("./routes/lenderRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");

const app = express();

// --- Application Configuration ---
app.set("view engine", "ejs");
// Corrected __line to __dirname
app.set("views", path.join(__dirname, "views"));

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method")); // Allows ?_method=PUT in forms

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gamelend-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
    },
  }),
);

// app.js - Global variables for EJS templates
app.use((req, res, next) => {
  // This maps the session data to a variable accessible in EJS files
  res.locals.currentUser = req.session.user || null;
  next();
});

// --- Routes ---
// Mount the auth routes FIRST (so they are not protected by requireAuth)
app.use("/auth", authRoutes);

// Mount the lender routes
app.use("/lender", requireAuth, lenderRoutes);

// Mount the borrower routes
app.use("/borrower", requireAuth, borrowerRoutes);

// Mount the profile routes
app.use("/profile", profileRoutes);

// Public Landing Page (Placeholder)
app.get("/", (req, res) => {
  res.render("index");
});

// Public About Page
app.get("/about", (req, res) => {
  res.render("about");
});

// --- Database Sync and Server Start ---
const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("MariaDB Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`GameLend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
