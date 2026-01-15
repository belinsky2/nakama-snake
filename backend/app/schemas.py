"""
Pydantic схемы — описание формата данных для API.

Зачем нужны схемы (отдельно от моделей)?

1. **Валидация** — проверка, что данные правильного формата
   Если клиент пришлёт score="abc" вместо числа — получит ошибку 422

2. **Документация** — автоматически генерируется в /docs
   FastAPI покажет какие поля нужны и какого типа

3. **Разделение** — входные данные ≠ выходные данные
   При создании записи не нужен id (его создаёт БД)
   При ответе id нужен (чтобы клиент знал какая запись создана)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# === Схемы для Score ===

class ScoreCreate(BaseModel):
    """
    Схема для СОЗДАНИЯ результата (POST /api/scores).
    
    Что отправляет клиент (frontend) после окончания игры.
    Только те поля, которые знает клиент.
    """
    
    # score — количество очков
    # ge=0 означает "greater or equal" (больше или равно 0)
    score: int = Field(
        ge=0,
        description="Количество очков за игру"
    )
    
    # snake_length — длина змейки в конце
    # ge=1 — минимум 1 сегмент (хотя обычно начинаем с 3)
    snake_length: int = Field(
        ge=1,
        default=3,
        description="Финальная длина змейки"
    )
    
    # duration_seconds — как долго играли
    # ge=0 — не может быть отрицательным
    duration_seconds: int = Field(
        ge=0,
        default=0,
        description="Продолжительность игры в секундах"
    )
    
    # player_name — имя игрока (опционально)
    # max_length=100 — ограничение длины
    player_name: Optional[str] = Field(
        default="Player",
        max_length=100,
        description="Имя игрока"
    )


class ScoreResponse(BaseModel):
    """
    Схема для ОТВЕТА с результатом (то, что возвращает API).
    
    Содержит все поля, включая id и created_at,
    которые создаёт база данных.
    """
    
    id: int = Field(description="Уникальный ID записи")
    player_name: str = Field(description="Имя игрока")
    score: int = Field(description="Количество очков")
    snake_length: int = Field(description="Длина змейки")
    duration_seconds: int = Field(description="Продолжительность в секундах")
    created_at: datetime = Field(description="Дата и время игры")
    
    # Эта настройка говорит Pydantic:
    # "можно создавать объект из SQLAlchemy модели"
    # Без этого пришлось бы вручную преобразовывать
    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    """
    Одна строка в таблице лидеров.
    
    Отличие от ScoreResponse — есть поле rank (место в рейтинге).
    """
    
    rank: int = Field(description="Место в рейтинге (1 = лучший)")
    player_name: str = Field(description="Имя игрока")
    score: int = Field(description="Количество очков")
    created_at: datetime = Field(description="Когда сыграно")
    
    model_config = {"from_attributes": True}


class LeaderboardResponse(BaseModel):
    """
    Ответ на запрос таблицы лидеров.
    
    Содержит список лучших результатов.
    """
    
    entries: list[LeaderboardEntry] = Field(
        description="Список лидеров (топ-10)"
    )


class StatsResponse(BaseModel):
    """
    Статистика игрока.
    
    Агрегированные данные по всем играм.
    """
    
    total_games: int = Field(
        description="Всего сыграно игр"
    )
    best_score: int = Field(
        description="Лучший результат"
    )
    average_score: float = Field(
        description="Средний результат"
    )
    total_play_time_seconds: int = Field(
        description="Общее время игры в секундах"
    )
    longest_snake: int = Field(
        description="Самая длинная змейка"
    )


class HealthResponse(BaseModel):
    """
    Ответ на health check — проверку работы сервера.
    """
    
    status: str = Field(description="Статус сервера")
    message: str = Field(description="Сообщение")
