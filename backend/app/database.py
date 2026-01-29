"""
Подключение к SQLite базе данных.

SQLite — это файловая база данных. Вместо сервера (как PostgreSQL),
все данные хранятся в одном файле snake.db.

Это идеально для локальных приложений:
- Не нужно устанавливать сервер
- Не нужно настраивать пользователей
- Файл можно скопировать/перенести
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL подключения к SQLite
# Можно переопределить через переменную окружения DATABASE_URL
# По умолчанию: ./snake.db в текущей директории
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./snake.db")

# Engine — это "движок" который управляет подключениями к БД
# connect_args={"check_same_thread": False} — нужно для SQLite,
# чтобы можно было использовать одно подключение из разных потоков
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,  # True = показывать SQL запросы в консоли (для отладки)
)

# SessionLocal — фабрика сессий
# Сессия — это "разговор" с базой данных
# Через сессию мы делаем запросы и сохраняем данные
SessionLocal = sessionmaker(
    autocommit=False,  # Не сохранять автоматически (нужен явный commit)
    autoflush=False,   # Не отправлять изменения автоматически
    bind=engine,       # Привязать к нашему engine
)

# Base — базовый класс для всех моделей
# Все наши таблицы будут наследоваться от Base
Base = declarative_base()


def get_db():
    """
    Dependency для FastAPI — получить сессию базы данных.
    
    Как это работает:
    1. Создаём новую сессию
    2. Отдаём её в endpoint (yield)
    3. После завершения запроса — закрываем сессию (finally)
    
    Это гарантирует, что сессия всегда будет закрыта,
    даже если произойдёт ошибка.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Создать все таблицы в базе данных.
    
    Вызывается один раз при старте приложения.
    Если таблицы уже существуют — ничего не произойдёт.
    """
    Base.metadata.create_all(bind=engine)
