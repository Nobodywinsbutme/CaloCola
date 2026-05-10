import json
import re
from collections import defaultdict
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / 'exercise_dataset.csv'
JSON_PATH = BASE_DIR / 'exercise_dataset.json'

CATEGORY_MAPPING = {
    'Gym_Strength': {
        'category': 'Phòng Tập & Nâng Tạ',
        'keywords': ['weight lifting', 'calisthenics', 'circuit training', 'health club exercise', 'pushups', 'situps', 'gymnastics', 'rowing machine', 'stair machine', 'ski machine', 'stationary cycling', 'stationary bike']
    },
    'Cardio_Aerobics_Dance': {
        'category': 'Cardio, Aerobic & Dance',
        'keywords': ['aerobics', 'jazzercise', 'dancing', 'ballet', 'ballroom', 'jazz', 'tap', 'stretch', 'yoga', 'pilates']
    },
    'Running_Track': {
        'category': 'Chạy Bộ & Điền Kinh',
        'keywords': ['running', 'track and field', 'race walking', 'cross country']
    },
    'Racquet_Sports': {
        'category': 'Thể Thao Vợt',
        'keywords': ['tennis', 'badminton', 'squash', 'racquetball', 'paddleball', 'table tennis', 'ping pong']
    },
    'Combat_Sports': {
        'category': 'Thể Thao Võ',
        'keywords': ['martial arts', 'boxing', 'wrestling', 'judo', 'karate', 'kickboxing', 'tae kwan do', 'krav maga', 'fencing']
    },
    'Team_Ball_Sports': {
        'category': 'Thể Thao Bóng Tập Thể',
        'keywords': ['football', 'basketball', 'soccer', 'volleyball', 'baseball', 'softball', 'cricket', 'handball', 'lacrosse', 'rugby', 'jai alai']
    },
    'Water_Sports': {
        'category': 'Thể Thao Nước',
        'keywords': ['swimming', 'diving', 'water polo', 'water volleyball', 'water aerobics', 'water jogging', 'kayaking', 'canoeing', 'rowing', 'sailing', 'windsurfing', 'boating', 'jet skiing', 'waterskiing', 'water skiing', 'snorkeling', 'skin diving', 'scuba', 'surfing', 'whitewater rafting']
    },
    'Winter_Sports': {
        'category': 'Thể Thao Mùa Đông',
        'keywords': ['skiing', 'ice skating', 'cross country skiing', 'downhill', 'sledding', 'toboggan', 'luge', 'snow', 'speed skating']
    },
    'Cycling': {
        'category': 'Đạp Xe',
        'keywords': ['cycling', 'bicycle', 'biking', 'bike', 'bmx', 'mountain bike', 'unicycling']
    },
    'Outdoor_Leisure': {
        'category': 'Thể Thao Ngoài Trời & Giải Trí',
        'keywords': ['walking', 'hiking', 'rock climbing', 'archery', 'golf', 'horseback', 'frisbee', 'orienteering', 'backpacking', 'bird watching', 'billiards', 'bowling', 'croquet', 'curling', 'darts', 'fishing', 'hacky sack', 'horseshoe', 'juggling', 'kickball', 'polo', 'shuffleboard', 'skateboarding', 'roller', 'trampoline', 'ultimate', 'wallyball', 'sky diving']
    },
    'Household_Yard': {
        'category': 'Công Việc Nhà & Vườn',
        'keywords': ['housework', 'cleaning', 'vacuuming', 'mopping', 'sweeping', 'laundry', 'ironing', 'cooking', 'dishwashing', 'painting', 'carpentry', 'gardening', 'mowing', 'raking', 'bagging', 'watering', 'weeding', 'carrying', 'loading', 'unloading', 'gutters', 'trash', 'shoveling', 'snow blower', 'grooming', 'bathing', 'playing with']
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
    'racing': 'đua',
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
    'gymnastics': 'thể dục dụng cụ',
    
    # Cardio
    'aerobics': 'aerobic',
    'high impact': 'tác động cao',
    'step aerobics': 'aerobic bậc',
    'low impact': 'tác động thấp',
    'jazzercise': 'jazzercise',
    'dancing': 'nhảy múa',
    'ballet': 'ba lê',
    'twist': 'twist',
    'jazz': 'jazz',
    'tap': 'tap',
    'ballroom': 'khiêu vũ',
    'slow': 'chậm',
    'fast': 'nhanh',
    'stretching': 'co giãn',
    'hatha yoga': 'yoga hatha',
    'mild stretching': 'co giãn nhẹ',
    'instructing aerobic class': 'hướng dẫn lớp aerobic',
    'water aerobics': 'aerobic nước',
    'rowing machine': 'máy chèo',
    'stair machine': 'máy leo cầu thang',
    'ski machine': 'máy trượt tuyết',
    
    # Running & Track
    'running': 'chạy bộ',
    '5 mph': '8 km/h',
    '5.2 mph': '8.4 km/h',
    '6 mph': '9.6 km/h',
    '6.7 mph': '10.8 km/h',
    '7 mph': '11.3 km/h',
    '7.5mph': '12 km/h',
    '8 mph': '12.9 km/h',
    '8.6 mph': '13.8 km/h',
    '9 mph': '14.5 km/h',
    '10 mph': '16 km/h',
    '10.9 mph': '17.5 km/h',
    '12 minute mile': 'dặm 12 phút',
    '11.5 minute mile': 'dặm 11.5 phút',
    '10 min mile': 'dặm 10 phút',
    '9 min mile': 'dặm 9 phút',
    '8.5 min mile': 'dặm 8.5 phút',
    '8 min mile': 'dặm 8 phút',
    '7.5 min mile': 'dặm 7.5 phút',
    '7 min mile': 'dặm 7 phút',
    '6.5 min mile': 'dặm 6.5 phút',
    '6 min mile': 'dặm 6 phút',
    '5.5 min mile': 'dặm 5.5 phút',
    'cross country': 'xuyên quốc gia',
    'general': 'chung',
    'track and field': 'điền kinh',
    'shot': 'ném tạ',
    'discus': 'ném đĩa',
    'high jump': 'nhảy cao',
    'pole vault': 'nhảy sào',
    'hurdles': 'chạy vượt rào',
    'race walking': 'bước chạy tốc độ',
    'stairs': 'cầu thang',
    
    # Racquet Sports
    'archery': 'bắn cung',
    'badminton': 'cầu lông',
    'basketball game': 'trận bóng rổ',
    'competitive': 'cạnh tranh',
    'playing basketball': 'chơi bóng rổ',
    'non game': 'không chính thức',
    'officiating': 'làm tr裁',
    'shooting baskets': 'ném bóng',
    'wheelchair': 'xe lăn',
    'billiards': 'bida',
    'bowling': 'bowling',
    'boxing': 'quyền anh',
    'in ring': 'trong võng',
    'punching bag': 'túi đấm',
    'sparring': 'tập đấm',
    'coaching': 'huấn luyện',
    'cricket': 'cricket',
    'batting': 'đánh bóng',
    'bowling': 'ném bóng',
    'croquet': 'croquet',
    'curling': 'curling',
    'darts': 'phi tiêu',
    'wall': 'tường',
    'lawn': 'sân',
    'fencing': 'kiếm',
    'football': 'bóng đá Mỹ',
    'touch': 'chạm',
    'flag': 'cờ',
    'frisbee': 'frisbee',
    'playing': 'chơi',
    'ultimate frisbee': 'frisbee tối high',
    'golf': 'golf',
    'walking': 'đi bộ',
    'carrying clubs': 'mang gậy',
    'driving range': 'sân tập',
    'miniature golf': 'golf tí hon',
    'pulling clubs': 'kéo gậy',
    'power cart': 'xe điện',
    'hacky sack': 'hacky sack',
    'handball': 'bóng ném',
    'team': 'tập thể',
    'hockey': 'khúc côn cầu',
    'field hockey': 'khúc côn cầu sân',
    'ice hockey': 'khúc côn cầu đá',
    'horse': 'ngựa',
    'horseback riding': 'cưỡi ngựa',
    'saddling': 'yên',
    'grooming': 'chải',
    'trotting': 'chạy nhỏ bước',
    'horse racing': 'đua ngựa',
    'galloping': 'phi ngựa',
    'horseshoe pitching': 'ném móng ngựa',
    'jai alai': 'jai alai',
    'martial arts': 'võ thuật',
    'judo': 'judo',
    'karate': 'karate',
    'jujitsu': 'jujitsu',
    'kick boxing': 'kick boxing',
    'tae kwan do': 'taekwondo',
    'krav maga training': 'tập luyện krav maga',
    'juggling': 'múa trò',
    'kickball': 'bóng đá tay',
    'lacrosse': 'lacrosse',
    'orienteering': 'định hướng',
    'paddleball': 'bóng vợt',
    'polo': 'polo',
    'racquetball': 'racquetball',
    'rock climbing': 'leo đá',
    'ascending': 'trèo lên',
    'rappelling': 'cứu hộ dây',
    'jumping rope': 'nhảy dây',
    'rugby': 'rugby',
    'shuffleboard': 'shuffleboard',
    'lawn bowling': 'bowling sân',
    'skateboarding': 'trượt ván',
    'roller skating': 'trượt patin',
    'roller blading': 'trượt inline',
    'in-line skating': 'trượt inline',
    'sky diving': 'nhảy dù',
    'soccer': 'bóng đá',
    'softball': 'bóng mềm',
    'baseball': 'bóng chày',
    'pitching': 'ném',
    'squash': 'squash',
    'table tennis': 'bóng bàn',
    'ping pong': 'bóng bàn',
    'tai chi': 'thái cực',
    'tennis': 'tennis',
    'doubles': 'đôi',
    'singles': 'đơn',
    'trampoline': 'sàn nhún',
    'volleyball': 'bóng chuyền',
    'beach': 'bãi biển',
    'wrestling': 'đấu vật',
    'wallyball': 'wallyball',
    'backpacking': 'ba lô',
    'hiking': 'đi bộ đường dài',
    'with pack': 'mang ba lô',
    'carrying infant': 'mang trẻ sơ sinh',
    'upstairs': 'lên cầu thang',
    'lbs': 'lbs',
    'children': 'trẻ em',
    'loading': 'xếp hàng',
    'unloading car': 'dỡ xe',
    'climbing hills': 'leo đồi',
    'downstairs': 'xuống cầu thang',
    'pushing stroller': 'đẩy xe công',
    'pushing a wheelchair': 'đẩy xe lăn',
    'using crutches': 'sử dụng nạng',
    'walking the dog': 'đi bộ với chó',
    'under': 'dưới',
    'under 2.0 mph': 'dưới 3.2 km/h',
    '2.0 mph': '3.2 km/h',
    '2.5 mph': '4 km/h',
    '3.0 mph': '4.8 km/h',
    '3.5 mph': '5.6 km/h',
    '3.5 mph uphill': '5.6 km/h lên dốc',
    'uphill': 'lên dốc',
    '4.0 mph': '6.4 km/h',
    '4.0 mph very brisk': '6.4 km/h rất nhanh',
    'very brisk': 'rất nhanh',
    '4.5 mph': '7.2 km/h',
    '5.0 mph': '8 km/h',
    'brisk pace': 'tốc độ nhanh',
    
    # Water Sports
    'boating': 'chèo thuyền',
    'power': 'máy',
    'speed boat': 'cano tốc độ',
    'canoeing': 'canoeing',
    'camping trip': 'chuyến cắm trại',
    'rowing': 'chèo',
    'crew': 'crew',
    'sculling': 'chèo đơn',
    'competition': 'thi đấu',
    'kayaking': 'kayaking',
    'paddle boat': 'thuyền chèo',
    'windsurfing': 'lướt gió',
    'sailing': 'buồm',
    'yachting': 'du thuyền',
    'ocean sailing': 'buồm ngoài đại dương',
    'water skiing': 'trượt nước',
    'ski mobiling': 'xe tuyết',
    'skin diving': 'lặn tự do',
    'scuba diving': 'lặn bình khí',
    'snorkeling': 'lặn ống thở',
    'surfing': 'lướt sóng',
    'body surfing': 'lướt sóng thân',
    'board surfing': 'lướt sóng ván',
    'whitewater rafting': 'chèo thuyền nước trắng',
    'freestyle': 'tự do',
    'swimming': 'bơi',
    'not laps': 'không vòng',
    'sidestroke': 'bơi bên',
    'synchronized': 'đồng bộ',
    'treading water': 'đạp nước',
    'water polo': 'bóng nước',
    'water volleyball': 'bóng chuyền nước',
    'water jogging': 'chạy nước',
    'diving': 'nhảy cầu',
    'springboard': 'bệ nhảy',
    'platform': 'bệ cao',
    'ice skating': 'trượt băng',
    '< 9 mph': '< 14.5 km/h',
    'average speed': 'tốc độ trung bình',
    'rapidly': 'nhanh chóng',
    'speed skating': 'trượt tốc độ',
    'cross country skiing': 'trượt xuyên quốc gia',
    'downhill skiing': 'trượt xuống dốc',
    'sledding': 'trượt thuyền',
    'tobagganing': 'trượt thuyền',
    'luge': 'luge',
    'snow shoeing': 'đi bộ tuyết',
    'snowmobiling': 'xe tuyết',
    
    # Housework/Cleaning
    'housework': 'công việc nhà',
    'cleaning gutters': 'lau rươi',
    'painting': 'sơn',
    'sit playing with animals': 'ngồi chơi với động vật',
    'walk / run playing with animals': 'đi bộ / chạy chơi với động vật',
    'bathing dog': 'tắm chó',
    'mowing lawn': 'cắt cỏ',
    'walk': 'đi bộ',
    'power mower': 'cắt cỏ máy',
    'riding mower': 'cắt cỏ ngồi',
    'walking snow blower': 'máy thổi tuyết',
    'riding snow blower': 'máy thổi tuyết ngồi',
    'shoveling snow': 'xúc tuyết',
    'by hand': 'tay',
    'raking lawn': 'cào cỏ',
    'gardening': 'làm vườn',
    'bagging grass': 'xếp cỏ',
    'leaves': 'lá',
    'watering lawn': 'tưới sân',
    'watering garden': 'tưới vườn',
    'weeding': 'nhổ cỏ',
    'cultivating garden': 'canh tác vườn',
    'carpentry': 'carpentry',
    'carrying heavy loads': 'mang nặng',
    'carrying moderate loads': 'mang vừa phải',
    'general cleaning': 'vệ sinh chung',
    'cleaning': 'lau chùi',
    'dusting': 'lau bụi',
    'taking out trash': 'vứt rác',
    'housecleaning': 'vệ sinh nhà cửa',
    'general housework': 'công việc nhà nói chung',
    'vacuuming': 'hút bụi',
    'mopping': 'lau sàn',
    'sweeping': 'quét nhà',
    'laundry': 'giặt đồ',
    'ironing': 'ủi quần áo',
    'cooking': 'nấu ăn',
    'dishwashing': 'rửa bát',
}



def categorize_activity(activity_name: str) -> str:
    """Return the category for an activity name using precise keyword matching."""
    text = activity_name.lower()
    # Explicit: treat sky/skydiving as outdoor (not water) to avoid matching on 'diving'
    if 'skydiv' in text or 'sky diving' in text or 'sky-div' in text:
        return 'Outdoor_Leisure'
    
    # Priority order: Check more specific categories first
    priority_order = [
        'Team_Ball_Sports', 'Combat_Sports', 'Racquet_Sports', 'Water_Sports',
        'Winter_Sports', 'Running_Track', 'Cycling', 'Gym_Strength',
        'Cardio_Aerobics_Dance', 'Outdoor_Leisure', 'Household_Yard'
    ]
    
    for category_key in priority_order:
        if category_key in CATEGORY_MAPPING:
            info = CATEGORY_MAPPING[category_key]
            for keyword in info['keywords']:
                if keyword in text:
                    return category_key
    
    # Fallback: Try to match partial keywords
    if 'cleaning' in text or 'laundry' in text or 'ironing' in text or 'yard' in text or 'lawn' in text or 'snow' in text or 'shovel' in text:
        return 'Household_Yard'
    if 'weight' in text or 'strength' in text or 'fitness' in text or 'gym' in text:
        return 'Gym_Strength'
    if 'swim' in text or 'water' in text or 'boat' in text:
        return 'Water_Sports'
    if 'walk' in text:
        return 'Outdoor_Leisure'
    
    # Ultimate fallback
    return 'Outdoor_Leisure'


def translate_to_vietnamese(activity_name: str) -> str:
    """Translate an activity name into Vietnamese using keyword replacement."""
    # Apply longer keys first to avoid substring collisions (e.g., 'race walking' vs 'walking')
    result = activity_name
    for english in sorted(TRANSLATIONS.keys(), key=lambda k: -len(k)):
        vietnamese = TRANSLATIONS[english]
        # Use case-insensitive replacement; escape special regex chars
        result = re.sub(re.escape(english), vietnamese, result, flags=re.IGNORECASE)

    # Clean up repeated words produced by overlapping replacements (e.g., 'Swimming bơi ếch')
    # Replace common duplicated patterns like 'Swimming bơi' -> 'bơi'
    result = re.sub(r'(?i)\b(swimming)\s+(bơi)\b', r'\2', result)
    result = re.sub(r'(?i)\b(water)\s+(aerobic)\b', 'aerobic nước', result)
    return result


def load_activities() -> pd.DataFrame:
    return pd.read_csv(CSV_PATH)


DISTANCE_CONTEXT_PATTERN = re.compile(
    r'(\d+\.?\d*\s*(mph|km/h|mile|min|minute|lb|lbs|kg)|<\s*\d|>\s*\d)',
    re.IGNORECASE,
)


def has_distance_or_speed_context(activity_name: str) -> bool:
    """Return True when an activity includes measurable speed/distance/load context."""
    return bool(DISTANCE_CONTEXT_PATTERN.search(activity_name))


def normalize_activity_name(activity_name: str) -> str:
    """Collapse context variants to a base activity name unless numeric context exists."""
    text = activity_name.strip()
    if has_distance_or_speed_context(text):
        return text
    # Collapse only swim-specific variants to a single canonical name.
    # Do NOT collapse generic 'water *' activities (e.g., 'water polo', 'water aerobics').
    lower = text.lower()
    swim_keywords = [
        'swim', 'swimming', 'laps', 'freestyle', 'backstroke', 'breaststroke',
        'butterfly', 'sidestroke', 'tread', 'treading water', 'synchronized'
    ]
    for kw in swim_keywords:
        if kw in lower:
            return 'Swimming'
    if ',' in text:
        return text.split(',', 1)[0].strip()
    return text


def build_json_data(df: pd.DataFrame) -> dict:
    activities_by_category = {}
    grouped_activities = defaultdict(lambda: {
        'original_names': set(),
        'sum_59_kg': 0.0,
        'sum_70_kg': 0.0,
        'sum_82_kg': 0.0,
        'sum_93_kg': 0.0,
        'sum_calories_per_kg': 0.0,
        'count': 0,
    })

    for _, row in df.iterrows():
        activity_name = str(row['Activity, Exercise or Sport (1 hour)']).strip()
        normalized_name = normalize_activity_name(activity_name)
        category = categorize_activity(activity_name)
        group_key = (category, normalized_name)

        grouped_activities[group_key]['original_names'].add(activity_name)
        grouped_activities[group_key]['sum_59_kg'] += float(row['130 lb'])
        grouped_activities[group_key]['sum_70_kg'] += float(row['155 lb'])
        grouped_activities[group_key]['sum_82_kg'] += float(row['180 lb'])
        grouped_activities[group_key]['sum_93_kg'] += float(row['205 lb'])
        grouped_activities[group_key]['sum_calories_per_kg'] += float(row['Calories per kg'])
        grouped_activities[group_key]['count'] += 1

    # Additionally generate a full-activity -> translation mapping file for review
    all_activity_translations = {}
    for (category, normalized_name), grouped in grouped_activities.items():
        # Use normalized name for translation (preserves numeric context when present)
        vn = translate_to_vietnamese(normalized_name)
        all_activity_translations[normalized_name] = vn
    try:
        trans_path = BASE_DIR / 'activity_translations.json'
        with open(trans_path, 'w', encoding='utf-8') as tf:
            json.dump(all_activity_translations, tf, ensure_ascii=False, indent=2)
    except Exception:
        pass

    for (category, normalized_name), grouped in grouped_activities.items():
        count = grouped['count']

        if category not in activities_by_category:
            activities_by_category[category] = {
                'category': CATEGORY_MAPPING.get(category, {}).get('category', category),
                'activities': []
            }

        activities_by_category[category]['activities'].append({
            'name': normalized_name,
            'vn_name': translate_to_vietnamese(normalized_name),
            'calories': {
                '59_kg': round(grouped['sum_59_kg'] / count),
                '70_kg': round(grouped['sum_70_kg'] / count),
                '82_kg': round(grouped['sum_82_kg'] / count),
                '93_kg': round(grouped['sum_93_kg'] / count),
            },
            'calories_per_kg': grouped['sum_calories_per_kg'] / count,
            'merged_from': sorted(grouped['original_names']) if count > 1 else [normalized_name],
        })

    for category_data in activities_by_category.values():
        category_data['activities'].sort(key=lambda x: x['name'].lower())

    total_merged_activities = sum(
        len(category_data['activities']) for category_data in activities_by_category.values()
    )

    return {
        'exercises': activities_by_category,
        'metadata': {
            'weight_categories': ['59 kg', '70 kg', '82 kg', '93 kg'],
            'weight_categories_original_lb': ['130 lb', '155 lb', '180 lb', '205 lb'],
            'total_activities': total_merged_activities,
            'original_total_activities': len(df),
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
    print('\nCategories breakdown:')
    for i, (category_key, data) in enumerate(result['exercises'].items(), 1):
        count = len(data['activities'])
        print(f'  {i}. {data["category"]}: {count} activities')


if __name__ == '__main__':
    main()
