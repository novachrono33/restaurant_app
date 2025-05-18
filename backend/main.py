from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine, Base
from backend.routes import users, bookings

# При старте создаём таблицы, если ещё не созданы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Booking App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(bookings.router)
