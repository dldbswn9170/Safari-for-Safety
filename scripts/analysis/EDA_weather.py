import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# -------------------------------
# 1️⃣ 데이터 불러오기 및 준비
# -------------------------------
weather_df = pd.read_csv('data/processed/weather_data.csv', encoding='utf-8')

if '일자' in weather_df.columns:
    weather_df.rename(columns={'일자': '날짜'}, inplace=True)
weather_df['날짜'] = pd.to_datetime(weather_df['날짜'], errors='coerce')

num_df = weather_df.select_dtypes(include='number').dropna()

# -------------------------------
# 2️⃣ 상관계수 계산
# -------------------------------
corr = num_df.corr()

# 특정 기준 이상만 추출 (|r| > 0.5)
strong_pairs = []
for i in corr.columns:
    for j in corr.columns:
        if i != j and abs(corr.loc[i, j]) > 0.5:
            strong_pairs.append((i, j, corr.loc[i, j]))

# 중복 제거
unique_pairs = set()
for a, b, r in strong_pairs:
    pair = tuple(sorted([a, b]))  # 정렬 후 튜플로 저장
    unique_pairs.add((pair[0], pair[1], r))
strong_pairs = list(unique_pairs)

print("📈 상관계수 |r| > 0.5 인 변수쌍:")
for a, b, r in strong_pairs:
    print(f"{a} ↔ {b} : {r:.2f}")

# -------------------------------
# 3️⃣ 시각화 (회귀선 + 산점도)
# -------------------------------
for a, b, r in strong_pairs:
    plt.figure(figsize=(6, 5))
    sns.regplot(x=a, y=b, data=num_df, scatter_kws={'alpha':0.3}, line_kws={'color': 'red'})
    plt.title(f"{a} vs {b} (r = {r:.2f})")
    plt.xlabel(a)
    plt.ylabel(b)
    plt.tight_layout()
    plt.show()
