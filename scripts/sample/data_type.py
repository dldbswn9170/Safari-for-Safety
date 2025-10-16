import numpy as np
import pandas as pd                 


print("=============================================================")
print("로드킬 데이터의 전체 데이터 타입 확인")
print("=============================================================")
roadkill_df = pd.read_csv("data/raw/roadkill/roadkill_merged.csv")
print(roadkill_df.dtypes)
print(roadkill_df.info())
print(roadkill_df.head(3))

print("=============================================================")
print("기상 데이터의 전체 데이터 타입 확인")
print("=============================================================")

year = [2020, 2021, 2022]
weather_df_2020 = pd.read_csv("data/raw/weather/weather_2020.csv")
weather_df_2021 = pd.read_csv("data/raw/weather/weather_2021.csv")
weather_df_2022 = pd.read_csv("data/raw/weather/weather_2022.csv")
weather_df = pd.concat([weather_df_2020, weather_df_2021, weather_df_2022], ignore_index=True)

print(weather_df.dtypes)
print(weather_df.info())
print(weather_df.head(3))


