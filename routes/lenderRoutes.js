const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Imported File System module
const { requireRole } = require("../middleware/auth");
const { listingValidationRules } = require("../middleware/listingValidation");
const LenderController = require("../controllers/LenderController");

// --- Ensure Upload Directory Exists ---
// Creates an absolute path to the uploads folder
const uploadDir = path.join(__dirname, "../public/images/uploads");

// Check if the directory exists, and if not, create it recursively
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer Configuration for Image Uploads (UC-L02) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the absolute path we guaranteed exists above
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
router.get("/listings", LenderController.getMyListings);

// UC-L01: Create Equipment Listing
router.get("/listings/new", LenderController.renderCreateForm);
router.post(
  "/listings",
  listingValidationRules(),
  LenderController.createListing,
);

// UC-L02: Upload Item Images
router.get("/listings/:id/images", LenderController.renderUploadForm);
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
router.put("/rentals/:id/complete", LenderController.completeRental);

module.exports = router;
