const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const LenderController = require("../controllers/LenderController");

// --- Multer Configuration for Image Uploads (UC-L02) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads"); // Ensure this folder exists
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

// Note: In a full app, an authentication middleware would verify the user role here.
// e.g., router.use(requireLenderAuth);

// --- Lender Dashboard & Listings ---
router.get("/dashboard", LenderController.getDashboard);
router.get("/listings", LenderController.getMyListings);

// UC-L01: Create Equipment Listing
router.get("/listings/new", LenderController.renderCreateForm);
router.post("/listings", LenderController.createListing);

// UC-L02: Upload Item Images
router.get("/listings/:id/images", LenderController.renderUploadForm);
router.post(
  "/listings/:id/images",
  upload.array("listingImages", 8),
  LenderController.uploadImages,
);
router.delete("/images/:imageId", LenderController.deleteImage);

// UC-L03: Edit Listing Details
router.get("/listings/:id/edit", LenderController.renderEditForm);
router.put("/listings/:id", LenderController.updateListing);
router.delete("/listings/:id", LenderController.deleteListing);

// UC-L04: View Listing (Public perspective + Lender stats)
router.get("/listings/:id", LenderController.viewListing);

// --- Rental Requests ---
router.get("/requests", LenderController.getPendingRequests);

// UC-L05: Accept Borrow Request
router.post("/requests/:id/accept", LenderController.acceptRequest);

// UC-L06: Reject Borrow Request
router.post("/requests/:id/reject", LenderController.rejectRequest);

// --- Rental History ---
// UC-L07: View Lending History
router.get("/history", LenderController.getLendingHistory);

module.exports = router;
