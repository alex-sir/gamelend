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
  PlatformSettings,
  Report,
} = require("../models");
const { Op } = require("sequelize");

const LenderController = {
  // --- Dashboard ---
  getDashboard: async (req, res) => {
    const lenderId = req.session.user.id;

    try {
      const activeListingsCount = await Listing.count({
        where: { lenderId, status: "Active" },
      });
      const activeRentalsCount = await Rental.count({
        where: { lenderId, status: "Active" },
      });

      // Calculate Net Earnings (Gross - Platform Fee)
      const settings = await PlatformSettings.findAll();
      const sMap = {};
      settings.forEach((s) => (sMap[s.settingKey] = s.settingValue));
      const feePercent = parseFloat(sMap["platformFeePercent"] || "10") / 100;

      const grossEarnings =
        (await Rental.sum("actualTotal", {
          where: { lenderId, status: "Completed" },
        })) || 0;
      const netEarnings = grossEarnings * (1 - feePercent);

      const pendingRequestsCount = await RentalRequest.count({
        include: [{ model: Listing, as: "listing", where: { lenderId } }],
        where: { status: "Pending" },
      });

      const dashboardStats = {
        activeListings: activeListingsCount,
        pendingRequests: pendingRequestsCount,
        activeRentals: activeRentalsCount,
        thisMonthEarnings: `$${netEarnings.toFixed(2)}`,
      };

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
          dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
          price: `$${parseFloat(req.listing.dailyRate).toFixed(2)}`,
          duration: "Requested",
        };
      });

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

      // FIX: Changed Op.iLike to Op.like for MariaDB compatibility
      if (req.query.q) {
        whereClause.title = { [Op.like]: `%${req.query.q}%` };
      }

      const listings = await Listing.findAll({
        where: whereClause,
        include: [{ model: Image, as: "images" }],
        order: [["createdAt", "DESC"]],
      });

      res.render("lender/my-listings", {
        listings,
        searchQuery: req.query.q || "",
      });
    } catch (error) {
      console.error("Get Listings Error:", error);
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

      // ENUM Safety Filtering to prevent DB crashes
      const validPlatforms = [
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
        "PC",
      ];
      const validGenres = [
        "Action",
        "Adventure",
        "RPG",
        "Sports",
        "Racing",
        "Fighting",
        "Strategy",
        "Simulation",
      ];
      const validConsoles = [
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
      ];
      const validAccessories = [
        "Controller",
        "Headset",
        "VR Equipment",
        "Racing Wheel",
        "Flight Stick",
        "Charging Station",
        "Other",
      ];

      let safePlatform = validPlatforms.includes(platform)
        ? platform
        : "PlayStation 5";
      if (platform === "PS5") safePlatform = "PlayStation 5";
      if (platform === "PS4") safePlatform = "PlayStation 4";

      let safeGenre = validGenres.includes(genre) ? genre : "Action";
      if (genre && genre.toLowerCase().includes("rpg")) safeGenre = "RPG";

      let safeConsoleType = validConsoles.includes(consoleType)
        ? consoleType
        : "PlayStation 5";
      let safeAccessoryType = validAccessories.includes(accessoryType)
        ? accessoryType
        : "Other";

      if (category === "Video Game") {
        await Listing_VideoGame.create({
          listingId: newListing.id,
          platform: safePlatform,
          genre: safeGenre,
          esrbRating: esrbRating || null,
          publisher: publisher || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
        });
      } else if (category === "Console") {
        await Listing_Console.create({
          listingId: newListing.id,
          consoleType: safeConsoleType,
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
          listingId: newListing.id,
          accessoryType: safeAccessoryType,
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
        include: [
          { model: Image, as: "images" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
      });

      if (!listing) return res.status(404).send("Listing not found");

      const dynamicCategories = await Category.findAll({
        where: { status: "Active" },
      });

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

      res.render("lender/edit-listing", {
        error: null,
        formData: formData,
        dynamicCategories,
        listing,
      });
    } catch (error) {
      res.status(500).send("Error loading form");
    }
  },

  updateListing: async (req, res) => {
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const dynamicCategories = await Category.findAll({
          where: { status: "Active" },
        });
        return res.render("lender/edit-listing", {
          error: errors.array()[0].msg,
          formData: req.body,
          dynamicCategories,
          listing,
        });
      }

      // DO NOT extract category, condition, or dailyRate from req.body
      const {
        title,
        description,
        quantity,
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

      // SERVER-SIDE SECURITY LOCK: Force use of original database values
      const category = listing.category;

      await listing.update({
        title,
        description,
        quantity: quantity || 1,
        dynamicCategoryId:
          category === "Other" && dynamicCategoryId ? dynamicCategoryId : null,
      });

      // Clear sub-tables to cleanly overwrite
      await Listing_VideoGame.destroy({ where: { listingId: listing.id } });
      await Listing_Console.destroy({ where: { listingId: listing.id } });
      await Listing_Accessory.destroy({ where: { listingId: listing.id } });

      // ENUM Safety Filtering to prevent DB crashes during update
      const validPlatforms = [
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
        "PC",
      ];
      const validGenres = [
        "Action",
        "Adventure",
        "RPG",
        "Sports",
        "Racing",
        "Fighting",
        "Strategy",
        "Simulation",
      ];
      const validConsoles = [
        "PlayStation 5",
        "PlayStation 4",
        "Xbox Series X/S",
        "Xbox One",
        "Nintendo Switch",
      ];
      const validAccessories = [
        "Controller",
        "Headset",
        "VR Equipment",
        "Racing Wheel",
        "Flight Stick",
        "Charging Station",
        "Other",
      ];

      const vgd = listing.videoGameDetails || {};
      const cd = listing.consoleDetails || {};
      const ad = listing.accessoryDetails || {};

      let safePlatform = validPlatforms.includes(platform)
        ? platform
        : validPlatforms.includes(vgd.platform)
          ? vgd.platform
          : "PlayStation 5";
      let safeGenre = validGenres.includes(genre)
        ? genre
        : validGenres.includes(vgd.genre)
          ? vgd.genre
          : "Action";
      let safeConsoleType = validConsoles.includes(consoleType)
        ? consoleType
        : validConsoles.includes(cd.consoleType)
          ? cd.consoleType
          : "PlayStation 5";
      let safeAccessoryType = validAccessories.includes(accessoryType)
        ? accessoryType
        : validAccessories.includes(ad.accessoryType)
          ? ad.accessoryType
          : "Other";

      // Special mapping for common typos/legacy values
      if (platform === "PS5") safePlatform = "PlayStation 5";
      if (platform === "PS4") safePlatform = "PlayStation 4";
      if (genre && genre.toLowerCase().includes("rpg")) safeGenre = "RPG";

      if (category === "Video Game") {
        await Listing_VideoGame.create({
          listingId: listing.id,
          platform: safePlatform,
          genre: safeGenre,
          esrbRating: esrbRating || vgd.esrbRating || null,
          publisher: publisher || vgd.publisher || null,
          releaseYear: releaseYear
            ? parseInt(releaseYear)
            : vgd.releaseYear || null,
        });
      } else if (category === "Console") {
        await Listing_Console.create({
          listingId: listing.id,
          consoleType: safeConsoleType,
          storageCapacity: storageCapacity || cd.storageCapacity || null,
          controllersIncluded: controllersIncluded === "on",
          controllerQuantity: controllerQuantity
            ? parseInt(controllerQuantity)
            : cd.controllerQuantity || 0,
          cablesIncluded: cablesIncluded === "on",
          serialNumber: serialNumber || cd.serialNumber || null,
        });
      } else if (category === "Accessory") {
        await Listing_Accessory.create({
          listingId: listing.id,
          accessoryType: safeAccessoryType,
          compatiblePlatforms:
            compatiblePlatforms || ad.compatiblePlatforms || null,
          isWireless: isWireless === "on",
          brand: brand || ad.brand || null,
          modelNumber: modelNumber || ad.modelNumber || null,
        });
      }

      res.redirect(`/lender/listings/${listing.id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Database error updating listing.");
    }
  },

  // --- NEW: Publish a Draft Listing ---
  publishListing: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
        include: [{ model: Image, as: "images" }],
      });

      if (!listing) return res.status(404).send("Listing not found");

      if (listing.images && listing.images.length > 0) {
        await listing.update({ status: "Active" });
        res.redirect(`/lender/listings/${listing.id}`);
      } else {
        res.redirect(
          `/lender/listings/${listing.id}/images?error=${encodeURIComponent("You must upload at least one image before publishing.")}`,
        );
      }
    } catch (error) {
      res.status(500).send("Error publishing listing");
    }
  },

  // --- UC-L02: Delete Listing ---
  deleteListing: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, lenderId: req.session.user.id },
      });
      if (listing) await listing.update({ status: "Deleted" });
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

      res.render("lender/upload-images", {
        listing,
        error: req.query.error || null,
      });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  },

  uploadImages: async (req, res) => {
    try {
      const listingId = req.params.id;
      let imagesToCreate = [];

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          imagesToCreate.push({
            listingId,
            imageUrl: `/images/uploads/${file.filename}`,
            isPrimary: false,
          });
        });
      }

      if (req.body.imageUrls) {
        let urls = req.body.imageUrls;
        if (!Array.isArray(urls)) urls = [urls];
        urls.forEach((url) => {
          if (url.trim())
            imagesToCreate.push({
              listingId,
              imageUrl: url.trim(),
              isPrimary: false,
            });
        });
      }

      if (imagesToCreate.length === 0)
        return res.redirect(`/lender/listings/${listingId}/images`);

      const existingImages = await Image.count({ where: { listingId } });
      if (existingImages === 0 && imagesToCreate.length > 0)
        imagesToCreate[0].isPrimary = true;

      await Image.bulkCreate(imagesToCreate);
      res.redirect(`/lender/listings/${listingId}/images`);
    } catch (error) {
      res.status(500).send("Error uploading images");
    }
  },

  deleteImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId);
      if (image) {
        const listingId = image.listingId;
        const wasPrimary = image.isPrimary;

        // Safety Check: Do not delete the last available image
        const currentCount = await Image.count({ where: { listingId } });
        if (currentCount <= 1) {
          return res.redirect(
            `/lender/listings/${listingId}/images?error=Cannot+delete+the+last+remaining+image.`,
          );
        }

        await image.destroy();

        // Automatically set the next remaining image as primary if the old primary was deleted
        if (wasPrimary) {
          const nextImage = await Image.findOne({
            where: { listingId },
            order: [["createdAt", "ASC"]], // Sort chronologically to get the top image
          });
          if (nextImage) {
            await nextImage.update({ isPrimary: true });
          }
        }

        return res.redirect(
          `/lender/listings/${listingId}/images?success=Image+successfully+deleted.`,
        );
      }
      res.redirect("back");
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).send("Error deleting image");
    }
  },

  // Processes the drag-and-drop reordering
  reorderImages: async (req, res) => {
    try {
      const listingId = req.params.id;
      const { imageIds } = req.body;

      // Use the current time as a baseline and increment by 1 second for each position
      // This enforces chronological order without needing a schema migration for an 'orderIndex' column
      let baseTime = new Date().getTime();

      for (let i = 0; i < imageIds.length; i++) {
        const imgId = imageIds[i];

        // Automatically make the item dragged to the first slot the new Primary
        const isPrimary = i === 0;

        await Image.update(
          {
            createdAt: new Date(baseTime + i * 1000),
            isPrimary: isPrimary,
          },
          { where: { id: imgId, listingId: listingId } },
        );
      }

      res.status(200).json({ message: "Reordered successfully" });
    } catch (error) {
      console.error("Error reordering images:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  setPrimaryImage: async (req, res) => {
    try {
      const image = await Image.findByPk(req.params.imageId);
      if (image) {
        const listingId = image.listingId;

        // 1. Remove primary status from all other images
        await Image.update(
          { isPrimary: false },
          { where: { listingId: listingId } },
        );

        // 2. Find the current oldest image in the list
        const oldestImage = await Image.findOne({
          where: { listingId: listingId },
          order: [["createdAt", "ASC"]],
        });

        // 3. Calculate a new timestamp 1 second older than the current oldest
        let newTime = new Date().getTime();
        if (oldestImage) {
          newTime = new Date(oldestImage.createdAt).getTime() - 1000;
        }

        // 4. Set the selected image as primary AND move it to the front
        await image.update({
          isPrimary: true,
          createdAt: new Date(newTime),
        });

        // 5. Explicitly redirect back with a success message
        return res.redirect(
          `/lender/listings/${listingId}/images?success=Primary+image+successfully+updated.`,
        );
      }
      res.redirect("/lender/listings");
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

      // Fetch Pending Requests for this specific listing
      const pendingRequests = await RentalRequest.findAll({
        where: { listingId: listing.id, status: "Pending" },
        include: [{ model: User, as: "borrower" }],
        order: [["createdAt", "DESC"]],
      });

      // Fetch all Rentals (Active & Completed) for this listing
      const allRentals = await Rental.findAll({
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { listingId: listing.id },
            include: [{ model: User, as: "borrower" }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Calculate Listing Analytics
      const totalRentals = allRentals.length;
      const totalEarnings = allRentals.reduce(
        (sum, rental) => sum + (parseFloat(rental.actualTotal) || 0),
        0,
      );
      const isCurrentlyRented = allRentals.some((r) => r.status === "Active");

      // Build a specific Activity Feed for this listing
      let activities = [];

      // Add creation event
      activities.push({
        type: "created",
        text: "Listing was created",
        date: listing.createdAt,
        icon: "bi-stars",
        color: "text-warning",
      });

      // Add request events
      pendingRequests.forEach((req) => {
        activities.push({
          type: "request",
          text: `${req.borrower.firstName || req.borrower.email.split("@")[0]} requested to borrow this`,
          date: req.createdAt,
          icon: "bi-envelope",
          color: "text-info",
        });
      });

      // Add rental events
      allRentals.forEach((rent) => {
        const borrowerName =
          rent.request.borrower.firstName ||
          rent.request.borrower.email.split("@")[0];
        activities.push({
          type: "rental_started",
          text: `Rental started with ${borrowerName}`,
          date: rent.createdAt,
          icon: "bi-play-circle",
          color: "text-primary",
        });
        if (rent.status === "Completed") {
          activities.push({
            type: "rental_completed",
            text: `Rental completed safely`,
            date: rent.updatedAt,
            icon: "bi-check-circle",
            color: "text-success",
          });
        }
      });

      // Sort newest to oldest and limit to the 5 most recent events
      activities.sort((a, b) => b.date - a.date);
      const recentActivity = activities.slice(0, 5);

      res.render("lender/listing-detail", {
        listing,
        pendingRequests,
        allRentals,
        totalRentals,
        totalEarnings,
        isCurrentlyRented,
        recentActivity,
      });
    } catch (error) {
      console.error(error);
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

      res.render("lender/pending-requests", { requests });
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
      res.status(500).send("Server Error processing request");
    }
  },

  // --- UC-L06: Manage Active Rentals ---
  getActiveRentals: async (req, res) => {
    try {
      const rentals = await Rental.findAll({
        // REMOVED: status: "Active" so that the Completed tab can populate on load
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
                include: [{ model: Image, as: "images" }],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]], // Ensure newest rentals appear first
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
              {
                model: Listing,
                as: "listing",
                include: [{ model: Image, as: "images" }],
              },
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

  completeRental: async (req, res) => {
    try {
      const rental = await Rental.findOne({
        where: {
          id: req.params.id,
          lenderId: req.session.user.id,
          status: "Active",
        },
      });
      if (rental) await rental.update({ status: "Completed" });
      res.redirect("/lender/history");
    } catch (error) {
      res.status(500).send("Error completing rental");
    }
  },
  submitReport: async (req, res) => {
    try {
      const lenderId = req.session.user.id;
      const { listingId, reason, details } = req.body;

      if (!listingId || !reason || !details) {
        return res.status(400).send("Missing report details");
      }

      // Find the most recent rental for this listing to identify the borrower
      const rental = await Rental.findOne({
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { listingId },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!rental) {
        return res
          .status(404)
          .send("No rental history found for this listing to report.");
      }

      const borrowerId = rental.request.borrowerId;

      await Report.create({
        listingId,
        reporterId: lenderId,
        reportedUserId: borrowerId,
        reason,
        details,
        status: "Submitted",
      });

      res.redirect("/lender/rentals");
    } catch (error) {
      console.error("Lender Report Error:", error);
      res.status(500).send("Error submitting report");
    }
  },
};

module.exports = LenderController;
