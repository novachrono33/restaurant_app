from fastapi import APIRouter, Header, HTTPException, Response, Query, Depends
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
import os

from backend.schemas import BookingRead
from backend.crud import get_bookings
from backend.auth import get_db

router = APIRouter(tags=["service"])

@router.get(
    "/service/bookings/",
    response_model=List[BookingRead],
    summary="Service API: получить список бронирований"
)
def service_read_bookings(
    skip:    int              = Query(0, ge=0),
    limit:   int              = Query(20, ge=1),
    from_dt: datetime | None = Query(None),
    to_dt:   datetime | None = Query(None),
    db:      Session          = Depends(get_db),
    response: Response        = None,
    api_key: str | None = Header(None, alias="X-API-Key"),
):
    expected = os.getenv("SERVICE_API_KEY")
    if api_key is None or api_key != expected:
        raise HTTPException(status_code=403, detail="Неверный API‑ключ")

    bookings, total_count = get_bookings(db, skip=skip, limit=limit, from_dt=from_dt, to_dt=to_dt)
    response.headers["X-Total-Count"] = str(total_count)
    return bookings
