import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RoadkillChart = ({ isOpen, onToggle, currentLocationName, currentData }) => {
  const [isReady, setIsReady] = useState(false);

  // 데이터를 정렬하여 상대적 순위에 따른 색상 결정
  const getBarColors = (data) => {
    if (!data || data.length === 0) return [];
    
    const sorted = [...data].sort((a, b) => b.count - a.count);
    const colorMap = new Map();
    
    sorted.forEach((item, index) => {
      if (index === 0) colorMap.set(item.animal, '#8B0000'); // 1위: 매우 높음
      else if (index === 1) colorMap.set(item.animal, '#DC143C'); // 2위: 높음
      else if (index === 2) colorMap.set(item.animal, '#FF8C00'); // 3위: 표준
      else if (index === 3) colorMap.set(item.animal, '#FFD700'); // 4위: 낮음
      else colorMap.set(item.animal, '#4CAF50'); // 5위: 매우 낮음
    });
    
    return data.map(item => colorMap.get(item.animal));
  };

  useEffect(() => {
    if (isOpen) {
      // DOM이 렌더링된 후 차트를 표시
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [isOpen]);

  const barColors = getBarColors(currentData);

  return (
    <>
      {/* 발생건수 범례 - 항상 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '350px',
        backgroundColor: '#2c3e50',
        padding: '8px 10px',
        borderRadius: '6px',
        zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{
          fontSize: '10px',
          color: 'white',
          margin: '0 0 6px 0',
          fontWeight: 'bold'
        }}>발생건수</h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0'
        }}>
          <div style={{ width: '45px', height: '22px', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}>매우낮음</span>
          </div>
          <div style={{ width: '35px', height: '22px', backgroundColor: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}>낮음</span>
          </div>
          <div style={{ width: '35px', height: '22px', backgroundColor: '#FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}>표준</span>
          </div>
          <div style={{ width: '35px', height: '22px', backgroundColor: '#DC143C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}>높음</span>
          </div>
          <div style={{ width: '45px', height: '22px', backgroundColor: '#8B0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}>매우높음</span>
          </div>
        </div>
      </div>

      {/* Floating 차트 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '520px',
          height: '300px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          paddingBottom: '0px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          zIndex: 1100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', margin: 0 }}>
              {currentLocationName} 로드킬 현황
            </h2>
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#7f8c8d',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ width: '480px', height: '220px' }}>
            {isReady && currentData.length > 0 ? (
              <ResponsiveContainer width={480} height={220}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="animal" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="발생 건수">
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#7f8c8d',
                fontSize: '14px'
              }}>
                데이터 로딩 중...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 차트 토글 버튼 */}
      {!isOpen && (
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1100
          }}
        >
          📊 차트 보기
        </button>
      )}
    </>
  );
};

export default RoadkillChart;