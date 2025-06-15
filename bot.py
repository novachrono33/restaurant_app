import os
import logging
import requests
import asyncio
from datetime import date, timedelta, datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram import F
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    ReplyKeyboardMarkup,
    KeyboardButton,
    CallbackQuery
)
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL      = os.getenv("BACKEND_API_URL", "http://localhost:8000").rstrip("/")
SERVICE_KEY  = os.getenv("SERVICE_API_KEY")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

bot = Bot(token=TELEGRAM_TOKEN)
dp  = Dispatcher()

persistent_kb = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="Просмотреть брони")]
    ],
    resize_keyboard=True,
    one_time_keyboard=False
)

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(
        "Привет! Чтобы посмотреть бронь, нажмите на кнопку внизу.",
        reply_markup=persistent_kb
    )

@dp.message(F.text == "Просмотреть брони")
async def show_period_menu(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📅 Сегодня",    callback_data="today:1"),
            InlineKeyboardButton(text="📅 Завтра",     callback_data="tomorrow:1"),
        ],
        [
            InlineKeyboardButton(text="📅 На неделю",  callback_data="week:1"),
        ]
    ])
    await message.answer("Выберите период бронирований:", reply_markup=kb)


def fetch_bookings(period: str, limit_fetch: int = 50):
    try:
        resp = requests.get(
            f"{API_URL}/service/bookings/",
            params={"skip": 0, "limit": limit_fetch},
            headers={"X-API-Key": SERVICE_KEY},
            timeout=5,
        )
        resp.raise_for_status()
        all_bookings = resp.json()
    except Exception as e:
        logger.error(f"Ошибка API: {e}")
        return None, str(e)

    today    = date.today()
    tomorrow = today + timedelta(days=1)
    week_end = today + timedelta(days=6)

    filtered = []
    for b in all_bookings:
        dt_str = b.get("booking_time", "")
        if len(dt_str) < 10:
            continue
        try:
            b_date = date.fromisoformat(dt_str[:10])
        except ValueError:
            continue

        if period == "today"    and b_date == today:      filtered.append(b)
        if period == "tomorrow" and b_date == tomorrow:   filtered.append(b)
        if period == "week"     and today <= b_date <= week_end:
            filtered.append(b)

    return filtered, None

def render_page(bookings, period: str, page: int, per_page: int = 10):
    total       = len(bookings)
    total_pages = max((total + per_page - 1) // per_page, 1)
    page        = max(1, min(page, total_pages))
    start, end  = (page - 1) * per_page, page * per_page
    slice_      = bookings[start:end]

    if period == "today":
        d = date.today().strftime("%d.%m.%Y")
        header = f"📅 *Сегодня — {d}*\n(страница {page} из {total_pages})"
    elif period == "tomorrow":
        d = (date.today() + timedelta(days=1)).strftime("%d.%m.%Y")
        header = f"📅 *Завтра — {d}*\n(страница {page} из {total_pages})"
    else:
        header = f"📅 *На неделю*\n(страница {page} из {total_pages})"

    lines = [header, ""]

    if not slice_:
        lines.append("_Нет броней на этой странице._")
    else:
        for b in slice_:
            dt_raw = b["booking_time"]
            try:
                dt_obj = datetime.fromisoformat(dt_raw.replace("Z", "+00:00"))
            except ValueError:
                try:
                    dt_obj = datetime.strptime(dt_raw, "%Y-%m-%d %H:%M:%S")
                except:
                    dt_obj = None

            if period in ("today", "tomorrow") and dt_obj:
                snippet = dt_obj.strftime("%H:%M")
            elif period == "week" and dt_obj:
                snippet = dt_obj.strftime("%H:%M %d.%m")
            else:
                snippet = dt_raw.replace("T", " ")[:16]

            guest   = f"{b.get('first_name','')} {b.get('last_name','')}".strip() or "—"
            table   = b.get("table_number", "—")
            info    = b.get("extra_info") or "—"
            arrived = "✅" if b.get("arrived") else "❌"

            lines.append(f"⏰ {snippet} · Стол {table} · {guest} · {info} · Пришёл: {arrived}")

    buttons = []
    if page > 1:
        buttons.append(InlineKeyboardButton(text="‹ Назад", callback_data=f"{period}:{page-1}"))
    if page < total_pages:
        buttons.append(InlineKeyboardButton(text="Вперед ›", callback_data=f"{period}:{page+1}"))

    kb = InlineKeyboardMarkup(inline_keyboard=[buttons]) if buttons else None
    return "\n".join(lines), kb

@dp.callback_query(lambda c: c.data and c.data.split(":",1)[0] in ("today","tomorrow","week"))
async def on_period_pagination(query: CallbackQuery):
    await query.answer()
    period, page_str = query.data.split(":",1)
    page = int(page_str)

    bookings, error = fetch_bookings(period, limit_fetch=50)
    if error:
        return await query.message.edit_text(f"❌ Ошибка получения данных: {error}")

    text, kb = render_page(bookings, period, page, per_page=10)
    await query.message.edit_text(text, parse_mode="Markdown", reply_markup=kb)

async def main():
    logger.info("Бот запущен, начинаем polling")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
