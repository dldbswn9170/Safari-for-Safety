const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../database');

// CSV에서 지역 정보 추출 및 DB에 삽입
async function importRegions() {
  console.log('🚀 Starting region data import from CSV...\n');

  const csvPath = path.join(__dirname, '..', '..', 'data', 'processed', 'roadkill_data.csv');
  const regionMap = new Map(); // key: "province|city", value: {province, city, coords[]}

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const fullAddress = row['관할기관'];
        const lat = parseFloat(row['위도']);
        const lng = parseFloat(row['경도']);

        if (!fullAddress || !lat || !lng) return;

        // 주소 파싱: "경기 부천시" → province: "경기", city: "부천시"
        const parts = fullAddress.trim().split(' ');

        if (parts.length === 0) return;

        let province = parts[0];
        let city = parts.length > 1 ? parts.slice(1).join(' ') : null;

        // 특별시/광역시 정리
        if (province === '서울특별시') province = '서울';
        if (province === '부산광역시') province = '부산';
        if (province === '대구광역시') province = '대구';
        if (province === '인천광역시') province = '인천';
        if (province === '광주광역시') province = '광주';
        if (province === '대전광역시') province = '대전';
        if (province === '울산광역시') province = '울산';
        if (province === '세종특별자치시') {
          province = '세종';
          city = '세종시';
        }

        const key = `${province}|${city || ''}`;

        if (!regionMap.has(key)) {
          regionMap.set(key, {
            province,
            city,
            fullAddress,
            coords: []
          });
        }

        regionMap.get(key).coords.push({ lat, lng });
      })
      .on('end', async () => {
        console.log(`📊 Found ${regionMap.size} unique regions\n`);

        try {
          // 기존 데이터 삭제
          await db.query('TRUNCATE TABLE regions RESTART IDENTITY CASCADE');
          console.log('🗑️  Cleared existing region data\n');

          let insertCount = 0;

          for (const [key, data] of regionMap) {
            // 평균 좌표 계산
            const avgLat = data.coords.reduce((sum, c) => sum + c.lat, 0) / data.coords.length;
            const avgLng = data.coords.reduce((sum, c) => sum + c.lng, 0) / data.coords.length;

            await db.query(
              `INSERT INTO regions (province, city, full_address, latitude, longitude)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (province, city) DO NOTHING`,
              [data.province, data.city, data.fullAddress, avgLat, avgLng]
            );

            insertCount++;

            if (insertCount % 50 === 0) {
              console.log(`   Inserted ${insertCount} regions...`);
            }
          }

          console.log(`\n✅ Successfully imported ${insertCount} regions into database!`);

          // 통계 출력
          const stats = await db.query(`
            SELECT province, COUNT(*) as city_count
            FROM regions
            GROUP BY province
            ORDER BY city_count DESC
          `);

          console.log('\n📈 Region Statistics:');
          stats.rows.forEach(row => {
            console.log(`   ${row.province}: ${row.city_count} cities/districts`);
          });

          resolve();
        } catch (error) {
          console.error('❌ Error inserting regions:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// 실행
if (require.main === module) {
  importRegions()
    .then(() => {
      console.log('\n🎉 Import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = importRegions;
