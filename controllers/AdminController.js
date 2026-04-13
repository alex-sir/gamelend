const { User, Listing, Rental, PlatformSettings, Category } = require('../models');

const AdminController = {
  // --- Main Dashboard ---
  getDashboard: (req, res) => {
    res.render('admin/admin-dashboard');
  },

  // --- UC-A01: View Platform Analytics ---
  viewAnalytics: async (req, res) => {
    try {
      const activeRentersCount = await User.count({ where: { role: 'borrower', isSuspended: false } });
      const activeOwnersCount = await User.count({ where: { role: 'lender', isSuspended: false } });
      const activeListingsCount = await Listing.count({ where: { status: 'Active' } });
      
      const completedRentalsCount = await Rental.count({ where: { status: 'Completed' } });
      const totalRevenue = await Rental.sum('actualTotal', { where: { status: 'Completed' } });

      res.render('admin/analytics', {
        metrics: {
          activeRenters: activeRentersCount,
          activeOwners: activeOwnersCount,
          activeListings: activeListingsCount,
          completedRentals: completedRentalsCount,
          totalRevenue: totalRevenue || 0
        }
      });
    } catch (error) {
      console.error("Analytics Error:", error);
      res.status(500).send("Unable to load analytics.");
    }
  },

  // --- UC-A02: Remove / Moderate Listings ---
  viewListings: async (req, res) => {
    try {
      // Include the User model so we can see who owns the listing
      const listings = await Listing.findAll({ include: [{ model: User, as: 'lender' }] });
      res.render('admin/moderation-listings', { listings });
    } catch (error) {
      console.error("View Listings Error:", error);
      res.status(500).send("Unable to load listings.");
    }
  },

  removeListing: async (req, res) => {
    try {
      const listingId = req.params.id;
      // Updates the specific listing's status to "Removed"
      await Listing.update({ status: 'Removed' }, { where: { id: listingId } });
      
      // Redirect back to the moderation page
      res.redirect('/admin/listings');
    } catch (error) {
      console.error("Remove Listing Error:", error);
      res.status(500).send("Failed to remove listing.");
    }
  },

  // --- UC-A03: Manage Platform Settings ---
  viewSettings: async (req, res) => {
    try {
      const settings = await PlatformSettings.findAll();
      res.render('admin/admin-settings', { settings });
    } catch (error) {
      console.error("View Settings Error:", error);
      res.status(500).send("Unable to load settings.");
    }
  },

  updateSettings: async (req, res) => {
    try {
      const adminId = req.session.user.id;
      const { settingKey, settingValue, settingCategory } = req.body;

      // Validates and saves the settings into the system
      const [setting, created] = await PlatformSettings.findOrCreate({
        where: { settingKey },
        defaults: { settingValue, settingCategory, updatedBy: adminId }
      });

      if (!created) {
        await setting.update({ settingValue, updatedBy: adminId });
      }

      res.redirect('/admin/settings');
    } catch (error) {
      console.error("Update Settings Error:", error);
      res.status(500).send("Failed to update settings.");
    }
  },

  // --- UC-A04: Manage Equipment Categories ---
  viewCategories: async (req, res) => {
    try {
      const categories = await Category.findAll();
      res.render('admin/moderation-categories', { categories });
    } catch (error) {
      console.error("View Categories Error:", error);
      res.status(500).send("Unable to load categories.");
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description, parentId } = req.body;

      // Creates the new category
      await Category.create({
        name,
        description,
        parentId: parentId ? parentId : null,
        status: 'Active'
      });

      res.redirect('/admin/categories');
    } catch (error) {
      console.error("Create Category Error:", error);
      res.status(500).send("Failed to create category. Ensure the name is unique.");
    }
  },

  // --- UC-A05: Suspend User Account ---
  viewUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.render('admin/moderation-users', { users });
    } catch (error) {
      console.error("View Users Error:", error);
      res.status(500).send("Unable to load users.");
    }
  },

  suspendUser: async (req, res) => {
    try {
      const userId = req.params.id;
      // Updates the user status to "Suspended" (true)
      await User.update({ isSuspended: true }, { where: { id: userId } });
      
      res.redirect('/admin/users');
    } catch (error) {
      console.error("Suspend Error:", error);
      res.status(500).send("Failed to suspend user.");
    }
  }
};

module.exports = AdminController;