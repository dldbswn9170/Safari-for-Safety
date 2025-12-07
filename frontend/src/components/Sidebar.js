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
  isOpen = false, // 모바일에서 Sidebar 열림 상태
  onClose = () => {}, // Sidebar 닫기 함수
  currentUser = null, // 현재 로그인한 사용자
  onAuthClick = () => {}, // 로그인 버튼 클릭
  onReportClick = () => {}, // 신고 버튼 클릭
  onLogout = () => {}, // 로그아웃 함수
}) {

  // 모바일 감지 (768px 이하)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 지역 목록 (regionCoordinates의 키 사용)
  const regionKeys = Object.keys(regionCoordinates);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    console.log("Sidebar select change:", val);
    if (onRegionSelect) onRegionSelect(val);
    else setSelectedRegion(val);
  };

  return (
    <>
      {/* 모바일에서 배경 오버레이 */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1099,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      <div
        className="sidebar"
        style={{
          width: 320,
          height: "100vh",
          padding: 20,
          background: "#111",
          color: "#fff",
          overflowY: "auto",
          zIndex: 1100,
          textAlign: "center",
          position: isMobile ? "fixed" : "relative",
          left: isMobile ? (isOpen ? 0 : -320) : 0,
          top: 0,
          transition: "left 0.3s ease",
          boxShadow: isMobile ? "2px 0 10px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* 모바일에서 닫기 버튼 */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 15,
              right: 15,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid #444",
              borderRadius: 6,
              color: "#fff",
              fontSize: 18,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ✕
          </button>
        )}

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

        {/* 로그인/로그아웃/신고 버튼 영역 */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {!currentUser ? (
            <button
              onClick={onAuthClick}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                background: "#4a90e2",
                color: "#fff",
                border: "1px solid #357abd",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#357abd";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#4a90e2";
              }}
            >
              <span>🔐</span>
              <span>로그인</span>
            </button>
          ) : (
            <>
              <button
                onClick={onReportClick}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "#e63946",
                  color: "#fff",
                  border: "1px solid #c5303d",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#c5303d";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#e63946";
                }}
              >
                <span>🚨</span>
                <span>로드킬 신고</span>
              </button>
              <button
                onClick={onLogout}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "#666",
                  color: "#fff",
                  border: "1px solid #555",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#555";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#666";
                }}
              >
                <span>👤</span>
                <span>{currentUser.username} (로그아웃)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
