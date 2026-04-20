const { User, Listing, RentalRequest, Rental, Listing_VideoGame, Listing_Console } = require('../models');
const { sequelize } = require('../models');

async function seedTylerData() {
  try {
    console.log('--- Starting Seeding Script ---');

    // 1. Find the users
    const lender = await User.findOne({ where: { email: 'tyler@lender.com' } });
    const borrower = await User.findOne({ where: { email: 'tyler@borrower.com' } });

    if (!lender || !borrower) {
      console.error('Error: Could not find tyler@lender.com or tyler@borrower.com. Please make sure they are registered first!');
      return;
    }

    console.log(`Found Lender (ID: ${lender.id}) and Borrower (ID: ${borrower.id})`);

    // 2. Create some sample listings for the lender
    const listings = [
      {
        title: 'PlayStation 5 Console - Disk Edition',
        category: 'Console',
        condition: 'Like New',
        dailyRate: 15.00,
        description: 'Hardly used PS5 with two controllers. 4K gaming ready!',
        status: 'Active'
      },
      {
        title: 'Elden Ring - Shadow of the Erdtree Edition',
        category: 'Video Game',
        condition: 'New',
        dailyRate: 5.00,
        description: 'The full masterpiece including the DLC. Prepare to die!',
        status: 'Active'
      },
      {
        title: 'Xbox Series X + Game Pass Ultimate',
        category: 'Console',
        condition: 'Very Good',
        dailyRate: 12.50,
        description: 'Powerful console with access to hundreds of games.',
        status: 'Active'
      },
      {
        title: 'Nintendo Switch OLED - Mario Red',
        category: 'Console',
        condition: 'Good',
        dailyRate: 8.00,
        description: 'Beautiful OLED screen, great for local multiplayer.',
        status: 'Active'
      }
    ];

    console.log('Creating listings...');
    for (const item of listings) {
      const newList = await Listing.create({
        ...item,
        lenderId: lender.id
      });

      // Add sub-type details
      if (item.category === 'Console') {
        await Listing_Console.create({
          listingId: newList.id,
          consoleType: item.title.includes('PS5') ? 'PlayStation 5' : (item.title.includes('Xbox') ? 'Xbox Series X/S' : 'Nintendo Switch'),
          storageCapacity: '1TB',
          controllersIncluded: true,
          controllerQuantity: 2
        });
      } else {
        await Listing_VideoGame.create({
          listingId: newList.id,
          platform: 'PlayStation 5',
          genre: 'RPG',
          esrbRating: 'M'
        });
      }
      item.id = newList.id; // Store ID for requests
    }

    // 3. Create Rental Requests and Rentals
    const now = new Date();
    
    // Rental 1: COMPLETED (Past dates)
    const pastStart = new Date(); pastStart.setDate(now.getDate() - 10);
    const pastEnd = new Date(); pastEnd.setDate(now.getDate() - 5);
    
    const req1 = await RentalRequest.create({
      listingId: listings[0].id,
      borrowerId: borrower.id,
      startDate: pastStart,
      endDate: pastEnd,
      status: 'Accepted'
    });
    
    await Rental.create({
      requestId: req1.id,
      lenderId: lender.id,
      actualTotal: 75.00,
      status: 'Completed',
      createdAt: pastStart // Set created at to past for chart diversity
    });

    // Rental 2: ACTIVE (Started 2 days ago, ends in 3 days)
    const activeStart = new Date(); activeStart.setDate(now.getDate() - 2);
    const activeEnd = new Date(); activeEnd.setDate(now.getDate() + 3);
    
    const req2 = await RentalRequest.create({
      listingId: listings[1].id,
      borrowerId: borrower.id,
      startDate: activeStart,
      endDate: activeEnd,
      status: 'Accepted'
    });
    
    await Rental.create({
      requestId: req2.id,
      lenderId: lender.id,
      actualTotal: 25.00,
      status: 'Active'
    });

    // Rental 3: UPCOMING (Starts in 5 days)
    const futureStart = new Date(); futureStart.setDate(now.getDate() + 5);
    const futureEnd = new Date(); futureEnd.setDate(now.getDate() + 10);
    
    const req3 = await RentalRequest.create({
      listingId: listings[2].id,
      borrowerId: borrower.id,
      startDate: futureStart,
      endDate: futureEnd,
      status: 'Accepted'
    });
    
    await Rental.create({
      requestId: req3.id,
      lenderId: lender.id,
      actualTotal: 62.50,
      status: 'Active'
    });

    console.log('--- Seeding Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedTylerData();
