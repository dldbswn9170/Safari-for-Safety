const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // First connect without database to create it
  const masterPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'safari_for_safety';
    const checkDB = await masterPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDB.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}`);
      await masterPool.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }

    await masterPool.end();

    // Now connect to the new database and create tables
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: dbName
    });

    console.log('\n📋 Creating tables...');

    // Read and execute SQL file
    const sqlFile = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    await appPool.query(sqlFile);

    console.log('✅ Tables created successfully');

    // Check if tables exist
    const tables = await appPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await appPool.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Make sure your .env file has the correct database credentials');
    console.log('  2. Start the server: npm start');
    console.log('  3. Test the API endpoints\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n💡 Make sure PostgreSQL is running and credentials are correct in .env file');
    process.exit(1);
  }
}

setupDatabase();
