"""
Module: roadkill_analysis
Description: 로드킬 데이터의 시간·공간적 특성 분석 및 시각화를 수행하는 모듈
"""

import warnings
import pandas as pd
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

# 한글 폰트 설정
plt.rcParams["font.family"] = "Malgun Gothic"
plt.rcParams["axes.unicode_minus"] = False


def extract_hour(time_str):
    """시각 문자열에서 시(hour)만 추출"""
    try:
        if ":" in str(time_str):
            return int(str(time_str).split(":")[0])
        return 0
    except Exception:
        return 0


def analyze_roadkill_data(file_path="data/raw/roadkill/roadkill_merged.csv", show_plot=True):
    """로드킬 데이터의 기본 통계 및 시각화 수행 (터미널 출력 없음)"""
    roadkill_df = pd.read_csv(file_path)

    # 날짜 및 시각 처리
    roadkill_df["접수일자"] = pd.to_datetime(roadkill_df["접수일자"], errors="coerce")
    roadkill_df["년도"] = roadkill_df["접수일자"].dt.year
    roadkill_df["월"] = roadkill_df["접수일자"].dt.month
    roadkill_df["요일"] = roadkill_df["접수일자"].dt.day_name()
    roadkill_df["시간"] = roadkill_df["접수시각"].apply(extract_hour)

    # 그룹 통계
    region_counts = roadkill_df["관할기관"].value_counts().head(10)
    monthly_counts = roadkill_df["월"].value_counts().sort_index()
    hourly_counts = roadkill_df["시간"].value_counts().sort_index()
    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday_counts = roadkill_df["요일"].value_counts().reindex(weekday_order)

    # 시각화
    if show_plot:
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))

        region_counts.plot(kind="bar", ax=axes[0, 0], color="skyblue")
        axes[0, 0].set_title("지역별 로드킬 발생 현황 (상위 10개)")
        axes[0, 0].set_xlabel("관할기관")
        axes[0, 0].set_ylabel("발생 건수")
        axes[0, 0].tick_params(axis="x", rotation=45)

        monthly_counts.plot(kind="line", ax=axes[0, 1], marker="o", color="red")
        axes[0, 1].set_title("월별 로드킬 발생 현황")
        axes[0, 1].set_xlabel("월")
        axes[0, 1].set_ylabel("발생 건수")
        axes[0, 1].grid(True, alpha=0.3)

        hourly_counts.plot(kind="bar", ax=axes[1, 0], color="green", alpha=0.7)
        axes[1, 0].set_title("시간대별 로드킬 발생 현황")
        axes[1, 0].set_xlabel("시간")
        axes[1, 0].set_ylabel("발생 건수")

        weekday_counts.plot(kind="bar", ax=axes[1, 1], color="orange")
        axes[1, 1].set_title("요일별 로드킬 발생 현황")
        axes[1, 1].set_xlabel("요일")
        axes[1, 1].set_ylabel("발생 건수")
        axes[1, 1].tick_params(axis="x", rotation=45)

        plt.tight_layout()
        plt.show()

    return roadkill_df


if __name__ == "__main__":
    file_path = "data/raw/roadkill/roadkill_merged.csv"
    analyze_roadkill_data(file_path)
