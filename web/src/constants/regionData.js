// 지역별 좌표 데이터
export const regionCoordinates = {
  '서울': { lat: 37.5665, lng: 126.9780, name: '서울특별시' },
  '부산': { lat: 35.1796, lng: 129.0756, name: '부산광역시' },
  '대구': { lat: 35.8714, lng: 128.6014, name: '대구광역시' },
  '인천': { lat: 37.4563, lng: 126.7052, name: '인천광역시' },
  '광주': { lat: 35.1595, lng: 126.8526, name: '광주광역시' },
  '대전': { lat: 36.3504, lng: 127.3845, name: '대전광역시' },
  '울산': { lat: 35.5384, lng: 129.3114, name: '울산광역시' },
  '세종': { lat: 36.4800, lng: 127.2890, name: '세종특별자치시' },
  '경기': { lat: 37.4138, lng: 127.5183, name: '경기도' },
  '강원': { lat: 37.8228, lng: 128.1555, name: '강원특별자치도' },
  '충북': { lat: 36.8000, lng: 127.7000, name: '충청북도' },
  '충남': { lat: 36.5184, lng: 126.8000, name: '충청남도' },
  '전북': { lat: 35.7175, lng: 127.1530, name: '전북특별자치도' },
  '전남': { lat: 34.8679, lng: 126.9910, name: '전라남도' },
  '경북': { lat: 36.4919, lng: 128.8889, name: '경상북도' },
  '경남': { lat: 35.4606, lng: 128.2132, name: '경상남도' },
  '제주': { lat: 33.4890, lng: 126.4983, name: '제주특별자치도' }
};

// 더미 로드킬 데이터 (지역별 동물별 발생 건수)
export const roadkillData = {
  '서울': [
    { animal: '고양이', count: 145 },
    { animal: '개', count: 89 },
    { animal: '너구리', count: 34 },
    { animal: '까치', count: 67 },
    { animal: '비둘기', count: 123 }
  ],
  '부산': [
    { animal: '고中含', count: 98 },
    { animal: '개', count: 76 },
    { animal: '너구리', count: 45 },
    { animal: '까치', count: 54 },
    { animal: '갈매기', count: 112 }
  ],
  '대구': [
    { animal: '고양이', count: 87 },
    { animal: '개', count: 63 },
    { animal: '너구리', count: 41 },
    { animal: '까치', count: 58 },
    { animal: '참새', count: 72 }
  ],
  '인천': [
    { animal: '고양이', count: 102 },
    { animal: '개', count: 71 },
    { animal: '너구리', count: 38 },
    { animal: '갈매기', count: 95 },
    { animal: '비둘기', count: 81 }
  ],
  '광주': [
    { animal: '고양이', count: 78 },
    { animal: '개', count: 59 },
    { animal: '너구리', count: 33 },
    { animal: '까치', count: 48 },
    { animal: '참새', count: 65 }
  ],
  '대전': [
    { animal: '고양이', count: 91 },
    { animal: '개', count: 68 },
    { animal: '너구리', count: 52 },
    { animal: '고라니', count: 29 },
    { animal: '까치', count: 55 }
  ],
  '울산': [
    { animal: '고양이', count: 73 },
    { animal: '개', count: 54 },
    { animal: '너구리', count: 47 },
    { animal: '고라니', count: 38 },
    { animal: '까치', count: 42 }
  ],
  '세종': [
    { animal: '고양이', count: 45 },
    { animal: '개', count: 38 },
    { animal: '너구리', count: 61 },
    { animal: '고라니', count: 73 },
    { animal: '까치', count: 36 }
  ],
  '경기': [
    { animal: '고양이', count: 234 },
    { animal: '개', count: 187 },
    { animal: '너구리', count: 156 },
    { animal: '고라니', count: 198 },
    { animal: '족제비', count: 89 }
  ],
  '강원': [
    { animal: '고라니', count: 312 },
    { animal: '너구리', count: 198 },
    { animal: '멧돼지', count: 87 },
    { animal: '노루', count: 145 },
    { animal: '오소리', count: 76 }
  ],
  '충북': [
    { animal: '고라니', count: 245 },
    { animal: '너구리', count: 167 },
    { animal: '고양이', count: 98 },
    { animal: '개', count: 76 },
    { animal: '족제비', count: 54 }
  ],
  '충남': [
    { animal: '고라니', count: 289 },
    { animal: '너구리', count: 178 },
    { animal: '고양이', count: 112 },
    { animal: '개', count: 89 },
    { animal: '오소리', count: 67 }
  ],
  '전북': [
    { animal: '고라니', count: 267 },
    { animal: '너구리', count: 189 },
    { animal: '멧돼지', count: 98 },
    { animal: '고양이', count: 87 },
    { animal: '개', count: 73 }
  ],
  '전남': [
    { animal: '고라니', count: 298 },
    { animal: '너구리', count: 201 },
    { animal: '고양이', count: 134 },
    { animal: '개', count: 98 },
    { animal: '오소리', count: 81 }
  ],
  '경북': [
    { animal: '고라니', count: 334 },
    { animal: '너구리', count: 223 },
    { animal: '멧돼지', count: 112 },
    { animal: '노루', count: 156 },
    { animal: '오소리', count: 94 }
  ],
  '경남': [
    { animal: '고라니', count: 278 },
    { animal: '너구리', count: 198 },
    { animal: '멧돼지', count: 134 },
    { animal: '고양이', count: 123 },
    { animal: '개', count: 98 }
  ],
  '제주': [
    { animal: '고양이', count: 156 },
    { animal: '개', count: 89 },
    { animal: '너구리', count: 67 },
    { animal: '까치', count: 78 },
    { animal: '참새', count: 94 }
  ]
};
