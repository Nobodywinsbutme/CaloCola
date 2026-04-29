from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import foods, bmr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(foods.router)
app.include_router(bmr.router)