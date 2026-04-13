// middleware/auth.js

// Generic check: Is the user logged in at all?
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  res.redirect("/auth/login");
};

// Specific check: Is the user logged in AND do they have the right role?
const requireRole = (role) => {
  return (req, res, next) => {
    // 1. Check if they are logged in
    if (!req.session || !req.session.user) {
      req.session.returnTo = req.originalUrl;
      return res.redirect("/auth/login");
    }

    // 2. Check if their role matches the required role
    if (req.session.user.role === role) {
      next(); // Authorized, proceed to the route
    } else {
      // Unauthorized role (e.g., a borrower trying to view lender pages)
      res
        .status(403)
        .send("Unauthorized: You do not have permission to view this page.");
    }
  };
};

// Export both functions so they can be used anywhere in your routes
module.exports = { requireAuth, requireRole };
