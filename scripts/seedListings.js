const { User, Listing, Category } = require('../models');

async function seedDatabase() {
  console.log("Connecting to the database to plant dummy listings...");
  
  try {
    const users = await User.findAll({ limit: 3 });
    if (users.length === 0) {
      console.error("❌ No users found! Please run node scripts/seedUsers.js first.");
      process.exit(1);
    }

    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({ 
        name: 'Consoles & Games', 
        description: 'General category.',
        status: 'Active' 
      });
    }

    // Updated to ONLY use "Active", "Deleted", and "Suspended"
    const dummyListings = [
      { 
        title: 'PlayStation 5 Console', 
        description: 'Like new PS5 with one controller. Kept in a clean, smoke-free environment and runs perfectly quietly.', 
        status: 'Active', 
        dailyRate: 15.00,
        categoryId: category.id,
        lenderId: users[0].id 
      },
      { 
        title: 'The Legend of Zelda: Tears of the Kingdom', 
        description: 'Nintendo Switch game cartridge in perfect condition. Case is included without any scratches or dents.', 
        status: 'Active', 
        dailyRate: 5.00,
        categoryId: category.id,
        lenderId: users[1].id 
      },
      { 
        title: 'Xbox Elite Series 2 Wireless Controller', 
        description: 'Slight stick drift on the left thumbstick, but otherwise works great. Comes with all interchangeable paddles.', 
        status: 'Deleted', 
        dailyRate: 8.50,
        categoryId: category.id,
        lenderId: users[2].id 
      },
      { 
        title: 'Elden Ring (PS5 Edition)', 
        description: 'Extremely difficult game, barely played it before giving up. Disc is completely flawless with no smudges.', 
        status: 'Suspended', 
        dailyRate: 6.00,
        categoryId: category.id,
        lenderId: users[0].id 
      }
    ];

    for (const listingData of dummyListings) {
      await Listing.create(listingData);
    }
    
    console.log("✅ Success! Dummy listings have been added to the database.");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error seeding listings:", error);
    process.exit(1);
  }
}

seedDatabase();