from fastapi import APIRouter
from app.schemas.bmr import BMRInput, BMROutput

router = APIRouter()

@router.post("/bmr", response_model=BMROutput)
async def calculate_bmr(data: BMRInput):
    bmi = round(data.weight / ((data.height / 100) ** 2), 1)

    if data.gender == "m":
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    else:
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161

    tdee  = round(bmr * data.activity + data.goal, 0)
    protein = round(data.weight * 1.5, 1)
    fat     = round((tdee * 0.3) / 9, 1)
    carbs   = round((tdee - protein * 4 - fat * 9) / 4, 1)

    return BMROutput(
        bmi=bmi, bmr=round(bmr, 0),
        tdee=tdee, protein=protein,
        fat=fat, carbs=carbs
    )