"""
Module: weather_roadkill_merged
Description: 로드킬 데이터와 기상 관측소 데이터를 매칭하여 통합 데이터셋을 생성하는 스크립트.
"""

import warnings
from math import radians, cos, sin, asin, sqrt
from datetime import datetime
import pandas as pd
import numpy as np
import time

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
    """기상 데이터 한 줄을 파싱
    - 필드: 일자, 지점, 일평균기온, 강수량, 일평균풍속, 일조시간, 전운량, 강수계속시간, 습도
    - 결측 처리: 강수량 결측은 0으로 처리, 그 외 결측은 None
    """
    try:
        # CSV 형식 (comma-separated)
        parts = line.strip().split(",")
        if len(parts) < 42:
            return None

        date = parts[0].strip()
        station = parts[1].strip()
        avg_temp = None
        rainfall = 0.0  # 결측 시 0 처리
        avg_wind = None
        sunshine_hours = None
        total_cloud_amount = None
        precipitation_duration = None
        humidity = None

        # 일평균기온 (index 10: "평균기온(°C)")
        if len(parts) > 10 and parts[10] not in ["", "-9.0", "-9.00"]:
            try:
                avg_temp = float(parts[10])
            except (ValueError, IndexError):
                pass

        # 일평균풍속 (index 2: "평균풍속(m/s)")
        if len(parts) > 2 and parts[2] not in ["", "-9.0", "-9.00"]:
            try:
                avg_wind = float(parts[2])
            except (ValueError, IndexError):
                pass

        # 일조시간 (index 32: "일조합(hr)")
        if len(parts) > 32 and parts[32] not in ["", "-9.0", "-9.00"]:
            try:
                sunshine_hours = float(parts[32])
            except (ValueError, IndexError):
                pass

        # 전운량 (index 31: "평균전운량(1/10)")
        if len(parts) > 31 and parts[31] not in ["", "-9.0", "-9.00"]:
            try:
                total_cloud_amount = float(parts[31])
            except (ValueError, IndexError):
                pass

        # 강수계속시간 (index 40: "강수계속시간(hr)")
        if len(parts) > 40 and parts[40] not in ["", "-9.0", "-9.00"]:
            try:
                precipitation_duration = float(parts[40])
            except (ValueError, IndexError):
                pass

        # 습도 (index 18: "평균상대습도(%)")
        if len(parts) > 18 and parts[18] not in ["", "-9.0", "-9.00"]:
            try:
                humidity = float(parts[18])
            except (ValueError, IndexError):
                pass

        # 일강수량 (index 38: "일강수량(mm)") → 결측치 0 처리
        if len(parts) > 38 and parts[38] not in ["", "-9", "-9.0", "-9.00"]:
            try:
                rainfall = float(parts[38])
            except (ValueError, IndexError):
                pass

        # 날짜 포맷 통일 (YYYYMMDD)
        date = date.replace("-", "").strip()

        return {
            "일자": date,
            "지점": station,
            "일평균기온": avg_temp,
            "강수량": rainfall,
            "일평균풍속": avg_wind,
            "일조시간": sunshine_hours,
            "전운량": total_cloud_amount,
            "강수계속시간": precipitation_duration,
            "습도": humidity
        }
    except Exception:
        return None


def create_full_weather_dataset():
    """전체 로드킬 데이터에 대해 날씨 매핑 수행"""
    print("전체 로드킬-날씨 데이터셋 생성 시작...")

    # 1️⃣ 데이터 로드
    print("데이터 로드 중...")
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    roadkill_path = os.path.join(BASE_DIR, "data", "raw", "roadkill", "roadkill_merged.csv")
    stations_path = os.path.join(BASE_DIR, "data", "raw", "weather", "weather_stations.csv")
    
    if not os.path.exists(roadkill_path):
        print(f"❌ 파일을 찾을 수 없습니다: {roadkill_path}")
        return None, None, None
    if not os.path.exists(stations_path):
        print(f"❌ 파일을 찾을 수 없습니다: {stations_path}")
        return None, None, None
    
    roadkill_df = pd.read_csv(roadkill_path, encoding='utf-8-sig')
    stations_df = pd.read_csv(stations_path, encoding='utf-8-sig')

    print(f"전체 로드킬 데이터: {len(roadkill_df):,}건")
    print(f"관측소 데이터: {len(stations_df):,}개")

    # 2️⃣ 운영 중인 관측소 수집
    operating_stations = set()
    try:
        # 모든 년도 데이터가 하나의 파일에 저장 (CSV 형식)
        weather_data_path = os.path.join(BASE_DIR, "data", "raw", "weather", "weather_data.csv")
        with open(weather_data_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for line in lines[1:]:  # 첫 줄은 헤더
            parts = line.strip().split(",")
            if len(parts) > 1:
                operating_stations.add(parts[1])
    except FileNotFoundError:
        print("기상 데이터 파일 없음")

    operating_station_ids = {int(s) for s in operating_stations if s.isdigit()}
    print(f"사용할 관측소 개수: {len(operating_station_ids)}개")

    # 3️⃣ 기상 데이터 로드
    weather_data = []
    try:
        print("기상 데이터 처리 중...")
        weather_data_path = os.path.join(BASE_DIR, "data", "raw", "weather", "weather_data.csv")
        with open(weather_data_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        for line in lines[1:]:  # 첫 줄은 헤더
            parsed = parse_weather_line(line)
            if parsed:
                weather_data.append(parsed)
    except FileNotFoundError:
        print("기상 데이터 파일 없음")

    weather_df = pd.DataFrame(weather_data)
    weather_df["지점"] = weather_df["지점"].astype(str).str.strip().str.replace(".0", "", regex=False)
    weather_df_valid = weather_df[weather_df["일평균기온"].notna()]
    print(f"전체 기상 데이터: {len(weather_df_valid):,}행")

    # 4️⃣ 로드킬 데이터 전처리
    roadkill_df["접수일자"] = pd.to_datetime(roadkill_df["접수일자"])
    roadkill_df["GPS X"] = pd.to_numeric(roadkill_df["GPS X"], errors="coerce")
    roadkill_df["GPS Y"] = pd.to_numeric(roadkill_df["GPS Y"], errors="coerce")
    roadkill_df = roadkill_df.dropna(subset=["GPS X", "GPS Y"])

    print(f"좌표 유효 데이터: {len(roadkill_df):,}건")

    # 5️⃣ 매칭 수행
    roadkill_results = []
    weather_dict = {}  # 중복 제거
    matching_results = []
    last_print_time = time.time()  # 마지막 출력 시간
    
    for idx, row in roadkill_df.iterrows():
        # 1분(60초)마다 진행률 출력
        current_time = time.time()
        if current_time - last_print_time >= 20:
            print(f"진행률: {idx}/{len(roadkill_df)} ({idx / len(roadkill_df) * 100:.1f}%)")
            last_print_time = current_time

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

        # 로드킬 데이터 저장 (생성 ID 제거, 원본 키 포함)
        roadkill_results.append({
            "일련번호": row["일련번호"],
            "접수일자": row["접수일자"],
            "접수시각": row["접수시각"],
            "관할기관": row["관할기관"],
            "위도": row["GPS Y"],
            "경도": row["GPS X"]
        })
        
        # 날씨 데이터 저장 (중복 제거)
        if weather_info is not None:
            weather_id = f"{nearest_station['지점번호']}_{date_str}"
            if weather_id not in weather_dict:
                weather_dict[weather_id] = {
                    "지점번호": nearest_station["지점번호"],
                    "지점명": nearest_station["지점명"],
                    "일자": date_str,
                    "일평균기온": weather_info["일평균기온"],
                    "강수량": weather_info["강수량"],
                    "일평균풍속": weather_info.get("일평균풍속"),
                    "일조시간": weather_info.get("일조시간"),
                    "전운량": weather_info.get("전운량"),
                    "강수계속시간": weather_info.get("강수계속시간"),
                    "습도": weather_info.get("습도")
                }
            
            # 매칭 테이블 저장 (생성 ID 제거, 원본 키 사용)
            matching_results.append({
                "일련번호": row["일련번호"],
                "지점번호": int(nearest_station["지점번호"]),
                "접수일자": date_str,
                "접수시각": row["접수시각"],
                "거리_km": round(distance, 2),
                "관측소_운영여부": is_operating
            })

    # 6️⃣ 결과 저장 (완전 분리)
    roadkill_df_result = pd.DataFrame(roadkill_results)
    weather_df_result = pd.DataFrame(list(weather_dict.values()))
    matching_df_result = pd.DataFrame(matching_results)
    
    # 저장 경로 설정
    processed_dir = os.path.join(BASE_DIR, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    roadkill_output_path = os.path.join(processed_dir, "roadkill_data.csv")
    roadkill_df_result.to_csv(roadkill_output_path, index=False, encoding="utf-8-sig")
    
    weather_output_path = os.path.join(processed_dir, "weather_data.csv")
    weather_df_result.to_csv(weather_output_path, index=False, encoding="utf-8-sig")
    
    matching_output_path = os.path.join(processed_dir, "roadkill_weather_matching.csv")
    matching_df_result.to_csv(matching_output_path, index=False, encoding="utf-8-sig")

    print(f"\n완료!")
    print(f"로드킬 데이터: {len(roadkill_df_result):,}건 - {roadkill_output_path}")
    print(f"날씨 데이터: {len(weather_df_result):,}건 - {weather_output_path}")
    print(f"매칭 테이블: {len(matching_df_result):,}건 - {matching_output_path}")
    print(f"- 평균 거리: {matching_df_result['거리_km'].mean():.2f}km")
    print(f"- 날씨 매칭률: {len(matching_results)/len(roadkill_results)*100:.1f}% ({len(matching_results)}/{len(roadkill_results)}건)")

    return roadkill_df_result, weather_df_result, matching_df_result


if __name__ == "__main__":
    create_full_weather_dataset()
