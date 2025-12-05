// src/utils/mapLayers.js

import { CLUSTER_RADIUS } from './constants';

// 행정구역 레이어 추가
export const addRegionLayers = (map, geojson) => {
  if (!map.getSource("regions")) {
    map.addSource("regions", {
      type: "geojson",
      data: geojson,
    });
  }

  if (!map.getLayer("region-fill")) {
    map.addLayer({
      id: "region-fill",
      type: "fill",
      source: "regions",
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "highlight"], false],
          "rgba(0, 0, 0, 0)",
          "#1a1a1a",
        ],
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "highlight"], false],
          0,
          0.7,
        ],
      },
      layout: { visibility: "visible" },
    });
  }

  if (!map.getLayer("region-outline")) {
    map.addLayer({
      id: "region-outline",
      type: "line",
      source: "regions",
      paint: {
        "line-color": [
          "case",
          ["boolean", ["feature-state", "highlight"], false],
          "#666666",
          "#111111",
        ],
        "line-width": [
          "case",
          ["boolean", ["feature-state", "highlight"], false],
          1,
          0.5,
        ],
      },
      layout: { visibility: "visible" },
    });
  }
};

// 로드킬 클러스터 레이어 추가
export const addRoadkillLayers = (map, geoData, setSelectedRegion) => {
  if (!map.getSource("roadkill")) {
    map.addSource("roadkill", {
      type: "geojson",
      data: geoData,
      cluster: true,
      clusterRadius: CLUSTER_RADIUS,
    });

    // 클러스터 원
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "roadkill",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#c9b87c",
          50,
          "#d4a853",
          200,
          "#cc8844",
          500,
          "#b86b3c",
        ],
        "circle-opacity": 0.7,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          15,
          50,
          25,
          200,
          35,
          500,
          50,
        ],
      },
    });

    // 클러스터 숫자
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "roadkill",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": [
          "step",
          ["get", "point_count"],
          12,
          50,
          14,
          200,
          16,
          500,
          18,
        ],
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#fff",
        "text-halo-color": "#000",
        "text-halo-width": 1,
      },
    });

    // 개별 포인트
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "roadkill",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#e63946",
        "circle-radius": 6,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    // 클러스터 클릭 이벤트
    map.on("click", "clusters", (e) => {
      const clusterId = e.features[0].id;
      const clusterSource = map.getSource("roadkill");

      clusterSource.getClusterLeaves(clusterId, 100, 0, (err, clusterFeatures) => {
        if (err) {
          console.error("클러스터 데이터 조회 오류:", err);
          return;
        }

        const cities = [...new Set(clusterFeatures.map(f => f.properties.city))];
        if (cities.length > 0) {
          setSelectedRegion(cities[0]);
        }
      });
    });

    // 포인트 클릭 이벤트
    map.on("click", "unclustered-point", (e) => {
      const city = e.features[0].properties.city;
      setSelectedRegion(city);
    });

    // 마우스 포인터
    ["clusters", "unclustered-point"].forEach((layer) => {
      map.on("mouseenter", layer, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = "";
      });
    });
  } else {
    map.getSource("roadkill").setData(geoData);
  }
};

// 줌 레벨에 따른 클러스터 크기 조정
export const updateClusterRadius = (map, currentZoom) => {
  if (!map || !map.getSource("roadkill")) return;

  let baseRadius, maxRadius;
  if (currentZoom < 7) {
    baseRadius = 20;
    maxRadius = 30;
  } else if (currentZoom < 8) {
    baseRadius = 18;
    maxRadius = 28;
  } else if (currentZoom < 9) {
    baseRadius = 15;
    maxRadius = 25;
  } else if (currentZoom < 10) {
    baseRadius = 12;
    maxRadius = 20;
  } else if (currentZoom < 11) {
    baseRadius = 10;
    maxRadius = 16;
  } else {
    baseRadius = 8;
    maxRadius = 12;
  }

  if (map.getLayer("clusters")) {
    map.setPaintProperty("clusters", "circle-radius", [
      "step",
      ["get", "point_count"],
      baseRadius,
      50,
      baseRadius + 5,
      200,
      maxRadius,
    ]);
  }
};

// 줌 레벨에 따른 단계별 클러스터 레이어 추가
export const addRoadkillClusterByLevel = (map, geoData) => {
  if (!map) return;

  // 기존 소스 제거 및 재생성
  if (map.getSource("roadkill")) {
    // 기존 레이어들 제거
    ["clusters", "cluster-count", "unclustered-point"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
    map.removeSource("roadkill");
  }

  // 새로운 소스 추가
  map.addSource("roadkill", {
    type: "geojson",
    data: geoData,
    cluster: true,
    clusterRadius: CLUSTER_RADIUS,
    clusterMaxZoom: 14,
  });

  // 클러스터 원 레이어
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "roadkill",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#c9b87c",
        50,
        "#d4a853",
        200,
        "#cc8844",
        500,
        "#b86b3c",
      ],
      "circle-opacity": 0.7,
      "circle-radius": [
        "step",
        ["get", "point_count"],
        15,
        50,
        25,
        200,
        35,
        500,
        50,
      ],
    },
  });

  // 클러스터 숫자 레이어
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "roadkill",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": [
        "step",
        ["get", "point_count"],
        12,
        50,
        14,
        200,
        16,
        500,
        18,
      ],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#fff",
      "text-halo-color": "#000",
      "text-halo-width": 1,
    },
  });

  // 개별 포인트 레이어
  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "roadkill",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#e63946",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
};