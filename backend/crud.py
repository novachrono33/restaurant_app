from sqlalchemy.orm import Session

from backend.models import User, Booking
from backend.schemas import UserCreate, BookingCreate
from backend.utils import get_password_hash


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_booking(db: Session, booking: BookingCreate, user_id: int):
    db_booking = Booking(**booking.dict(), created_by_id=user_id)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Booking).offset(skip).limit(limit).all()
