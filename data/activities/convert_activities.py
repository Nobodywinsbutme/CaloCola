import json
import re
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / 'exercise_dataset.csv'
JSON_PATH = BASE_DIR / 'exercise_dataset.json'

CATEGORY_MAPPING = {
    'Gym & Strength': {
        'category': 'Gym',
        'keywords': ['weight lifting', 'calisthenics', 'circuit training', 'health club', 'strength', 'bodybuilding']
    },
    'Cardio': {
        'category': 'Cardio',
        'keywords': ['aerobics', 'rowing machine', 'stair machine', 'ski machine', 'cycling', 'stationary', 'bike']
    },
    'Team Sports': {
        'category': 'Thể Thao Tập Thể',
        'keywords': ['football', 'basketball', 'soccer', 'volleyball', 'baseball', 'team', 'softball']
    },
    'Individual Sports': {
        'category': 'Thể Thao Cá Nhân',
        'keywords': ['tennis', 'golf', 'running', 'walking', 'hiking', 'yoga', 'pilates', 'martial arts', 'boxing']
    },
    'Housework': {
        'category': 'Công Việc Nhà',
        'keywords': ['housework', 'housecleaning', 'vacuuming', 'mopping', 'sweeping', 'laundry', 'ironing', 'cooking', 'dishwashing', 'general housework']
    }
}

TRANSLATIONS = {
    # Cycling/Cardio
    'mountain bike': 'xe đạp leo núi',
    'bmx': 'xe đạp BMX',
    'leisure bicycling': 'đạp xe giải trí',
    '<10 mph': '<16 km/h',
    '10-11.9 mph': '16-19 km/h',
    '12-13.9 mph': '19-22 km/h',
    '14-15.9 mph': '23-26 km/h',
    '16-19 mph': '26-31 km/h',
    '>20 mph': '>32 km/h',
    'light bicycling': 'đạp xe nhẹ',
    'moderate': 'vừa phải',
    'vigorous': 'mạnh mẽ',
    'racing': 'đua xe',
    'very fast': 'rất nhanh',
    'very light': 'rất nhẹ',
    'light': 'nhẹ',
    'very vigorous': 'rất mạnh mẽ',
    'unicycling': 'đạp xe một bánh',
    'stationary cycling': 'đạp xe cố định',
    
    # Gym & Strength
    'weight lifting': 'nâng tạ',
    'body building': 'xây dựng cơ bắp',
    'calisthenics': 'tập thể dục thể hình',
    'circuit training': 'tập vòng',
    'health club exercise': 'tập luyện phòng gym',
    'pushups': 'chống đẩy',
    'situps': 'gập bụng',
    'light workout': 'tập nhẹ',
    'minimal rest': 'nghỉ tối thiểu',
    
    # Cardio
    'aerobics': 'aerobic',
    'high impact': 'tác động cao',
    'step aerobics': 'aerobic bậc',
    'low impact': 'tác động thấp',
    
    # Housework/Cleaning
    'housework': 'công việc nhà',
    'housecleaning': 'vệ sinh nhà cửa',
    'general housework': 'công việc nhà nói chung',
    'vacuuming': 'hút bụi',
    'mopping': 'lau sàn',
    'sweeping': 'quét nhà',
    'laundry': 'giặt đồ',
    'ironing': 'ủi quần áo',
    'cooking': 'nấu ăn',
    'dishwashing': 'rửa bát',
    
    # General modifiers
    'general': 'chung',
}


def categorize_activity(activity_name: str) -> str:
    """Return the category for an activity name."""
    text = activity_name.lower()

    # Check primary keywords first
    for category, info in CATEGORY_MAPPING.items():
        for keyword in info['keywords']:
            if keyword in text:
                return category

    # Fallback categorization
    if 'housework' in text or 'cleaning' in text or 'laundry' in text or 'ironing' in text or 'cooking' in text or 'dishwashing' in text:
        return 'Housework'
    if 'weight' in text or 'strength' in text or 'fitness' in text or 'gym' in text:
        return 'Gym & Strength'
    if 'cardio' in text or 'aerobic' in text:
        return 'Cardio'
    
    return 'Individual Sports'


def translate_to_vietnamese(activity_name: str) -> str:
    """Translate an activity name into Vietnamese using keyword replacement."""
    result = activity_name
    for english, vietnamese in TRANSLATIONS.items():
        result = re.sub(re.escape(english), vietnamese, result, flags=re.IGNORECASE)
    return result


def load_activities() -> pd.DataFrame:
    return pd.read_csv(CSV_PATH)


def build_json_data(df: pd.DataFrame) -> dict:
    activities_by_category = {}

    for _, row in df.iterrows():
        activity_name = str(row['Activity, Exercise or Sport (1 hour)']).strip()
        category = categorize_activity(activity_name)

        if category not in activities_by_category:
            activities_by_category[category] = {
                'category': CATEGORY_MAPPING.get(category, {}).get('category', category),
                'activities': []
            }

        activities_by_category[category]['activities'].append({
            'name': activity_name,
            'vn_name': translate_to_vietnamese(activity_name),
            'calories': {
                '59_kg': row['130 lb'],
                '70_kg': row['155 lb'],
                '82_kg': row['180 lb'],
                '93_kg': row['205 lb'],
            },
            'calories_per_kg': row['Calories per kg']
        })

    return {
        'exercises': activities_by_category,
        'metadata': {
            'weight_categories': ['59 kg', '70 kg', '82 kg', '93 kg'],
            'weight_categories_original_lb': ['130 lb', '155 lb', '180 lb', '205 lb'],
            'total_activities': len(df)
        }
    }


def save_json(data: dict) -> None:
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main() -> None:
    df = load_activities()
    result = build_json_data(df)
    save_json(result)


    print(f'✓ Conversion complete!')
    print(f'✓ Total activities: {result["metadata"]["total_activities"]}')
    print(f'✓ Categories: {len(result["exercises"])}')
    print(f'✓ Output saved to: {JSON_PATH}')
    print('\nCategories:')
    for category, data in result['exercises'].items():
        print(f'  - {category} ({data["category"]}): {len(data["activities"])} activities')


if __name__ == '__main__':
    main()
