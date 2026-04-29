# CaloCola 🥗

An interactive nutrition and personalized meal recommendation dashboard for Vietnamese users.

> IT138IU — Data Science and Data Visualization
> Group TripleK | Instructor: Dr. Tran Thanh Tung

---

## Team

| Name | Student ID | Role |
|---|---|---|
| Nguyễn Tấn Khánh | ITCSIU23014 | D3.js & Beeswarm Chart |
| Lê Hoàng Khanh | ITCSIU23013 | UI Components & Frontend Integration |
| Phạm Trung Kiên | ITCSIU23020 | Data Pipeline & Backend |

---

## Project Structure
CaloCola/
├── frontend/          # Vite + React + D3 + Chart.js + Tailwind
├── backend/           # FastAPI
├── data/
│   ├── thanh_phan_dinh_duong.xls   # Raw dataset (not committed)
│   ├── clean.py                     # Pandas cleaning script
│   └── foods.json                   # Cleaned output (committed)
└── README.md

---

## Dataset

### Source
**Thành Phần Dinh Dưỡng** — a Vietnamese nutritional composition dataset containing macronutrient profiles for traditional Vietnamese foods.

### Column Mapping

| Original (Vietnamese) | Renamed (English) | Description |
|---|---|---|
| Tên thực phẩm | food_name | Vietnamese food name (kept in Vietnamese) |
| Nhóm | category | Food group/category |
| Năng lượng | calories | Energy in kcal per 100g |
| Chất đạm | protein | Protein in grams per 100g |
| Chất béo | fat | Fat in grams per 100g |
| Chất bột đường | carbs | Carbohydrates in grams per 100g |
| Chất xơ | fiber | Fiber in grams per 100g (nullable) |
| Đường | sugar | Sugar in grams per 100g (nullable) |
| Natri | sodium | Sodium in mg per 100g (nullable) |
| Cholesterol | cholesterol | Cholesterol in mg per 100g (nullable) |

### Cleaning Rules
- Rows where `calories` is null or zero are dropped — a food with no calorie value is unusable
- Rows where `protein`, `fat`, AND `carbs` are all simultaneously zero are dropped — signals a bad record
- Rows where only individual macros are zero are kept — e.g. zero fat on vegetables is valid data
- Vietnamese food names are preserved exactly as-is in the `food_name` column

### Outlier Decision
IQR analysis was run on the `calories` column (Q1 − 1.5×IQR to Q3 + 1.5×IQR).
Foods identified as outliers: high-fat items such as cooking oils and animal fats (>600 kcal/100g).

**Decision:** These items are excluded from the beeswarm chart to prevent axis stretching. The chart displays foods under ~500 kcal/100g. A note is shown in the UI informing users of this filter.

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Nobodywinsbutme/CaloCola.git
cd CaloCola
```

### 2. Run the Pandas cleaning notebook

```bash
cd data
pip install pandas openpyxl jupyter
jupyter notebook
```

Open `clean.ipynb` and run all cells. This produces `data/foods.json` from the raw `.xls` file.

### 3. Run the backend

```bash
cd backend

# Windows
py -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 4. Run the frontend
  
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 5. Verify

Open `http://localhost:5173` and navigate to **Caloric Density** in the sidebar.

You should see:
✓ 28 foods loaded from API

Vietnamese food names (Phở Bò, Bánh Mì, Gỏi Cuốn, etc.) should display correctly with no encoding issues.

### Environment
No `.env` file is required for local development. The Vite proxy handles routing `/api/*` to the FastAPI backend automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/foods` | Returns all foods |
| GET | `/foods?category=Cơm` | Returns foods filtered by category |
| POST | `/bmr` | Calculates BMI, BMR, TDEE, and macro targets |

### POST /bmr — Request body

```json
{
  "age": 22,
  "gender": "m",
  "height": 170,
  "weight": 65,
  "activity": 1.375,
  "goal": 0
}
```

### POST /bmr — Response

```json
{
  "bmi": 22.5,
  "bmr": 1680.0,
  "tdee": 2057.0,
  "protein": 97.5,
  "fat": 68.6,
  "carbs": 257.0
}
```

---

## GitHub
[https://github.com/Nobodywinsbutme/CaloCola](https://github.com/Nobodywinsbutme/CaloCola)