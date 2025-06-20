# Название проекта
Веб-приложения для бронирования столиков «Чердак»
# Описание
Система для ведения учета бронирований столиков, предназначенная для администраторов и сотрудников хостес общественных заведений. Проект состоит из бэкенда на FastAPI и фронтенда на React.
# Содержание
- [Установка](#установка)
- [Переменные окружения](#переменные-окружения)
- [Запуск бэкенда](#запуск-бэкенда)
- [Запуск фронтенда](#запуск-фронтенда)
- [Структура проекта](#структура-проекта)
- [Использование](#использование)
# Установка
Клонировать репозиторий
```
git clone https://github.com/novachrono33/restaurant_app.git
cd restaurant_app
```
Создать и активировать виртуальное окружение (для бэкенда)
```
python -m venv venv
source venv/bin/activate
```
Установить зависимости (бэкенд)
```
pip install -r requirements.txt
```
Установить зависимости (фронтенд)
```
cd frontend
npm install
```
# Переменные окружения
Создайте файл `.env` в корне проекта со следующими параметрами:
```
DATABASE_URL=<URL вашей базы данных>
SECRET_KEY=<секретный ключ для JWT>
ACCESS_TOKEN_EXPIRE_MINUTES=<время жизни токена в минутах>
ALGORITHM=<алгоритм JWT, например "HS256">
ADMIN_INVITE_CODE=<пригласительный код для администраторов>
HOSTESS_INVITE_CODE=<пригласительный код для хостес>
TELEGRAM_BOT_TOKEN=<токен вашего Telegram-бота>
BACKEND_API_URL=<URL API бэкенда, например http://localhost:8000>
SERVICE_API_KEY=<ключ внешнего сервиса>
REACT_APP_SERVICE_API_KEY=<ключ внешнего сервиса для фронтенда>
```
# Запуск бэкенда
В корневой папке проекта выполните:
```
uvicorn backend.main:app --reload
```
# Запуск фронтенда
Перейдите в папку `frontend` и выполните:
```
npm start
```
Приложение откроется в браузере по умолчанию на `http://localhost:3000`
# Структура проекта
```
restaurant_app-main/
├── backend/             # FastAPI-API
│   ├── auth.py         # Логика аутентификации
│   ├── crud.py         # Операции CRUD
│   ├── database.py     # Настройка базы данных
│   ├── main.py         # Точка входа приложения
│   ├── models.py       # SQLAlchemy-модели
│   └── ...
├── frontend/            # React-приложение
│   ├── src/
│   │   ├── components/  # Компоненты UI
│   │   ├── hooks/       # Кастомные хуки
│   │   ├── api.js       # Конфигурация API-запросов
│   └── ...
├── alembic/             # Миграции базы данных
├── bot.py               # Telegram-бот для уведомлений
├── requirements.txt     # Python-зависимости
├── package.json         # Node.js-зависимости (если есть на корне)
└── README.md            # Этот файл
```
# Использование
1. Зарегистрируйтесь как администратор или хостес, используя соответствующий пригласительный код.
2. После входа вы сможете создавать, просматривать и управлять бронированиями столиков.
3. Администратор может приглашать новых пользователей в виде членов хостес (в его распоряжении `HOSTESS_INVITE_CODE`).

https://github.com/user-attachments/assets/cefa28d2-7891-46f9-b4d1-5a9b94d17d85
