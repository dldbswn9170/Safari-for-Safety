const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all provinces (시/도 목록)
router.get('/provinces', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT province
      FROM regions
      ORDER BY province
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(row => row.province)
    });
  } catch (error) {
    console.error('Get provinces error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Get cities by province (특정 도의 시/군/구 목록)
router.get('/cities/:province', async (req, res) => {
  try {
    const { province } = req.params;

    const result = await db.query(`
      SELECT city, latitude, longitude
      FROM regions
      WHERE province = $1 AND city IS NOT NULL
      ORDER BY city
    `, [province]);

    res.json({
      success: true,
      province: province,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Get all regions with hierarchy (전체 계층 구조)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT province, city, latitude, longitude, full_address
      FROM regions
      ORDER BY province, city
    `);

    // 도별로 그룹화
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.province]) {
        grouped[row.province] = {
          province: row.province,
          cities: []
        };
      }

      if (row.city) {
        grouped[row.province].cities.push({
          city: row.city,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          fullAddress: row.full_address
        });
      }
    });

    res.json({
      success: true,
      count: Object.keys(grouped).length,
      data: grouped
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Reverse geocoding - 좌표로 지역 찾기
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '위도와 경도가 필요합니다'
      });
    }

    // 가장 가까운 지역 찾기 (거리 계산)
    const result = await db.query(`
      SELECT
        province,
        city,
        latitude,
        longitude,
        full_address,
        (
          6371 * acos(
            cos(radians($1)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) *
            sin(radians(latitude))
          )
        ) AS distance
      FROM regions
      ORDER BY distance
      LIMIT 1
    `, [latitude, longitude]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '가까운 지역을 찾을 수 없습니다'
      });
    }

    const region = result.rows[0];

    res.json({
      success: true,
      data: {
        province: region.province,
        city: region.city,
        latitude: parseFloat(region.latitude),
        longitude: parseFloat(region.longitude),
        fullAddress: region.full_address,
        distance: parseFloat(region.distance).toFixed(2) + ' km'
      }
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router;
