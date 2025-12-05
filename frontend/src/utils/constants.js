// src/utils/constants.js

// 시도별 중심 좌표
export const regionCenters = {
  서울특별시: [126.9780, 37.5665],
  부산광역시: [129.0756, 35.1796],
  대구광역시: [128.6014, 35.8714],
  인천광역시: [126.7052, 37.4563],
  광주광역시: [126.853, 35.1595],
  대전광역시: [127.3845, 36.3504],
  울산광역시: [129.3114, 35.5395],
  경기도: [127.5183, 37.4138],
  강원특별자치도: [128.1555, 37.8228],
  충청북도: [127.7, 36.8],
  충청남도: [126.8, 36.6],
  전북특별자치도: [127.1, 35.8],
  전라남도: [127.0, 34.9],
  경상북도: [128.8, 36.3],
  경상남도: [128.2, 35.2],
  제주특별자치도: [126.5312, 33.4996],
};

// Mapbox 스타일 옵션
export const mapStyles = {
  light: { 
    url: "mapbox://styles/mapbox/light-v11", 
    name: "밝은 테마" 
  },
  dark: { 
    url: "mapbox://styles/mapbox/dark-v11", 
    name: "어두운 테마" 
  },
  streets: { 
    url: "mapbox://styles/mapbox/streets-v12", 
    name: "거리 지도" 
  },
  outdoors: { 
    url: "mapbox://styles/mapbox/outdoors-v12", 
    name: "야외 지도" 
  },
  satellite: { 
    url: "mapbox://styles/mapbox/satellite-streets-v12", 
    name: "위성 지도" 
  },
};

// 기본 지도 설정
export const DEFAULT_MAP_CENTER = [127.7669, 35.9078];
export const DEFAULT_MAP_ZOOM = 6.3;
export const REGION_ZOOM = 11;

// 클러스터 설정
export const CLUSTER_RADIUS = 120;