// src/App.js

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Sidebar from "./components/Sidebar";
import RoadkillChart from "./components/RoadkillChart";

import {
  mapStyles,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  regionCenters,
} from "./utils/constants";

import {
  addRegionLayers,
  addRoadkillClusterByLevel,
} from "./utils/mapLayers";

import {
  highlightRegion,
  flyToRegion,
  createGeoJSONData,
} from "./utils/mapUtils";

import "./App.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [roadkillData, setRoadkillData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [geojsonData, setGeojsonData] = useState(null);
  const [mapStyle, setMapStyle] = useState(mapStyles.light.url);
  const [isChartOpen, setIsChartOpen] = useState(false);


  // ⭐ 지역 선택 핸들러
  const handleRegionSelect = (regionName) => {
    setSelectedRegion(regionName);

    if (regionName === "전체") {
      highlightRegion(map.current, geojsonData, null, true);
    } else {
      highlightRegion(map.current, geojsonData, regionName, false);
    }

    flyToRegion(map.current, regionName);
  };


  // ⭐ 행정구역 경계 로드
  const loadMapLayers = () => {
    fetch("/data/korea_regions.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        geojson.features = geojson.features.map((f, i) => ({
          ...f,
          id: i,
        }));

        setGeojsonData(geojson);
        addRegionLayers(map.current, geojson);

        if (selectedRegion === "전체") {
          highlightRegion(map.current, geojson, null, true);
        } else {
          highlightRegion(map.current, geojson, selectedRegion, false);
        }
      })
      .catch((err) => console.error("🚨 loadMapLayers fetch error:", err));
  };


  // ⭐ 지도 초기화
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });

    map.current.on("load", () => {
      loadMapLayers();
    });
  }, []);



  // ⭐ 지도 스타일 변경 시 레이어 재로드
  useEffect(() => {
    if (!map.current) return;

    map.current.setStyle(mapStyle);

    map.current.once("style.load", () => {
      loadMapLayers();

      if (roadkillData.length > 0) {
        const geoData = createGeoJSONData(roadkillData);

        // ⭐ 새 단계별 클러스터 추가
        addRoadkillClusterByLevel(map.current, geoData);
      }
    });
  }, [mapStyle]);



  // ⭐ 로드킬 CSV 불러오기
  useEffect(() => {
    fetch("/api/roadkill")
      .then((res) => res.json())
      .then((data) => {

        setRoadkillData(data);

        const geoData = createGeoJSONData(data);

        // ⭐ 단계별 클러스터 등록
        addRoadkillClusterByLevel(map.current, geoData);
      })
      .catch((err) => console.error("🚨 Roadkill API Fetch Error:", err));
  }, []);



  // 필터링된 로드킬 개수
  const filteredData =
    selectedRegion === "전체"
      ? roadkillData
      : roadkillData.filter((d) => {
          if (!d.관할기관) return false;
          // 지역명 일치 확인 (부분 일치 허용)
          return d.관할기관.includes(selectedRegion) || 
                 selectedRegion.includes(d.관할기관.split(" ")[0]);
        });

  const totalCount = filteredData.length;


  // regionCenters → Sidebar 입력형태로 변환
  const regionCoordinates = Object.fromEntries(
    Object.entries(regionCenters).map(([name, coords]) => [
      name,
      { name, coords },
    ])
  );


  // 지역별 Top5 통계 (동물명 컬럼이 없으므로 지역별 통계로 대체)
  const currentData = (() => {
    const counts = {};
    roadkillData.forEach((d) => {
      const region = d.관할기관 || "알 수 없음";
      const regionName = region.split(" ")[0] || region; // 첫 번째 단어만 추출
      counts[regionName] = (counts[regionName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([region, count]) => ({ animal: region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Sidebar
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        totalCount={totalCount}
        onRegionSelect={handleRegionSelect}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        mapStyles={mapStyles}
        regionCoordinates={regionCoordinates}
        currentData={currentData}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* 지도 영역 */}
        <div
          style={{
            flex: isChartOpen ? 1 : 1,
            position: "relative",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            ref={mapContainer}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          
          {/* 차트 토글 버튼 - 지도 위에 고정 */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => setIsChartOpen(!isChartOpen)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: isChartOpen
                  ? "rgba(233, 57, 70, 0.9)"
                  : "rgba(73, 144, 226, 0.9)",
                color: "#fff",
                border: `1px solid ${isChartOpen ? "#e63946" : "#4a90e2"}`,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
              }}
            >
              <span>{isChartOpen ? "📊" : "📈"}</span>
              <span>{isChartOpen ? "차트 닫기" : "차트 보기"}</span>
            </button>
          </div>
        </div>

        {/* 차트 영역 - 지도 아래 */}
        {isChartOpen && (
          <div
            style={{
              height: "500px",
              background: "#1a1a1a",
              borderTop: "3px solid #4a90e2",
              overflowY: "auto",
              padding: "25px",
              zIndex: 100,
              boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <RoadkillChart
              roadkillData={roadkillData}
              selectedRegion={selectedRegion}
            />
          </div>
        )}
      </div>
    </div>
  );
}
