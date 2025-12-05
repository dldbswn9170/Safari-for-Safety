from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

# Flask 앱 생성
app = Flask(__name__)
CORS(app)

# ✅ 프로젝트 루트 기준으로 CSV 파일 경로 지정
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend 상위 폴더
data_path = os.path.join(BASE_DIR, "data", "processed", "roadkill_data.csv")


@app.route('/api/roadkill')
def get_roadkill_data():
    try:
        # CSV 파일 읽기
        df = pd.read_csv(data_path, encoding='utf-8-sig')

        # ✅ NaN → None (JSON 변환 시 오류 방지)
        df = df.where(pd.notnull(df), None)

        # JSON 형식으로 변환
        data = df.to_dict(orient='records')
        return jsonify(data)

    except FileNotFoundError:
        return jsonify({"error": f"파일을 찾을 수 없습니다: {data_path}"}), 404
    except Exception as e:
        print(f"[❌ Error] {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Flask 서버 실행
    app.run(debug=True, host='0.0.0.0', port=5000)
