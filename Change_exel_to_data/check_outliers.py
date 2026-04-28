import pandas as pd
import json

# 1. Load dữ liệu từ file JSON hoặc biến dữ liệu
# Giả sử fen đã lưu dữ liệu vào file 'foods.json'
with open('nutrition_final_with_category.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# --- BƯỚC 1: TÍNH TOÁN Q1, Q3 VÀ IQR ---
# Tính Quartile 1 (mốc 25%)
Q1 = df['calories'].quantile(0.25)

# Tính Quartile 3 (mốc 75%)
Q3 = df['calories'].quantile(0.75)

# Tính IQR (Khoảng cách giữa Q3 và Q1)
IQR = Q3 - Q1

print(f"Quartile 1 (Q1): {Q1}")
print(f"Quartile 3 (Q3): {Q3}")
print(f"Chỉ số IQR: {IQR}")

# --- BƯỚC 2: XÁC ĐỊNH NGƯỠNG NGOẠI LAI (OUTLIERS) ---
# Theo công thức chuẩn: 1.5 lần IQR
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

print(f"Ngưỡng dưới (Lower Bound): {lower_bound}")
print(f"Ngưỡng trên (Upper Bound): {upper_bound}")

# --- BƯỚC 3: TÌM VÀ IN CÁC DÒNG NGOẠI LAI ---
outliers = df[(df['calories'] < lower_bound) | (df['calories'] > upper_bound)]

print("\n--- DANH SÁCH CÁC MÓN ĂN NGOẠI LAI ---")
if outliers.empty:
    print("Không có món nào là ngoại lai. Dữ liệu rất sạch!")
else:
    # Chỉ in ra tên và lượng calo của các món bị coi là bất thường
    print(outliers[['stt', 'name', 'calories']])