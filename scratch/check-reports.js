const { Report, Listing, User } = require('../models');

async function checkReports() {
  try {
    const counts = await Report.count();
    console.log(`Total Reports in DB: ${counts}`);

    const allReports = await Report.findAll({
      include: [
        { 
          model: Listing, 
          as: 'listing',
          include: [{ model: User, as: 'lender' }] 
        }
      ],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    console.log('All Reports in DB:');
    allReports.forEach(r => {
      console.log(`- ID: ${r.id}, Status: ${r.status}, Reason: ${r.reason}, Listing: ${r.listing?.title}, Lender: ${r.listing?.lender?.email}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkReports();
