// controllers/LenderController.js
const { Listing, Image, RentalRequest, Rental, User } = require("../models");
const { Op } = require("sequelize");

const LenderController = {
  // --- Dashboard ---
  getDashboard: async (req, res) => {
    const lenderId = req.session.user.id;

    try {
      // 1. Calculate Stats
      const activeListingsCount = await Listing.count({
        where: { lenderId, status: "Active" },
      });

      const activeRentalsCount = await Rental.count({
        where: { lenderId, status: "Active" },
      });

      const earningsSum = await Rental.sum("actualTotal", {
        where: { lenderId, status: "Completed" },
      });

      const pendingRequestsCount = await RentalRequest.count({
        include: [{ model: Listing, as: "listing", where: { lenderId } }],
        where: { status: "Pending" },
      });

      const dashboardStats = {
        activeListings: activeListingsCount,
        pendingRequests: pendingRequestsCount,
        activeRentals: activeRentalsCount,
        thisMonthEarnings: `$${earningsSum || 0}`,
      };

      // 2. Fetch Pending Requests for the UI
      const rawRequests = await RentalRequest.findAll({
        include: [
          {
            model: Listing,
            as: "listing",
            include: [{ model: Image, as: "images" }],
          },
          { model: User, as: "borrower" },
        ],
        where: { status: "Pending" },
        limit: 5,
        order: [["createdAt", "DESC"]],
      });

      const pendingReqs = rawRequests.map((req) => ({
        id: req.id,
        title: req.listing.title,
        image:
          req.listing.images && req.listing.images.length > 0
            ? req.listing.images[0].imageUrl
            : "/images/gaming-collage.jpg",
        borrower: req.borrower.firstName || req.borrower.email.split("@")[0],
        dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
        price: `$${req.listing.dailyRate}`,
        duration: "Requested",
      }));

      // 3. Fetch Active Rentals for the UI
      const rawRentals = await Rental.findAll({
        include: [
          {
            model: RentalRequest,
            as: "request",
            include: [
              { model: User, as: "borrower" },
              {
                model: Listing,
                as: "listing",
                include: [{ model: Image, as: "images" }],
              },
            ],
          },
        ],
        where: { lenderId, status: "Active" },
        limit: 5,
      });

      const activeRents = rawRentals.map((rent) => ({
        id: rent.id,
        title: rent.request.listing.title,
        image:
          rent.request.listing.images && rent.request.listing.images.length > 0
            ? rent.request.listing.images[0].imageUrl
            : "/images/gaming-collage.jpg",
        borrower:
          rent.request.borrower.firstName ||
          rent.request.borrower.email.split("@")[0],
        returnDate: new Date(rent.request.endDate).toLocaleDateString(),
        status: rent.status,
      }));

      res.render("lender/dashboard", {
        dashboardStats,
        pendingReqs,
        activeRents,
        recentActivity: [],
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      res.status(500).send("Error loading dashboard");
    }
  },

  // --- UC-L01: Create Equipment Listing (and Search) ---
  getMyListings: async (req, res) => {
    try {
      const { q } = req.query; // Extract search term from the URL

      // Default where clause: Only show this lender's listings
      let whereClause = { lenderId: req.session.user.id };

      // If a search query exists, add the LIKE conditions
      if (q) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${q}%` } },
          { category: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ];
      }

      const listings = await Listing.findAll({
        where: whereClause,
        include: [{ model: Image, as: "images" }],
        order: [["createdAt", "DESC"]], // Show newest first
      });

      // Pass the searchQuery back to the view so we can display it in the UI
      res.render("lender/my-listings", { listings, searchQuery: q });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error loading listings");
    }
  },

  renderCreateForm: (req, res) => {
    res.render("lender/create-listing", { error: null, formData: {} });
  },

  createListing: async (req, res) => {
    const { title, category, description, dailyRate } = req.body;
    const lenderId = req.session.user.id;

    try {
      if (description.length < 50) {
        return res.render("lender/create-listing", {
          error: "Description must be at least 50 characters.",
          formData: req.body,
        });
      }
      if (dailyRate < 1 || dailyRate > 500) {
        return res.render("lender/create-listing", {
          error: "Daily rate must be between $1.00 and $500.00.",
          formData: req.body,
        });
      }

      const newListing = await Listing.create({
        lenderId,
        title,
        category,
        description,
        dailyRate,
        status: "Draft",
      });

      res.redirect(`/lender/listings/${newListing.id}/images`);
    } catch (error) {
      console.error(error);
      res.render("lender/create-listing", {
        error: "Error creating listing.",
        formData: req.body,
      });
    }
  },

  // --- UC-L02: Upload Item Images ---
  renderUploadForm: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [{ model: Image, as: "images" }],
        order: [
          [{ model: Image, as: "images" }, "isPrimary", "DESC"],
          [{ model: Image, as: "images" }, "createdAt", "ASC"],
        ],
      });
      if (!listing) return res.status(404).send("Listing not found");

      res.render("lender/upload-images", { listing });
    } catch (error) {
      res.status(500).send("Error loading upload form");
    }
  },

  uploadImages: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [{ model: Image, as: "images" }],
      });

      if (!listing) return res.status(404).send("Listing not found");

      let imageRecords = [];
      const isFirstImage = !listing.images || listing.images.length === 0;

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          imageRecords.push({
            listingId: listing.id,
            imageUrl: `/images/uploads/${file.filename}`,
            isPrimary: isFirstImage && imageRecords.length === 0,
          });
        });
      }

      if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : [req.body.imageUrls];
        urls.forEach((url) => {
          if (url.trim()) {
            imageRecords.push({
              listingId: listing.id,
              imageUrl: url.trim(),
              isPrimary: isFirstImage && imageRecords.length === 0,
            });
          }
        });
      }

      if (imageRecords.length > 0) {
        await Image.bulkCreate(imageRecords);

        if (listing.status === "Draft") {
          await listing.update({ status: "Active" });
        }
      }

      res.redirect(`/lender/listings/${listing.id}/images`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading images");
    }
  },

  deleteImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId, {
        include: [{ model: Listing }],
      });

      if (
        image &&
        image.Listing &&
        image.Listing.lenderId === req.session.user.id
      ) {
        const listingId = image.listingId;
        const wasPrimary = image.isPrimary;

        await image.destroy();

        if (wasPrimary) {
          const nextImage = await Image.findOne({
            where: { listingId: listingId },
          });
          if (nextImage) {
            await nextImage.update({ isPrimary: true });
          }
        }

        return res.redirect(`/lender/listings/${listingId}/images`);
      }

      res.redirect("/lender/listings");
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).send("Error deleting image");
    }
  },

  setPrimaryImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId, {
        include: [{ model: Listing }],
      });

      if (
        image &&
        image.Listing &&
        image.Listing.lenderId === req.session.user.id
      ) {
        const listingId = image.listingId;

        await Image.update(
          { isPrimary: false },
          { where: { listingId: listingId } },
        );

        await image.update({ isPrimary: true });

        return res.redirect(`/lender/listings/${listingId}/images`);
      }

      res.redirect("/lender/listings");
    } catch (error) {
      console.error("Error setting primary image:", error);
      res.status(500).send("Error setting primary image");
    }
  },

  // --- UC-L03: Edit Listing Details ---
  renderEditForm: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        // ADDED THIS INCLUDE SO THE EJS FILE HAS ACCESS TO THE IMAGES
        include: [{ model: Image, as: "images" }],
      });
      if (!listing) return res.status(404).send("Listing not found");

      res.render("lender/edit-listing", { listing, error: null });
    } catch (error) {
      res.status(500).send("Error loading edit form");
    }
  },

  updateListing: async (req, res) => {
    const { title, description, dailyRate } = req.body;
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
      });
      if (!listing) return res.status(404).send("Listing not found");

      const activeRentals = await Rental.count({
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { listingId: listing.id },
          },
        ],
        where: { status: "Active" },
      });

      if (activeRentals > 0) {
        await listing.update({ description });
      } else {
        await listing.update({ title, description, dailyRate });
      }

      res.redirect(`/lender/listings/${listing.id}`);
    } catch (error) {
      res.status(500).send("Error updating listing");
    }
  },

  deleteListing: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
      });
      if (listing) {
        await listing.update({ status: "Deleted" });
      }
      res.redirect("/lender/listings");
    } catch (error) {
      res.status(500).send("Error deleting listing");
    }
  },

  // --- UC-L04: View Listing ---
  viewListing: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [{ model: Image, as: "images" }],
      });
      if (!listing) return res.status(404).send("Listing not found");

      res.render("lender/listing-detail", { listing });
    } catch (error) {
      res.status(500).send("Error viewing listing");
    }
  },

  // --- Rental Requests (UC-L05 & UC-L06) ---
  getPendingRequests: async (req, res) => {
    try {
      const requests = await RentalRequest.findAll({
        where: { status: "Pending" },
        include: [
          {
            model: Listing,
            as: "listing",
            where: { lenderId: req.session.user.id },
            include: [{ model: Image, as: "images" }],
          },
          { model: User, as: "borrower" },
        ],
      });
      res.render("lender/pending-requests", { requests });
    } catch (error) {
      res.status(500).send("Error loading requests");
    }
  },

  acceptRequest: async (req, res) => {
    try {
      const request = await RentalRequest.findByPk(req.params.id, {
        include: [{ model: Listing, as: "listing" }],
      });

      if (request && request.listing.lenderId === req.session.user.id) {
        await request.update({ status: "Accepted" });

        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const total = days * request.listing.dailyRate;

        await Rental.create({
          requestId: request.id,
          lenderId: req.session.user.id,
          actualTotal: total,
          status: "Active",
        });
      }
      res.redirect("/lender/dashboard");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error accepting request");
    }
  },

  rejectRequest: async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const request = await RentalRequest.findByPk(req.params.id, {
        include: [{ model: Listing, as: "listing" }],
      });

      if (request && request.listing.lenderId === req.session.user.id) {
        await request.update({
          status: "Rejected",
          rejectionReason: rejectionReason || "No reason provided",
        });
      }
      res.redirect("/lender/dashboard");
    } catch (error) {
      res.status(500).send("Error rejecting request");
    }
  },

  // --- UC-L07: View Lending History ---
  getLendingHistory: async (req, res) => {
    try {
      const rentals = await Rental.findAll({
        where: { lenderId: req.session.user.id },
        include: [
          {
            model: RentalRequest,
            as: "request",
            include: [
              { model: User, as: "borrower" },
              { model: Listing, as: "listing" },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("lender/active-rentals", { rentals });
    } catch (error) {
      res.status(500).send("Error loading history");
    }
  },
};

module.exports = LenderController;
