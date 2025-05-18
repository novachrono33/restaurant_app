from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    bookings = relationship("Booking", back_populates="created_by")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    number_of_guests = Column(Integer, nullable=False)
    table_number = Column(Integer, nullable=False)
    instructions_acknowledged = Column(Boolean, default=False)
    hookah_needed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_by = relationship("User", back_populates="bookings")
