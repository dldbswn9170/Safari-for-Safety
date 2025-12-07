// src/utils/mapUtils.js

import {
  regionCenters,
  regionNameMapping,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  REGION_ZOOM,
} from "./constants";

/**
 * 행정구역 하이라이트 처리
 */
export function highlightRegion(map, geojsonData, regionName, isAll = false) {
  if (!geojsonData || !map || !map.getSource || !map.getSource("regions")) return;

  // 지역명 정규화 (짧은 형식을 긴 형식으로 변환)
  const normalizedRegionName = regionName ? (regionNameMapping[regionName] || regionName) : null;

  geojsonData.features.forEach((f) => {
    const id = f.id;
    const featureName = f.properties.name;

    // 정규화된 이름으로 매칭하거나 부분 일치 허용
    const isSelected = isAll ||
      (normalizedRegionName && (
        featureName === normalizedRegionName ||
        featureName.includes(normalizedRegionName.replace(/특별시|광역시|특별자치시|특별자치도|도$/g, ''))
      ));

    map.setFeatureState({ source: "regions", id }, { highlight: isSelected });
  });
}

/**
 * 지역 선택 시 지도 이동 (안정화된 버전)
 * regionName: "전체" 또는 "서울특별시" 같은 정확한 key 권장
 */
export function flyToRegion(map, regionName) {
  if (!map) {
    console.warn("flyToRegion: map이 존재하지 않습니다.");
    return;
  }

  if (regionName === "전체") {
    console.log("flyToRegion → 전체로 이동");
    map.flyTo({
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      essential: true,
    });
    return;
  }

  // 지역명 정규화 (짧은 형식을 긴 형식으로 변환)
  const normalizedRegionName = regionNameMapping[regionName] || regionName;

  // 정규화된 이름으로 좌표 찾기
  let coords = regionCenters[normalizedRegionName];

  // 여전히 못 찾으면 부분 일치 시도
  if (!coords) {
    const matchKey = Object.keys(regionCenters).find((key) =>
      key.includes(normalizedRegionName) ||
      normalizedRegionName.includes(key.replace(/특별시|광역시|특별자치시|특별자치도|도$/g, ''))
    );
    if (matchKey) {
      coords = regionCenters[matchKey];
      console.log(`flyToRegion: 부분 일치로 매칭 '${regionName}' => '${matchKey}'`);
    }
  } else {
    console.log(`flyToRegion: 정규화 매칭 '${regionName}' => '${normalizedRegionName}'`);
  }

  if (coords) {
    map.flyTo({
      center: coords,
      zoom: REGION_ZOOM,
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  } else {
    console.warn("flyToRegion: 좌표를 찾을 수 없습니다:", regionName);
  }
}

/**
 * 로드킬 데이터를 GeoJSON으로 변환
 */
export function createGeoJSONData(data) {
  return {
    type: "FeatureCollection",
    features: data
      .filter((item) => {
        // 좌표가 유효한 데이터만 필터링
        const lon = Number(item.경도);
        const lat = Number(item.위도);
        return !isNaN(lon) && !isNaN(lat) && lon !== 0 && lat !== 0;
      })
      .map((item, i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(item.경도), Number(item.위도)],
        },
        properties: {
          city: item.관할기관 || "미상",
          idx: i,
          일련번호: item.일련번호 || i,
        },
      })),
  };
}
