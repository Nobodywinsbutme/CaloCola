from pydantic import BaseModel

class BMRInput(BaseModel):
    age:      int
    gender:   str
    height:   float
    weight:   float
    activity: float
    goal:     int

class BMROutput(BaseModel):
    bmi:     float
    bmr:     float
    tdee:    float
    protein: float
    fat:     float
    carbs:   float