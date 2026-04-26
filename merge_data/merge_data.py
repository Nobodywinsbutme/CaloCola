import pandas as pd
import re

# Đọc 2 file dữ liệu
df_cal = pd.read_csv('calorie_infos.csv')
df_daily = pd.read_csv('daily_food_nutrition_dataset.csv')

# --- BƯỚC 1: LỌC CỘT VÀ ĐỔI TÊN CHO KHỚP NHAU ---

# Xử lý Bảng 1: calorie_info
df1 = df_cal[['food_category', 'food_name', 'per_100_ml_or_gm', 'cal_per_100_ml_or_gms']].copy()
df1.columns = ['Category', 'Food_Name', 'Serving_Size', 'Calories']
# Vì bảng này thiếu Macros, ta thêm cột với giá trị mặc định là 0 để ráp không bị lỗi
df1['Protein'] = 0.0
df1['Carbs'] = 0.0
df1['Fat'] = 0.0
df1['Source'] = 'Calorie_Info'

# Xử lý Bảng 2: daily_food
df2 = df_daily[['Category', 'Food_Item', 'Calories (kcal)', 'Protein (g)', 'Carbohydrates (g)', 'Fat (g)']].copy()
df2.columns = ['Category', 'Food_Name', 'Calories', 'Protein', 'Carbs', 'Fat']
# Bảng này không có cột Serving Size rõ ràng, ta tạm gán là 1 (phần ăn) để tính toán
df2['Serving_Size'] = '1' 
df2['Source'] = 'Daily_Food'


# --- BƯỚC 2: GỘP 2 BẢNG THÀNH 1 (VERTICAL CONCATENATE) ---
df_master = pd.concat([df1, df2], ignore_index=True)


# --- BƯỚC 3: LÀM SẠCH TEXT THÀNH SỐ (STANDARDIZATION) ---

# Hàm trích xuất số: Biến "58 cal" -> 58.0 | "100ml" -> 100.0
def extract_number(text):
    if pd.isna(text): return 0.0
    nums = re.findall(r'\d+\.?\d*', str(text))
    return float(nums[0]) if nums else 0.0

# Áp dụng hàm làm sạch cho Cột Calories và Serving_Size
df_master['Calories'] = df_master['Calories'].apply(extract_number)
df_master['Serving_Size'] = df_master['Serving_Size'].apply(extract_number)


# --- BƯỚC 4: TÍNH CALORIC DENSITY VÀ XUẤT FILE ---

# Tính mật độ calo: Calories / Serving Size (Bảo vệ lỗi chia cho 0)
df_master['Caloric_Density'] = df_master.apply(
    lambda row: round(row['Calories'] / row['Serving_Size'], 2) if row['Serving_Size'] > 0 else 0, 
    axis=1
)

# Loại bỏ các cột dư thừa nếu cần (tùy chọn)
# df_master = df_master.drop_duplicates(subset=['Food_Name'])

# Xuất thẳng ra định dạng JSON để team làm HTML/JS đẩy lên Firebase luôn
df_master.to_json('Merged_Nutrition_Data.json', orient='records', force_ascii=False, indent=4)

print("Đã gộp xong! Hãy kiểm tra file Merged_Nutrition_Data.json")