// scripts/seedUsers.js
const { User } = require('../models');

const dummyUsers = [
  { email: 'alex.gamer@example.com', password: 'password123', role: 'borrower', isSuspended: false },
  { email: 'sarah.lender@example.com', password: 'password123', role: 'lender', isSuspended: false },
  { email: 'toxic_player99@example.com', password: 'password123', role: 'borrower', isSuspended: true },
  { email: 'retro.collector@example.com', password: 'password123', role: 'lender', isSuspended: false },
  { email: 'scammer_bot22@example.com', password: 'password123', role: 'lender', isSuspended: true },
  { email: 'casual.play@example.com', password: 'password123', role: 'borrower', isSuspended: false },
  { email: 'pro_streamer@example.com', password: 'password123', role: 'lender', isSuspended: false },
  { email: 'rule.breaker@example.com', password: 'password123', role: 'borrower', isSuspended: true },
  { email: 'helpful.mod@example.com', password: 'password123', role: 'admin', isSuspended: false },
  { email: 'newbie123@example.com', password: 'password123', role: 'borrower', isSuspended: false }
];

async function seedDatabase() {
  console.log("Connecting to the database to plant dummy users...");
  
  try {
    // Loop through the array and create each user
    for (const userData of dummyUsers) {
      // We use findOrCreate so if you run this script twice, it won't crash from duplicate emails!
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
    }
    
    console.log("✅ Success! 10 dummy users have been added to the database.");
    process.exit(0); // Closes the script
    
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    process.exit(1);
  }
}

// Run the function
seedDatabase();