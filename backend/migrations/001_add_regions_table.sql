-- Add regions table for location data
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  province VARCHAR(50) NOT NULL,
  city VARCHAR(100),
  full_address VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(province, city)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_regions_province ON regions(province);
CREATE INDEX IF NOT EXISTS idx_regions_city ON regions(city);
CREATE INDEX IF NOT EXISTS idx_regions_location ON regions(latitude, longitude);

-- Add comments
COMMENT ON TABLE regions IS '지역별 좌표 정보 (CSV 데이터에서 추출)';
COMMENT ON COLUMN regions.province IS '시/도 (예: 서울, 경기, 충남)';
COMMENT ON COLUMN regions.city IS '시/군/구 (예: 부천시, 동작구, 홍성군)';
COMMENT ON COLUMN regions.full_address IS '전체 주소 (예: 경기 부천시)';
