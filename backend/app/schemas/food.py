import json
from fastapi import APIRouter
from pathlib import Path

router = APIRouter()

DATA_PATH = Path(__file__).parent.parent.parent / "data" / "foods.json"

@router.get("/foods")
async def get_foods(category: str = None):
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        foods = json.load(f)
    if category:
        foods = [f for f in foods if f["category"] == category]
    return foods