-- Migration: Add user authentication and report features
-- Description: Creates users and roadkill_reports tables for login and report functionality

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roadkill_reports table (user-submitted reports)
CREATE TABLE IF NOT EXISTS roadkill_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  animal_type VARCHAR(100) NOT NULL,
  location_address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  description TEXT,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON roadkill_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON roadkill_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_incident_date ON roadkill_reports(incident_date);
CREATE INDEX IF NOT EXISTS idx_reports_location ON roadkill_reports(latitude, longitude);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to roadkill_reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON roadkill_reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON roadkill_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authentication and Reports tables created successfully!';
END $$;
