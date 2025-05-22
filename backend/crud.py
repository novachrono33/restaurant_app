from sqlalchemy.orm import Session, joinedload
from backend import models
from backend.utils import get_password_hash, verify_password

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

def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Booking)
          .options(joinedload(models.Booking.created_by))
          .offset(skip)
          .limit(limit)
          .all()
    )
