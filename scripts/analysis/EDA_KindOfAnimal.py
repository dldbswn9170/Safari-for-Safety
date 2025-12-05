import pandas as pd
import matplotlib.pyplot as plt

# CSV 파일 불러오기 (인코딩 주의)
# 경로를 프로젝트 루트 기준으로 수정
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
csv_path = os.path.join(BASE_DIR, 'data', 'processed', 'roadkill_data.csv')

if not os.path.exists(csv_path):
    print(f"❌ 파일을 찾을 수 없습니다: {csv_path}")
    print(f"현재 작업 디렉토리: {os.getcwd()}")
    exit(1)

df = pd.read_csv(csv_path, encoding='utf-8-sig')

# 데이터 미리보기
print(df.head())

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# 데이터 컬럼 확인
print("데이터 컬럼:", df.columns.tolist())
print("\n데이터 샘플:")
print(df.head())

# 관할기관별 발생 건수 계산 (종명 컬럼이 없으므로 관할기관으로 대체)
if '관할기관' in df.columns:
    region_counts = df['관할기관'].value_counts().reset_index()
    region_counts.columns = ['관할기관', '건수']
    species_counts = region_counts  # 변수명 호환성 유지
else:
    print("❌ '관할기관' 컬럼을 찾을 수 없습니다.")
    exit(1)

# 상위 7개 종만 선택
top7 = species_counts.head(7)

# 결과 출력
print(top7)

# 막대그래프 시각화 (건수 기준)
plt.figure(figsize=(10,6))
column_name = '관할기관' if '관할기관' in top7.columns else '종명'
plt.bar(top7[column_name], top7['건수'])
plt.title('관할기관별 발생 건수 (Top 7)', fontsize=16)
plt.xlabel('관할기관', fontsize=12)
plt.ylabel('건수', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()
