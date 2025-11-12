import pandas as pd
import matplotlib.pyplot as plt

# CSV 파일 불러오기 (인코딩 주의)
df = pd.read_csv('data/processed/ReportRoadkill.csv', encoding='utf-8-sig')

# 데이터 미리보기
print(df.head())

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# 종명별 발생 건수 계산
species_counts = df['종명'].value_counts().reset_index()
species_counts.columns = ['종명', '건수']

# 상위 7개 종만 선택
top7 = species_counts.head(7)

# 결과 출력
print(top7)

# 막대그래프 시각화 (건수 기준)
plt.figure(figsize=(10,6))
plt.bar(top7['종명'], top7['건수'])
plt.title('종명별 발생 건수 (Top 7)', fontsize=16)
plt.xlabel('종명', fontsize=12)
plt.ylabel('건수', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()
