const {
  User,
  Listing,
  RentalRequest,
  Rental,
  Listing_VideoGame,
  Listing_Console,
  Listing_Accessory,
  Image,
} = require("../models");
const { sequelize } = require("../models");

async function seedDatabase() {
  try {
    console.log("--- 🚀 Starting Exhaustive Seeding Script ---");

    // ----------------------------------------------------------------------
    // 0. SYNC DATABASE (Create Tables)
    // ----------------------------------------------------------------------
    console.log("🔄 Syncing database tables...");
    // CAUTION: { force: true } drops all existing tables before recreating them!
    // This is perfect for a seed script, but never use { force: true } in production.
    await sequelize.sync({ force: true });
    console.log("✅ Tables created successfully!");

    // ----------------------------------------------------------------------
    // 1. CREATE USERS (Admin, Lender, Borrower)
    // ----------------------------------------------------------------------
    console.log("👥 Seeding Users...");
    const [admin] = await User.findOrCreate({
      where: { email: "peach@admin.com" },
      defaults: {
        password: "password123",
        firstName: "Princess",
        lastName: "Peach",
        role: "admin",
      },
    });

    const [lender] = await User.findOrCreate({
      where: { email: "mario@lender.com" },
      defaults: {
        password: "password123",
        firstName: "Mario",
        lastName: "Bros",
        role: "lender",
      },
    });

    const [borrower] = await User.findOrCreate({
      where: { email: "luigi@borrower.com" },
      defaults: {
        password: "password123",
        firstName: "Luigi",
        lastName: "Bros",
        role: "borrower",
      },
    });

    console.log(
      `✅ Users Ready: Admin (${admin.email}), Lender (${lender.email}), Borrower (${borrower.email})`,
    );

    // ----------------------------------------------------------------------
    // 2. CREATE EXHAUSTIVE LISTINGS WITH SUB-TYPES & IMAGES
    // ----------------------------------------------------------------------
    console.log("📦 Seeding Exhaustive Listings & Images...");

    // LISTING 1: CONSOLE
    const ps5 = await Listing.create({
      title: "PlayStation 5 Console - Disk Edition",
      category: "Console",
      condition: "Like New",
      dailyRate: 15.0,
      quantity: 1,
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
          "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800",
        isPrimary: true,
      },
      {
        listingId: ps5.id,
        imageUrl:
          "https://images.unsplash.com/photo-1607458256227-2ad1907797da?auto=format&fit=crop&q=80&w=800",
        isPrimary: false,
      },
    ]);

    // LISTING 2: VIDEO GAME
    const zelda = await Listing.create({
      title: "The Legend of Zelda: Tears of the Kingdom",
      category: "Video Game",
      condition: "Very Good",
      dailyRate: 5.0,
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
          "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=800",
        isPrimary: true,
      },
    ]);

    // LISTING 3: ACCESSORY
    const controller = await Listing.create({
      title: "Xbox Elite Wireless Controller Series 2",
      category: "Accessory",
      condition: "Good",
      dailyRate: 8.0,
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
          "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&q=80&w=800",
        isPrimary: true,
      },
      {
        listingId: controller.id,
        imageUrl:
          "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=800",
        isPrimary: false,
      },
    ]);

    // LISTING 4: RETRO CONSOLE (Draft Status)
    const n64 = await Listing.create({
      title: "Nintendo 64 - Original Charcoal",
      category: "Console",
      condition: "Acceptable",
      dailyRate: 10.0,
      quantity: 1,
      description:
        "Classic N64 console. Works great, but missing the expansion pak cover. Comes with one gray controller and AV cables.",
      status: "Draft",
      lenderId: lender.id,
    });
    await Listing_Console.create({
      listingId: n64.id,
      consoleType: "Nintendo Switch", // Mapping to closest enum
      storageCapacity: "N/A",
      controllersIncluded: true,
      controllerQuantity: 1,
      cablesIncluded: true,
    });
    await Image.bulkCreate([
      {
        listingId: n64.id,
        imageUrl:
          "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=800",
        isPrimary: true,
      },
    ]);

    console.log("✅ 4 Exhaustive Listings Created.");

    // ----------------------------------------------------------------------
    // 3. CREATE RENTAL HISTORY (Simulating time passing)
    // ----------------------------------------------------------------------
    console.log("📅 Simulating Rental History...");
    const now = new Date();

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
      actualTotal: 20.0,
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
      actualTotal: 75.0,
      status: "Active",
    });

    // Rental 3: PENDING REQUEST (Xbox Controller)
    const pendStart = new Date();
    pendStart.setDate(now.getDate() + 2);
    const pendEnd = new Date();
    pendEnd.setDate(now.getDate() + 5);
    await RentalRequest.create({
      listingId: controller.id,
      borrowerId: borrower.id,
      startDate: pendStart,
      endDate: pendEnd,
      status: "Pending",
    });

    // Rental 4: REJECTED REQUEST (Zelda)
    const rejStart = new Date();
    rejStart.setDate(now.getDate() + 7);
    const rejEnd = new Date();
    rejEnd.setDate(now.getDate() + 10);
    await RentalRequest.create({
      listingId: zelda.id,
      borrowerId: borrower.id,
      startDate: rejStart,
      endDate: rejEnd,
      status: "Rejected",
    });

    // Rental 5: CANCELLED RENTAL (PS5)
    const cancStart = new Date();
    cancStart.setDate(now.getDate() - 30);
    const cancEnd = new Date();
    cancEnd.setDate(now.getDate() - 28);
    await RentalRequest.create({
      listingId: ps5.id,
      borrowerId: borrower.id,
      startDate: cancStart,
      endDate: cancEnd,
      status: "Cancelled",
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
