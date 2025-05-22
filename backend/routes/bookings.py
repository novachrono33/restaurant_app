from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List

from backend.schemas import BookingCreate, BookingRead
from backend.crud import create_booking, get_bookings
from backend.auth import get_db, get_current_active_user
from backend import models

router = APIRouter()

@router.post("/bookings/", response_model=BookingRead, tags=["bookings"])
def create_new_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    data = booking.dict()
    # Добавляем поле created_by_id прямо в модель
    from backend import models

    db_booking = models.Booking(**data, created_by_id=current_user.id)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.get("/bookings/", response_model=List[BookingRead], tags=["bookings"])
def read_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    return get_bookings(db, skip, limit)


@router.put("/bookings/{booking_id}", response_model=BookingRead, tags=["bookings"])
def update_booking(
    booking_id: int,
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for field, value in booking.dict().items():
        setattr(db_booking, field, value)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["bookings"])
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(db_booking)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
