import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# ==========================
# 1️⃣ 데이터 불러오기
# ==========================
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
csv_path = os.path.join(BASE_DIR, 'data', 'processed', 'roadkill_data.csv')

if not os.path.exists(csv_path):
    print(f"❌ 파일을 찾을 수 없습니다: {csv_path}")
    print(f"현재 작업 디렉토리: {os.getcwd()}")
    exit(1)

df = pd.read_csv(csv_path, encoding='utf-8-sig')

# ==========================
# 2️⃣ 날짜 파싱
# ==========================
df["접수일자"] = pd.to_datetime(df["접수일자"], errors="coerce")

# ==========================
# 3️⃣ 월별 집계
# ==========================
df["년월"] = df["접수일자"].dt.to_period("M").dt.to_timestamp()
monthly_counts = df.groupby("년월").size().reset_index(name="로드킬건수")

# ==========================
# 4️⃣ 한글 폰트 설정 (환경에 맞게 수정 가능)
# ==========================
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

# ==========================
# 5️⃣ 시각화
# ==========================
plt.figure(figsize=(10, 5))
plt.plot(monthly_counts["년월"], monthly_counts["로드킬건수"], marker="o", linewidth=2)
plt.title("월별 로드킬 발생 추이", fontsize=14)
plt.xlabel("연-월")
plt.ylabel("건수")
plt.grid(True, linestyle="--", alpha=0.5)
plt.tight_layout()

# ==========================
# 6️⃣ 파일 저장 (옵션)
# ==========================
plt.savefig("roadkill_monthly_plot.png", dpi=300)
plt.show()

print("그래프가 'roadkill_monthly_plot.png' 파일로 저장되었습니다.")
