-- Migration: Create tables for historical roadkill data from CSV files
-- Created: 2024-12-06

-- Historical roadkill incidents table (from roadkill_data.csv)
CREATE TABLE IF NOT EXISTS roadkill_incidents (
  id SERIAL PRIMARY KEY,
  serial_number INTEGER UNIQUE,
  incident_date DATE NOT NULL,
  incident_time TIME,
  jurisdiction VARCHAR(200),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Animal type statistics table (from animalType_data.csv)
CREATE TABLE IF NOT EXISTS animal_type_stats (
  id SERIAL PRIMARY KEY,
  species_name VARCHAR(100) NOT NULL UNIQUE,
  incident_count INTEGER NOT NULL,
  percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather data table (from weather_data.csv)
CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  station_number INTEGER,
  station_name VARCHAR(50),
  observation_date DATE NOT NULL,
  avg_temperature DECIMAL(5, 2),
  precipitation DECIMAL(6, 2),
  avg_wind_speed DECIMAL(5, 2),
  sunshine_hours DECIMAL(5, 2),
  total_cloud_cover DECIMAL(5, 2),
  precipitation_duration DECIMAL(6, 2),
  humidity DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_number, observation_date)
);

-- Roadkill-Weather matching table (from roadkill_weather_matching.csv)
CREATE TABLE IF NOT EXISTS roadkill_weather_matching (
  id SERIAL PRIMARY KEY,
  roadkill_incident_id INTEGER REFERENCES roadkill_incidents(id) ON DELETE CASCADE,
  weather_data_id INTEGER REFERENCES weather_data(id) ON DELETE CASCADE,
  matching_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roadkill_incident_id, weather_data_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadkill_incidents_date ON roadkill_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_roadkill_incidents_location ON roadkill_incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_roadkill_incidents_jurisdiction ON roadkill_incidents(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_weather_data_date ON weather_data(observation_date);
CREATE INDEX IF NOT EXISTS idx_weather_data_station ON weather_data(station_number);
CREATE INDEX IF NOT EXISTS idx_animal_stats_species ON animal_type_stats(species_name);

-- Create trigger for animal_type_stats
CREATE TRIGGER update_animal_stats_updated_at BEFORE UPDATE ON animal_type_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments to tables
COMMENT ON TABLE roadkill_incidents IS 'Historical roadkill incident data from government records';
COMMENT ON TABLE animal_type_stats IS 'Statistical summary of roadkill incidents by animal species';
COMMENT ON TABLE weather_data IS 'Daily weather observations from meteorological stations';
COMMENT ON TABLE roadkill_weather_matching IS 'Links roadkill incidents with corresponding weather conditions';
