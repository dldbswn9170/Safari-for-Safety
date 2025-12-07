const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('사용자명은 3-50자 사이여야 합니다'),
    body('email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다')
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

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 이메일 또는 사용자명입니다'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await db.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, hashedPassword]
      );

      const newUser = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다'
      });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
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

      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다'
        });
      }

      const user = result.rows[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '로그인 성공',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다'
      });
    }
  }
);

// Get current user info (requires auth)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router;
