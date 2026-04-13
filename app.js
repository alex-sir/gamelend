const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
require("dotenv").config();

const { sequelize } = require("./models");
const lenderRoutes = require("./routes/lenderRoutes");

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
    secret: "gamelend-secret-key",
    resave: false,
    saveUninitialized: true,
  }),
);

// --- Routes ---
// Mount the lender routes
app.use("/lender", lenderRoutes);

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
  .sync({ alter: true }) // Use { force: true } only for resetting the DB completely
  .then(() => {
    console.log("MariaDB Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`GameLend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
