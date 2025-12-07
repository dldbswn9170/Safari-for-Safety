// src/components/RoadkillChart.js

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RoadkillChart({ roadkillData = [], selectedRegion = "전체" }) {
  // 선택된 지역에 맞는 데이터 필터링
  const filteredData = useMemo(() => {
    if (!roadkillData || roadkillData.length === 0) return [];

    if (selectedRegion === "전체") {
      return roadkillData;
    }

    return roadkillData.filter((d) => {
      if (!d.관할기관) return false;
      // 지역명 일치 확인 (부분 일치 허용)
      return (
        d.관할기관.includes(selectedRegion) ||
        selectedRegion.includes(d.관할기관.split(" ")[0])
      );
    });
  }, [roadkillData, selectedRegion]);

  // 지역별 발생 건수 (관할기관별)
  const regionData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const regionCounts = {};

    filteredData.forEach((item) => {
      if (!item.관할기관) return;
      
      // "경기 부천시" -> "부천시" 형태로 추출
      const parts = item.관할기관.split(" ");
      const regionName = parts.length > 1 ? parts[parts.length - 1] : item.관할기관;
      
      if (!regionCounts[regionName]) {
        regionCounts[regionName] = 0;
      }
      regionCounts[regionName]++;
    });

    return Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  if (!filteredData || filteredData.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#ccc" }}>
        데이터가 없습니다.
      </div>
    );
  }

  const regionDisplayName = selectedRegion === "전체" ? "전체 지역" : selectedRegion;

  return (
    <div style={{ color: "#fff" }}>
      <div style={{ marginBottom: 20, color: "#fff" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
          📊 {regionDisplayName} 지역별 발생 건수
        </h3>
        <div style={{ fontSize: 12, color: "#aaa" }}>
          총 {filteredData.length.toLocaleString()}건의 로드킬 데이터
        </div>
      </div>

      {/* 지역별 발생 건수 */}
      {regionData.length > 0 && (
        <div>
          <ResponsiveContainer width="100%" height={window.innerWidth <= 768 ? 300 : 400}>
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                type="number" 
                stroke="#999" 
                fontSize={11} 
                tick={{ fill: "#ccc" }}
                label={{ value: "발생 건수", position: "insideBottom", offset: -5, fill: "#ccc", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="region"
                stroke="#999"
                fontSize={11}
                tick={{ fill: "#ccc" }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#222",
                  border: "1px solid #444",
                  color: "#fff",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}건`, "발생 건수"]}
              />
              <Bar dataKey="count" fill="#4a90e2" name="발생 건수" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
