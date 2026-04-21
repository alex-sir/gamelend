# GameLend

GameLend is a peer-to-peer web application for renting and lending physical video games, consoles, and gaming accessories. It connects gamers who have idle items with borrowers who want short-term access instead of buying new hardware or titles.

![Home page screenshot](public/images/gamelend.png)

## Features

- User registration and login with role-based access (borrower, lender, admin)
- Catalog of rentable items with search and filtering
- Item detail pages with rental terms and item information
- Lender dashboard for managing listings and responding to rental requests
- Borrower dashboard for tracking active rentals and rental history
- Admin portal for moderating users, listings, and the game catalog

## Tech Stack

- HTML, CSS, JavaScript (frontend)
- Bootstrap 5 and Bootstrap Icons for layout and styling
- Node.js with Express.js (backend)
- MariaDB (relational database)

## Development

### How to Install Dependencies

GameLend utilizes **npm** for package management.

Install all dependencies (run in the project root directory):

```bash
npm install
```

### How to Start the GameLend App

> [!NOTE]
> Starting the app automatically injects the `.env` file and starts the local MariaDB database. Ensure those are configured first.

**Nodemon** is used to automatically restart the server when file changes are made.

Start the app:

```bash
npm start
```

Go into your browser and type "**localhost:3000**" in the address bar to view the web app.

### Configure MariaDB Local Database

To develop and test the GameLend application locally, you can set up a local MariaDB database. We use an SQL script to standardize the creation of the database and the required user permissions.

The following instructions assume a Linux system is being used.

#### 1. Prerequisites

Ensure MariaDB is installed and the background service is running on your system.

#### 2. The Setup Script

In the `scripts/` directory, you will find the `setup_database.sql` file.

Security Note: Do not commit real passwords to the repository. The script uses a standardized dummy password (**gamelend_dev**) intended strictly for local development.

#### 3. Executing the Script

To provision your local database, run the script through the MariaDB CLI. You will be prompted to enter your local root MariaDB password.

```bash
sudo mariadb -u root -p < scripts/setup_database.sql
```

#### 4. Update Your Environment Variables

Create or update your `.env` file at the root of the project to match the local database credentials:

```bash
DB_NAME=gamelend
DB_USER=gamelend_user
DB_PASSWORD=gamelend_dev
DB_HOST=localhost
PORT=3000
```

#### 5. Verification

Because we use Sequelize, you do not need to manually create the tables (Users, Listings, etc.).

Start the application:

```bash
node app.js
```

If the database was set up correctly, you will see the following output in your terminal:

```bash
MariaDB Database synced successfully.
GameLend server running on http://localhost:3000
```

You can verify the tables were built by logging into the database:

```bash
mariadb -u gamelend_user -p
```

```sql
USE gamelend;
SHOW TABLES;
```

View all rows in the `Users` table:

```sql
SELECT * FROM Users;
```

### MariaDB Database Dump & Restore

A local database dump allows you to snapshot your data as a backup.
This data can later be restored.

#### 1. Run the dump command

Dump the data into a file called `gamelend_backup.sql`:

```bash
mariadb-dump -u root -p gamelend > gamelend_backup.sql
```

#### 2. Create an empty target database (if it doesn't exist)

MariaDB needs a container to pour the data into.
If the database was dropped, you must recreate it first.

Log into the MariaDB shell:

```bash
mariadb -u root -p
```

Create the empty database:

```sql
CREATE DATABASE gamelend;
EXIT;
```

#### 3. Import the dump file

From your terminal, navigate to the folder where the `gamelend_backup.sql`
file is saved and run the import command:

```bash
mariadb -u root -p gamelend < gamelend_backup.sql
```

### Database Seed Data

To quickly test GameLend with seed data, a script is provided
to fill a test database with predetermined information:

```bash
npm run seed
```

## Team

- Tyler Weddle ([tyler-weddle](https://github.com/tyler-weddle))
- Jonahtan Vasquez ([JonahtanV](https://github.com/JonahtanV))
- Alex Carbajal ([alex-sir](https://github.com/alex-sir))
