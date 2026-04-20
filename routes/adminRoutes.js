const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Main Admin Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Moderation Hub (Added this route!)
router.get('/moderation', AdminController.viewModerationHub);

// Analytics (UC-A01)
router.get('/analytics', AdminController.viewAnalytics);

// Listings Moderation (UC-A02)
router.get('/listings', AdminController.viewListings);
router.post('/listings/bulk', AdminController.bulkActionListings); 
router.post('/listings/:id/remove', AdminController.removeListing);
router.post('/listings/:id/unsuspend', AdminController.unsuspendListing); 
router.post('/listings/:id/suspend', AdminController.suspendListing); 
// Platform Settings (UC-A03)
router.get('/settings', AdminController.viewSettings);
router.post('/settings', AdminController.updateSettings);

// Categories (UC-A04)
router.get('/categories', AdminController.viewCategories);
router.post('/categories', AdminController.createCategory);
router.post('/categories/:id/delete', AdminController.deleteCategory);

// Users Moderation (UC-A05)
router.get('/users', AdminController.viewUsers);
router.post('/users/:id/suspend', AdminController.suspendUser);
router.post('/users/:id/unsuspend', AdminController.unsuspendUser); 
router.post('/users/:id/role', AdminController.changeRole); 

// Reports
router.post('/users/:id/dismiss-reports', AdminController.dismissUserReports);
router.post('/listings/:id/dismiss-reports', AdminController.dismissListingReports); 

module.exports = router;