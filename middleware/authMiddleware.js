// middleware/authMiddleware.js
const requireRole = (role) => {
  return (req, res, next) => {
    // Check if session exists and role matches
    if (req.session.user && req.session.user.role === role) {
      next(); // Authorized, proceed to route
    } else {
      // Unauthorized, redirect to login
      res.redirect("/auth/login");
    }
  };
};

module.exports = { requireRole };
