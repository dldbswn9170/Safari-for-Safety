-- 로드킬 통계 테이블 생성
CREATE TABLE IF NOT EXISTS roadkill_stats (
  id SERIAL PRIMARY KEY,
  province VARCHAR(50),
  city VARCHAR(100),
  animal_type VARCHAR(100) NOT NULL,
  incident_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (빠른 검색을 위해)
CREATE INDEX idx_roadkill_stats_province ON roadkill_stats(province);
CREATE INDEX idx_roadkill_stats_city ON roadkill_stats(province, city);
CREATE INDEX idx_roadkill_stats_animal ON roadkill_stats(animal_type);

-- province와 city, animal_type 조합이 중복되지 않도록
CREATE UNIQUE INDEX idx_roadkill_stats_unique ON roadkill_stats(
  COALESCE(province, ''),
  COALESCE(city, ''),
  animal_type
);
