"""
Module: missing_analysis
Description: 로드킬 데이터의 결측치 분석을 수행하는 모듈
"""

import pandas as pd


def analyze_missing_values(file_path="data/raw/roadkill/roadkill_merged.csv"):
    """로드킬 데이터의 결측치 현황을 분석"""
    df = pd.read_csv(file_path)

    print("=" * 60)
    print("🚧 로드킬 데이터 결측치 분석")
    print("=" * 60)
    print(f"데이터 크기: {df.shape[0]:,}행 × {df.shape[1]}열")

    print("\n결측치 현황:")
    print(f"전체 결측치: {df.isnull().sum().sum():,}개")

    for col in df.columns:
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            print(f" - {col}: {missing_count:,}개")

    missing_rows = df.isnull().any(axis=1).sum()
    print(f"\n결측치가 있는 행: {missing_rows:,}개")
    print("\n✅ 결측치 분석 완료!")

    return df


if __name__ == "__main__":
    file_path = "data/raw/roadkill/roadkill_merged.csv"
    analyze_missing_values(file_path)
