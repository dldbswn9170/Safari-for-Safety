const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all roadkill incidents from database (기존 데이터 + 사용자 신고 데이터 통합)
router.get('/', async (req, res) => {
  try {
    // 기존 로드킬 데이터 + 사용자 신고 데이터를 UNION으로 통합
    const result = await db.query(`
      SELECT
        serial_number as "일련번호",
        incident_date as "접수일자",
        incident_time as "접수시각",
        jurisdiction as "관할기관",
        latitude as "위도",
        longitude as "경도",
        'official' as "데이터타입"
      FROM roadkill_incidents

      UNION ALL

      SELECT
        id as "일련번호",
        incident_date as "접수일자",
        incident_time as "접수시각",
        location_address as "관할기관",
        CAST(latitude AS DOUBLE PRECISION) as "위도",
        CAST(longitude AS DOUBLE PRECISION) as "경도",
        'user_report' as "데이터타입"
      FROM roadkill_reports
      WHERE status = 'approved' OR status = 'pending'

      ORDER BY "접수일자" DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching roadkill data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roadkill data',
      error: error.message
    });
  }
});

// Get roadkill data by region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;

    const result = await db.query(`
      SELECT
        serial_number as "일련번호",
        incident_date as "접수일자",
        incident_time as "접수시각",
        jurisdiction as "관할기관",
        latitude as "위도",
        longitude as "경도"
      FROM roadkill_incidents
      WHERE jurisdiction LIKE $1
      ORDER BY incident_date DESC
    `, [`%${region}%`]);

    res.json({
      success: true,
      region: region,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching roadkill data by region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roadkill data by region',
      error: error.message
    });
  }
});

// Get roadkill statistics by region (기존 데이터 + 사용자 신고 통합)
router.get('/statistics/by-region', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT region, SUM(count)::INTEGER as count
      FROM (
        -- 기존 로드킬 데이터
        SELECT
          SPLIT_PART(jurisdiction, ' ', 1) as region,
          COUNT(*) as count
        FROM roadkill_incidents
        WHERE jurisdiction IS NOT NULL
        GROUP BY SPLIT_PART(jurisdiction, ' ', 1)

        UNION ALL

        -- 사용자 신고 데이터
        SELECT
          SPLIT_PART(location_address, ' ', 1) as region,
          COUNT(*) as count
        FROM roadkill_reports
        WHERE (status = 'approved' OR status = 'pending')
          AND location_address IS NOT NULL
        GROUP BY SPLIT_PART(location_address, ' ', 1)
      ) combined
      GROUP BY region
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching region statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch region statistics',
      error: error.message
    });
  }
});

// Get roadkill statistics by date range (기존 데이터 + 사용자 신고 통합)
router.get('/statistics/by-date', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      whereClause = `WHERE incident_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause = `WHERE incident_date >= $${paramIndex}`;
      params.push(startDate);
    } else if (endDate) {
      whereClause = `WHERE incident_date <= $${paramIndex}`;
      params.push(endDate);
    }

    const query = `
      SELECT month, SUM(count)::INTEGER as count
      FROM (
        -- 기존 로드킬 데이터
        SELECT
          TO_CHAR(incident_date, 'YYYY-MM') as month,
          COUNT(*) as count
        FROM roadkill_incidents
        ${whereClause}
        GROUP BY TO_CHAR(incident_date, 'YYYY-MM')

        UNION ALL

        -- 사용자 신고 데이터
        SELECT
          TO_CHAR(incident_date, 'YYYY-MM') as month,
          COUNT(*) as count
        FROM roadkill_reports
        WHERE (status = 'approved' OR status = 'pending')
        ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
        GROUP BY TO_CHAR(incident_date, 'YYYY-MM')
      ) combined
      GROUP BY month
      ORDER BY month
    `;

    const result = await db.query(query, params.length > 0 ? [...params, ...params] : []);

    res.json({
      success: true,
      total: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching date statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch date statistics',
      error: error.message
    });
  }
});

// Get animal type statistics from database (기존 데이터 + 사용자 신고 통합)
router.get('/statistics/animals', async (req, res) => {
  try {
    const result = await db.query(`
      WITH combined_animals AS (
        -- 기존 동물 통계 데이터
        SELECT
          species_name as "종명",
          incident_count as "건수"
        FROM animal_type_stats

        UNION ALL

        -- 사용자 신고 데이터
        SELECT
          animal_type as "종명",
          COUNT(*)::INTEGER as "건수"
        FROM roadkill_reports
        WHERE (status = 'approved' OR status = 'pending')
          AND animal_type IS NOT NULL
        GROUP BY animal_type
      ),
      aggregated AS (
        SELECT
          "종명",
          SUM("건수")::INTEGER as "건수"
        FROM combined_animals
        GROUP BY "종명"
      ),
      total_count AS (
        SELECT SUM("건수") as total FROM aggregated
      )
      SELECT
        a."종명",
        a."건수",
        ROUND((a."건수"::NUMERIC / t.total * 100), 2) as "비율(%)"
      FROM aggregated a, total_count t
      ORDER BY a."건수" DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching animal statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animal statistics',
      error: error.message
    });
  }
});

// Get weather data
router.get('/weather', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(`
      SELECT
        station_number as "지점번호",
        station_name as "지점명",
        observation_date as "일자",
        avg_temperature as "일평균기온",
        precipitation as "강수량",
        avg_wind_speed as "일평균풍속",
        sunshine_hours as "일조시간",
        total_cloud_cover as "전운량",
        precipitation_duration as "강수계속시간",
        humidity as "습도"
      FROM weather_data
      ORDER BY observation_date DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await db.query('SELECT COUNT(*) FROM weather_data');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      returned: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
});

module.exports = router;
