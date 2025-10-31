import { useState } from 'react';
import Sidebar from './components/Sidebar';
import RoadkillChart from './components/RoadkillChart';
import { locationData, roadkillData } from './constants/locationData';
import { useKakaoMap } from './hooks/useKakaoMap';

export default function App() {
  const [selectedProvince, setSelectedProvince] = useState('서울');
  const [selectedCity, setSelectedCity] = useState(null);
  const [isChartOpen, setIsChartOpen] = useState(true);
  const apiKey = '2b16e1d042f4324ca028c93ed0a54fa2'; // ← 본인 키로 교체

  const { mapContainer } = useKakaoMap({
    selectedProvince,
    selectedCity,
    locationData,
    apiKey
  });

  // 현재 데이터 키 생성 (도시 선택시 시/도-시/군구 형태로 key가 결정)
  const dataKey = selectedCity ? `${selectedProvince}-${selectedCity}` : selectedProvince;
  const currentData = roadkillData[dataKey] || [];
  const totalCount = currentData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex' }}>
      {/* 지도 */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }} />
      {/* 사이드바 */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Sidebar
          selectedRegion={selectedProvince}
          setSelectedRegion={setSelectedProvince}
          regionCoordinates={locationData}
          currentData={currentData}
          totalCount={totalCount}
        />
      </div>
      {/* 차트 */}
      <RoadkillChart
        isOpen={isChartOpen}
        onToggle={() => setIsChartOpen((prev) => !prev)}
        currentLocationName={selectedCity ? `${locationData[selectedProvince].name} ${selectedCity}` : locationData[selectedProvince].name}
        currentData={currentData}
      />
    </div>
  );
}
