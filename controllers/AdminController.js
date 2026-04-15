const { User, Listing, Rental, PlatformSettings, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * AdminController
 * Handles platform management including analytics, moderation, and settings.
 */
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
  
  // View Listings with Status Filtering
  viewListings: async (req, res) => {
    try {
      const { status } = req.query;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      const listings = await Listing.findAll({ 
        where: whereClause,
        include: [{ model: User, as: 'lender' }],
        order: [['createdAt', 'DESC']]
      });
      
      res.render('admin/moderation-listings', { 
        listings, 
        currentStatus: status || '' 
      });
    } catch (error) {
      console.error("View Listings Error:", error);
      res.status(500).send("Unable to load listings.");
    }
  },

  // Handle Bulk Actions (Delete, Restore, and Suspend)
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

  // Individual Actions
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
      const userId = req.params.id;
      await User.update({ isSuspended: true }, { where: { id: userId } });
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