const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireRole } = require("../middleware/auth");
const { listingValidationRules } = require("../middleware/listingValidation");
const LenderController = require("../controllers/LenderController");

// --- Ensure Upload Directory Exists ---
const uploadDir = path.join(__dirname, "../public/images/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer Configuration for Image Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Protect all lender routes from unauthorized access
router.use(requireRole("lender"));

// --- Lender Dashboard & Listings ---
router.get("/dashboard", LenderController.getDashboard);
router.get("/listings", LenderController.getListings);

// UC-L02: Create New Listing
router.get("/listings/new", LenderController.renderCreateForm);
router.post(
  "/listings",
  listingValidationRules(),
  LenderController.createListing,
);

// UC-L02: Upload Item Images
router.get("/listings/:id/images", LenderController.renderImageManager);
router.post(
  "/listings/:id/images",
  upload.array("listingImages", 8),
  LenderController.uploadImages,
);
router.delete("/images/:imageId", LenderController.deleteImage);
router.post("/images/:imageId/primary", LenderController.setPrimaryImage);

// UC-L03: Edit Listing Details
router.get("/listings/:id/edit", LenderController.renderEditForm);
router.put(
  "/listings/:id",
  listingValidationRules(),
  LenderController.updateListing,
);
router.delete("/listings/:id", LenderController.deleteListing);

// NEW: Publish Draft
router.put("/listings/:id/publish", LenderController.publishListing);

// UC-L04: View Listing Details
router.get("/listings/:id", LenderController.viewListingDetails);

// --- Rental Requests ---
router.get("/requests", LenderController.getPendingRequests);

// UC-L05: Process Borrow Request (Accept)
router.post("/requests/:id/accept", (req, res, next) => {
  req.body.action = "accept";
  LenderController.processRequest(req, res, next);
});

// UC-L05: Process Borrow Request (Reject)
router.post("/requests/:id/reject", (req, res, next) => {
  req.body.action = "reject";
  LenderController.processRequest(req, res, next);
});

// --- Active Rentals & History ---
// UC-L06: Manage Active Rentals
router.get("/rentals", LenderController.getActiveRentals);

// UC-L07: View Lending History
router.get("/history", LenderController.getLendingHistory);

// UC-L08: Complete Rental
router.put("/rentals/:id/complete", LenderController.completeRental);

module.exports = router;
