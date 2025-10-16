"""
Module: weather_roadkill_merged
Description: 로드킬 데이터와 기상 관측소 데이터를 매칭하여 통합 데이터셋을 생성하는 스크립트.
"""

import warnings
from math import radians, cos, sin, asin, sqrt
from datetime import datetime
import pandas as pd
import numpy as np

warnings.filterwarnings("ignore")


def haversine_distance(lon1, lat1, lon2, lat2):
    """두 지점 간의 거리 계산 (하버사인 공식)"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371  # 지구 반지름 (km)
    return c * r


def find_nearest_station(roadkill_lat, roadkill_lon, stations_df):
    """로드킬 발생 위치에서 가장 가까운 관측소 찾기"""
    min_distance = float("inf")
    nearest_station = None

    for _, station in stations_df.iterrows():
        try:
            station_lat = float(station["위도"])
            station_lon = float(station["경도"])
            distance = haversine_distance(
                roadkill_lon, roadkill_lat, station_lon, station_lat
            )

            if distance < min_distance:
                min_distance = distance
                nearest_station = station
        except Exception:
            continue

    return nearest_station, min_distance


def parse_weather_line(line):
    """기상 데이터 한 줄을 파싱"""
    try:
        parts = line.strip().split(",")
        if len(parts) < 6:
            return None

        date = parts[0]
        station = parts[1]
        avg_temp = None
        rainfall = None

        # 평균기온 (3번째 컬럼)
        if len(parts) > 2 and parts[2] not in ["-9.0", ""]:
            try:
                temp_val = float(parts[2])
                if temp_val != -9.0:
                    avg_temp = temp_val
            except Exception:
                pass

        # 강수량 (5번째 컬럼)
        if len(parts) > 5 and parts[5] not in ["-9.0", ""]:
            try:
                rain_val = float(parts[5])
                if rain_val != -9.0:
                    rainfall = rain_val
            except Exception:
                pass

        return {"일자": date, "지점": station, "평균기온": avg_temp, "강수량": rainfall}
    except Exception:
        return None


def create_full_weather_dataset():
    """전체 로드킬 데이터에 대해 날씨 매핑 수행"""
    print("전체 로드킬-날씨 데이터셋 생성 시작...")

    # 1️⃣ 데이터 로드
    print("데이터 로드 중...")
    roadkill_df = pd.read_csv("data/raw/roadkill/roadkill_merged.csv")
    stations_df = pd.read_csv("data/raw/weather/weather_stations.csv")

    print(f"전체 로드킬 데이터: {len(roadkill_df):,}건")
    print(f"관측소 데이터: {len(stations_df):,}개")

    # 2️⃣ 운영 중인 관측소 수집
    operating_stations = set()
    for year in [2020, 2021, 2022]:
        try:
            with open(f"data/raw/weather/weather_{year}.csv", "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines[1:]:
                parts = line.strip().split(",")
                if len(parts) > 1:
                    operating_stations.add(parts[1])
        except FileNotFoundError:
            print(f"{year}년 기상 데이터 없음")

    operating_station_ids = {int(s) for s in operating_stations if s.isdigit()}
    print(f"사용할 관측소 개수: {len(operating_station_ids)}개")

    # 3️⃣ 기상 데이터 로드
    weather_data = []
    for year in [2020, 2021, 2022]:
        try:
            print(f"{year}년 기상 데이터 처리 중...")
            with open(f"data/raw/weather/weather_{year}.csv", "r", encoding="utf-8") as f:
                lines = f.readlines()

            for line in lines[1:]:
                parsed = parse_weather_line(line)
                if parsed:
                    weather_data.append(parsed)
        except FileNotFoundError:
            print(f"{year}년 기상 데이터 없음")

    weather_df = pd.DataFrame(weather_data)
    weather_df_valid = weather_df[weather_df["평균기온"].notna()]
    print(f"전체 기상 데이터: {len(weather_df_valid):,}행")

    # 4️⃣ 로드킬 데이터 전처리
    roadkill_df["접수일자"] = pd.to_datetime(roadkill_df["접수일자"])
    roadkill_df["GPS X"] = pd.to_numeric(roadkill_df["GPS X"], errors="coerce")
    roadkill_df["GPS Y"] = pd.to_numeric(roadkill_df["GPS Y"], errors="coerce")
    roadkill_df = roadkill_df.dropna(subset=["GPS X", "GPS Y"])

    print(f"좌표 유효 데이터: {len(roadkill_df):,}건")

    # 5️⃣ 매칭 수행
    matched_results = []

    for idx, row in roadkill_df.iterrows():
        if idx % 1000 == 0:
            print(f"진행률: {idx}/{len(roadkill_df)} ({idx / len(roadkill_df) * 100:.1f}%)")

        nearest_station, distance = find_nearest_station(
            row["GPS Y"], row["GPS X"], stations_df
        )

        if nearest_station is None:
            continue

        is_operating = nearest_station["지점번호"] in operating_station_ids
        date_str = row["접수일자"].strftime("%Y%m%d")
        station_num = str(int(nearest_station["지점번호"]))
        weather_info = None

        # 현재 관측소 날씨 시도
        if is_operating:
            weather_match = weather_df_valid[
                (weather_df_valid["지점"] == station_num)
                & (weather_df_valid["일자"] == date_str)
            ]
            if len(weather_match) > 0:
                weather_info = weather_match.iloc[0]

        # 운영 안 하거나 데이터 없으면 → 가장 가까운 운영 관측소로 대체
        if weather_info is None:
            nearest_operating_station = None
            min_operating_dist = float("inf")

            for _, s in stations_df.iterrows():
                try:
                    if int(s["지점번호"]) not in operating_station_ids:
                        continue
                    dist2 = haversine_distance(
                        row["GPS X"], row["GPS Y"], s["경도"], s["위도"]
                    )
                    if dist2 < min_operating_dist:
                        min_operating_dist = dist2
                        nearest_operating_station = s
                except Exception:
                    continue

            if nearest_operating_station is not None:
                alt_station_num = str(int(nearest_operating_station["지점번호"]))
                alt_match = weather_df_valid[
                    (weather_df_valid["지점"] == alt_station_num)
                    & (weather_df_valid["일자"] == date_str)
                ]
                if len(alt_match) > 0:
                    weather_info = alt_match.iloc[0]
                    nearest_station = nearest_operating_station
                    distance = min_operating_dist
                    is_operating = True

        # 결과 저장
        matched_results.append({
            "일련번호": row["일련번호"],
            "접수일자": row["접수일자"],
            "관할기관": row["관할기관"],
            "로드킬_위도": row["GPS Y"],
            "로드킬_경도": row["GPS X"],
            "가까운_관측소_번호": nearest_station["지점번호"],
            "가까운_관측소_이름": nearest_station["지점명"],
            "거리_km": round(distance, 2),
            "관측소_운영여부": is_operating,
            "평균기온": weather_info["평균기온"] if weather_info is not None else None,
            "강수량": weather_info["강수량"] if weather_info is not None else None
        })

    # 6️⃣ 결과 저장
    result_df = pd.DataFrame(matched_results)
    output_path = "data/processed/roadkill_with_weather_full.csv"
    result_df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"\n✅ 전체 매칭 완료! ({len(result_df):,}건)")
    print(f"저장 위치: {output_path}")
    print(f"- 평균 거리: {result_df['거리_km'].mean():.2f}km")
    print(f"- 날씨 데이터 매칭률: {result_df['평균기온'].notna().mean() * 100:.1f}%")

    return result_df


if __name__ == "__main__":
    create_full_weather_dataset()
