const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../database');

// Helper function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Import roadkill incidents data
async function importRoadkillIncidents() {
  console.log('\n📊 Importing roadkill incidents data...');

  const filePath = path.join(__dirname, '../../data/processed/roadkill_data.csv');
  const data = await readCSV(filePath);

  let imported = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      // Remove BOM and handle Korean column names
      const serialNumber = row['일련번호'] || row['\ufeff일련번호'];
      const incidentDate = row['접수일자'];
      const incidentTime = row['접수시각'];
      const jurisdiction = row['관할기관'];
      const latitude = parseFloat(row['위도']);
      const longitude = parseFloat(row['경도']);

      if (!serialNumber || !incidentDate || !latitude || !longitude) {
        skipped++;
        continue;
      }

      await db.query(
        `INSERT INTO roadkill_incidents
         (serial_number, incident_date, incident_time, jurisdiction, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (serial_number) DO NOTHING`,
        [serialNumber, incidentDate, incidentTime || null, jurisdiction, latitude, longitude]
      );

      imported++;

      if (imported % 1000 === 0) {
        console.log(`   Imported ${imported} records...`);
      }
    } catch (error) {
      skipped++;
      if (skipped <= 5) {
        console.error(`   Error importing record: ${error.message}`);
      }
    }
  }

  console.log(`✅ Roadkill incidents: ${imported} imported, ${skipped} skipped`);
}

// Import animal type statistics
async function importAnimalTypeStats() {
  console.log('\n🦌 Importing animal type statistics...');

  const filePath = path.join(__dirname, '../../data/processed/animalType_data.csv');
  const data = await readCSV(filePath);

  let imported = 0;

  for (const row of data) {
    try {
      const speciesName = row['종명'] || row['\ufeff종명'];
      const incidentCount = parseInt(row['건수']);
      const percentage = parseFloat(row['비율(%)']);

      if (!speciesName || !incidentCount) {
        continue;
      }

      await db.query(
        `INSERT INTO animal_type_stats
         (species_name, incident_count, percentage)
         VALUES ($1, $2, $3)
         ON CONFLICT (species_name)
         DO UPDATE SET
           incident_count = $2,
           percentage = $3,
           updated_at = CURRENT_TIMESTAMP`,
        [speciesName, incidentCount, percentage]
      );

      imported++;
    } catch (error) {
      console.error(`   Error importing animal stat: ${error.message}`);
    }
  }

  console.log(`✅ Animal type statistics: ${imported} imported`);
}

// Import weather data
async function importWeatherData() {
  console.log('\n🌤️  Importing weather data...');

  const filePath = path.join(__dirname, '../../data/processed/weather_data.csv');
  const data = await readCSV(filePath);

  let imported = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      const stationNumber = parseInt(row['지점번호'] || row['\ufeff지점번호']);
      const stationName = row['지점명'];
      const observationDate = row['일자'];
      const avgTemperature = row['일평균기온'] ? parseFloat(row['일평균기온']) : null;
      const precipitation = row['강수량'] ? parseFloat(row['강수량']) : null;
      const avgWindSpeed = row['일평균풍속'] ? parseFloat(row['일평균풍속']) : null;
      const sunshineHours = row['일조시간'] ? parseFloat(row['일조시간']) : null;
      const totalCloudCover = row['전운량'] ? parseFloat(row['전운량']) : null;
      const precipitationDuration = row['강수계속시간'] ? parseFloat(row['강수계속시간']) : null;
      const humidity = row['습도'] ? parseFloat(row['습도']) : null;

      if (!stationNumber || !observationDate) {
        skipped++;
        continue;
      }

      // Convert date format YYYYMMDD to YYYY-MM-DD
      const formattedDate = observationDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

      await db.query(
        `INSERT INTO weather_data
         (station_number, station_name, observation_date, avg_temperature,
          precipitation, avg_wind_speed, sunshine_hours, total_cloud_cover,
          precipitation_duration, humidity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (station_number, observation_date) DO NOTHING`,
        [stationNumber, stationName, formattedDate, avgTemperature,
         precipitation, avgWindSpeed, sunshineHours, totalCloudCover,
         precipitationDuration, humidity]
      );

      imported++;

      if (imported % 1000 === 0) {
        console.log(`   Imported ${imported} records...`);
      }
    } catch (error) {
      skipped++;
      if (skipped <= 5) {
        console.error(`   Error importing weather record: ${error.message}`);
      }
    }
  }

  console.log(`✅ Weather data: ${imported} imported, ${skipped} skipped`);
}

// Main import function
async function importAllData() {
  console.log('\n========================================');
  console.log('🚀 Starting CSV to Database Import');
  console.log('========================================');

  try {
    // First, run the migration to create tables
    console.log('\n📋 Creating database tables...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/create-roadkill-data-tables.sql'),
      'utf8'
    );
    await db.query(migrationSQL);
    console.log('✅ Tables created successfully');

    // Import all data
    await importRoadkillIncidents();
    await importAnimalTypeStats();
    await importWeatherData();

    // Show summary
    console.log('\n========================================');
    console.log('📊 Import Summary');
    console.log('========================================');

    const roadkillCount = await db.query('SELECT COUNT(*) FROM roadkill_incidents');
    const animalCount = await db.query('SELECT COUNT(*) FROM animal_type_stats');
    const weatherCount = await db.query('SELECT COUNT(*) FROM weather_data');

    console.log(`Roadkill Incidents: ${roadkillCount.rows[0].count}`);
    console.log(`Animal Types: ${animalCount.rows[0].count}`);
    console.log(`Weather Records: ${weatherCount.rows[0].count}`);
    console.log('========================================\n');

    console.log('✅ All data imported successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importAllData();
