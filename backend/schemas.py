from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    full_name: str
    password: str
    is_admin: bool = False
    invite_code: str

class UserRead(BaseModel):
    id: int
    username: str
    full_name: str
    is_admin: bool

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    booking_time: datetime
    first_name: str
    last_name: str
    phone: str
    number_of_guests: int
    table_number: int
    instructions_acknowledged: bool = False
    extra_info: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingRead(BookingBase):
    id: int
    created_at: datetime
    created_by: UserRead

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None