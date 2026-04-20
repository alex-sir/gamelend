const { User, Listing, RentalRequest, Rental, Listing_VideoGame, Listing_Console, Listing_Accessory, Image } = require('../models');
const { sequelize } = require('../models');

async function seedTylerData() {
  try {
    console.log('--- Starting Seeding Script ---');

    // 1. Create or Find the mock users
    const [lender] = await User.findOrCreate({
      where: { email: 'mario@lender.com' },
      defaults: {
        password: 'password123',
        firstName: 'Mario',
        lastName: 'Bros',
        role: 'lender'
      }
    });

    const [borrower] = await User.findOrCreate({
      where: { email: 'luigi@borrower.com' },
      defaults: {
        password: 'password123',
        firstName: 'Luigi',
        lastName: 'Bros',
        role: 'borrower'
      }
    });

    console.log(`Using Lender: ${lender.email} (ID: ${lender.id}) and Borrower: ${borrower.email} (ID: ${borrower.id})`);

    // 2. Create some sample listings for the lender
    const listings = [
      {
        title: 'PlayStation 5 Console - Disk Edition',
        category: 'Console',
        condition: 'Like New',
        dailyRate: 15.00,
        description: 'Hardly used PS5 with two controllers. 4K gaming ready!',
        status: 'Active',
        imageUrl: '/images/ps5.jpg'
      },
      {
        title: 'Elden Ring - Shadow of the Erdtree Edition',
        category: 'Video Game',
        condition: 'New',
        dailyRate: 5.00,
        description: 'The full masterpiece including the DLC. Prepare to die!',
        status: 'Active',
        imageUrl: '/images/gaming-collage.svg'
      },
      {
        title: 'Xbox Wireless Controller',
        category: 'Accessory',
        condition: 'Very Good',
        dailyRate: 4.50,
        description: 'Black wireless controller, works perfectly with Xbox and PC.',
        status: 'Active',
        imageUrl: '/images/xbox-wireless-controller.jpg'
      },
      {
        title: 'Donkey Kong Bananza',
        category: 'Video Game',
        condition: 'Good',
        dailyRate: 3.50,
        description: 'Classic platformer, great for kids and families.',
        status: 'Active',
        imageUrl: '/images/donkey-kong-bananza.jpg'
      },
      {
        title: 'Nintendo Switch OLED - Mario Red',
        category: 'Console',
        condition: 'Acceptable',
        dailyRate: 10.00,
        description: 'Beautiful OLED screen, great for local multiplayer. Has a few scratches on the back but screen is perfect.',
        status: 'Active',
        imageUrl: '/images/gaming-collage.svg'
      },
      {
        title: 'DualSense Wireless Controller - Cosmic Red',
        category: 'Accessory',
        condition: 'Like New',
        dailyRate: 6.00,
        description: 'Extra controller for the PS5. Used twice.',
        status: 'Active',
        imageUrl: '/images/gaming-collage.svg'
      }
    ];

    console.log('Creating listings & images...');
    for (const item of listings) {
      const { imageUrl, ...listingData } = item;
      
      const newList = await Listing.create({
        ...listingData,
        lenderId: lender.id
      });

      // Add Image
      await Image.create({
        listingId: newList.id,
        imageUrl: imageUrl,
        isPrimary: true
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
      } else if (item.category === 'Accessory') {
        await Listing_Accessory.create({
          listingId: newList.id,
          accessoryType: 'Controller',
          compatiblePlatforms: item.title.includes('Xbox') ? 'Xbox, PC' : 'PlayStation 5',
          isWireless: true,
          brand: item.title.includes('Xbox') ? 'Microsoft' : 'Sony'
        });
      } else {
        await Listing_VideoGame.create({
          listingId: newList.id,
          platform: item.title.includes('Donkey') ? 'Nintendo Switch' : 'PlayStation 5',
          genre: item.title.includes('Donkey') ? 'Platformer' : 'RPG',
          esrbRating: item.title.includes('Donkey') ? 'E' : 'M'
        });
      }
      item.id = newList.id; // Store ID for requests
    }

    // 3. Create Rental Requests and Rentals
    console.log('Creating robust rental history...');
    const now = new Date();
    
    // Rental 1: COMPLETED (Past dates)
    const pastStart = new Date(); pastStart.setDate(now.getDate() - 15);
    const pastEnd = new Date(); pastEnd.setDate(now.getDate() - 10);
    
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
      createdAt: pastStart
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

    // Rental 3: PENDING REQUEST (Starts tomorrow)
    const pendStart = new Date(); pendStart.setDate(now.getDate() + 1);
    const pendEnd = new Date(); pendEnd.setDate(now.getDate() + 4);
    
    await RentalRequest.create({
      listingId: listings[2].id,
      borrowerId: borrower.id,
      startDate: pendStart,
      endDate: pendEnd,
      status: 'Pending'
    });

    // Rental 4: REJECTED REQUEST
    const rejStart = new Date(); rejStart.setDate(now.getDate() + 5);
    const rejEnd = new Date(); rejEnd.setDate(now.getDate() + 8);
    
    await RentalRequest.create({
      listingId: listings[3].id,
      borrowerId: borrower.id,
      startDate: rejStart,
      endDate: rejEnd,
      status: 'Rejected'
    });

    // Rental 5: CANCELLED RENTAL (Accepted but then cancelled)
    const cancStart = new Date(); cancStart.setDate(now.getDate() - 20);
    const cancEnd = new Date(); cancEnd.setDate(now.getDate() - 18);
    
    const req5 = await RentalRequest.create({
      listingId: listings[4].id,
      borrowerId: borrower.id,
      startDate: cancStart,
      endDate: cancEnd,
      status: 'Accepted'
    });

    await Rental.create({
      requestId: req5.id,
      lenderId: lender.id,
      actualTotal: 0.00,
      status: 'Cancelled',
      createdAt: cancStart
    });

    console.log('--- Seeding Completed Successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedTylerData();
