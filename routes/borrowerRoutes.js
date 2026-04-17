const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/auth");
const BorrowerController = require("../controllers/BorrowerController");

// Protect all borrower routes
router.use(requireRole("borrower"));

// UC-B01
router.get("/dashboard", BorrowerController.getDashboard);

// UC-B02
router.get("/listings/:id", BorrowerController.viewListing);

// UC-B03
router.get("/listings/:id/request", BorrowerController.renderRentalRequestForm);
router.post("/listings/:id/request", BorrowerController.submitRentalRequest);
router.get("/requests/:id/confirmation", BorrowerController.renderRequestConfirmation);

// History / status
router.get("/my-rentals", BorrowerController.getMyRentals);
router.get("/requests/:id", BorrowerController.viewRequestDetails);
router.get("/rentals/:id", BorrowerController.viewRentalDetails);

// UC-B04
router.post("/requests/:id/cancel", BorrowerController.cancelRequest);

// UC-B05
router.get("/rentals/:id/extend", BorrowerController.renderExtendForm);
router.post("/rentals/:id/extend", BorrowerController.submitExtendRental);

// UC-B06
router.get("/listings/:id/report", BorrowerController.renderReportForm);
router.post("/listings/:id/report", BorrowerController.submitReport);

module.exports = router;

