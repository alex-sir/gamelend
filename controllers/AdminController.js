const { User, Listing, Rental, PlatformSettings, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * AdminController
 * Handles platform management including analytics, moderation, and settings.
 */
const AdminController = {
  
  // --- Main Dashboard ---
  getDashboard: async (req, res) => {
    try {
      const activeListingsCount = await Listing.count({ where: { status: 'Active' } });
      const completedRentalsCount = await Rental.count({ where: { status: 'Completed' } });
      const totalRevenue = await Rental.sum('actualTotal', { where: { status: 'Completed' } });

      res.render('admin/admin-dashboard', {
        metrics: {
          activeListings: activeListingsCount,
          completedRentals: completedRentalsCount,
          totalRevenue: totalRevenue || 0
        }
      });
    } catch (error) {
      console.error("Dashboard Loading Error:", error);
      res.render('admin/admin-dashboard', {
        metrics: { activeListings: 0, completedRentals: 0, totalRevenue: 0 }
      });
    }
  },

  // --- Moderation Hub ---
  viewModerationHub: async (req, res) => {
    try {
      // 1. Fetch Metrics for the top cards
      const flaggedListingsCount = await Listing.count({ where: { status: 'Suspended' } });
      const suspensionsCount = await User.count({ where: { isSuspended: true } });

      // 2. Fetch Data for the preview tables (Limit to 5 rows each)
      const flaggedListings = await Listing.findAll({ 
        where: { status: 'Suspended' }, 
        limit: 5,
        include: [{ model: User, as: 'lender' }],
        order: [['createdAt', 'DESC']]
      });
      
      const categories = await Category.findAll({ 
        limit: 5,
        order: [['updatedAt', 'DESC']]
      });

      res.render('admin/moderation-dashboard', {
        title: 'GameLend · Moderation Hub',
        metrics: {
          openReports: 0, 
          highSeverityReports: 0,
          flaggedListings: flaggedListingsCount,
          awaitingReview: 0,
          suspensions: suspensionsCount,
          suspendedUsers: suspensionsCount,
          suspendedListings: flaggedListingsCount,
          avgResponseTime: '6h', 
          responseTimeTrend: 'Stable'
        },
        userReports: [],
        listingReports: [],
        categories: categories,
        recentActions: []
      });
    } catch (error) {
      console.error("Moderation Hub Error:", error);
      res.status(500).send("Unable to load moderation hub.");
    }
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
      const { status } = req.query;
      const whereClause = {};
      if (status) whereClause.status = status;

      const listings = await Listing.findAll({ 
        where: whereClause,
        include: [{ model: User, as: 'lender' }],
        order: [['createdAt', 'DESC']]
      });
      
      res.render('admin/moderation-listings', { listings, currentStatus: status || '' });
    } catch (error) {
      console.error("View Listings Error:", error);
      res.status(500).send("Unable to load listings.");
    }
  },

  bulkActionListings: async (req, res) => {
    try {
      const { listingIds, bulkAction } = req.body;
      if (!listingIds) return res.redirect('/admin/listings');

      const idsToUpdate = Array.isArray(listingIds) ? listingIds : [listingIds];
      let targetStatus = '';

      if (bulkAction === 'delete') targetStatus = 'Deleted';
      else if (bulkAction === 'restore') targetStatus = 'Active';
      else if (bulkAction === 'suspend') targetStatus = 'Suspended';

      if (targetStatus) {
        await Listing.update(
          { status: targetStatus }, 
          { 
            where: { 
              id: { [Op.in]: idsToUpdate },
              status: { [Op.ne]: targetStatus } 
            } 
          }
        );
      }

      res.redirect('/admin/listings');
    } catch (error) {
      console.error("Bulk Action Error:", error);
      res.status(500).send("Failed to process bulk action.");
    }
  },

  suspendListing: async (req, res) => {
    try {
      await Listing.update({ status: 'Suspended' }, { where: { id: req.params.id } });
      res.redirect('/admin/listings');
    } catch (error) {
      console.error("Suspend Listing Error:", error);
      res.status(500).send("Failed to suspend listing.");
    }
  },

  unsuspendListing: async (req, res) => {
    try {
      await Listing.update({ status: 'Active' }, { where: { id: req.params.id } });
      res.redirect('/admin/listings');
    } catch (error) {
      console.error("Unsuspend Listing Error:", error);
      res.status(500).send("Failed to restore listing.");
    }
  },

  removeListing: async (req, res) => {
    try {
      await Listing.update({ status: 'Deleted' }, { where: { id: req.params.id } });
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
      res.render('admin/settings', { settings });
    } catch (error) {
      console.error("View Settings Error:", error);
      res.status(500).send("Unable to load settings.");
    }
  },

updateSettings: async (req, res) => {
    try {
      const adminId = (req.session && req.session.user) ? req.session.user.id : 1; 
      const { settingCategory, ...settingsData } = req.body;

      // MAPPER: Ensures we stay strictly compliant with the UseCases document ENUM 
      let dbCategory = 'Listings'; // Default fallback
      if (settingCategory === 'Payments') dbCategory = 'Payments';
      if (settingCategory === 'Rentals') dbCategory = 'Rentals';
      // Treat "Platform" or "Moderation" from the UI as "Listings" for the DB
      if (settingCategory === 'Platform' || settingCategory === 'Moderation') dbCategory = 'Listings';

      for (const [key, rawValue] of Object.entries(settingsData)) {
        const cleanValue = Array.isArray(rawValue) ? rawValue[rawValue.length - 1] : rawValue;
        const stringValue = String(cleanValue);

        const [setting, created] = await PlatformSettings.findOrCreate({
          where: { settingKey: key },
          defaults: { 
            settingValue: stringValue, 
            settingCategory: dbCategory, // Uses the doc-compliant category
            updatedBy: adminId 
          }
        });

        if (!created) {
          await setting.update({ settingValue: stringValue, settingCategory: dbCategory, updatedBy: adminId });
        }
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
      await Category.create({
        name,
        description,
        parentId: parentId || null,
        status: 'Active'
      });
      res.redirect('/admin/categories');
    } catch (error) {
      console.error("Create Category Error:", error);
      res.status(500).send("Failed to create category.");
    }
  },

  // --- UC-A05: User Moderation ---
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
      await User.update({ isSuspended: true }, { where: { id: req.params.id } });
      res.redirect('/admin/users');
    } catch (error) {
      console.error("Suspend User Error:", error);
      res.status(500).send("Failed to suspend user.");
    }
  },

  unsuspendUser: async (req, res) => {
    try {
      await User.update({ isSuspended: false }, { where: { id: req.params.id } });
      res.redirect('/admin/users');
    } catch (error) {
      console.error("Unsuspend User Error:", error);
      res.status(500).send("Failed to restore user.");
    }
  },

  changeRole: async (req, res) => {
    try {
      await User.update({ role: req.body.newRole }, { where: { id: req.params.id } });
      res.redirect('/admin/users');
    } catch (error) {
      console.error("Change Role Error:", error);
      res.status(500).send("Failed to change user role.");
    }
  }
};

module.exports = AdminController;