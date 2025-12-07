const db = require('../database');
const fs = require('fs');
const path = require('path');

async function addWeatherColumns() {
  try {
    console.log('🔧 Adding weather columns to roadkill_reports table...');

    const sqlPath = path.join(__dirname, '../migrations/add-weather-to-reports.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await db.query(sql);

    console.log('✅ Weather columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding weather columns:', error);
    process.exit(1);
  }
}

addWeatherColumns();
