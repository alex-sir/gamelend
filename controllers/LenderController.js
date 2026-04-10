const { Listing, Image, RentalRequest, Rental, User } = require("../models");

// Helper to mock an authenticated lender session for now
const getLenderId = (req) => req.session.userId || 1;

const LenderController = {
  // --- Dashboard & Basic Views ---
  getDashboard: async (req, res) => {
    res.render("lender/lender-dashboard");
  },

  getMyListings: async (req, res) => {
    try {
      const listings = await Listing.findAll({
        where: { lenderId: getLenderId(req) },
        include: [{ model: Image, as: "images", limit: 1 }],
      });
      res.render("lender/my-listings", { listings });
    } catch (error) {
      res.status(500).send("Error loading listings");
    }
  },

  // --- UC-L01: Create Equipment Listing ---
  renderCreateForm: (req, res) => {
    res.render("lender/create-listing", { formData: {}, errors: null });
  },

  createListing: async (req, res) => {
    try {
      const { title, category, description, dailyRate } = req.body;

      // Sequelize handles validation based on Model definitions
      const newListing = await Listing.create({
        lenderId: getLenderId(req),
        title,
        category,
        description,
        dailyRate,
      });

      // Redirect to image upload (UC-L02)
      res.redirect(`/lender/listings/${newListing.id}/images`);
    } catch (error) {
      // Re-render form with errors if validation fails
      res.render("lender/create-listing", {
        formData: req.body,
        errors: error.errors || [{ message: "Invalid data" }],
      });
    }
  },

  // --- UC-L02: Upload Item Images ---
  renderUploadForm: async (req, res) => {
    const listing = await Listing.findByPk(req.params.id, {
      include: ["images"],
    });
    if (!listing || listing.lenderId !== getLenderId(req))
      return res.status(403).send("Unauthorized");
    res.render("lender/upload-images", { listing });
  },

  uploadImages: async (req, res) => {
    try {
      const listingId = req.params.id;
      const files = req.files; // Provided by Multer

      // Check if this is the first image to set it as primary
      const existingImages = await Image.count({ where: { listingId } });

      for (let i = 0; i < files.length; i++) {
        await Image.create({
          listingId,
          imageUrl: `/images/uploads/${files[i].filename}`,
          isPrimary: existingImages === 0 && i === 0,
        });
      }
      res.redirect(`/lender/listings/${listingId}/images`);
    } catch (error) {
      res.status(500).send("Upload failed");
    }
  },

  deleteImage: async (req, res) => {
    await Image.destroy({ where: { id: req.params.imageId } });
    res.redirect("back");
  },

  // --- UC-L03: Edit Listing Details ---
  renderEditForm: async (req, res) => {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing || listing.lenderId !== getLenderId(req))
      return res.status(403).send("Unauthorized");

    // Check for active rentals to lock fields
    const activeRentals = await RentalRequest.count({
      where: { listingId: listing.id, status: "Accepted" },
    });

    res.render("lender/edit-listing", { listing, isLocked: activeRentals > 0 });
  },

  updateListing: async (req, res) => {
    try {
      const { title, description, dailyRate } = req.body;
      await Listing.update(
        { title, description, dailyRate },
        { where: { id: req.params.id, lenderId: getLenderId(req) } },
      );
      res.redirect(`/lender/listings/${req.params.id}`);
    } catch (error) {
      res.status(500).send("Update failed");
    }
  },

  deleteListing: async (req, res) => {
    // UC-L03 Alternative Flow: Archive/Delete listing
    await Listing.update(
      { status: "Deleted" },
      { where: { id: req.params.id } },
    );
    res.redirect("/lender/listings");
  },

  // --- UC-L04: View Listing ---
  viewListing: async (req, res) => {
    try {
      const listing = await Listing.findByPk(req.params.id, {
        include: [
          { model: Image, as: "images" },
          {
            model: RentalRequest,
            as: "requests",
            where: { status: "Pending" },
            required: false,
          },
        ],
      });

      if (!listing) return res.status(404).send("Listing not found");

      // Verify ownership to show stats
      const isOwner = listing.lenderId === getLenderId(req);

      res.render("lender/listing-detail", { listing, isOwner });
    } catch (error) {
      res.status(500).send("Error loading listing");
    }
  },

  // --- UC-L05 & UC-L06: Manage Borrow Requests ---
  getPendingRequests: async (req, res) => {
    const requests = await RentalRequest.findAll({
      where: { status: "Pending" },
      include: [
        {
          model: Listing,
          as: "listing",
          where: { lenderId: getLenderId(req) },
        },
        { model: User, as: "borrower" },
      ],
    });
    res.render("lender/pending-requests", { requests });
  },

  acceptRequest: async (req, res) => {
    try {
      const request = await RentalRequest.findByPk(req.params.id, {
        include: ["listing"],
      });

      // Security check
      if (!request || request.listing.lenderId !== getLenderId(req)) {
        return res.status(403).send("Unauthorized");
      }

      // Update Request Status
      request.status = "Accepted";
      await request.save();

      // Calculate total (Days * dailyRate + 15% platform fee)
      const days = Math.ceil(
        (new Date(request.endDate) - new Date(request.startDate)) /
          (1000 * 60 * 60 * 24),
      );
      const total = days * request.listing.dailyRate * 1.15;

      // Create Official Rental Record
      await Rental.create({
        requestId: request.id,
        lenderId: getLenderId(req),
        actualTotal: total,
        status: "Active",
      });

      res.redirect("/lender/requests");
    } catch (error) {
      res.status(500).send("Error accepting request");
    }
  },

  rejectRequest: async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const request = await RentalRequest.findByPk(req.params.id, {
        include: ["listing"],
      });

      if (!request || request.listing.lenderId !== getLenderId(req)) {
        return res.status(403).send("Unauthorized");
      }

      request.status = "Rejected";
      request.rejectionReason = rejectionReason;
      await request.save();

      res.redirect("/lender/requests");
    } catch (error) {
      res.status(500).send("Error rejecting request");
    }
  },

  // --- UC-L07: View Lending History ---
  getLendingHistory: async (req, res) => {
    try {
      const rentals = await Rental.findAll({
        where: { lenderId: getLenderId(req) },
        include: [
          {
            model: RentalRequest,
            as: "request",
            include: [
              { model: Listing, as: "listing" },
              { model: User, as: "borrower" },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Calculate Analytics
      let lifetimeEarnings = 0;
      let activeRentals = 0;

      rentals.forEach((rental) => {
        if (rental.status === "Active") activeRentals++;
        if (rental.status === "Completed") {
          // Lender gets 85% of actualTotal (subtracting platform fee)
          lifetimeEarnings += parseFloat(rental.actualTotal) * 0.85;
        }
      });

      res.render("lender/active-rentals", {
        rentals,
        analytics: { lifetimeEarnings, activeRentals },
      });
    } catch (error) {
      res.status(500).send("Error loading history");
    }
  },
};

module.exports = LenderController;
