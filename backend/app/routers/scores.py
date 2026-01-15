"""
API endpoints для работы с результатами игр.

Endpoint (эндпоинт) — это URL, на который можно отправить запрос.
Например: POST /api/scores — сохранить результат игры.

HTTP методы:
- GET — получить данные (не изменяет ничего)
- POST — создать новую запись
- PUT — обновить существующую запись
- DELETE — удалить запись
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Score
from app.schemas import (
    ScoreCreate,
    ScoreResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    StatsResponse,
    HealthResponse,
)

# Router — это группа связанных endpoints
# prefix="/api" — все URL будут начинаться с /api
# tags=["scores"] — группировка в документации /docs
router = APIRouter(prefix="/api", tags=["scores"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Проверка работы сервера (Health Check).
    
    Используется для:
    - Проверки, что сервер запущен
    - Мониторинга (системы вроде Docker проверяют этот endpoint)
    
    Returns:
        Статус "ok" если всё работает
    """
    return HealthResponse(
        status="ok",
        message="Snake Game API is running! 🐍"
    )


@router.post("/scores", response_model=ScoreResponse, status_code=201)
async def create_score(
    score_data: ScoreCreate,
    db: Session = Depends(get_db)
):
    """
    Сохранить результат игры.
    
    Вызывается frontend'ом после Game Over.
    Создаёт новую запись в таблице scores.
    
    Args:
        score_data: Данные о результате (очки, длина змейки, время)
        db: Сессия базы данных (внедряется автоматически)
    
    Returns:
        Созданная запись с id и датой создания
    
    Raises:
        HTTPException 500: Если не удалось сохранить в БД
    """
    try:
        # Создаём объект Score из полученных данных
        # ** распаковывает словарь: {"score": 100} → score=100
        db_score = Score(**score_data.model_dump())
        
        # Добавляем в сессию (ещё не сохранено в БД!)
        db.add(db_score)
        
        # Фиксируем изменения (сохраняем в БД)
        db.commit()
        
        # Обновляем объект — получаем id и created_at от БД
        db.refresh(db_score)
        
        return db_score
        
    except Exception as e:
        # Если ошибка — откатываем изменения
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Не удалось сохранить результат: {str(e)}"
        )


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Получить таблицу лидеров (топ-N результатов).
    
    Args:
        limit: Сколько записей вернуть (по умолчанию 10)
        db: Сессия базы данных
    
    Returns:
        Список лучших результатов с рангами
    
    Example:
        GET /api/leaderboard → топ-10
        GET /api/leaderboard?limit=5 → топ-5
    """
    # Запрос к БД:
    # SELECT * FROM scores ORDER BY score DESC LIMIT 10
    scores = (
        db.query(Score)
        .order_by(Score.score.desc())  # Сортировка по убыванию очков
        .limit(limit)                   # Ограничение количества
        .all()                          # Получить все результаты
    )
    
    # Преобразуем в формат с рангом (место в рейтинге)
    entries = [
        LeaderboardEntry(
            rank=index + 1,  # Ранг начинается с 1
            player_name=score.player_name,
            score=score.score,
            created_at=score.created_at,
        )
        for index, score in enumerate(scores)
    ]
    
    return LeaderboardResponse(entries=entries)


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """
    Получить статистику игрока.
    
    Агрегирует данные по всем играм:
    - Сколько игр сыграно
    - Лучший результат
    - Средний результат
    - Общее время игры
    - Самая длинная змейка
    
    Returns:
        Объект со статистикой
    """
    # Считаем количество игр
    total_games = db.query(func.count(Score.id)).scalar() or 0
    
    # Если нет игр — возвращаем нули
    if total_games == 0:
        return StatsResponse(
            total_games=0,
            best_score=0,
            average_score=0.0,
            total_play_time_seconds=0,
            longest_snake=0,
        )
    
    # Лучший результат (максимальные очки)
    best_score = db.query(func.max(Score.score)).scalar() or 0
    
    # Средний результат
    average_score = db.query(func.avg(Score.score)).scalar() or 0.0
    
    # Общее время игры (сумма всех duration_seconds)
    total_time = db.query(func.sum(Score.duration_seconds)).scalar() or 0
    
    # Самая длинная змейка
    longest_snake = db.query(func.max(Score.snake_length)).scalar() or 0
    
    return StatsResponse(
        total_games=total_games,
        best_score=best_score,
        average_score=round(average_score, 1),
        total_play_time_seconds=total_time,
        longest_snake=longest_snake,
    )
