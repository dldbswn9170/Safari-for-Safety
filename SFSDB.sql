-- 로드킬 관리 시스템 데이터베이스 스키마

-- 1. 동물 종 테이블
CREATE TABLE animal_species (
    species_id SERIAL PRIMARY KEY,
    species_name VARCHAR(100) NOT NULL,
    species_name_en VARCHAR(100),
    category VARCHAR(50), -- 포유류, 조류, 파충류, 양서류 등
    protection_level VARCHAR(50), -- 멸종위기종, 보호종 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 사용자 테이블
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'general', -- general, admin, researcher
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 3. 로드킬 사고 신고 테이블
CREATE TABLE roadkill_reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    species_id INTEGER REFERENCES animal_species(species_id),
    
    -- 위치 정보
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255),
    road_name VARCHAR(100),
    road_type VARCHAR(50), -- 고속도로, 국도, 지방도 등
    
    -- 사고 정보
    accident_date DATE NOT NULL,
    accident_time TIME,
    weather_condition VARCHAR(50), -- 맑음, 비, 눈 등
    road_condition VARCHAR(50), -- 건조, 습윤, 결빙 등
    
    -- 상세 정보
    animal_count INTEGER DEFAULT 1,
    animal_size VARCHAR(20), -- 소형, 중형, 대형
    injury_level VARCHAR(50), -- 경상, 중상, 사망
    description TEXT,
    
    -- 사진 정보
    photo_url VARCHAR(500),
    photo_url2 VARCHAR(500),
    photo_url3 VARCHAR(500),
    
    -- 처리 상태
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processed, rejected
    processed_date TIMESTAMP,
    processed_by INTEGER REFERENCES users(user_id),
    processing_note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 로드킬 다발지역 테이블
CREATE TABLE hotspot_areas (
    hotspot_id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER, -- 미터 단위
    road_name VARCHAR(100),
    
    -- 통계 정보
    total_incidents INTEGER DEFAULT 0,
    risk_level VARCHAR(20), -- low, medium, high, critical
    main_species VARCHAR(100), -- 주요 출현 동물
    
    -- 대책 정보
    prevention_measures TEXT,
    has_warning_sign BOOLEAN DEFAULT FALSE,
    has_fence BOOLEAN DEFAULT FALSE,
    has_eco_bridge BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 통계 요약 테이블 (월별/연도별 집계)
CREATE TABLE statistics_summary (
    stat_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER, -- NULL이면 연간 통계
    species_id INTEGER REFERENCES animal_species(species_id),
    region VARCHAR(100),
    
    total_count INTEGER DEFAULT 0,
    fatal_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month, species_id, region)
);

-- 6. 예방 시설물 테이블
CREATE TABLE prevention_facilities (
    facility_id SERIAL PRIMARY KEY,
    facility_type VARCHAR(50), -- 경고표지판, 울타리, 생태통로 등
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    road_name VARCHAR(100),
    installation_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 게시판 테이블 (공지사항, 자료실 등)
CREATE TABLE board_posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    board_type VARCHAR(20), -- notice, data, qna, news
    title VARCHAR(200) NOT NULL,
    content TEXT,
    attachment_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_roadkill_location ON roadkill_reports(latitude, longitude);
CREATE INDEX idx_roadkill_date ON roadkill_reports(accident_date);
CREATE INDEX idx_roadkill_species ON roadkill_reports(species_id);
CREATE INDEX idx_roadkill_status ON roadkill_reports(status);
CREATE INDEX idx_hotspot_location ON hotspot_areas(latitude, longitude);
CREATE INDEX idx_statistics_period ON statistics_summary(year, month);

-- 샘플 동물 종 데이터 삽입
INSERT INTO animal_species (species_name, species_name_en, category, protection_level) VALUES
('고라니', 'Korean Water Deer', '포유류', '일반종'),
('너구리', 'Raccoon Dog', '포유류', '일반종'),
('고양이', 'Cat', '포유류', '일반종'),
('개', 'Dog', '포유류', '일반종'),
('멧돼지', 'Wild Boar', '포유류', '일반종'),
('노루', 'Roe Deer', '포유류', '일반종'),
('오소리', 'Badger', '포유류', '일반종'),
('삵', 'Leopard Cat', '포유류', '멸종위기 II급'),
('수달', 'Otter', '포유류', '멸종위기 I급'),
('까치', 'Magpie', '조류', '일반종'),
('까마귀', 'Crow', '조류', '일반종'),
('비둘기', 'Pigeon', '조류', '일반종'),
('고슴도치', 'Hedgehog', '포유류', '일반종'),
('족제비', 'Weasel', '포유류', '일반종'),
('청설모', 'Squirrel', '포유류', '일반종');

-- 뷰 생성: 로드킬 통계 대시보드용
CREATE VIEW roadkill_statistics AS
SELECT 
    DATE_TRUNC('month', accident_date) as month,
    s.species_name,
    COUNT(*) as incident_count,
    COUNT(CASE WHEN injury_level = '사망' THEN 1 END) as fatal_count
FROM roadkill_reports r
JOIN animal_species s ON r.species_id = s.species_id
WHERE status = 'confirmed'
GROUP BY DATE_TRUNC('month', accident_date), s.species_name;

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadkill_reports_updated_at BEFORE UPDATE ON roadkill_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotspot_areas_updated_at BEFORE UPDATE ON hotspot_areas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();