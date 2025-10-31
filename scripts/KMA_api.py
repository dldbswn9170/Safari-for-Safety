"""
KMA API 샘플 코드 - 새로운 형식
기상청 API에서 데이터를 받아서 CSV로 변환
"""
import os
from pathlib import Path
import requests
import pandas as pd
from io import StringIO

def download_weather_csv(url, save_path):
    # 1️⃣ 데이터 요청
    response = requests.get(url)
    response.encoding = 'utf-8'

    if response.status_code != 200:
        print(f"❌ 요청 실패: {response.status_code}")
        return

    text = response.text

    # 2️⃣ 데이터 부분만 추출 (#START7777 이후의 숫자 데이터부터)
    start_idx = text.find("#START7777")
    if start_idx != -1:
        text = text[start_idx:]
    lines = text.splitlines()

    # 3️⃣ 실제 데이터 라인만 추출 (숫자로 시작하는 줄만)
    data_lines = [line for line in lines if line.strip() and line[0].isdigit()]

    # 4️⃣ DataFrame으로 변환
    data_str = "\n".join(data_lines)
    df = pd.read_csv(StringIO(data_str), delim_whitespace=True, header=None)

    # 5️⃣ 컬럼명 한글 지정
    korean_columns = [
        "날짜", "지점번호", "평균풍속(m/s)", "일풍정(m)", "최대풍향", "최대풍속(m/s)",
        "최대풍속시각", "최대순간풍향", "최대순간풍속(m/s)", "최대순간풍속시각",
        "평균기온(°C)", "최고기온(°C)", "최고기온시각", "최저기온(°C)", "최저기온시각",
        "평균이슬점온도(°C)", "평균지면온도(°C)", "최저초상온도(°C)",
        "평균상대습도(%)", "최저습도(%)", "최저습도시각",
        "평균수증기압(hPa)", "소형증발량(mm)", "대형증발량(mm)",
        "안개계속시간(hr)", "평균현지기압(hPa)", "평균해면기압(hPa)",
        "최고해면기압(hPa)", "최고해면기압시각", "최저해면기압(hPa)", "최저해면기압시각",
        "평균전운량(1/10)", "일조합(hr)", "가조시간(hr)", "캄벨일조(hr)",
        "일사합(MJ/m²)", "최대1시간일사(MJ/m²)", "최대1시간일사시각",
        "일강수량(mm)", "9-9강수량(mm)", "강수계속시간(hr)",
        "1시간최다강수량(mm)", "1시간최다강수량시각",
        "10분최다강수량(mm)", "10분최다강수량시각",
        "최대강우강도(mm/h)", "최대강우강도시각",
        "최심신적설(cm)", "최심신적설시각", "최심적설(cm)", "최심적설시각",
        "지중온도(0.5m,°C)", "지중온도(1.0m,°C)", "지중온도(1.5m,°C)",
        "지중온도(3.0m,°C)", "지중온도(5.0m,°C)"
    ]

    df.columns = korean_columns[:len(df.columns)]

    # 6️⃣ CSV로 저장
    df.to_csv(save_path, index=False, encoding='utf-8-sig')
    print(f"✅ CSV 저장 완료: {save_path}")

def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and key not in os.environ:
            os.environ[key] = value


def build_kma_url(api_key: str, tm1: str = "20200101", tm2: str = "20221231", stn: str = "108", help_flag: str = "1") -> str:
    base = "https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd3.php"
    return f"{base}?tm1={tm1}&tm2={tm2}&stn={stn}&help={help_flag}&authKey={api_key}"


if __name__ == "__main__":
    # 1) .env 로드 (존재 시)
    project_root = Path(__file__).resolve().parents[2]
    load_env_file(project_root / ".env")

    # 2) 환경변수에서 API 키 읽기
    api_key = os.getenv("KMA_API_KEY")
    if not api_key:
        raise RuntimeError("환경변수 KMA_API_KEY 가 설정되지 않았습니다. 프로젝트 루트에 .env 파일을 만들고 KMA_API_KEY=... 로 설정하세요.")

    # 3) URL 구성 및 실행 예시
    url = build_kma_url(api_key=api_key, tm1="20200101", tm2="20221231", stn="108", help_flag="1")
    save_path = "data/raw/weather/weather_data.csv"
    download_weather_csv(url, save_path)