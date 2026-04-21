const {
  User,
  Listing,
  RentalRequest,
  Rental,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
  Image,
  Category,
  PlatformSettings,
  Report,
  AuditLog
} = require("../models");
const { sequelize } = require("../models");

async function seedDatabase() {
  try {
    console.log("--- 🚀 Starting Exhaustive Seeding Script ---");

    // ----------------------------------------------------------------------
    // 0. SYNC DATABASE (Create Tables)
    // ----------------------------------------------------------------------
    console.log("🔄 Syncing database tables...");
    await sequelize.sync({ force: true });
    console.log("✅ Tables created successfully!");

    // ----------------------------------------------------------------------
    // 1. CREATE USERS (Admin, Lender, Borrower)
    // ----------------------------------------------------------------------
    console.log("👥 Seeding Users...");
    const admin = await User.create({
      email: "peach@admin.com",
      password: "password123",
      firstName: "Princess",
      lastName: "Peach",
      role: "admin",
    });

    const lender = await User.create({
      email: "mario@lender.com",
      password: "password123",
      firstName: "Mario",
      lastName: "Bros",
      role: "lender",
    });

    const borrower = await User.create({
      email: "luigi@borrower.com",
      password: "password123",
      firstName: "Luigi",
      lastName: "Bros",
      role: "borrower",
    });

    console.log(
      `✅ Users Ready: Admin (${admin.email}), Lender (${lender.email}), Borrower (${borrower.email})`,
    );

    // ----------------------------------------------------------------------
    // 2. SEED PLATFORM SETTINGS & CATEGORIES
    // ----------------------------------------------------------------------
    console.log("⚙️ Seeding Platform Settings...");
    await PlatformSettings.bulkCreate([
      { settingCategory: "Payments", settingKey: "platformFeePercent", settingValue: "10", updatedBy: admin.id },
      { settingCategory: "Rentals", settingKey: "maintenanceMode", settingValue: "false", updatedBy: admin.id },
      { settingCategory: "Listings", settingKey: "maxImagesPerListing", settingValue: "8", updatedBy: admin.id }
    ]);

    console.log("🏷️ Seeding Default Categories...");
    await Category.bulkCreate([
      { name: "Console", status: "Active" },
      { name: "Video Game", status: "Active" },
      { name: "Accessory", status: "Active" }
    ]);

    // ----------------------------------------------------------------------
    // 3. CREATE EXHAUSTIVE LISTINGS WITH SUB-TYPES & IMAGES
    // ----------------------------------------------------------------------
    console.log("📦 Seeding Exhaustive Listings & Images...");

    // LISTING 1: CONSOLE
    const ps5 = await Listing.create({
      title: "PlayStation 5 Console - Disk Edition",
      category: "Console",
      condition: "Like New",
      dailyRate: 7.0,
      quantity: 5,
      description:
        "Hardly used PS5 with two controllers. 4K gaming ready! Comes in original box with all HDMI and power cables. Perfectly quiet, no fan coil whine.",
      status: "Active",
      lenderId: lender.id,
    });
    // Add Console Sub-Type Details
    await Listing_Console.create({
      listingId: ps5.id,
      consoleType: "PlayStation 5",
      storageCapacity: "825GB NVMe SSD",
      controllersIncluded: true,
      controllerQuantity: 2,
      cablesIncluded: true,
      serialNumber: "PS5-987654321-XYZ",
    });
    // Add Multiple Images
    await Image.bulkCreate([
      {
        listingId: ps5.id,
        imageUrl:
          "https://media.gamestop.com/i/gamestop/20009351_ALT05?$pdp$?w=1256&h=664&fmt=auto",
        isPrimary: true,
      },
      {
        listingId: ps5.id,
        imageUrl:
          "https://media.wired.com/photos/5fa9dbb7ed97b6b30c266262/master/pass/games_gear_ps5-disc.jpg",
        isPrimary: false,
      },
    ]);

    // LISTING 2: VIDEO GAME
    const zelda = await Listing.create({
      title: "The Legend of Zelda: Tears of the Kingdom",
      category: "Video Game",
      condition: "Very Good",
      dailyRate: 1.5,
      quantity: 1,
      description:
        "Physical cartridge for Nintendo Switch. Case is included and in perfect condition. Dive into the massive world of Hyrule and the skies above!",
      status: "Active",
      lenderId: lender.id,
    });
    // Add Video Game Sub-Type Details
    await Listing_VideoGame.create({
      listingId: zelda.id,
      platform: "Nintendo Switch",
      genre: "Adventure",
      esrbRating: "E10+",
      publisher: "Nintendo",
      releaseYear: 2023,
    });
    // Add Images
    await Image.bulkCreate([
      {
        listingId: zelda.id,
        imageUrl:
          "https://thesunflower.com/wp-content/uploads/2024/02/Tears-of-the-Kingdom-wallpaper-1170x720-1.jpg",
        isPrimary: true,
      },
    ]);

    // LISTING 3: ACCESSORY
    const controller = await Listing.create({
      title: "Xbox Elite Wireless Controller Series 2",
      category: "Accessory",
      condition: "Good",
      dailyRate: 2.0,
      quantity: 2,
      description:
        "Pro-level Xbox controller with adjustable-tension thumbsticks, wrap-around rubberized grip, and shorter hair trigger locks. Includes carrying case.",
      status: "Active",
      lenderId: lender.id,
    });
    // Add Accessory Sub-Type Details
    await Listing_Accessory.create({
      listingId: controller.id,
      accessoryType: "Controller",
      compatiblePlatforms: "Xbox Series X/S, Xbox One, PC",
      isWireless: true,
      brand: "Microsoft",
      modelNumber: "FST-00001",
    });
    // Add Images
    await Image.bulkCreate([
      {
        listingId: controller.id,
        imageUrl:
          "https://m.media-amazon.com/images/I/717XTm0moDL._AC_UF1000,1000_QL80_.jpg",
        isPrimary: true,
      },
    ]);

    console.log("✅ 3 Exhaustive Listings Created.");

    // ----------------------------------------------------------------------
    // 4. CREATE RENTAL HISTORY (Simulating time passing)
    // ----------------------------------------------------------------------
    console.log("📅 Simulating Rental History...");
    const now = new Date();

    // ----------------------------------------------------------------------
    // 3.5 SEED INITIAL AUDIT LOGS
    // ----------------------------------------------------------------------
    console.log("📝 Seeding Initial Audit Logs...");
    await AuditLog.bulkCreate([
      { adminId: admin.id, action: 'Platform Setup', targetType: 'System', details: 'Initial system seeding and platform configuration completed.' },
      { adminId: admin.id, action: 'Category Creation', targetType: 'Category', details: 'Standard categories (Console, Video Game, Accessory) initialized.' },
      { adminId: admin.id, action: 'Security Policy', targetType: 'User', details: 'Admin and test accounts secured with default credentials.' }
    ]);

    // Rental 1: COMPLETED RENTAL (Zelda)
    const compStart = new Date();
    compStart.setDate(now.getDate() - 14);
    const compEnd = new Date();
    compEnd.setDate(now.getDate() - 10);
    const req1 = await RentalRequest.create({
      listingId: zelda.id,
      borrowerId: borrower.id,
      startDate: compStart,
      endDate: compEnd,
      status: "Accepted",
    });
    await Rental.create({
      requestId: req1.id,
      lenderId: lender.id,
      actualTotal: 6.0,
      status: "Completed",
    });

    // Rental 2: ACTIVE RENTAL (PS5)
    const activeStart = new Date();
    activeStart.setDate(now.getDate() - 2);
    const activeEnd = new Date();
    activeEnd.setDate(now.getDate() + 3);
    const req2 = await RentalRequest.create({
      listingId: ps5.id,
      borrowerId: borrower.id,
      startDate: activeStart,
      endDate: activeEnd,
      status: "Accepted",
    });
    await Rental.create({
      requestId: req2.id,
      lenderId: lender.id,
      actualTotal: 21.0,
      status: "Active",
    });

    console.log("✅ Rental History Generated.");
    console.log("🎉 Seeding Complete! You can now log in and test the UI.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
