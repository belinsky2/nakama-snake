"""
SQLAlchemy модели — описание таблиц базы данных.

Модель — это Python класс, который описывает структуру таблицы:
- Какие колонки (поля) есть
- Какого они типа (число, текст, дата)
- Какие ограничения (обязательное поле, уникальность)
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


class Score(Base):
    """
    Модель для хранения результатов игр.
    
    Каждая запись — это один завершённый раунд игры.
    Сохраняем: очки, длину змейки, время игры, дату.
    
    Attributes:
        id: Уникальный номер записи (создаётся автоматически)
        player_name: Имя игрока (по умолчанию "Player")
        score: Количество очков (0+)
        snake_length: Финальная длина змейки
        duration_seconds: Сколько секунд длилась игра
        created_at: Когда была сыграна игра (автоматически)
    """
    
    # Имя таблицы в базе данных
    __tablename__ = "scores"
    
    # === Колонки таблицы ===
    
    # id — уникальный идентификатор
    # Integer = целое число
    # primary_key=True = это главный ключ таблицы (уникальный для каждой записи)
    # index=True = создать индекс для быстрого поиска
    id = Column(Integer, primary_key=True, index=True)
    
    # player_name — имя игрока
    # String(100) = текст до 100 символов
    # default="Player" = если не указано, будет "Player"
    # nullable=False = обязательное поле (не может быть пустым)
    player_name = Column(String(100), default="Player", nullable=False)
    
    # score — количество очков
    # default=0 = если не указано, будет 0
    score = Column(Integer, default=0, nullable=False)
    
    # snake_length — длина змейки в конце игры
    # default=3 = начальная длина змейки
    snake_length = Column(Integer, default=3, nullable=False)
    
    # duration_seconds — продолжительность игры в секундах
    duration_seconds = Column(Integer, default=0, nullable=False)
    
    # created_at — когда запись была создана
    # DateTime = дата и время
    # default=datetime.utcnow = текущее время UTC
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self) -> str:
        """
        Как показывать объект при печати (для отладки).
        
        Пример: <Score(id=1, player='Player', score=150)>
        """
        return f"<Score(id={self.id}, player='{self.player_name}', score={self.score})>"
