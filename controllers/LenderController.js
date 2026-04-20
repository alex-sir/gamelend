// controllers/LenderController.js
const { validationResult } = require("express-validator");
const {
  Listing,
  Image,
  RentalRequest,
  Rental,
  User,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
} = require("../models");
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

      const pendingReqs = rawRequests.map((req) => {
        // Correctly find the primary image for the request
        let imageUrl = "/images/gaming-collage.svg";
        if (req.listing.images && req.listing.images.length > 0) {
          const primary = req.listing.images.find((img) => img.isPrimary);
          imageUrl = primary
            ? primary.imageUrl
            : req.listing.images[0].imageUrl;
        }

        return {
          id: req.id,
          title: req.listing.title,
          image: imageUrl,
          borrower: req.borrower.firstName || req.borrower.email.split("@")[0],
          dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
          price: `$${parseFloat(req.listing.dailyRate).toFixed(2)}`,
          duration: "Requested",
        };
      });

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

      const activeRents = rawRentals.map((rent) => {
        // Correctly find the primary image for the active rental
        let imageUrl = "/images/gaming-collage.svg";
        if (
          rent.request.listing.images &&
          rent.request.listing.images.length > 0
        ) {
          const primary = rent.request.listing.images.find(
            (img) => img.isPrimary,
          );
          imageUrl = primary
            ? primary.imageUrl
            : rent.request.listing.images[0].imageUrl;
        }

        return {
          id: rent.id,
          title: rent.request.listing.title,
          image: imageUrl,
          borrower:
            rent.request.borrower.firstName ||
            rent.request.borrower.email.split("@")[0],
          returnDate: new Date(rent.request.endDate).toLocaleDateString(),
          status: rent.status,
        };
      });

      // 4. Build the Recent Activity Feed dynamically
      const activities = [];

      // A. Fetch recent requests (Pending, Accepted, Rejected)
      const recentRequests = await RentalRequest.findAll({
        include: [
          { model: Listing, as: "listing", where: { lenderId } },
          { model: User, as: "borrower" },
        ],
        order: [["updatedAt", "DESC"]],
        limit: 5,
      });

      recentRequests.forEach((req) => {
        const borrowerName =
          req.borrower.firstName || req.borrower.email.split("@")[0];
        let icon, type, label, text;

        if (req.status === "Pending") {
          icon = "bi-envelope-paper";
          type = "info";
          label = "New Request";
          text = `${borrowerName} requested to borrow ${req.listing.title}`;
        } else if (req.status === "Accepted") {
          icon = "bi-check-circle";
          type = "success";
          label = "Request Accepted";
          text = `You accepted a rental for ${req.listing.title}`;
        } else if (req.status === "Rejected") {
          icon = "bi-x-circle";
          type = "danger";
          label = "Request Rejected";
          text = `You declined a request for ${req.listing.title}`;
        } else if (req.status === "Cancelled") {
          icon = "bi-slash-circle";
          type = "warning";
          label = "Request Cancelled";
          text = `${borrowerName} cancelled their request`;
        }

        if (icon) {
          activities.push({
            icon,
            type,
            label,
            text,
            dateObj: req.updatedAt,
            time: new Date(req.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
          });
        }
      });

      // B. Fetch recently created or updated listings
      const recentListings = await Listing.findAll({
        where: { lenderId },
        order: [["updatedAt", "DESC"]],
        limit: 3,
      });

      recentListings.forEach((listing) => {
        let icon = "bi-tags",
          type = "primary",
          label = "Listing Updated",
          text = `You updated ${listing.title}`;
        // If created and updated are identical, it's a brand new listing
        if (listing.createdAt.getTime() === listing.updatedAt.getTime()) {
          label = "New Listing Created";
          icon = "bi-plus-circle";
          text = `You published ${listing.title}`;
        }
        activities.push({
          icon,
          type,
          label,
          text,
          dateObj: listing.updatedAt,
          time: new Date(listing.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        });
      });

      // C. Sort everything chronologically (newest first) and take the top 6
      activities.sort((a, b) => b.dateObj - a.dateObj);
      const recentActivity = activities.slice(0, 6);

      res.render("lender/dashboard", {
        dashboardStats,
        pendingReqs,
        activeRents,
        recentActivity,
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
    // 1. Check for Validation Errors first!
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("lender/create-listing", {
        error: errors.array()[0].msg,
        formData: req.body,
      });
    }

    const {
      title,
      category,
      condition,
      quantity,
      description,
      dailyRate,
      platform,
      genre,
      esrbRating,
      publisher,
      releaseYear,
      consoleType,
      storageCapacity,
      controllersIncluded,
      controllerQuantity,
      cablesIncluded,
      serialNumber,
      accessoryType,
      compatiblePlatforms,
      isWireless,
      brand,
      modelNumber,
    } = req.body;

    const lenderId = req.session.user.id;

    try {
      // 2. Create Core Listing
      const newListing = await Listing.create({
        lenderId,
        title,
        category,
        condition,
        quantity: quantity || 1,
        description,
        dailyRate,
        status: "Draft",
      });

      // 3. Create Specific Sub-Type Record
      if (category === "Video Game") {
        await Listing_VideoGame.create({
          listingId: newListing.id,
          platform,
          genre,
          esrbRating,
          publisher,
          releaseYear,
        });
      } else if (category === "Console") {
        await Listing_Console.create({
          listingId: newListing.id,
          consoleType,
          storageCapacity,
          controllersIncluded: controllersIncluded === "on",
          controllerQuantity: controllerQuantity || 0,
          cablesIncluded: cablesIncluded === "on",
          serialNumber,
        });
      } else if (category === "Accessory") {
        await Listing_Accessory.create({
          listingId: newListing.id,
          accessoryType,
          compatiblePlatforms,
          isWireless: isWireless === "on",
          brand,
          modelNumber,
        });
      }

      res.redirect(`/lender/listings/${newListing.id}/images`);
    } catch (error) {
      console.error(error);
      res.render("lender/create-listing", {
        error: "Database error creating listing.",
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
        include: [
          { model: Image, as: "images" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
      });
      if (!listing) return res.status(404).send("Listing not found");

      res.render("lender/edit-listing", { listing, error: null });
    } catch (error) {
      res.status(500).send("Error loading edit form");
    }
  },

  updateListing: async (req, res) => {
    // 1. Check for Validation Errors first!
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [
          { model: Image, as: "images" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
      });
      return res.render("lender/edit-listing", {
        listing,
        error: errors.array()[0].msg,
      });
    }

    const {
      title,
      description,
      dailyRate,
      condition,
      quantity,
      platform,
      genre,
      esrbRating,
      publisher,
      releaseYear,
      consoleType,
      storageCapacity,
      controllersIncluded,
      controllerQuantity,
      cablesIncluded,
      serialNumber,
      accessoryType,
      compatiblePlatforms,
      isWireless,
      brand,
      modelNumber,
    } = req.body;

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
        await listing.update({
          title,
          description,
          dailyRate,
          condition,
          quantity,
        });

        // Update Sub-Type tables
        if (listing.category === "Video Game") {
          await Listing_VideoGame.update(
            { platform, genre, esrbRating, publisher, releaseYear },
            { where: { listingId: listing.id } },
          );
        } else if (listing.category === "Console") {
          await Listing_Console.update(
            {
              consoleType,
              storageCapacity,
              controllersIncluded: controllersIncluded === "on",
              controllerQuantity,
              cablesIncluded: cablesIncluded === "on",
              serialNumber,
            },
            { where: { listingId: listing.id } },
          );
        } else if (listing.category === "Accessory") {
          await Listing_Accessory.update(
            {
              accessoryType,
              compatiblePlatforms,
              isWireless: isWireless === "on",
              brand,
              modelNumber,
            },
            { where: { listingId: listing.id } },
          );
        }
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
        include: [
          { model: Image, as: "images" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
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
              {
                model: Listing,
                as: "listing",
                // ---> HERE IS THE FIX! Instructing Sequelize to fetch images for the rentals <---
                include: [{ model: Image, as: "images" }],
              },
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

  // --- UC-L07: Confirm Item Return ---
  completeRental: async (req, res) => {
    try {
      // Find the specific active rental that belongs to this lender
      const rental = await Rental.findOne({
        where: {
          id: req.params.id,
          lenderId: req.session.user.id,
          status: "Active",
        },
      });

      if (rental) {
        // Update the rental status to Completed
        await rental.update({ status: "Completed" });
      }

      // Redirect back to the active rentals page
      res.redirect("/lender/history");
    } catch (error) {
      console.error("Error completing rental:", error);
      res.status(500).send("Error completing rental");
    }
  },
};

module.exports = LenderController;
