import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

print("=" * 50)
print("데이터 분석 시작")
print("=" * 50)

# 1. 로드킬 데이터 분석
print("\n1. 로드킬 데이터 분석")
print("-" * 30)

# 로드킬 데이터 로드
roadkill_df = pd.read_csv("Data/merged_roadkill_data.csv")

print(f"로드킬 데이터 크기: {roadkill_df.shape}")
print(f"컬럼: {list(roadkill_df.columns)}")

# 기본 정보
print(f"\n로드킬 데이터 기본 정보:")
print(f"- 총 신고 건수: {len(roadkill_df):,}건")
print(f"- 데이터 기간: {roadkill_df['접수일자'].min()} ~ {roadkill_df['접수일자'].max()}")

# 날짜 변환
roadkill_df['접수일자'] = pd.to_datetime(roadkill_df['접수일자'])
roadkill_df['년도'] = roadkill_df['접수일자'].dt.year
roadkill_df['월'] = roadkill_df['접수일자'].dt.month
roadkill_df['요일'] = roadkill_df['접수일자'].dt.day_name()

# 시간 변환 (접수시각 컬럼 처리)
def extract_hour(time_str):
    try:
        if ':' in str(time_str):
            return int(str(time_str).split(':')[0])
        return 0
    except:
        return 0

roadkill_df['시간'] = roadkill_df['접수시각'].apply(extract_hour)

# 지역별 분석
print(f"\n지역별 로드킬 발생 현황 (상위 10개):")
region_counts = roadkill_df['관할기관'].value_counts().head(10)
print(region_counts)

# 월별 분석
print(f"\n월별 로드킬 발생 현황:")
monthly_counts = roadkill_df['월'].value_counts().sort_index()
print(monthly_counts)

# 시간대별 분석
print(f"\n시간대별 로드킬 발생 현황:")
hourly_counts = roadkill_df['시간'].value_counts().sort_index()
print(hourly_counts)

# 시각화
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 1. 지역별 로드킬 발생 현황
region_counts.head(10).plot(kind='bar', ax=axes[0,0], color='skyblue')
axes[0,0].set_title('지역별 로드킬 발생 현황 (상위 10개)')
axes[0,0].set_xlabel('관할기관')
axes[0,0].set_ylabel('발생 건수')
axes[0,0].tick_params(axis='x', rotation=45)

# 2. 월별 로드킬 발생 현황
monthly_counts.plot(kind='line', ax=axes[0,1], marker='o', color='red')
axes[0,1].set_title('월별 로드킬 발생 현황')
axes[0,1].set_xlabel('월')
axes[0,1].set_ylabel('발생 건수')
axes[0,1].grid(True, alpha=0.3)

# 3. 시간대별 로드킬 발생 현황
hourly_counts.plot(kind='bar', ax=axes[1,0], color='green', alpha=0.7)
axes[1,0].set_title('시간대별 로드킬 발생 현황')
axes[1,0].set_xlabel('시간')
axes[1,0].set_ylabel('발생 건수')

# 4. 요일별 로드킬 발생 현황
weekday_counts = roadkill_df['요일'].value_counts()
weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
weekday_counts = weekday_counts.reindex(weekday_order)
weekday_counts.plot(kind='bar', ax=axes[1,1], color='orange')
axes[1,1].set_title('요일별 로드킬 발생 현황')
axes[1,1].set_xlabel('요일')
axes[1,1].set_ylabel('발생 건수')
axes[1,1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

