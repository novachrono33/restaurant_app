from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.schemas import Booking, BookingCreate
from backend.crud import create_booking, get_bookings
from backend.auth import get_current_active_user, get_db

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=Booking)
def add_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    return create_booking(db, booking, current_user.id)


@router.get("/", response_model=List[Booking])
def list_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    return get_bookings(db, skip=skip, limit=limit)
