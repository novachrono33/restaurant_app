from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BookingBase(BaseModel):
    first_name: str
    last_name: str
    phone: str
    number_of_guests: int
    table_number: int
    instructions_acknowledged: bool = False
    hookah_needed: bool = False


class BookingCreate(BookingBase):
    pass


class Booking(BookingBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int]

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str
    is_admin: bool = False


class User(UserBase):
    id: int
    is_admin: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
