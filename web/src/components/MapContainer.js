const MapContainer = ({ mapContainer, selectedRegion, regionCoordinates }) => {
  return (
    <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0 }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {regionCoordinates[selectedRegion].name}
      </div>
    </div>
  );
};

export default MapContainer;

