// 로드킬 신고 모달 (독립 모듈)
import { useState } from 'react';

export default function ReportModal({ isOpen, onClose, onReportSuccess }) {
  const [formData, setFormData] = useState({
    animal_type: '',
    location_address: '',
    latitude: '',
    longitude: '',
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: '',
    description: '',
    temperature: '',
    precipitation: '',
    wind_speed: '',
    humidity: '',
    weather_condition: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [autoWeather, setAutoWeather] = useState(true); // 날씨 자동/수동 토글

  if (!isOpen) return null;

  // 주소로 위도/경도 검색 (Geocoding)
  const searchAddressToCoords = async () => {
    if (!formData.location_address.trim()) {
      setError('주소를 먼저 입력해주세요');
      return;
    }

    setSearchingAddress(true);
    setError('');

    try {
      const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
      const geocodingResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.location_address)}.json?access_token=${mapboxToken}&language=ko&country=KR`
      );
      const geocodingData = await geocodingResponse.json();

      if (geocodingData.features && geocodingData.features.length > 0) {
        const [longitude, latitude] = geocodingData.features[0].center;
        const fullAddress = geocodingData.features[0].place_name;

        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          location_address: fullAddress,
        }));

        alert(`✅ 위치를 찾았습니다!\n위도: ${latitude.toFixed(6)}\n경도: ${longitude.toFixed(6)}`);
      } else {
        setError('해당 주소를 찾을 수 없습니다. 더 자세한 주소를 입력해주세요.');
      }
    } catch (err) {
      console.error('주소 검색 실패:', err);
      setError('주소 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSearchingAddress(false);
    }
  };

  // 날씨 상태 옵션
  const weatherOptions = [
    '맑음',
    '구름 조금',
    '흐림',
    '비',
    '소나기',
    '눈',
    '진눈깨비',
    '안개',
    '천둥번개',
    '폭우',
    '폭설',
  ];

  // WMO 날씨 코드를 한국어로 변환
  const convertWeatherCode = (code) => {
    const weatherCodes = {
      0: '맑음',
      1: '구름 조금',
      2: '구름 조금',
      3: '흐림',
      45: '안개',
      48: '안개',
      51: '비',
      53: '비',
      55: '비',
      56: '진눈깨비',
      57: '진눈깨비',
      61: '비',
      63: '비',
      65: '폭우',
      66: '진눈깨비',
      67: '진눈깨비',
      71: '눈',
      73: '눈',
      75: '폭설',
      77: '눈',
      80: '소나기',
      81: '소나기',
      82: '폭우',
      85: '눈',
      86: '폭설',
      95: '천둥번개',
      96: '천둥번개',
      99: '천둥번개',
    };
    return weatherCodes[code] || '맑음';
  };

  // Open-Meteo API로 현재 날씨 정보 가져오기
  const fetchWeatherByCoords = async (lat, lng) => {
    try {
      console.log('🌤️ Open-Meteo API 날씨 정보 요청 중:', { lat, lng });

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia/Seoul`;
      console.log('🌤️ API URL:', weatherUrl);

      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      console.log('🌤️ 날씨 API 응답:', weatherData);

      if (weatherData && weatherData.current) {
        const current = weatherData.current;

        const newWeatherData = {
          temperature: current.temperature_2m.toFixed(1),
          humidity: current.relative_humidity_2m,
          wind_speed: current.wind_speed_10m.toFixed(1),
          precipitation: current.precipitation.toFixed(1),
          weather_condition: convertWeatherCode(current.weather_code),
        };

        console.log('🌤️ 설정할 날씨 데이터:', newWeatherData);

        setFormData(prev => ({
          ...prev,
          ...newWeatherData
        }));

        alert('✅ 날씨 정보를 성공적으로 불러왔습니다!');
      } else {
        console.error('❌ 날씨 데이터 형식 오류:', weatherData);
        alert('❌ 날씨 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 날씨 정보 가져오기 실패:', err);
      alert('❌ 날씨 정보를 불러오는데 실패했습니다: ' + err.message);
    }
  };

  // GPS로 현재 위치 가져오기
  const getCurrentLocation = () => {
    // HTTPS 체크 (localhost는 예외)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('🔒 GPS 기능은 보안 연결(HTTPS)에서만 작동합니다. 수동으로 위치를 입력해주세요.');
      return;
    }

    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 위도/경도 설정
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));

        // Mapbox Geocoding API로 주소 가져오기 & OpenWeatherMap API로 날씨 가져오기
        try {
          // 주소 가져오기
          const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
          const geocodingResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=ko`
          );
          const geocodingData = await geocodingResponse.json();

          let address = '';
          if (geocodingData.features && geocodingData.features.length > 0) {
            address = geocodingData.features[0].place_name;
          }

          setFormData(prev => ({
            ...prev,
            location_address: address,
          }));

          // 자동 날씨 모드일 때만 날씨 정보 가져오기
          if (autoWeather) {
            await fetchWeatherByCoords(latitude, longitude);
          }
        } catch (err) {
          console.error('주소/날씨 변환 실패:', err);
          // 주소와 날씨는 못 가져와도 위도/경도는 이미 설정됨
        }

        setGettingLocation(false);
      },
      (err) => {
        setGettingLocation(false);
        if (err.code === 1) {
          setError('위치 정보 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.');
        } else if (err.code === 2) {
          setError('위치 정보를 사용할 수 없습니다.');
        } else if (err.code === 3) {
          setError('위치 정보 요청 시간이 초과되었습니다.');
        } else {
          setError('위치 정보를 가져오는데 실패했습니다.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 프론트엔드 유효성 검사
    const errors = [];

    // 동물 종류 검사 (문자열만 허용)
    if (formData.animal_type && /\d/.test(formData.animal_type)) {
      errors.push('동물 종류는 문자만 입력 가능합니다 (숫자 불가)');
    }

    // 위도 검사 (-90 ~ 90)
    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('위도는 -90부터 90 사이의 숫자여야 합니다');
    }

    // 경도 검사 (-180 ~ 180)
    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('경도는 -180부터 180 사이의 숫자여야 합니다');
    }

    // 기온 검사 (숫자만)
    if (formData.temperature && isNaN(parseFloat(formData.temperature))) {
      errors.push('기온은 숫자만 입력 가능합니다');
    }

    // 습도 검사 (0~100)
    if (formData.humidity) {
      const humidity = parseFloat(formData.humidity);
      if (isNaN(humidity) || humidity < 0 || humidity > 100) {
        errors.push('습도는 0부터 100 사이의 숫자여야 합니다');
      }
    }

    // 풍속 검사 (양수)
    if (formData.wind_speed) {
      const windSpeed = parseFloat(formData.wind_speed);
      if (isNaN(windSpeed) || windSpeed < 0) {
        errors.push('풍속은 0 이상의 숫자여야 합니다');
      }
    }

    // 날씨 상태 검사 (문자열만)
    if (formData.weather_condition && /\d/.test(formData.weather_condition)) {
      errors.push('날씨 상태는 문자만 입력 가능합니다 (숫자 불가)');
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('로그인이 필요합니다');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // 서버에서 보낸 메시지 표시 (신규 동물이면 특별 메시지 포함)
        alert(data.message || '신고가 접수되었습니다!');
        onReportSuccess(data.data);
        onClose();

        // 폼 초기화
        setFormData({
          animal_type: '',
          location_address: '',
          latitude: '',
          longitude: '',
          incident_date: new Date().toISOString().split('T')[0],
          incident_time: '',
          description: '',
          temperature: '',
          precipitation: '',
          wind_speed: '',
          humidity: '',
          weather_condition: '',
        });
      } else {
        setError(data.message || '신고 접수에 실패했습니다');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#2a2a2a',
          padding: window.innerWidth <= 768 ? '20px' : '30px',
          borderRadius: '12px',
          width: window.innerWidth <= 768 ? '95%' : '500px',
          maxWidth: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          margin: window.innerWidth <= 768 ? '10px' : '20px',
        }}
      >
        <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
          🚨 로드킬 신고하기
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              동물 종류 *
            </label>
            <input
              type="text"
              value={formData.animal_type}
              onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })}
              required
              placeholder="예: 고양이, 고라니, 강아지"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              발생 위치 * (주소 입력 또는 GPS 사용)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                required
                placeholder="예: 서울특별시 강남구 또는 경기도 수원시"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  background: gettingLocation ? '#555' : '#4a90e2',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: gettingLocation ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!gettingLocation) e.target.style.background = '#357abd';
                }}
                onMouseLeave={(e) => {
                  if (!gettingLocation) e.target.style.background = '#4a90e2';
                }}
              >
                {gettingLocation ? '위치 확인 중...' : '📍 GPS'}
              </button>
            </div>
            <button
              type="button"
              onClick={searchAddressToCoords}
              disabled={searchingAddress || !formData.location_address.trim()}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: searchingAddress || !formData.location_address.trim() ? '#555' : '#28a745',
                color: '#fff',
                border: 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: searchingAddress || !formData.location_address.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!searchingAddress && formData.location_address.trim()) {
                  e.target.style.background = '#218838';
                }
              }}
              onMouseLeave={(e) => {
                if (!searchingAddress && formData.location_address.trim()) {
                  e.target.style.background = '#28a745';
                }
              }}
            >
              {searchingAddress ? '🔍 주소 검색 중...' : '🔍 위 주소로 위도/경도 자동 검색'}
            </button>
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
              💡 팁: 주소를 입력한 후 "자동 검색" 버튼을 누르면 위도/경도가 자동으로 입력됩니다
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                위도 *
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
                placeholder="37.5665"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                경도 *
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
                placeholder="126.9780"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                발생 날짜 *
              </label>
              <input
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                발생 시간
              </label>
              <input
                type="time"
                value={formData.incident_time}
                onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* 날씨 정보 입력 (선택사항) */}
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(74, 144, 226, 0.05)',
            border: '1px solid rgba(74, 144, 226, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ color: '#4a90e2', fontSize: '13px', fontWeight: '600' }}>
                🌤️ 날씨 정보 (선택사항)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: autoWeather ? '#4a90e2' : '#999' }}>
                  {autoWeather ? '자동' : '수동'}
                </span>
                <button
                  type="button"
                  onClick={() => setAutoWeather(!autoWeather)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: autoWeather ? '#4a90e2' : '#666',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                >
                  {autoWeather ? '🤖 자동' : '✋ 수동'}
                </button>
              </div>
            </div>

            {autoWeather && formData.latitude && formData.longitude && (
              <div style={{ marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => fetchWeatherByCoords(parseFloat(formData.latitude), parseFloat(formData.longitude))}
                  disabled={!formData.latitude || !formData.longitude}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#218838';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#28a745';
                  }}
                >
                  🌍 현재 위치 날씨 불러오기
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  🌡️ 기온 (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder={autoWeather ? "자동 입력됨" : "예: 15.5"}
                  disabled={autoWeather}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    background: autoWeather ? '#0f0f0f' : '#1a1a1a',
                    color: autoWeather ? '#666' : '#fff',
                    fontSize: '13px',
                    cursor: autoWeather ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  💧 습도 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  placeholder={autoWeather ? "자동 입력됨" : "예: 65"}
                  disabled={autoWeather}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    background: autoWeather ? '#0f0f0f' : '#1a1a1a',
                    color: autoWeather ? '#666' : '#fff',
                    fontSize: '13px',
                    cursor: autoWeather ? 'not-allowed' : 'text',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  💨 풍속 (m/s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wind_speed}
                  onChange={(e) => setFormData({ ...formData, wind_speed: e.target.value })}
                  placeholder={autoWeather ? "자동 입력됨" : "예: 3.5"}
                  disabled={autoWeather}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    background: autoWeather ? '#0f0f0f' : '#1a1a1a',
                    color: autoWeather ? '#666' : '#fff',
                    fontSize: '13px',
                    cursor: autoWeather ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  ☁️ 날씨 상태
                </label>
                <select
                  value={formData.weather_condition}
                  onChange={(e) => setFormData({ ...formData, weather_condition: e.target.value })}
                  disabled={autoWeather}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    background: autoWeather ? '#0f0f0f' : '#1a1a1a',
                    color: autoWeather ? '#666' : '#fff',
                    fontSize: '13px',
                    cursor: autoWeather ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#1a1a1a' }}>선택하세요</option>
                  {weatherOptions.map((option) => (
                    <option key={option} value={option} style={{ background: '#1a1a1a' }}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
              {autoWeather
                ? '💡 자동 모드: 위 "날씨 불러오기" 버튼 클릭 또는 GPS 사용'
                : '💡 수동 모드: 날씨 정보를 직접 입력하세요'
              }
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              상세 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="로드킬 상황에 대한 추가 정보를 입력해주세요"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(233, 57, 70, 0.2)',
              border: '1px solid #e63946',
              color: '#ff6b6b',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                background: '#666',
                color: '#fff',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '6px',
                background: '#e63946',
                color: '#fff',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '접수 중...' : '신고 접수'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
