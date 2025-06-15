from sqlalchemy.orm import Session, joinedload
from backend import models
from backend.utils import get_password_hash, verify_password
from datetime import datetime
from sqlalchemy import func

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter_by(username=username).first()

def create_user(db: Session, username: str, full_name: str, password: str, is_admin: bool):
    hashed = get_password_hash(password)
    user = models.User(
        username=username,
        full_name=full_name,
        hashed_password=hashed,
        is_admin=is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_booking(db: Session, booking):
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_bookings(
    db: Session,
    skip: int,
    limit: int,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
):
    q = db.query(models.Booking).options(joinedload(models.Booking.created_by))

    if from_dt:
        q = q.filter(models.Booking.booking_time >= from_dt)
    if to_dt:
        q = q.filter(models.Booking.booking_time <= to_dt)

    total_count = q.count()

    bookings = q.order_by(models.Booking.booking_time).offset(skip).limit(limit).all()
    return bookings, total_count
