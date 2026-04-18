const { body } = require("express-validator");

const listingValidationRules = () => {
  return [
    // --- Core Fields ---
    body("title")
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage("Title must be between 5 and 100 characters.")
      .escape(), // Escapes HTML characters to prevent XSS attacks

    body("category")
      .isIn(["Video Game", "Console", "Accessory"])
      .withMessage("Invalid category selected."),

    body("condition")
      .isIn(["New", "Like New", "Very Good", "Good", "Acceptable"])
      .withMessage("Invalid condition selected."),

    body("quantity")
      .isInt({ min: 1, max: 99 })
      .withMessage("Quantity must be a whole number between 1 and 99."),

    body("description")
      .trim()
      .isLength({ min: 50, max: 2000 })
      .withMessage("Description must be between 50 and 2000 characters.")
      .escape(),

    body("dailyRate")
      .isFloat({ min: 1.0, max: 500.0 })
      .withMessage("Daily rate must be a number between $1.00 and $500.00."),

    // --- Conditional Fields: Video Game ---
    body("platform")
      .if(body("category").equals("Video Game"))
      .notEmpty()
      .withMessage("Platform is required for Video Games."),

    body("releaseYear")
      .if(body("category").equals("Video Game"))
      .optional({ checkFalsy: true }) // Allows the field to be empty
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Release year must be a valid 4-digit year."),

    // --- Conditional Fields: Console ---
    body("consoleType")
      .if(body("category").equals("Console"))
      .notEmpty()
      .withMessage("Console Type is required for Consoles."),

    body("controllerQuantity")
      .if(body("category").equals("Console"))
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Controller quantity must be 0 or higher."),

    // --- Conditional Fields: Accessory ---
    body("accessoryType")
      .if(body("category").equals("Accessory"))
      .notEmpty()
      .withMessage("Accessory Type is required for Accessories."),
  ];
};

module.exports = {
  listingValidationRules,
};
