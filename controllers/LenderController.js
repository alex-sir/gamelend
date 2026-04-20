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
  Category,
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
          dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(
            req.endDate,
          ).toLocaleDateString()}`,
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

  // --- UC-L01: Manage Listings ---
  getListings: async (req, res) => {
    try {
      let whereClause = { lenderId: req.session.user.id };

      if (req.query.q) {
        whereClause.title = { [Op.iLike]: `%${req.query.q}%` };
      }

      const listings = await Listing.findAll({
        where: whereClause,
        include: [{ model: Image, as: "images" }],
        order: [["createdAt", "DESC"]],
      });

      res.render("lender/listings", { listings });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  // --- UC-L02: Create Listing ---
  renderCreateForm: async (req, res) => {
    try {
      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });
      res.render("lender/create-listing", {
        error: null,
        formData: {},
        dynamicCategories,
      });
    } catch (error) {
      res.status(500).send("Error loading form");
    }
  },

  createListing: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });
      return res.render("lender/create-listing", {
        error: errors.array()[0].msg,
        formData: req.body,
        dynamicCategories,
      });
    }

    const lenderId = req.session.user.id;
    // Extract everything, including the specific sub-type details
    const {
      title,
      description,
      category,
      condition,
      quantity,
      dailyRate,
      dynamicCategoryId,
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
      // 1. Create the Parent Listing
      const newListing = await Listing.create({
        lenderId,
        title,
        description,
        category,
        condition,
        quantity: quantity || 1,
        dailyRate,
        dynamicCategoryId: category === "Other" ? dynamicCategoryId : null,
        status: "Draft",
      });

      // 2. Create the precise Sub-Type record mapped to the new Listing
      if (category === "Video Game") {
        await Listing_VideoGame.create({
          listingId: newListing.id,
          platform,
          genre,
          esrbRating: esrbRating || null,
          publisher: publisher || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
        });
      } else if (category === "Console") {
        await Listing_Console.create({
          listingId: newListing.id,
          consoleType,
          storageCapacity: storageCapacity || null,
          controllersIncluded: controllersIncluded === "on", // Checkbox gives 'on'
          controllerQuantity: controllerQuantity
            ? parseInt(controllerQuantity)
            : 0,
          cablesIncluded: cablesIncluded === "on",
          serialNumber: serialNumber || null,
        });
      } else if (category === "Accessory") {
        await Listing_Accessory.create({
          listingId: newListing.id,
          accessoryType,
          compatiblePlatforms: compatiblePlatforms || null,
          isWireless: isWireless === "on",
          brand: brand || null,
          modelNumber: modelNumber || null,
        });
      }

      res.redirect(`/lender/listings/${newListing.id}/images`);
    } catch (error) {
      console.error(error);
      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });
      res.render("lender/create-listing", {
        error: "Database error creating listing.",
        formData: req.body,
        dynamicCategories,
      });
    }
  },

  // --- UC-L02: Update Listing ---
  renderEditForm: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        // Make sure to include the sub-details so the edit form can pre-fill them
        include: [
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
      });

      if (!listing) return res.status(404).send("Listing not found");

      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });

      // Flatten the listing for the EJS view formData
      const formData = {
        ...listing.get({ plain: true }),
        ...(listing.videoGameDetails
          ? listing.videoGameDetails.get({ plain: true })
          : {}),
        ...(listing.consoleDetails
          ? listing.consoleDetails.get({ plain: true })
          : {}),
        ...(listing.accessoryDetails
          ? listing.accessoryDetails.get({ plain: true })
          : {}),
      };

      res.render("lender/create-listing", {
        error: null,
        formData: formData,
        dynamicCategories,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error loading form");
    }
  },

  updateListing: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });
      return res.render("lender/create-listing", {
        error: errors.array()[0].msg,
        formData: req.body,
        dynamicCategories,
      });
    }

    const {
      title,
      description,
      category,
      condition,
      quantity,
      dailyRate,
      dynamicCategoryId,
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

      // 1. Update the parent listing
      await listing.update({
        title,
        description,
        category,
        condition,
        quantity: quantity || 1,
        dailyRate,
        dynamicCategoryId: category === "Other" ? dynamicCategoryId : null,
      });

      // 2. Clear out any old sub-types
      await Listing_VideoGame.destroy({ where: { listingId: listing.id } });
      await Listing_Console.destroy({ where: { listingId: listing.id } });
      await Listing_Accessory.destroy({ where: { listingId: listing.id } });

      // 3. Rebuild the proper sub-type mapped to the updated category
      if (category === "Video Game") {
        await Listing_VideoGame.create({
          listingId: listing.id,
          platform,
          genre,
          esrbRating: esrbRating || null,
          publisher: publisher || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
        });
      } else if (category === "Console") {
        await Listing_Console.create({
          listingId: listing.id,
          consoleType,
          storageCapacity: storageCapacity || null,
          controllersIncluded: controllersIncluded === "on",
          controllerQuantity: controllerQuantity
            ? parseInt(controllerQuantity)
            : 0,
          cablesIncluded: cablesIncluded === "on",
          serialNumber: serialNumber || null,
        });
      } else if (category === "Accessory") {
        await Listing_Accessory.create({
          listingId: listing.id,
          accessoryType,
          compatiblePlatforms: compatiblePlatforms || null,
          isWireless: isWireless === "on",
          brand: brand || null,
          modelNumber: modelNumber || null,
        });
      }

      res.redirect(`/lender/listings/${listing.id}`);
    } catch (error) {
      console.error(error);
      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });
      res.render("lender/create-listing", {
        error: "Database error updating listing.",
        formData: req.body,
        dynamicCategories,
      });
    }
  },

  // --- UC-L02: Delete Listing ---
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

  // --- UC-L03: Manage Listing Images ---
  renderImageManager: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [{ model: Image, as: "images" }],
      });

      if (!listing) return res.status(404).send("Listing not found");

      res.render("lender/manage-images", { listing });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  // RESTORED: Image Upload Logic
  uploadImages: async (req, res) => {
    try {
      const listingId = req.params.id;
      if (!req.files || req.files.length === 0)
        return res.redirect(`/lender/listings/${listingId}/images`);

      const imagesToCreate = req.files.map((file) => ({
        listingId,
        imageUrl: `/images/uploads/${file.filename}`,
        isPrimary: false,
      }));

      const existingImages = await Image.count({ where: { listingId } });
      if (existingImages === 0 && imagesToCreate.length > 0) {
        imagesToCreate[0].isPrimary = true;
      }

      await Image.bulkCreate(imagesToCreate);
      res.redirect(`/lender/listings/${listingId}/images`);
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).send("Error uploading images");
    }
  },

  // RESTORED: Image Deletion Logic
  deleteImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId);
      if (image) await image.destroy();
      res.redirect("back");
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).send("Error deleting image");
    }
  },

  // RESTORED: Set Primary Image Logic
  setPrimaryImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId);
      if (image) {
        await Image.update(
          { isPrimary: false },
          { where: { listingId: image.listingId } },
        );
        await image.update({ isPrimary: true });
      }
      res.redirect("back");
    } catch (error) {
      console.error("Error setting primary image:", error);
      res.status(500).send("Error setting primary image");
    }
  },

  // --- UC-L04: View Listing Details ---
  viewListingDetails: async (req, res) => {
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
      res.status(500).send("Server Error");
    }
  },

  // --- UC-L05: Review Requests ---
  getPendingRequests: async (req, res) => {
    try {
      const requests = await RentalRequest.findAll({
        include: [
          {
            model: Listing,
            as: "listing",
            where: { lenderId: req.session.user.id },
            include: [{ model: Image, as: "images" }],
          },
          { model: User, as: "borrower" },
        ],
        where: { status: "Pending" },
        order: [["createdAt", "ASC"]],
      });

      res.render("lender/requests", { requests });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  },

  processRequest: async (req, res) => {
    const { action } = req.body;

    try {
      const request = await RentalRequest.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: Listing,
            as: "listing",
            where: { lenderId: req.session.user.id },
          },
        ],
      });

      if (!request) return res.status(404).send("Request not found");

      if (action === "accept") {
        await request.update({ status: "Accepted" });

        const duration = Math.ceil(
          (new Date(request.endDate) - new Date(request.startDate)) /
            (1000 * 60 * 60 * 24),
        );
        const total = duration * request.listing.dailyRate;

        await Rental.create({
          requestId: request.id,
          lenderId: req.session.user.id,
          actualTotal: total,
          status: "Active",
        });
      } else if (action === "reject") {
        await request.update({ status: "Rejected" });
      }

      res.redirect("/lender/requests");
    } catch (error) {
      console.error("Process Request Error:", error);
      res.status(500).send("Server Error processing request");
    }
  },

  // --- UC-L06: Manage Active Rentals ---
  getActiveRentals: async (req, res) => {
    try {
      const rentals = await Rental.findAll({
        where: {
          lenderId: req.session.user.id,
          status: "Active",
        },
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
      });

      res.render("lender/active-rentals", { rentals });
    } catch (error) {
      console.error("Active Rentals Error:", error);
      res.status(500).json({ error: "Internal server error" });
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
      console.error("Lending History Error:", error);
      res.status(500).send("Error loading history: " + error.message);
    }
  },

  // --- UC-L07: Confirm Item Return ---
  completeRental: async (req, res) => {
    try {
      const rental = await Rental.findOne({
        where: {
          id: req.params.id,
          lenderId: req.session.user.id,
          status: "Active",
        },
      });

      if (rental) {
        await rental.update({ status: "Completed" });
      }

      res.redirect("/lender/history");
    } catch (error) {
      console.error("Error completing rental:", error);
      res.status(500).send("Error completing rental");
    }
  },
};

module.exports = LenderController;
