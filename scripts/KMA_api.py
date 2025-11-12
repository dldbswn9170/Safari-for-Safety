"""
Module: kma_data_api
Description: 기상청 일자료 데이터를 API로부터 다운로드하고 단일 CSV로 저장하는 스크립트.
"""

import os
from datetime import datetime, timedelta
import requests


# ✅ 기상청 일자료 표준 컬럼 전체 
HEADER = (
    "관측일,지점번호,일평균풍속,일풍정,최대풍향,최대풍속,최대풍속시각,최대순간풍향,최대순간풍속,최대순간풍속시각,일평균기온,최고기온,"
    "최고기온시각,최저기온,최저기온시각,일평균이슬점온도,일평균지면온도,일최저초상온도,일평균상대습도,최저습도,최저습도시각,"
    "일평균수증기압,소형증발량,대형증발량,안개계속시간,일평균현지기압,일평균해면기압,최고해면기압,최고해면기압시각,최저해면기압,"
    "최저해면기압시각,일평균전운량,일조합,가조시간,캄벨일조,일사합,최대1시간일사,최대1시간일사시각,일강수량,9-9강수량,강수계속시간,"
    "1시간최다강수량,1시간최다강수량시각,10분최다강수량,10분최다강수량시각,최대강우강도,최대강우강도시각,최심신적설,최심신적설시각,"
    "최심적설,최심적설시각,0.5m지중온도,1.0m지중온도,1.5m지중온도,3.0m지중온도,5.0m지중온도\n"
)


def extract_data_only(raw_bytes):
    """원본 응답에서 데이터 행만 추출"""
    text = raw_bytes.decode("utf-8", errors="ignore")
    lines = text.splitlines()
    data_lines = [
        line for line in lines
        if len(line) >= 9 and line[:8].isdigit() and line[8] == ","
    ]
    return "\n".join(data_lines).encode("utf-8")


def download_file(file_url):
    """URL에서 파일 다운로드"""
    response = requests.get(file_url)
    response.raise_for_status()
    return response.content


def download_weather_data():
    """기상청 API에서 데이터를 다운로드하고 단일 CSV로 저장"""
    start_date = datetime(2020, 8, 1)
    end_date = datetime(2022, 6, 30)
    output_dir = "data/raw/weather"
    os.makedirs(output_dir, exist_ok=True)

    save_path = os.path.join(output_dir, "weather_data.csv")

    with open(save_path, "wb") as f:
        f.write(HEADER.encode("utf-8"))  # CSV 헤더 작성

        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime("%Y%m%d")
            print(f"Downloading {date_str}...")

            url = (
                f"https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?"
                f"tm={date_str}&stn=0&help=1&authKey=u49bQSWmQxKPW0ElpoMSXw"
            )

            try:
                content = download_file(url)
                data_only = extract_data_only(content)
                if data_only.strip():
                    f.write(data_only)
                    if not data_only.endswith(b"\n"):
                        f.write(b"\n")
            except Exception as e:
                print(f"❌ Error downloading {date_str}: {e}")

            current_date += timedelta(days=1)

    print(f"✅ All data saved to {save_path}")


if __name__ == "__main__":
    download_weather_data()
