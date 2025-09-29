import pandas as pd

# 데이터 로드
df = pd.read_csv("Data/merged_roadkill_data.csv")

print("=" * 50)
print("로드킬 데이터 결측치 분석")
print("=" * 50)

# 기본 정보
print(f"데이터 크기: {df.shape[0]:,}행 × {df.shape[1]}열")

# 결측치 확인
print(f"\n결측치 현황:")
print(f"전체: {df.isnull().sum().sum():,}개")

# 컬럼별 결측치
for col in df.columns:
    missing = df[col].isnull().sum()
    if missing > 0:
        print(f"{col}: {missing:,}개")
    else:
        print(f"{col}: 없음")

# 결측치가 있는 행
missing_rows = df.isnull().any(axis=1).sum()
print(f"\n결측치가 있는 행: {missing_rows:,}개")

print("\n분석 완료!")
