const db = require('../database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('1234', 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      ['admin', 'admin@admin.com', hashedPassword]
    );
    console.log('✅ admin 계정 생성 완료:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

createAdmin();
