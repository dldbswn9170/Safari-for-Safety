// src/components/Sidebar.js

import React from "react";

export default function Sidebar({
  selectedRegion,
  setSelectedRegion,
  regionCoordinates = {},
  currentData = [],
  totalCount = 0,
  mapStyle,
  setMapStyle,
  mapStyles = {},
  onRegionSelect, // 반드시 handleRegionSelect 전달되어야 함
}) {

  // 지역 목록 (regionCoordinates의 키 사용)
  const regionKeys = Object.keys(regionCoordinates);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    console.log("Sidebar select change:", val);
    if (onRegionSelect) onRegionSelect(val);
    else setSelectedRegion(val);
  };

  return (
    <div className="sidebar" style={{ width: 320, height: "100vh", padding: 20, background: "#111", color: "#fff", overflowY: "auto", zIndex: 1100, textAlign: "center"}}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>국내 로드킬 분석 시스템</h1>
        <span style={{ fontSize: 12, color: "#ccc" }}>지역별 동물 로드킬 발생 현황을 분석합니다.</span>
      </div>

      {/* 지역 선택 */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>지역 선택</label>
        <select value={selectedRegion} onChange={handleSelectChange} style={{ width: "90%", padding: 12, borderRadius: 8 }}>
          <option value="전체">전체</option>
          {regionKeys.length > 0 ? (
            regionKeys.map((key) => (
              <option key={key} value={key}>
                {regionCoordinates[key].name}
              </option>
            ))
          ) : (
            <option value="">데이터 없음</option>
          )}
        </select>


      </div>

      {/* 통계 */}
      <div style={{ background: "rgba(0,0,0,0.15)", padding: 10, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#ddd" }}>총 로드킬 발생 건수</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{totalCount.toLocaleString()}건</div>
      </div>

      {/* 지역별 순위 */}
      <div>
        <h3 style={{ margin: "0 0 8px" }}>📍 지역별 발생 건수 (Top 5)</h3>
        {currentData.length > 0 ? (
          currentData
            .slice(0, 5) // 👈 상위 5개만 출력
            .map((item, idx) => (
              <div
                key={item.animal + idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 13 }}>{item.animal}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{item.count}건</div>
              </div>
            ))
        ) : (
          <div style={{ color: "#ccc" }}>데이터 없음</div>
        )}
      </div>


      {/* 지도 스타일 선택 */}
      {Object.keys(mapStyles).length > 0 && (
        <div style={{ marginTop: 20, marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 12,
              color: "#ccc",
            }}
          >
            지도 스타일
          </label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          >
            {Object.entries(mapStyles).map(([k, s]) => (
              <option key={k} value={s.url}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
