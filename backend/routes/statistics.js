const express = require('express');
const router = express.Router();
const db = require('../database');

// 전국 동물별 로드킬 통계 조회
router.get('/animals', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT animal_type, incident_count
       FROM roadkill_stats
       WHERE province IS NULL AND city IS NULL
       ORDER BY incident_count DESC`
    );

    const stats = result.rows.map(row => ({
      animal: row.animal_type,
      count: parseInt(row.incident_count)
    }));

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching animal statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animal statistics'
    });
  }
});

// 특정 지역의 동물별 로드킬 통계 조회
router.get('/animals/:province', async (req, res) => {
  try {
    const { province } = req.params;
    const { city } = req.query;

    let query, params;

    if (city) {
      // 시/군/구 통계
      query = `
        SELECT animal_type, incident_count
        FROM roadkill_stats
        WHERE province = $1 AND city = $2
        ORDER BY incident_count DESC
      `;
      params = [province, city];
    } else {
      // 시/도 통계
      query = `
        SELECT animal_type, incident_count
        FROM roadkill_stats
        WHERE province = $1 AND city IS NULL
        ORDER BY incident_count DESC
      `;
      params = [province];
    }

    const result = await db.query(query, params);

    const stats = result.rows.map(row => ({
      animal: row.animal_type,
      count: parseInt(row.incident_count)
    }));

    res.json({
      success: true,
      province,
      city: city || null,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching regional animal statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regional animal statistics'
    });
  }
});

// 전체 통계 요약
router.get('/summary', async (req, res) => {
  try {
    // 전국 총 로드킬 건수
    const totalResult = await db.query(
      `SELECT SUM(incident_count) as total
       FROM roadkill_stats
       WHERE province IS NULL AND city IS NULL`
    );

    // 가장 많이 발생한 동물 Top 5
    const topAnimalsResult = await db.query(
      `SELECT animal_type, incident_count
       FROM roadkill_stats
       WHERE province IS NULL AND city IS NULL
       ORDER BY incident_count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalIncidents: parseInt(totalResult.rows[0].total) || 0,
        topAnimals: topAnimalsResult.rows.map(row => ({
          animal: row.animal_type,
          count: parseInt(row.incident_count)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching summary statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary statistics'
    });
  }
});

module.exports = router;
