import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ====== 한글 폰트 설정 ======
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# ====== 1️⃣ 데이터 불러오기 ======
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

roadkill_path = os.path.join(BASE_DIR, 'data', 'processed', 'roadkill_data.csv')
weather_path = os.path.join(BASE_DIR, 'data', 'processed', 'weather_data.csv')

if not os.path.exists(roadkill_path):
    print(f"❌ 파일을 찾을 수 없습니다: {roadkill_path}")
    exit(1)
if not os.path.exists(weather_path):
    print(f"❌ 파일을 찾을 수 없습니다: {weather_path}")
    exit(1)

roadkill = pd.read_csv(roadkill_path, encoding='utf-8-sig')
weather = pd.read_csv(weather_path, encoding='utf-8-sig')

# ====== 2️⃣ 날짜 형식 통일 ======
roadkill['접수일자'] = pd.to_datetime(roadkill['접수일자'])
weather['일자'] = pd.to_datetime(weather['일자'].astype(str))

# ====== 3️⃣ 날짜별 로드킬 건수 집계 ======
daily_roadkill = (
    roadkill.groupby('접수일자')
    .size()
    .reset_index(name='로드킬_건수')
)

# ====== 4️⃣ 병합 ======
merged = pd.merge(
    daily_roadkill,
    weather,
    left_on='접수일자',
    right_on='일자',
    how='inner'
)

# ====== 5️⃣ (첫 번째) 상관계수 그래프 ======
corr = merged[['로드킬_건수', '일평균기온', '강수량', '일평균풍속', '일조시간', '전운량', '강수계속시간', '습도']].corr()
corr_target = corr['로드킬_건수'].drop('로드킬_건수').sort_values(ascending=False)

plt.figure(figsize=(8,5))
sns.barplot(x=corr_target.values, y=corr_target.index, palette="viridis")
plt.title("로드킬 발생 건수와 날씨 변수 간 상관계수", fontsize=14)
plt.xlabel("상관계수 (Correlation)")
plt.ylabel("날씨 변수")
plt.grid(axis='x', linestyle='--', alpha=0.6)
plt.tight_layout()
plt.show()

print("📊 로드킬 건수와 날씨 변수 간 상관계수:")
print(corr_target)
print("\n")

# ====== 6️⃣ (세 번째) 기온 구간별 평균 분석 ======

# 🌡️ 기온 구간 설정 (4단계)
bins = [-50, 0, 16, 32, 50]
labels = ['0℃ 미만', '0~16℃', '16~32℃', '32℃ 이상']
merged['기온구간'] = pd.cut(merged['일평균기온'], bins=bins, labels=labels)

# 구간별 평균 로드킬 계산
temp_group = merged.groupby('기온구간')['로드킬_건수'].mean().reset_index()

# ① 기온 구간별 평균 막대그래프
plt.figure(figsize=(6,4))
sns.barplot(data=temp_group, x='기온구간', y='로드킬_건수', palette="coolwarm")
plt.title("기온 구간별 평균 로드킬 건수", fontsize=13)
plt.xlabel("기온 구간")
plt.ylabel("평균 로드킬 건수")
plt.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()

