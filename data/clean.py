import pandas as pd
import json

df_raw = pd.read_excel(
    'thanh_phan_dinh_duong.xlsx',
    header=None,
    engine='xlrd'
)

print("Raw shape:", df_raw.shape)
print(df_raw.head(10).to_string())

CATEGORY_HEADERS = {
    'ngũ cốc':      'Ngũ cốc',
    'khoai củ':     'Khoai củ',
    'hạt':          'Hạt & Đậu',
    'thịt':         'Thịt',
    'thủy sản':     'Thủy sản',
    'trứng':        'Trứng',
    'sữa':          'Sữa',
    'đồ hộp':       'Đồ hộp',
    'đồ ngọt':      'Đồ ngọt',
    'gia vị':       'Gia vị',
    'nước giải khát': 'Đồ uống',
}

def detect_category(cell_value):
    if not isinstance(cell_value, str):
        return None
    lower = cell_value.strip().lower()
    for keyword, cat_name in CATEGORY_HEADERS.items():
        if keyword in lower:
            return cat_name
    return None

records = []
current_category = None

for _, row in df_raw.iterrows():
    # Column B (index 1) is food name, Column A (index 0) is STT number
    cell_b = row.iloc[1]
    
    # Check if this row is a category header
    detected = detect_category(cell_b)
    if detected:
        current_category = detected
        continue

    # Skip rows with no category yet or no food name
    if current_category is None:
        continue
    if not isinstance(cell_b, str) or cell_b.strip() == '':
        continue

    # Try to parse numeric columns safely
    def safe_float(val):
        try:
            if isinstance(val, str):
                val = val.replace(',', '.').strip()
            return float(val)
        except:
            return None

    calories = safe_float(row.iloc[2])
    protein  = safe_float(row.iloc[3])
    fat      = safe_float(row.iloc[4])
    carbs    = safe_float(row.iloc[5])
    fiber    = safe_float(row.iloc[6])
    chol     = safe_float(row.iloc[7])
    sodium   = safe_float(row.iloc[9])

    # Drop rows with no calorie value
    if calories is None or calories == 0:
        continue

    # Drop rows where protein + fat + carbs are all zero simultaneously
    macros = [protein, fat, carbs]
    if all(m == 0 or m is None for m in macros):
        continue

    records.append({
        'food_name':    cell_b.strip(),
        'category':     current_category,
        'calories':     calories,
        'protein':      protein or 0,
        'fat':          fat or 0,
        'carbs':        carbs or 0,
        'fiber':        fiber,
        'cholesterol':  chol,
        'sodium':       sodium,
    })

df = pd.DataFrame(records)

# IQR outlier check
Q1 = df['calories'].quantile(0.25)
Q3 = df['calories'].quantile(0.75)
IQR = Q3 - Q1
upper = Q3 + 1.5 * IQR

outliers = df[df['calories'] > upper]
print(f"\nOutliers found ({len(outliers)} rows):")
print(outliers[['food_name', 'category', 'calories']].to_string())
print(f"\nKeeping foods under {upper:.0f} kcal/100g")

df_clean = df[df['calories'] <= upper].reset_index(drop=True)

print(f"\nFinal dataset: {len(df_clean)} foods across {df_clean['category'].nunique()} categories")
print(df_clean.groupby('category').size().to_string())

df_clean.to_json('../frontend/public/foods.json', orient='records', force_ascii=False, indent=2)
print("\n✓ Exported to frontend/public/foods.json")