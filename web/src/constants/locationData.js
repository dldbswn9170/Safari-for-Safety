export const locationData = {
  '서울': { 
    lat: 37.5665, lng: 126.9780, name: '서울특별시', level: 8,
    cities: {
      '종로구': { lat: 37.5735, lng: 126.9790, level: 5 },
      '중구': { lat: 37.5641, lng: 126.9979, level: 5 },
      '강남구': { lat: 37.4979, lng: 127.0276, level: 5 }
    }
  },
  '부산': { 
    lat: 35.1796, lng: 129.0756, name: '부산광역시', level: 8,
    cities: {
      '해운대구': { lat: 35.1631, lng: 129.1635, level: 5 },
      '사하구': { lat: 35.1042, lng: 128.9743, level: 5 },
      '동래구': { lat: 35.2048, lng: 129.0838, level: 5 }
    }
  },
  '충남': { 
    lat: 36.5184, lng: 126.8000, name: '충청남도', level: 9,
    cities: {
      '천안시': { lat: 36.8151, lng: 127.1139, level: 6 },
      '공주시': { lat: 36.4465, lng: 127.1189, level: 6 },
      '보령시': { lat: 36.3334, lng: 126.6129, level: 6 },
      '아산시': { lat: 36.7898, lng: 127.0019, level: 6 },
      '서산시': { lat: 36.7847, lng: 126.4503, level: 6 }
    }
  },
  '경기': { 
    lat: 37.4138, lng: 127.5183, name: '경기도', level: 9,
    cities: {
      '수원시': { lat: 37.2636, lng: 127.0286, level: 6 },
      '성남시': { lat: 37.4201, lng: 127.1262, level: 6 },
      '고양시': { lat: 37.6584, lng: 126.8320, level: 6 },
      '용인시': { lat: 37.2411, lng: 127.1776, level: 6 }
    }
  },
  '강원': { 
    lat: 37.8228, lng: 128.1555, name: '강원특별자치도', level: 9,
    cities: {
      '춘천시': { lat: 37.8813, lng: 127.7300, level: 6 },
      '원주시': { lat: 37.3422, lng: 127.9202, level: 6 },
      '강릉시': { lat: 37.7519, lng: 128.8761, level: 6 }
    }
  },
  '제주': { 
    lat: 33.4890, lng: 126.4983, name: '제주특별자치도', level: 9,
    cities: {
      '제주시': { lat: 33.5097, lng: 126.5219, level: 6 },
      '서귀포시': { lat: 33.2541, lng: 126.5600, level: 6 }
    }
  }
};

export const roadkillData = {
  '서울': [
    { animal: '고양이', count: 145 },
    { animal: '개', count: 89 },
    { animal: '너구리', count: 34 },
    { animal: '까치', count: 67 },
    { animal: '비둘기', count: 123 }
  ],
  '서울-종로구': [
    { animal: '고양이', count: 23 },
    { animal: '개', count: 15 },
    { animal: '비둘기', count: 31 }
  ],
  '서울-중구': [
    { animal: '고양이', count: 28 },
    { animal: '개', count: 19 },
    { animal: '비둘기', count: 35 }
  ],
  '서울-강남구': [
    { animal: '고양이', count: 42 },
    { animal: '개', count: 27 },
    { animal: '너구리', count: 12 }
  ],
  '부산': [
    { animal: '고양이', count: 98 },
    { animal: '개', count: 76 },
    { animal: '너구리', count: 45 },
    { animal: '까치', count: 54 },
    { animal: '갈매기', count: 112 }
  ],
  '부산-해운대구': [
    { animal: '고양이', count: 34 },
    { animal: '갈매기', count: 45 },
    { animal: '개', count: 21 }
  ],
  '충남': [
    { animal: '고라니', count: 289 },
    { animal: '너구리', count: 178 },
    { animal: '고양이', count: 112 },
    { animal: '개', count: 89 },
    { animal: '오소리', count: 67 }
  ],
  '충남-천안시': [
    { animal: '고라니', count: 87 },
    { animal: '너구리', count: 54 },
    { animal: '고양이', count: 32 },
    { animal: '개', count: 28 }
  ],
  '충남-공주시': [
    { animal: '고라니', count: 72 },
    { animal: '너구리', count: 48 },
    { animal: '오소리', count: 23 }
  ],
  '충남-아산시': [
    { animal: '고라니', count: 65 },
    { animal: '너구리', count: 41 },
    { animal: '고양이', count: 29 }
  ],
  '경기': [
    { animal: '고양이', count: 234 },
    { animal: '개', count: 187 },
    { animal: '너구리', count: 156 },
    { animal: '고라니', count: 198 },
    { animal: '족제비', count: 89 }
  ],
  '경기-수원시': [
    { animal: '고양이', count: 67 },
    { animal: '개', count: 52 },
    { animal: '고라니', count: 43 }
  ],
  '강원': [
    { animal: '고라니', count: 312 },
    { animal: '너구리', count: 198 },
    { animal: '멧돼지', count: 87 },
    { animal: '노루', count: 145 }
  ],
  '제주': [
    { animal: '고양이', count: 156 },
    { animal: '개', count: 89 },
    { animal: '너구리', count: 67 }
  ]
};
