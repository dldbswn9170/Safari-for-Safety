import requests  # requests 모듈 임포트
from datetime import datetime

def download_file(file_url, save_path):
    with open(save_path, 'wb') as f: # 저장할 파일을 바이너리 쓰기 모드로 열기
        response = requests.get(file_url) # 파일 URL에 GET 요청 보내기
        f.write(response.content) # 응답의 내용을 파일에 쓰기

now = datetime.now()
now = now.strftime('%Y%m%d')  # 현재 날짜를 'YYYYMMDD' 형식으로 포맷팅
url = f'https://apihub.kma.go.kr/api/typ01/url/kma_sfcdd.php?tm={now}&stn=0&help=1&authKey=u49bQSWmQxKPW0ElpoMSXw'
save_file_path = 'output_file.csv'

# 파일 다운로드 함수를 호출합니다.
download_file(url, save_file_path)