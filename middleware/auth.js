// middleware/auth.js
const { User } = require("../models");

// Generic check: Is the user logged in at all?
const requireAuth = async (req, res, next) => {
  if (req.session && req.session.user) {
    // SECURITY FIX: Check the database to see if the user has been suspended in real-time
    try {
      const user = await User.findByPk(req.session.user.id);
      
      if (!user || user.isSuspended) {
        const reason = user ? user.suspensionReason : "Account not found.";
        // If they were suspended, clear their session and send them to login
        req.session.destroy();
        return res.redirect(`/auth/login?suspended=true&reason=${encodeURIComponent(reason)}`);
      }
      
      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return res.status(500).send("Internal Server Error during authentication.");
    }
  }

  // Save the URL they were trying to reach so they can be redirected back after login
  req.session.returnTo = req.originalUrl;
  res.redirect("/auth/login");
};

// Dynamic role check: Is the user logged in AND do they have the required role?
// Usage in routes: router.get('/lender/dashboard', requireRole('lender'), ...)
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
      res.status(403).send("Unauthorized: You do not have permission to view this page.");
    }
  };
};

// Specific Admin check 
// Usage in routes: router.get('/admin/dashboard', requireAuth, requireAdmin, ...)
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).send("Access Denied: You do not have administrator privileges.");
};

// Export all functions so they can be used anywhere in your routes
module.exports = { requireAuth, requireRole, requireAdmin };