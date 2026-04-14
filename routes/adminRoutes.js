const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Main Admin Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Analytics (UC-A01)
router.get('/analytics', AdminController.viewAnalytics);

// Listings Moderation (UC-A02)
router.get('/listings', AdminController.viewListings);
router.post('/listings/:id/remove', AdminController.removeListing);

// Platform Settings (UC-A03)
router.get('/settings', AdminController.viewSettings);
router.post('/settings', AdminController.updateSettings);

// Categories (UC-A04)
router.get('/categories', AdminController.viewCategories);
router.post('/categories', AdminController.createCategory);

// Users Moderation (UC-A05)
router.get('/users', AdminController.viewUsers);
router.post('/users/:id/suspend', AdminController.suspendUser);
router.post('/users/:id/unsuspend', AdminController.unsuspendUser); 
router.post('/users/:id/role', AdminController.changeRole); 
module.exports = router;