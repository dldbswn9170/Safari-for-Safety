const Sidebar = ({ selectedRegion, setSelectedRegion, regionCoordinates, currentData, totalCount }) => {
  return (
    <div style={{ 
      width: '300px', 
      height: '100vh',
      backgroundColor: '#222', 
      color: '#f4f4f4',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 1100
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: 'bold', color: '#fff' }}>
        🦌 SFS - 전국 로드킬 분석
      </h1>
      <p style={{ fontSize: '14px', color: '#bbb', marginBottom: '30px' }}>
        지역별 동물 로드킬 발생 현황을 분석합니다.
      </p>

      {/* 지역 선택 */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', color: '#eee' }}>
          📍 지역 선택
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#444',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {Object.keys(regionCoordinates).map((region) => (
            <option key={region} value={region} style={{ color: '#222', backgroundColor:'#fff' }}>
              {regionCoordinates[region].name}
            </option>
          ))}
        </select>
      </div>

      {/* 통계 정보 */}
      <div style={{
        backgroundColor: '#333',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
          총 로드킬 발생 건수
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
          {totalCount.toLocaleString()}건
        </div>
      </div>

      {/* 동물별 순위 */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold', color: '#eee' }}>
          동물별 발생 건수
        </h3>
        {currentData.map((item, index) => (
          <div key={item.animal} style={{
            backgroundColor: '#232323',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #373737'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                backgroundColor: '#666',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                {index + 1}
              </span>
              <span style={{ fontSize: '14px', color: '#f4f4f4' }}>{item.animal}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e0e0e0' }}>
              {item.count}건
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;