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

    // CONSOLE (PlayStation 5)
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
    await Listing_Console.create({
      listingId: ps5.id,
      consoleType: "PlayStation 5",
      storageCapacity: "825GB NVMe SSD",
      controllersIncluded: true,
      controllerQuantity: 2,
      cablesIncluded: true,
      serialNumber: "PS5-987654321-XYZ",
    });
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

    // VIDEO GAME (The Legend of Zelda: Tears of the Kingdom)
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
    await Listing_VideoGame.create({
      listingId: zelda.id,
      platform: "Nintendo Switch",
      genre: "Adventure",
      esrbRating: "E10+",
      publisher: "Nintendo",
      releaseYear: 2023,
    });
    await Image.bulkCreate([
      {
        listingId: zelda.id,
        imageUrl:
          "https://thesunflower.com/wp-content/uploads/2024/02/Tears-of-the-Kingdom-wallpaper-1170x720-1.jpg",
        isPrimary: true,
      },
      {
        listingId: zelda.id,
        imageUrl:
          "https://static0.pocketlintimages.com/wordpress/wp-content/uploads/2023/05/legend-of-zelda-tears-of-the-kingdom-9.jpg?w=1600&h=900&fit=crop",
        isPrimary: false,
      },
    ]);

    // ACCESSORY (Xbox Elite Wireless Controller Series 2)
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
    await Listing_Accessory.create({
      listingId: controller.id,
      accessoryType: "Controller",
      compatiblePlatforms: "Xbox Series X/S, Xbox One, PC",
      isWireless: true,
      brand: "Microsoft",
      modelNumber: "FST-00001",
    });
    await Image.bulkCreate([
      {
        listingId: controller.id,
        imageUrl:
          "https://m.media-amazon.com/images/I/717XTm0moDL._AC_UF1000,1000_QL80_.jpg",
        isPrimary: true,
      },
      {
        listingId: controller.id,
        imageUrl:
          "https://i.extremetech.com/imagery/content-types/04K176NzQ8xAqEfIXArLIHe/hero-image.fit_lim.v1678673188.jpg",
        isPrimary: false,
      },
    ]);

    // RETRO CONSOLE (Nintendo 64) (Draft Status)
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
      consoleType: "Nintendo Switch", // Keeping original mapping
      storageCapacity: "N/A",
      controllersIncluded: true,
      controllerQuantity: 1,
      cablesIncluded: true,
    });
    await Image.bulkCreate([
      {
        listingId: n64.id,
        imageUrl: "https://m.media-amazon.com/images/I/81-6ZsysglL.jpg",
        isPrimary: true,
      },
    ]);

    // VIDEO GAME (Final Fantasy VII Rebirth)
    const ff7r = await Listing.create({
      title: "Final Fantasy VII Rebirth",
      category: "Video Game",
      condition: "Like New",
      dailyRate: 2.5,
      quantity: 1,
      description:
        "The unknown journey continues. Physical copy for PS5. Comes with both the Data Disc and the Play Disc in pristine condition.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_VideoGame.create({
      listingId: ff7r.id,
      platform: "PlayStation 5",
      genre: "RPG",
      esrbRating: "T",
      publisher: "Square Enix",
      releaseYear: 2024,
    });
    await Image.bulkCreate([
      {
        listingId: ff7r.id,
        imageUrl:
          "https://m.media-amazon.com/images/I/8139kZStJ6L._AC_UF1000,1000_QL80_.jpg",
        isPrimary: true,
      },
      {
        listingId: ff7r.id,
        imageUrl:
          "https://static01.nyt.com/images/2024/02/22/multimedia/22finalfantasy-review-bjzf/22finalfantasy-review-bjzf-superJumbo.jpg",
        isPrimary: false,
      },
    ]);

    // VIDEO GAME (Helldivers 2)
    const helldivers = await Listing.create({
      title: "Helldivers 2",
      category: "Video Game",
      condition: "Good",
      dailyRate: 1.5,
      quantity: 3,
      description:
        "Join the Helldivers and fight for freedom across a hostile galaxy in a fast, frantic, and ferocious third-person shooter.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_VideoGame.create({
      listingId: helldivers.id,
      platform: "PlayStation 5",
      genre: "Action",
      esrbRating: "M",
      publisher: "Sony Interactive Entertainment",
      releaseYear: 2024,
    });
    await Image.bulkCreate([
      {
        listingId: helldivers.id,
        imageUrl:
          "https://m.media-amazon.com/images/M/MV5BN2IyY2VjMDctNGMzYS00ZWEwLTkyNTgtNTdkNDQ3MzA0MDhmXkEyXkFqcGc@._V1_.jpg",
        isPrimary: true,
      },
    ]);

    // VIDEO GAME (Super Mario Bros. Wonder)
    const marioWonder = await Listing.create({
      title: "Super Mario Bros. Wonder",
      category: "Video Game",
      condition: "Very Good",
      dailyRate: 1.0,
      quantity: 2,
      description:
        "Find wonder in the next evolution of Mario fun! Physical Switch cartridge.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_VideoGame.create({
      listingId: marioWonder.id,
      platform: "Nintendo Switch",
      genre: "Adventure",
      esrbRating: "E",
      publisher: "Nintendo",
      releaseYear: 2023,
    });
    await Image.bulkCreate([
      {
        listingId: marioWonder.id,
        imageUrl: "https://m.media-amazon.com/images/I/81kN3ZgSSGL.jpg",
        isPrimary: true,
      },
    ]);

    // CONSOLE (Nintendo Switch OLED)
    const switchOled = await Listing.create({
      title: "Nintendo Switch OLED Model - White Joy-Con",
      category: "Console",
      condition: "Good",
      dailyRate: 5.0,
      quantity: 3,
      description:
        "Includes dock, HDMI cable, power adapter, and Joy-Con grip. Perfect for a weekend party or testing before you buy.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_Console.create({
      listingId: switchOled.id,
      consoleType: "Nintendo Switch",
      storageCapacity: "256GB",
      controllersIncluded: true,
      controllerQuantity: 2,
      cablesIncluded: true,
    });
    await Image.bulkCreate([
      {
        listingId: switchOled.id,
        imageUrl:
          "https://www.nintendo.com/my/hardware/detail/switch-oled/img/01-bgdark/main_pic_sp.png",
        isPrimary: true,
      },
    ]);

    // CONSOLE (Xbox Series X)
    const xboxX = await Listing.create({
      title: "Xbox Series X",
      category: "Console",
      condition: "Very Good",
      dailyRate: 6.5,
      quantity: 4,
      description:
        "Microsoft's most powerful console. Includes 1 standard wireless controller and a high-speed HDMI cable.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_Console.create({
      listingId: xboxX.id,
      consoleType: "Xbox Series X/S",
      storageCapacity: "1TB SSD",
      controllersIncluded: true,
      controllerQuantity: 1,
      cablesIncluded: true,
    });
    await Image.bulkCreate([
      {
        listingId: xboxX.id,
        imageUrl:
          "https://cms-assets.xboxservices.com/assets/bc/40/bc40fdf3-85a6-4c36-af92-dca2d36fc7e5.png?n=642227_Hero-Gallery-0_A1_857x676.png",
        isPrimary: true,
      },
    ]);

    // ACCESSORY (PlayStation VR2)
    const psvr2 = await Listing.create({
      title: "PlayStation VR2 Headset & Horizon Call of the Mountain",
      category: "Accessory",
      condition: "Like New",
      dailyRate: 15.0,
      quantity: 2,
      description:
        "Next-gen virtual reality for the PS5. Includes the VR headset, two Sense controllers, and stereo headphones. Note: Requires a PS5 to operate.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_Accessory.create({
      listingId: psvr2.id,
      accessoryType: "VR Equipment",
      compatiblePlatforms: "PS5",
      isWireless: false,
      brand: "Sony",
      modelNumber: "CFI-ZVR1W",
    });
    await Image.bulkCreate([
      {
        listingId: psvr2.id,
        imageUrl:
          "https://gmedia.playstation.com/is/image/SIEPDC/PSVR2-thumbnail-01-en-22feb22?$facebook$",
        isPrimary: true,
      },
    ]);

    // ACCESSORY (DualSense Edge)
    const dualSenseEdge = await Listing.create({
      title: "DualSense Edge Wireless Controller",
      category: "Accessory",
      condition: "Like New",
      dailyRate: 3.0,
      quantity: 7,
      description:
        "Pro controller for the PS5. Comes with the carrying case, braided USB cable, and all interchangeable back buttons and stick caps.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_Accessory.create({
      listingId: dualSenseEdge.id,
      accessoryType: "Controller",
      compatiblePlatforms: "PS5, PC",
      isWireless: true,
      brand: "Sony",
      modelNumber: "CFI-ZCP1",
    });
    await Image.bulkCreate([
      {
        listingId: dualSenseEdge.id,
        imageUrl:
          "https://gmedia.playstation.com/is/image/SIEPDC/dualsense-edge-listing-thumb-01-en-23aug22?$facebook$",
        isPrimary: true,
      },
    ]);

    // VIDEO GAME (Baldur's Gate 3)
    const bg3 = await Listing.create({
      title: "Baldur's Gate 3 - Deluxe Edition",
      category: "Video Game",
      condition: "Very Good",
      dailyRate: 2.0,
      quantity: 9,
      description:
        "Gather your party and return to the Forgotten Realms. Physical PS5 edition. Huge game with hundreds of hours of content.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_VideoGame.create({
      listingId: bg3.id,
      platform: "PlayStation 5",
      genre: "RPG",
      esrbRating: "M",
      publisher: "Larian Studios",
      releaseYear: 2023,
    });
    await Image.bulkCreate([
      {
        listingId: bg3.id,
        imageUrl:
          "https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/3098481c9164bb5f33069b37e49fba1a572ea3b89971ee7b.jpg",
        isPrimary: true,
      },
    ]);

    // NEW LISTING 14: VIDEO GAME (Dragon's Dogma 2)
    const dragonsDogma = await Listing.create({
      title: "Dragon's Dogma 2",
      category: "Video Game",
      condition: "New",
      dailyRate: 2.0,
      quantity: 5,
      description:
        "Brand new condition. Action-RPG for the Xbox Series X. Lead your Pawns and slay legendary monsters.",
      status: "Active",
      lenderId: lender.id,
    });
    await Listing_VideoGame.create({
      listingId: dragonsDogma.id,
      platform: "Xbox Series X/S",
      genre: "RPG",
      esrbRating: "M",
      publisher: "Capcom",
      releaseYear: 2024,
    });
    await Image.bulkCreate([
      {
        listingId: dragonsDogma.id,
        imageUrl:
          "https://assets-prd.ignimgs.com/2023/06/12/dragonsdogma2-1686609309622.jpg?crop=1%3A1%2Csmart&format=jpg&auto=webp&quality=80",
        isPrimary: true,
      },
    ]);

    console.log("✅ 14 Total Exhaustive Listings Created.");

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

    // Rental 3: PENDING REQUEST (Xbox Controller)
    const pendStart = new Date();
    pendStart.setDate(now.getDate() + 2);
    const pendEnd = new Date();
    pendEnd.setDate(now.getDate() + 5);
    await RentalRequest.create({
      listingId: switchOled.id,
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

    // Rental 6: PENDING REQUEST (FF7 Rebirth)
    const pendStart2 = new Date();
    pendStart2.setDate(now.getDate() + 1);
    const pendEnd2 = new Date();
    pendEnd2.setDate(now.getDate() + 7);
    await RentalRequest.create({
      listingId: ff7r.id,
      borrowerId: borrower.id,
      startDate: pendStart2,
      endDate: pendEnd2,
      status: "Pending",
    });

    // Rental 7: ACTIVE RENTAL (Helldivers 2)
    const activeStart2 = new Date();
    activeStart2.setDate(now.getDate() - 1);
    const activeEnd2 = new Date();
    activeEnd2.setDate(now.getDate() + 7);
    const req3 = await RentalRequest.create({
      listingId: helldivers.id,
      borrowerId: borrower.id,
      startDate: activeStart2,
      endDate: activeEnd2,
      status: "Accepted",
    });
    await Rental.create({
      requestId: req3.id,
      lenderId: lender.id,
      actualTotal: 1.5,
      status: "Active",
    });

    // Rental 8: ACTIVE RENTAL (Xbox Elite Wireless Controller Series 2)
    const activeStart3 = new Date();
    activeStart3.setDate(now.getDate() - 5);
    const activeEnd3 = new Date();
    activeEnd3.setDate(now.getDate() + 3);
    const req4 = await RentalRequest.create({
      listingId: controller.id,
      borrowerId: borrower.id,
      startDate: activeStart3,
      endDate: activeEnd3,
      status: "Accepted",
    });
    await Rental.create({
      requestId: req4.id,
      lenderId: lender.id,
      actualTotal: 14,
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
