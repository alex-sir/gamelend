const {
  Listing,
  Image,
  RentalRequest,
  Rental,
  User,
  Report,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
  PlatformSettings,
  Category,
} = require("../models");
const { Op } = require("sequelize");



function toDateOnly(value) {
  // value from <input type="date"> is already YYYY-MM-DD
  return value;
}

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end - start) / msPerDay) || 1;
}

async function listingHasAcceptedOverlap(listingId, startDate, endDate, excludeRequestId = null) {
  const where = {
    listingId,
    status: "Accepted",
    startDate: { [Op.lte]: endDate },
    endDate: { [Op.gte]: startDate },
  };
  if (excludeRequestId) where.id = { [Op.ne]: excludeRequestId };

  const count = await RentalRequest.count({ where });
  return count > 0;
}

const BorrowerController = {
  // UC-B01
  getDashboard: async (req, res) => {
    const { q, category } = req.query;

    try {
      const categories = await Category.findAll({ where: { status: 'Active' } });
      const categoryNames = categories.map(c => c.name);

      const where = { status: "Active" };
      if (category && categoryNames.includes(category)) {
        where.category = category;
      }

      if (q && String(q).trim()) {
        const term = `%${String(q).trim()}%`;
        where[Op.or] = [
          { title: { [Op.like]: term } },
          { category: { [Op.like]: term } },
          { description: { [Op.like]: term } },
        ];
      }

      const listings = await Listing.findAll({
        where,
        include: [
          { model: Image, as: "images" },
          { model: User, as: "lender" },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.render("borrower/dashboard", {
        listings,
        searchQuery: q ? String(q).trim() : "",
        activeCategoryLabel: category || "",
        categories
      });
    } catch (error) {
      console.error("Borrower dashboard error:", error);
      res.status(500).send("Error loading borrower dashboard");
    }
  },

  // UC-B02
  viewListing: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id },
        include: [
          { model: Image, as: "images" },
          { model: User, as: "lender" },
          { model: Listing_VideoGame, as: "videoGameDetails" },
          { model: Listing_Console, as: "consoleDetails" },
          { model: Listing_Accessory, as: "accessoryDetails" },
        ],
        order: [[{ model: Image, as: "images" }, "isPrimary", "DESC"]],
      });

      if (!listing || listing.status !== "Active") {
        return res.redirect("/borrower/dashboard");
      }

      res.render("borrower/item-details", { listing, error: null, isPublicListingView: false });
    } catch (error) {
      console.error("Borrower listing view error:", error);
      res.status(500).send("Error loading listing details");
    }
  },

  // UC-B03 (render)
  renderRentalRequestForm: async (req, res) => {
    try {
      const listing = await Listing.findOne({
        where: { id: req.params.id, status: "Active" },
        include: [
          { model: Image, as: "images" },
          { model: User, as: "lender" },
        ],
      });
      if (!listing) return res.redirect("/borrower/dashboard");

      res.render("borrower/rental-request", { listing, error: null });
    } catch (error) {
      console.error("Render rental request error:", error);
      res.status(500).send("Error loading request form");
    }
  },

  // UC-B03 (submit)
  submitRentalRequest: async (req, res) => {
    const borrowerId = req.session.user.id;
    const listingId = req.params.id;
    const startDate = toDateOnly(req.body.startDate);
    const endDate = toDateOnly(req.body.endDate);

    try {
      const borrower = await User.findByPk(borrowerId);
      if (!borrower) return res.status(404).send("User not found");
      if (borrower.isSuspended) {
        return res.status(403).send("Account suspended: cannot submit requests.");
      }

      const listing = await Listing.findOne({
        where: { id: listingId, status: "Active" },
        include: [{ model: User, as: "lender" }, { model: Image, as: "images" }],
      });
      if (!listing) return res.redirect("/borrower/dashboard");

      // Enforce Max Active Rentals Platform Setting
      const maxRentalsSetting = await PlatformSettings.findOne({ where: { settingKey: 'maxActiveRentals' } });
      const maxRentals = maxRentalsSetting ? parseInt(maxRentalsSetting.settingValue, 10) : 5;
      
      const activeRentalsCount = await Rental.count({ where: { borrowerId, status: "Active" } });
      if (activeRentalsCount >= maxRentals) {
        return res.render("borrower/rental-request", {
          listing,
          error: `You have reached the platform maximum of ${maxRentals} active rentals. Please return items before requesting more.`,
        });
      }

      if (!startDate || !endDate) {
        return res.render("borrower/rental-request", {
          listing,
          error: "Please select a start and end date.",
        });
      }
      if (new Date(endDate) < new Date(startDate)) {
        return res.render("borrower/rental-request", {
          listing,
          error: "End date must be after start date.",
        });
      }

      const durationDays = daysBetween(startDate, endDate);
      if (durationDays < 1) {
        return res.render("borrower/rental-request", {
          listing,
          error: "Rental duration must be at least one day.",
        });
      }

      const hasOverlap = await listingHasAcceptedOverlap(listingId, startDate, endDate);
      if (hasOverlap) {
        return res.render("borrower/rental-request", {
          listing,
          error: "Those dates are no longer available. Please choose different dates.",
        });
      }

      const request = await RentalRequest.create({
        listingId: listing.id,
        borrowerId,
        startDate,
        endDate,
        status: "Pending",
      });

      res.redirect(`/borrower/requests/${request.id}/confirmation`);
    } catch (error) {
      console.error("Submit rental request error:", error);
      res.status(500).send("Error submitting rental request");
    }
  },

  renderRequestConfirmation: async (req, res) => {
    try {
      const request = await RentalRequest.findOne({
        where: { id: req.params.id, borrowerId: req.session.user.id },
        include: [
          {
            model: Listing,
            as: "listing",
            include: [{ model: Image, as: "images" }, { model: User, as: "lender" }],
          },
        ],
      });

      if (!request) return res.redirect("/borrower/my-rentals");

      const durationDays = daysBetween(request.startDate, request.endDate);
      const subtotal = durationDays * Number(request.listing.dailyRate);
      const deposit = 0;
      
      // Calculate dynamic platform service fee
      const feeSetting = await PlatformSettings.findOne({ where: { settingKey: 'platformFeePercent' } });
      const feePercent = feeSetting ? parseFloat(feeSetting.settingValue) : 10;
      const serviceFee = subtotal * (feePercent / 100);
      
      const total = subtotal + serviceFee + deposit;

      res.render("borrower/rental-confirmation", {
        request,
        cost: { durationDays, subtotal, deposit, serviceFee, total },
      });
    } catch (error) {
      console.error("Confirmation error:", error);
      res.status(500).send("Error loading confirmation");
    }
  },

  // UC-B04 + history view
  getMyRentals: async (req, res) => {
    const borrowerId = req.session.user.id;

    try {
      const pendingRequests = await RentalRequest.findAll({
        where: { borrowerId, status: "Pending" },
        include: [
          {
            model: Listing,
            as: "listing",
            include: [{ model: Image, as: "images" }, { model: User, as: "lender" }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const activeRentals = await Rental.findAll({
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { borrowerId },
            include: [
              {
                model: Listing,
                as: "listing",
                include: [{ model: Image, as: "images" }, { model: User, as: "lender" }],
              },
            ],
          },
        ],
        where: { status: "Active" },
        order: [["createdAt", "DESC"]],
      });

      const completedRentals = await Rental.findAll({
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { borrowerId },
            include: [{ model: Listing, as: "listing", include: [{ model: User, as: "lender" }] }],
          },
        ],
        where: { status: "Completed" },
        order: [["createdAt", "DESC"]],
      });

      res.render("borrower/my-rentals", { pendingRequests, activeRentals, completedRentals });
    } catch (error) {
      console.error("My rentals error:", error);
      res.status(500).send("Error loading rentals");
    }
  },

  cancelRequest: async (req, res) => {
    const borrowerId = req.session.user.id;
    try {
      const request = await RentalRequest.findOne({
        where: { id: req.params.id, borrowerId },
      });
      if (!request) return res.redirect("/borrower/my-rentals");

      if (request.status !== "Pending") return res.redirect("/borrower/my-rentals");

      const today = new Date();
      const start = new Date(request.startDate);
      if (today >= start) {
        return res.redirect("/borrower/my-rentals");
      }

      await request.update({ status: "Cancelled" });
      res.redirect("/borrower/my-rentals");
    } catch (error) {
      console.error("Cancel request error:", error);
      res.status(500).send("Error cancelling request");
    }
  },

  // Details pages
  viewRequestDetails: async (req, res) => {
    const borrowerId = req.session.user.id;
    try {
      const request = await RentalRequest.findOne({
        where: { id: req.params.id, borrowerId },
        include: [
          {
            model: Listing,
            as: "listing",
            include: [{ model: Image, as: "images" }, { model: User, as: "lender" }],
          },
        ],
      });
      if (!request) return res.redirect("/borrower/my-rentals");

      const durationDays = daysBetween(request.startDate, request.endDate);
      const subtotal = durationDays * Number(request.listing.dailyRate);
      const deposit = 0;
      const serviceFee = subtotal * 0.125;
      const total = subtotal + serviceFee + deposit;

      res.render("borrower/rental-details", {
        request,
        rental: null,
        cost: { durationDays, subtotal, deposit, serviceFee, total },
      });
    } catch (error) {
      console.error("Request details error:", error);
      res.status(500).send("Error loading request details");
    }
  },

  viewRentalDetails: async (req, res) => {
    const borrowerId = req.session.user.id;
    try {
      const rental = await Rental.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { borrowerId },
            include: [
              {
                model: Listing,
                as: "listing",
                include: [{ model: Image, as: "images" }, { model: User, as: "lender" }],
              },
            ],
          },
        ],
      });

      if (!rental) return res.redirect("/borrower/my-rentals");

      const durationDays = daysBetween(rental.request.startDate, rental.request.endDate);
      const subtotal = durationDays * Number(rental.request.listing.dailyRate);
      const deposit = 0;
      
      const feeSetting = await PlatformSettings.findOne({ where: { settingKey: 'platformFeePercent' } });
      const feePercent = feeSetting ? parseFloat(feeSetting.settingValue) : 10;
      const serviceFee = subtotal * (feePercent / 100);
      
      const total = rental.actualTotal + serviceFee + deposit;

      res.render("borrower/rental-details", {
        request: rental.request,
        rental,
        cost: { durationDays, subtotal, deposit, serviceFee, total },
      });
    } catch (error) {
      console.error("Rental details error:", error);
      res.status(500).send("Error loading rental details");
    }
  },

  // UC-B05 (minimal: extend an active rental by updating request endDate)
  renderExtendForm: async (req, res) => {
    const borrowerId = req.session.user.id;
    try {
      const rental = await Rental.findOne({
        where: { id: req.params.id, status: "Active" },
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { borrowerId },
            include: [
              {
                model: Listing,
                as: "listing",
                include: [{ model: User, as: "lender" }, { model: Image, as: "images" }],
              },
            ],
          },
        ],
      });
      if (!rental) return res.redirect("/borrower/my-rentals");

      res.render("borrower/extend-rental", { rental, error: null });
    } catch (error) {
      console.error("Extend form error:", error);
      res.status(500).send("Error loading extension form");
    }
  },

  submitExtendRental: async (req, res) => {
    const borrowerId = req.session.user.id;
    const newEndDate = toDateOnly(req.body.newEndDate);

    try {
      const rental = await Rental.findOne({
        where: { id: req.params.id, status: "Active" },
        include: [
          {
            model: RentalRequest,
            as: "request",
            where: { borrowerId },
            include: [{ model: Listing, as: "listing", include: [{ model: Image, as: "images" }, { model: User, as: "lender" }] }],
          },
        ],
      });
      if (!rental) return res.redirect("/borrower/my-rentals");

      const currentEnd = rental.request.endDate;
      if (!newEndDate || new Date(newEndDate) <= new Date(currentEnd)) {
        return res.render("borrower/extend-rental", {
          rental,
          error: "Please choose a new return date after the current end date.",
        });
      }

      const hasOverlap = await listingHasAcceptedOverlap(
        rental.request.listingId,
        rental.request.startDate,
        newEndDate,
        rental.request.id,
      );
      if (hasOverlap) {
        return res.render("borrower/extend-rental", {
          rental,
          error: "That extension conflicts with another booking.",
        });
      }

      await rental.request.update({ endDate: newEndDate });

      const days = daysBetween(rental.request.startDate, newEndDate);
      const total = days * Number(rental.request.listing.dailyRate);
      await rental.update({ actualTotal: total });

      res.redirect(`/borrower/rentals/${rental.id}`);
    } catch (error) {
      console.error("Extend submit error:", error);
      res.status(500).send("Error submitting extension");
    }
  },

  // UC-B06
  renderReportForm: async (req, res) => {
    try {
      const listing = await Listing.findByPk(req.params.id, {
        include: [{ model: User, as: 'lender' }]
      });
      if (!listing) return res.redirect("/borrower/dashboard");

      res.render("borrower/report-listing", { listing, error: null });
    } catch (error) {
      console.error("Report form error:", error);
      res.status(500).send("Error loading report form");
    }
  },

  submitReport: async (req, res) => {
    const borrowerId = req.session.user.id;
    const listingId = req.params.id;
    const { reason, details, referenceUrl } = req.body;

    try {
      const listing = await Listing.findByPk(listingId);
      if (!listing) {
        return res.redirect("/borrower/dashboard");
      }

      if (!reason || !details) {
        const fullListing = await Listing.findByPk(listingId, {
          include: [{ model: User, as: "lender" }],
        });
        return res.render("borrower/report-listing", {
          listing: fullListing,
          error: "Please select a reason and provide details.",
        });
      }

      await Report.create({
        listingId: listing.id,
        borrowerId,
        reason,
        details,
        referenceUrl: referenceUrl || null,
        status: "Submitted",
      });

      res.redirect(`/borrower/listings/${listingId}`);
    } catch (error) {
      console.error("Submit report error details:", error);
      res.status(500).send("Error submitting report");
    }
  },
};

module.exports = BorrowerController;

