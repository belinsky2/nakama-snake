/**
 * Хук useSnakeGame — вся игровая логика змейки.
 * 
 * Что такое хук (hook)?
 * Это функция, которая позволяет использовать React-функции
 * (состояние, эффекты) в компонентах.
 * 
 * Зачем выносить логику в хук?
 * 1. Переиспользование — можно использовать в разных компонентах
 * 2. Тестирование — легче тестировать отдельно от UI
 * 3. Чистота кода — компонент остаётся простым
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// === Константы игры ===
const BOARD_SIZE = 20          // Размер поля (20x20 клеток)
const INITIAL_SPEED = 150      // Начальная скорость (мс между движениями)
const MIN_SPEED = 50           // Минимальная задержка (максимальная скорость)
const SPEED_INCREASE = 5       // На сколько уменьшать задержку
const SPEED_THRESHOLD = 50     // Каждые N очков ускоряемся
const POINTS_PER_FOOD = 10     // Очков за еду
const INITIAL_SNAKE_LENGTH = 3 // Начальная длина змейки

// Направления: [изменение по X, изменение по Y]
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

// Противоположные направления (нельзя развернуться на 180°)
const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

/**
 * Создать начальную змейку.
 * Змейка начинает в центре поля, смотрит вправо.
 */
function createInitialSnake() {
  const centerY = Math.floor(BOARD_SIZE / 2)
  const startX = Math.floor(BOARD_SIZE / 4)
  
  // Массив сегментов [голова, ..., хвост]
  const snake = []
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: startX - i, y: centerY })
  }
  return snake
}

/**
 * Создать еду в случайной свободной клетке.
 * @param {Array} snake - Текущее положение змейки
 */
function createFood(snake) {
  // Собираем все занятые клетки
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`))
  
  // Собираем все свободные клетки
  const free = []
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y })
      }
    }
  }
  
  // Выбираем случайную свободную клетку
  if (free.length === 0) return null // Поле заполнено!
  return free[Math.floor(Math.random() * free.length)]
}

/**
 * Главный хук игры.
 * @param {Function} onGameOver - Callback при окончании игры
 */
export function useSnakeGame(onGameOver) {
  // === Состояние игры ===
  const [snake, setSnake] = useState(createInitialSnake)
  const [food, setFood] = useState(() => createFood(createInitialSnake()))
  const [direction, setDirection] = useState('RIGHT')
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('ready') // ready | playing | paused | gameOver
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  
  // Время начала игры (для подсчёта длительности)
  const startTimeRef = useRef(null)
  
  // Буфер направления (чтобы не пропустить быстрые нажатия)
  const directionBufferRef = useRef(null)
  
  // Предотвращаем двойные нажатия в одном тике
  const lastDirectionRef = useRef('RIGHT')

  /**
   * Сбросить игру в начальное состояние.
   */
  const resetGame = useCallback(() => {
    const newSnake = createInitialSnake()
    setSnake(newSnake)
    setFood(createFood(newSnake))
    setDirection('RIGHT')
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameState('ready')
    startTimeRef.current = null
    directionBufferRef.current = null
    lastDirectionRef.current = 'RIGHT'
  }, [])

  /**
   * Начать игру.
   */
  const startGame = useCallback(() => {
    if (gameState === 'ready' || gameState === 'gameOver') {
      resetGame()
    }
    setGameState('playing')
    startTimeRef.current = Date.now()
  }, [gameState, resetGame])

  /**
   * Поставить на паузу / снять с паузы.
   */
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused')
    } else if (gameState === 'paused') {
      setGameState('playing')
    }
  }, [gameState])

  /**
   * Изменить направление движения.
   * @param {string} newDirection - Новое направление (UP, DOWN, LEFT, RIGHT)
   */
  const changeDirection = useCallback((newDirection) => {
    // Нельзя развернуться на 180°
    if (OPPOSITE[newDirection] === lastDirectionRef.current) {
      return
    }
    
    // Сохраняем в буфер (применится в следующем тике)
    directionBufferRef.current = newDirection
  }, [])

  /**
   * Обработка нажатия клавиш.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Предотвращаем скролл страницы стрелками
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT')
          break
        case ' ': // Пробел
          if (gameState === 'ready') {
            startGame()
          } else {
            togglePause()
          }
          break
        case 'Enter':
          if (gameState === 'ready' || gameState === 'gameOver') {
            startGame()
          }
          break
        default:
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection, startGame, togglePause, gameState])

  /**
   * Главный игровой цикл.
   * Выполняется каждые `speed` миллисекунд.
   */
  useEffect(() => {
    if (gameState !== 'playing') return
    
    const gameLoop = setInterval(() => {
      setSnake((currentSnake) => {
        // Применяем буферизованное направление
        let currentDirection = direction
        if (directionBufferRef.current) {
          // Ещё раз проверяем, что не разворачиваемся
          if (OPPOSITE[directionBufferRef.current] !== lastDirectionRef.current) {
            currentDirection = directionBufferRef.current
            setDirection(currentDirection)
          }
          directionBufferRef.current = null
        }
        lastDirectionRef.current = currentDirection
        
        // Вычисляем новую позицию головы
        const head = currentSnake[0]
        const delta = DIRECTIONS[currentDirection]
        const newHead = {
          x: head.x + delta.x,
          y: head.y + delta.y,
        }
        
        // === Проверка столкновений ===
        
        // 1. Столкновение со стеной
        if (
          newHead.x < 0 || 
          newHead.x >= BOARD_SIZE || 
          newHead.y < 0 || 
          newHead.y >= BOARD_SIZE
        ) {
          // Game Over!
          setGameState('gameOver')
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
          onGameOver?.({
            score,
            snakeLength: currentSnake.length,
            duration,
          })
          return currentSnake
        }
        
        // 2. Столкновение с собой
        const collidesWithSelf = currentSnake.some(
          (segment, index) => index > 0 && segment.x === newHead.x && segment.y === newHead.y
        )
        if (collidesWithSelf) {
          // Game Over!
          setGameState('gameOver')
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
          onGameOver?.({
            score,
            snakeLength: currentSnake.length,
            duration,
          })
          return currentSnake
        }
        
        // === Движение змейки ===
        const newSnake = [newHead, ...currentSnake]
        
        // Проверяем, съели ли еду
        if (food && newHead.x === food.x && newHead.y === food.y) {
          // Съели еду!
          setScore((s) => {
            const newScore = s + POINTS_PER_FOOD
            
            // Увеличиваем скорость каждые SPEED_THRESHOLD очков
            if (newScore % SPEED_THRESHOLD === 0) {
              setSpeed((currentSpeed) => 
                Math.max(MIN_SPEED, currentSpeed - SPEED_INCREASE)
              )
            }
            
            return newScore
          })
          
          // Создаём новую еду
          setFood(createFood(newSnake))
          
          // НЕ удаляем хвост (змейка растёт)
          return newSnake
        }
        
        // Удаляем хвост (змейка движется)
        newSnake.pop()
        return newSnake
      })
    }, speed)
    
    return () => clearInterval(gameLoop)
  }, [gameState, direction, food, speed, score, onGameOver])

  return {
    // Состояние
    snake,
    food,
    score,
    gameState,
    direction,
    
    // Константы
    boardSize: BOARD_SIZE,
    
    // Методы
    startGame,
    togglePause,
    changeDirection,
    resetGame,
  }
}

export default useSnakeGame
