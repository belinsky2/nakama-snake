# 🏗️ Архитектура проекта: Snake Game

> Диаграммы в формате Mermaid

---

## Общая схема системы

```mermaid
graph TB
    subgraph "Browser"
        REACT[React Frontend<br/>localhost:5173]
    end
    
    subgraph "Backend"
        API[FastAPI<br/>localhost:8000]
    end
    
    subgraph "Storage"
        DB[(SQLite<br/>snake.db)]
    end
    
    REACT -->|HTTP POST /api/scores| API
    REACT -->|HTTP GET /api/leaderboard| API
    API -->|SQL| DB
```

---

## Схема компонентов Frontend

```mermaid
graph TB
    subgraph "React App"
        APP[App.jsx]
        
        subgraph "Screens"
            MENU[Menu]
            GAME[Game]
            OVER[GameOver]
            LEAD[Leaderboard]
        end
        
        subgraph "Hooks"
            HOOK[useSnakeGame]
        end
        
        subgraph "API"
            APICLIENT[scores.js]
        end
    end
    
    APP --> MENU
    APP --> GAME
    APP --> OVER
    APP --> LEAD
    
    GAME --> HOOK
    OVER --> APICLIENT
    LEAD --> APICLIENT
```

---

## Схема обработки запроса

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant A as FastAPI
    participant D as SQLite
    
    Note over B,D: Сохранение результата игры
    
    B->>F: Game Over
    F->>F: Показать экран Game Over
    F->>A: POST /api/scores {score: 150}
    A->>D: INSERT INTO scores...
    D-->>A: OK
    A-->>F: 201 Created {id: 1, score: 150}
    F->>F: Показать "Результат сохранён"
    
    Note over B,D: Загрузка таблицы лидеров
    
    B->>F: Нажал "Таблица лидеров"
    F->>A: GET /api/leaderboard
    A->>D: SELECT * FROM scores ORDER BY score DESC LIMIT 10
    D-->>A: [rows...]
    A-->>F: 200 OK {entries: [...]}
    F->>B: Отрисовать таблицу
```

---

## Схема базы данных

```mermaid
erDiagram
    SCORES {
        int id PK "Уникальный ID"
        string player_name "Имя игрока"
        int score "Очки"
        int snake_length "Длина змейки"
        int duration_seconds "Длительность игры"
        datetime created_at "Дата и время"
    }
```

---

## Состояния игры

```mermaid
stateDiagram-v2
    [*] --> Menu: Открыть игру
    
    Menu --> Playing: Нажать "Играть"
    Menu --> Leaderboard: Нажать "Лидеры"
    
    Playing --> Paused: Нажать Space
    Paused --> Playing: Нажать Space
    
    Playing --> GameOver: Столкновение
    
    GameOver --> Menu: Нажать "В меню"
    GameOver --> Playing: Нажать "Ещё раз"
    
    Leaderboard --> Menu: Нажать "Назад"
```

---

## Игровой цикл

```mermaid
graph TD
    START[Начало игры] --> INIT[Инициализация<br/>snake, food, score]
    INIT --> LOOP{Игровой цикл<br/>каждые 150ms}
    
    LOOP --> MOVE[Переместить голову]
    MOVE --> CHECK_WALL{Стена?}
    
    CHECK_WALL -->|Да| GAMEOVER[Game Over]
    CHECK_WALL -->|Нет| CHECK_SELF{Хвост?}
    
    CHECK_SELF -->|Да| GAMEOVER
    CHECK_SELF -->|Нет| CHECK_FOOD{Еда?}
    
    CHECK_FOOD -->|Да| EAT[+10 очков<br/>+1 длина<br/>Новая еда]
    CHECK_FOOD -->|Нет| REMOVE_TAIL[Удалить хвост]
    
    EAT --> RENDER[Отрисовать]
    REMOVE_TAIL --> RENDER
    
    RENDER --> LOOP
    
    GAMEOVER --> SAVE[Сохранить результат]
    SAVE --> SHOW_OVER[Показать Game Over]
```

---

## Структура файлов

```mermaid
graph LR
    subgraph "snake/"
        subgraph "backend/"
            BA[app/]
            BA --> BM[main.py]
            BA --> BD[database.py]
            BA --> BMO[models.py]
            BA --> BS[schemas.py]
            BA --> BR[routers/]
            BR --> BRS[scores.py]
        end
        
        subgraph "frontend/"
            FS[src/]
            FS --> FC[components/]
            FS --> FH[hooks/]
            FS --> FA[api/]
            FS --> FST[styles/]
        end
        
        subgraph "docs/"
            D1[project-plan.md]
            D2[technical-summary.md]
            D3[architecture.md]
        end
    end
```
