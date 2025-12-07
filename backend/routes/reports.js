const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all reports (public - no auth required)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT r.*, u.username
      FROM roadkill_reports r
      LEFT JOIN users u ON r.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE r.status = $1';
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Get single report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*, u.username
       FROM roadkill_reports r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '신고를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Create new report (requires auth)
router.post('/',
  authMiddleware,
  [
    body('animal_type').trim().notEmpty().withMessage('동물 종류를 입력해주세요')
      .matches(/^[^0-9]*$/).withMessage('동물 종류는 문자만 입력 가능합니다'),
    body('location_address').trim().notEmpty().withMessage('위치를 입력해주세요'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('유효한 위도를 입력해주세요'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('유효한 경도를 입력해주세요'),
    body('incident_date').isDate().withMessage('유효한 날짜를 입력해주세요'),
    body('temperature').optional().isFloat().withMessage('기온은 숫자만 입력 가능합니다'),
    body('humidity').optional().isInt({ min: 0, max: 100 }).withMessage('습도는 0부터 100 사이의 숫자여야 합니다'),
    body('wind_speed').optional().isFloat({ min: 0 }).withMessage('풍속은 0 이상의 숫자여야 합니다'),
    body('weather_condition').optional().matches(/^[^0-9]*$/).withMessage('날씨 상태는 문자만 입력 가능합니다')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        animal_type,
        location_address,
        latitude,
        longitude,
        incident_date,
        incident_time,
        description,
        photo_url,
        temperature,
        precipitation,
        wind_speed,
        humidity,
        weather_condition
      } = req.body;

      // 신규 동물 종류인지 확인
      const existingAnimalCheck = await db.query(`
        SELECT 1 FROM (
          SELECT species_name FROM animal_type_stats
          UNION
          SELECT DISTINCT animal_type FROM roadkill_reports WHERE animal_type IS NOT NULL
        ) combined
        WHERE LOWER(TRIM(species_name)) = LOWER(TRIM($1))
        LIMIT 1
      `, [animal_type]);

      const isNewAnimal = existingAnimalCheck.rows.length === 0;

      const result = await db.query(
        `INSERT INTO roadkill_reports
         (user_id, animal_type, location_address, latitude, longitude, incident_date, incident_time, description, photo_url, status,
          temperature, precipitation, wind_speed, humidity, weather_condition)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          req.user.userId,
          animal_type,
          location_address,
          latitude,
          longitude,
          incident_date,
          incident_time || null,
          description || null,
          photo_url || null,
          'approved',
          temperature || null,
          precipitation || null,
          wind_speed || null,
          humidity || null,
          weather_condition || null
        ]
      );

      // 성공 메시지에 신규 동물 정보 포함
      let message = '로드킬 신고가 접수되었습니다';
      if (isNewAnimal) {
        message = `🆕 새로운 동물 종류 "${animal_type}"가 데이터베이스에 등록되었습니다!\n로드킬 신고가 접수되었습니다.`;
      }

      res.status(201).json({
        success: true,
        message: message,
        isNewAnimal: isNewAnimal,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다'
      });
    }
  }
);

// Get user's own reports (requires auth)
router.get('/user/my-reports', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM roadkill_reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// Update report status (admin only - for now just auth required)
router.patch('/:id/status',
  authMiddleware,
  [
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('유효한 상태를 선택해주세요')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const result = await db.query(
        'UPDATE roadkill_reports SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '신고를 찾을 수 없습니다'
        });
      }

      res.json({
        success: true,
        message: '신고 상태가 업데이트되었습니다',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다'
      });
    }
  }
);

// Delete report (only owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if report belongs to user
    const checkResult = await db.query(
      'SELECT * FROM roadkill_reports WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '신고를 찾을 수 없습니다'
      });
    }

    if (checkResult.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '삭제 권한이 없습니다'
      });
    }

    await db.query('DELETE FROM roadkill_reports WHERE id = $1', [id]);

    res.json({
      success: true,
      message: '신고가 삭제되었습니다'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router;
