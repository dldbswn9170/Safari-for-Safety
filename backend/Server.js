const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const roadkillRoutes = require('./routes/roadkill');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const regionsRoutes = require('./routes/regions');
const statisticsRoutes = require('./routes/statistics');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
// Roadkill data routes (database-backed)
app.use('/api/roadkill', roadkillRoutes);

// User authentication routes
app.use('/api/auth', authRoutes);

// User reports routes (신고 기능)
app.use('/api/reports', reportsRoutes);

// Other routes
app.use('/api/regions', regionsRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check with database statistics
app.get('/api/health', async (req, res) => {
  try {
    const roadkillCount = await db.query('SELECT COUNT(*) FROM roadkill_incidents');
    const animalCount = await db.query('SELECT COUNT(*) FROM animal_type_stats');
    const weatherCount = await db.query('SELECT COUNT(*) FROM weather_data');
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const reportsCount = await db.query('SELECT COUNT(*) FROM roadkill_reports');

    res.json({
      status: 'ok',
      message: 'Safari-for-Safety API is running',
      database: 'connected',
      dataStored: {
        roadkillIncidents: parseInt(roadkillCount.rows[0].count),
        animalTypes: parseInt(animalCount.rows[0].count),
        weather: parseInt(weatherCount.rows[0].count),
        users: parseInt(usersCount.rows[0].count),
        userReports: parseInt(reportsCount.rows[0].count)
      }
    });
  } catch (error) {
    res.json({
      status: 'ok',
      message: 'Safari-for-Safety API is running',
      database: 'error',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Get local IP address
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start server and verify database connection
async function startServer() {
  try {
    // Test database connection
    const roadkillCount = await db.query('SELECT COUNT(*) FROM roadkill_incidents');
    const animalCount = await db.query('SELECT COUNT(*) FROM animal_type_stats');
    const weatherCount = await db.query('SELECT COUNT(*) FROM weather_data');
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const reportsCount = await db.query('SELECT COUNT(*) FROM roadkill_reports');

    const HOST = '0.0.0.0';
    const localIP = getLocalIP();

    app.listen(PORT, HOST, () => {
      console.log('\n========================================');
      console.log('🚀 Safari-for-Safety API Server Started');
      console.log('========================================');
      console.log('📊 Database Connected - Data Overview:');
      console.log(`   🗺️  Roadkill Incidents: ${roadkillCount.rows[0].count} (from CSV)`);
      console.log(`   🦌 Animal Types: ${animalCount.rows[0].count}`);
      console.log(`   🌤️  Weather Data: ${weatherCount.rows[0].count}`);
      console.log(`   👥 Users: ${usersCount.rows[0].count}`);
      console.log(`   📝 User Reports: ${reportsCount.rows[0].count}`);
      console.log('\n📍 Access URLs:');
      console.log(`   Local:    http://localhost:${PORT}`);
      console.log(`   Network:  http://${localIP}:${PORT}`);
      console.log('\n💡 포트포워딩으로 외부 접속 가능:');
      console.log(`   외부:     http://${localIP}:${PORT}`);
      console.log('   (공유기 포트 ' + PORT + ' 포워딩 필요)');
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database configuration and try again.');
    process.exit(1);
  }
}

startServer();

module.exports = app;
