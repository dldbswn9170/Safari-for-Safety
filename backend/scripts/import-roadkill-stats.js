const fs = require('fs');
const path = require('path');
const db = require('../database');

const animalDataPath = path.join(__dirname, '../../data/processed/animalType_data.csv');

async function runMigration(client) {
  console.log('Running roadkill_stats table migration...');
  const migrationSQL = `
    CREATE TABLE IF NOT EXISTS roadkill_stats (
      id SERIAL PRIMARY KEY,
      province VARCHAR(50),
      city VARCHAR(100),
      animal_type VARCHAR(100) NOT NULL,
      incident_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_roadkill_stats_province ON roadkill_stats(province);
    CREATE INDEX IF NOT EXISTS idx_roadkill_stats_city ON roadkill_stats(province, city);
    CREATE INDEX IF NOT EXISTS idx_roadkill_stats_animal ON roadkill_stats(animal_type);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_roadkill_stats_unique ON roadkill_stats(
      COALESCE(province, ''),
      COALESCE(city, ''),
      animal_type
    );
  `;

  await client.query(migrationSQL);
  console.log('Migration completed successfully');
}

async function importRoadkillStats() {
  console.log('Starting roadkill stats import...');

  try {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // 마이그레이션 먼저 실행
      await runMigration(client);

      // 기존 통계 데이터 삭제
      await client.query('DELETE FROM roadkill_stats');
      console.log('Cleared existing stats');

      // 동물별 전국 데이터 읽기 - animalType_data.csv
      const animalData = fs.readFileSync(animalDataPath, 'utf-8');
      const animalLines = animalData.split('\n').filter(line => line.trim());
      const animalRecords = animalLines.slice(1); // 헤더 skip

      console.log(`Found ${animalRecords.length} animal type records`);

      const animalStats = [];
      for (const line of animalRecords) {
        const parts = line.split(',');
        if (parts.length < 2) continue;

        const animalType = parts[0].trim();
        const count = parseInt(parts[1].trim());

        if (animalType && !isNaN(count)) {
          animalStats.push({
            province: null,
            city: null,
            animal_type: animalType,
            incident_count: count
          });
        }
      }

      console.log(`Parsed ${animalStats.length} animal statistics`);

      // 데이터베이스에 삽입
      let insertedCount = 0;
      for (const stat of animalStats) {
        await client.query(
          `INSERT INTO roadkill_stats (province, city, animal_type, incident_count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [stat.province, stat.city, stat.animal_type, stat.incident_count]
        );
        insertedCount++;
      }

      console.log(`Inserted ${insertedCount} animal statistics`);

      await client.query('COMMIT');
      console.log('Roadkill stats import completed successfully!');

      // 통계 출력
      const result = await client.query(
        'SELECT COUNT(*) as total FROM roadkill_stats'
      );
      console.log(`Total roadkill stats in database: ${result.rows[0].total}`);

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error importing roadkill stats:', error);
    throw error;
  }
}

// 스크립트 실행
importRoadkillStats()
  .then(() => {
    console.log('Import completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });
