import { useState, useEffect, useRef } from 'react';

export const useKakaoMap = ({ selectedProvince, selectedCity, locationData, apiKey }) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  // 카카오 맵 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        const province = locationData[selectedProvince];
        const options = {
          center: new window.kakao.maps.LatLng(province.lat, province.lng),
          level: province.level
        };
        const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
        setMap(mapInstance);
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 지역 변경시 지도 이동 및 줌
  useEffect(() => {
    if (!map) return;
    let coords; 
    let level;

    if (selectedCity && locationData[selectedProvince]?.cities?.[selectedCity]) {
      const city = locationData[selectedProvince].cities[selectedCity];
      coords = new window.kakao.maps.LatLng(city.lat, city.lng);
      level = city.level;
    } else {
      const province = locationData[selectedProvince];
      coords = new window.kakao.maps.LatLng(province.lat, province.lng);
      level = province.level;
    }

    map.setLevel(level);
    map.panTo(coords);
  }, [map, selectedProvince, selectedCity, locationData]);

  return { mapContainer, map };
};

