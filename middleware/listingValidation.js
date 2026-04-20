const { body } = require("express-validator");

const listingValidationRules = () => {
  return [
    body("title")
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage("Title must be between 5 and 100 characters."),

    body("description")
      .trim()
      .isLength({ min: 50, max: 2000 })
      .withMessage("Description must be between 50 and 2000 characters."),

    // FIXED: Added "Other" to the allowed categories array
    body("category")
      .isIn(["Video Game", "Console", "Accessory", "Other"])
      .withMessage("Invalid category selected."),

    body("condition")
      .isIn(["New", "Like New", "Very Good", "Good", "Acceptable"])
      .withMessage("Invalid condition selected."),

    body("quantity")
      .isInt({ min: 1, max: 99 })
      .withMessage("Quantity must be between 1 and 99."),

    body("dailyRate")
      .isFloat({ min: 1.0, max: 500.0 })
      .withMessage("Daily rate must be between $1.00 and $500.00."),

    // NEW: Ensure dynamicCategoryId is provided IF the category is "Other"
    body("dynamicCategoryId").custom((value, { req }) => {
      if (req.body.category === "Other" && !value) {
        throw new Error(
          "Please select a specific custom category from the list.",
        );
      }
      return true;
    }),
  ];
};

module.exports = { listingValidationRules };
