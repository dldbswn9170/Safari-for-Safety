-- Migration: Add weather data to roadkill_reports table
-- Description: Adds weather-related columns to user reports

-- Add weather columns to roadkill_reports table
ALTER TABLE roadkill_reports
ADD COLUMN IF NOT EXISTS temperature DECIMAL(5, 2),  -- 기온 (°C)
ADD COLUMN IF NOT EXISTS precipitation DECIMAL(6, 2), -- 강수량 (mm)
ADD COLUMN IF NOT EXISTS wind_speed DECIMAL(5, 2),   -- 풍속 (m/s)
ADD COLUMN IF NOT EXISTS humidity INTEGER,            -- 습도 (%)
ADD COLUMN IF NOT EXISTS weather_condition VARCHAR(50); -- 날씨 상태 (맑음, 흐림, 비 등)

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Weather columns added to roadkill_reports table!';
END $$;
