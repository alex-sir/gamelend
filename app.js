const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { requireAuth } = require("./middleware/auth");
const HomeController = require("./controllers/HomeController");
require("dotenv").config();

const { sequelize } = require("./models");
const lenderRoutes = require("./routes/lenderRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const adminRoutes = require("./routes/adminRoutes");

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

const { PlatformSettings } = require("./models");

// Global Maintenance Mode Middleware
app.use(async (req, res, next) => {
  // Allow admins and auth routes to bypass maintenance mode
  if (
    req.path.startsWith("/admin") ||
    req.path.startsWith("/auth") ||
    req.path.startsWith("/css") ||
    req.path.startsWith("/images")
  ) {
    return next();
  }

  try {
    const maintenanceSetting = await PlatformSettings.findOne({
      where: { settingKey: "maintenanceMode" },
    });
    if (maintenanceSetting && maintenanceSetting.settingValue === "true") {
      if (
        req.session &&
        req.session.user &&
        req.session.user.role === "admin"
      ) {
        return next(); // Admins bypass
      }
      return res.status(503).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 20%; color: #333;">
          <h1>🛠️ GameLend is currently down for maintenance.</h1>
          <p>We are making some upgrades. Please check back shortly.</p>
          <a href="/auth/login">Admin Login</a>
        </div>
      `);
    }
  } catch (error) {
    console.error("Maintenance check error:", error);
  }

  next();
});

// --- Routes ---
// Mount the auth routes FIRST (so they are not protected by requireAuth)
app.use("/auth", authRoutes);

// Mount the lender routes
app.use("/lender", requireAuth, lenderRoutes);

// Mount the borrower routes
app.use("/borrower", requireAuth, borrowerRoutes);

//Mount the admin routes
app.use("/admin", adminRoutes);

// Mount the profile routes
app.use("/profile", profileRoutes);

// Route for the homepage
app.get("/", HomeController.getHomePage);

// Public marketplace & listing detail (linked from homepage carousel & category nav)
app.get("/browse", HomeController.browseMarketplace);
app.get("/listing/:id", HomeController.viewPublicListing);

// Public About Page
app.get("/about", async (req, res) => {
  const { Listing, Image } = require("./models");
  try {
    const featuredListings = await Listing.findAll({
      where: { status: "Active" },
      include: [{ model: Image, as: "images" }],
      limit: 10,
    });
    res.render("about", { featuredListings });
  } catch (error) {
    res.render("about", { featuredListings: [] });
  }
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

