const { User, Listing, Rental, PlatformSettings, Category, Report } = require('../models');
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

      // Fetch data for charts
      const categoryDistribution = await Listing.findAll({
        attributes: ['category', [Listing.sequelize.fn('COUNT', Listing.sequelize.col('id')), 'count']],
        group: ['category']
      });

      const revenueHistory = await Rental.findAll({
        where: { status: 'Completed' },
        attributes: [
          [Rental.sequelize.fn('DATE_FORMAT', Rental.sequelize.col('createdAt'), '%Y-%m'), 'month'],
          [Rental.sequelize.fn('SUM', Rental.sequelize.col('actualTotal')), 'total']
        ],
        group: ['month'],
        order: [[Rental.sequelize.col('month'), 'ASC']],
        limit: 6
      });

      res.render('admin/dashboard', {
        metrics: {
          activeListings: activeListingsCount,
          completedRentals: completedRentalsCount,
          totalRevenue: totalRevenue || 0
        },
        chartData: {
          categories: categoryDistribution,
          revenue: revenueHistory
        }
      });
    } catch (error) {
      console.error("Dashboard Loading Error:", error);
      res.render('admin/dashboard', {
        metrics: { activeListings: 0, completedRentals: 0, totalRevenue: 0 },
        chartData: { categories: [], revenue: [] }
      });
    }
  },

  // --- Moderation Hub ---
  viewModerationHub: async (req, res) => {
    try {
      // 1. Fetch Metrics
      const flaggedListingsCount = await Listing.count({ where: { status: 'Suspended' } });
      const suspensionsCount = await User.count({ where: { isSuspended: true } });

      // 2. Fetch Data for previews
      const flaggedListings = await Listing.findAll({ 
        where: { status: 'Suspended' }, 
        limit: 5,
        include: [{ model: User, as: 'lender' }],
        order: [['createdAt', 'DESC']]
      });
      
      // Data for moderation charts
      const userStatusData = {
        active: await User.count({ where: { isSuspended: false } }),
        suspended: suspensionsCount
      };

      const listingStatusData = {
        active: await Listing.count({ where: { status: 'Active' } }),
        suspended: flaggedListingsCount,
        draft: await Listing.count({ where: { status: 'Draft' } })
      };

      // 3. Fetch Real Reports
      const rawListingReports = await Report.findAll({
        where: { status: 'Submitted' },
        include: [
          { 
            model: Listing, 
            as: 'listing',
            include: [{ model: User, as: 'lender' }] 
          },
          { model: User, as: 'borrower' }
        ],
        limit: 100,
        order: [['createdAt', 'DESC']]
      });

      // Individual reports for "User Reports" table (No grouping)
      const userReports = rawListingReports.map(report => {
        const lender = report.listing?.lender;
        const email = lender?.email || 'Unknown User';
        return {
          id: report.id,
          reportedUser: {
            name: email,
            handle: ''
          },
          reason: report.reason,
          severity: report.reason === 'fraud' || report.reason === 'abuse' ? 'High' : 'Medium',
          severityColor: report.reason === 'fraud' || report.reason === 'abuse' ? 'danger' : 'warning',
          status: report.status,
          statusColor: 'info',
          createdDate: report.createdAt.toLocaleDateString()
        };
      });

      // Format for "Listing Reports" table
      const listingReports = rawListingReports.map(report => {
        const lender = report.listing?.lender;
        const email = lender?.email || 'Unknown User';
        return {
          id: report.id,
          listing: {
            id: report.listingId,
            name: report.listing?.title || 'Deleted Listing',
            platform: 'N/A'
          },
          owner: {
            name: email,
            handle: ''
          },
          reason: report.reason,
          details: report.details,
          severity: report.reason === 'fraud' || report.reason === 'abuse' ? 'High' : 'Medium',
          severityColor: report.reason === 'fraud' || report.reason === 'abuse' ? 'danger' : 'warning',
          status: report.status,
          statusColor: 'info',
          createdDate: report.createdAt.toLocaleDateString()
        };
      });
      const openReportsCount = await Report.count({ where: { status: 'Submitted' } });

      const rawCategories = await Category.findAll({
        limit: 5,
        order: [['updatedAt', 'DESC']]
      });

      const categories = await Promise.all(rawCategories.map(async (cat) => {
        const count = await Listing.count({ where: { category: cat.name, status: 'Active' } });
        return {
          id: cat.id,
          name: cat.name,
          status: cat.status || 'Active',
          statusColor: cat.status === 'Hidden' ? 'secondary' : 'success',
          listingsCount: count,
          lastUpdated: cat.updatedAt ? cat.updatedAt.toLocaleDateString() : 'Unknown'
        };
      }));

      res.render('admin/moderation-dashboard', {
        title: 'GameLend · Moderation Hub',
        metrics: {
          openReports: openReportsCount, 
          highSeverityReports: await Report.count({ where: { status: 'Submitted', reason: ['fraud', 'abuse'] } }),
          flaggedListings: flaggedListingsCount,
          awaitingReview: openReportsCount,
          suspensions: suspensionsCount,
          suspendedUsers: suspensionsCount,
          suspendedListings: flaggedListingsCount,
          avgResponseTime: '6h', 
          responseTimeTrend: 'Stable'
        },
        chartData: {
          users: userStatusData,
          listings: listingStatusData
        },
        userReports: userReports,
        listingReports: listingReports,
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

      // Data for charts
      const listingsByCategoryRaw = await Listing.findAll({
        attributes: ['category', [Listing.sequelize.fn('COUNT', Listing.sequelize.col('id')), 'count']],
        where: { status: 'Active' },
        group: ['category']
      });
      const listingsByCategory = listingsByCategoryRaw.map(l => ({
        category: l.category,
        count: parseInt(l.dataValues.count, 10)
      }));

      const rentalsByStatusRaw = await Rental.findAll({
        attributes: ['status', [Rental.sequelize.fn('COUNT', Rental.sequelize.col('id')), 'count']],
        group: ['status']
      });
      const rentalsByStatus = rentalsByStatusRaw.map(r => ({
        status: r.status,
        count: parseInt(r.dataValues.count, 10)
      }));

      res.render('admin/analytics', {
        metrics: {
          activeRenters: activeRentersCount,
          activeOwners: activeOwnersCount,
          activeListings: activeListingsCount,
          completedRentals: completedRentalsCount,
          totalRevenue: totalRevenue || 0
        },
        chartData: {
          listingsByCategory,
          rentalsByStatus
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
        include: [
          { model: User, as: 'lender' },
          { 
            model: Report, 
            as: 'reports',
            where: { status: 'Submitted' },
            required: false
          }
        ],
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

        // Auto-resolve reports if suspended or deleted
        if (targetStatus === 'Suspended' || targetStatus === 'Deleted') {
          await Report.update(
            { status: 'Reviewed' },
            { where: { listingId: { [Op.in]: idsToUpdate }, status: 'Submitted' } }
          );
        }
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
      
      // Auto-resolve reports
      await Report.update(
        { status: 'Reviewed' },
        { where: { listingId: req.params.id, status: 'Submitted' } }
      );

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

      // Auto-resolve reports
      await Report.update(
        { status: 'Reviewed' },
        { where: { listingId: req.params.id, status: 'Submitted' } }
      );

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

      // Robust Mapper: Ensures compliance with PlatformSettings ENUM
      let dbCategory = 'Listings';
      if (settingCategory === 'Payments') dbCategory = 'Payments';
      if (settingCategory === 'Rentals') dbCategory = 'Rentals';
      if (settingCategory === 'Moderation') dbCategory = 'Listings';
      if (settingCategory === 'Platform') dbCategory = 'Listings';
      if (settingCategory === 'Notifications') dbCategory = 'Notifications';

      // Specific overrides for keys that belong elsewhere
      const keyToCategoryMap = {
        'maxActiveRentals': 'Rentals',
        'defaultRentalDays': 'Rentals',
        'lateFeePerDay': 'Rentals',
        'notifyModeratorsEmail': 'Notifications',
        'userReportReceipts': 'Notifications'
      };

      for (const [key, rawValue] of Object.entries(settingsData)) {
        // Handle checkbox hidden input + checkbox array behavior
        const cleanValue = Array.isArray(rawValue) ? rawValue[rawValue.length - 1] : rawValue;
        const stringValue = String(cleanValue);
        
        // Determine correct category for this specific key
        const finalCategory = keyToCategoryMap[key] || dbCategory;

        const [setting, created] = await PlatformSettings.findOrCreate({
          where: { settingKey: key },
          defaults: { 
            settingValue: stringValue, 
            settingCategory: finalCategory,
            updatedBy: adminId 
          }
        });

        if (!created) {
          await setting.update({ 
            settingValue: stringValue, 
            settingCategory: finalCategory, 
            updatedBy: adminId 
          });
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
      const rawCategories = await Category.findAll();
      
      const categories = await Promise.all(rawCategories.map(async (cat) => {
        const count = await Listing.count({ where: { category: cat.name, status: 'Active' } });
        return {
          ...cat.toJSON(),
          listingsCount: count
        };
      }));

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

  deleteCategory: async (req, res) => {
    try {
      await Category.destroy({ where: { id: req.params.id } });
      res.redirect('/admin/categories');
    } catch (error) {
      console.error("Delete Category Error:", error);
      res.status(500).send("Failed to delete category.");
    }
  },

  // --- UC-A05: User Moderation ---
  viewUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Listing,
            as: 'listings',
            include: [{ 
              model: Report, 
              as: 'reports', 
              where: { status: 'Submitted' },
              required: false
            }]
          }
        ]
      });
      res.render('admin/moderation-users', { users });
    } catch (error) {
      console.error("View Users Error:", error);
      res.status(500).send("Unable to load users.");
    }
  },

  suspendUser: async (req, res) => {
    try {
      const { reason } = req.body;
      const userId = req.params.id;

      // 1. Suspend the User
      await User.update(
        { isSuspended: true, suspensionReason: reason || "No specific reason provided." }, 
        { where: { id: userId } }
      );

      // 2. Suspend all their Listings
      await Listing.update(
        { status: 'Suspended' },
        { where: { lenderId: userId, status: 'Active' } }
      );

      // 3. Auto-resolve all reports for those listings
      const userListings = await Listing.findAll({ where: { lenderId: userId }, attributes: ['id'] });
      const listingIds = userListings.map(l => l.id);

      if (listingIds.length > 0) {
        await Report.update(
          { status: 'Reviewed' },
          { where: { listingId: { [Op.in]: listingIds }, status: 'Submitted' } }
        );
      }

      res.redirect('/admin/users');
    } catch (error) {
      console.error("Suspend User Error:", error);
      res.status(500).send("Failed to suspend user.");
    }
  },

  unsuspendUser: async (req, res) => {
    try {
      await User.update(
        { isSuspended: false, suspensionReason: null }, 
        { where: { id: req.params.id } }
      );
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
  },

  dismissUserReports: async (req, res) => {
    try {
      const listings = await Listing.findAll({ where: { lenderId: req.params.id } });
      const listingIds = listings.map(l => l.id);
      
      if (listingIds.length > 0) {
        await Report.update(
          { status: 'Dismissed' }, 
          { where: { listingId: listingIds, status: 'Submitted' } }
        );
      }
      res.redirect('/admin/users');
    } catch (error) {
      console.error("Dismiss User Reports Error:", error);
      res.status(500).send("Failed to dismiss user reports.");
    }
  },

  dismissListingReports: async (req, res) => {
    try {
      await Report.update(
        { status: 'Dismissed' }, 
        { where: { listingId: req.params.id, status: 'Submitted' } }
      );
      res.redirect('/admin/listings');
    } catch (error) {
      console.error("Dismiss Listing Reports Error:", error);
      res.status(500).send("Failed to dismiss listing reports.");
    }
  }
};

module.exports = AdminController;