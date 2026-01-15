/**
 * Компонент игрового поля.
 * 
 * Использует Canvas для отрисовки — это быстрее, чем DOM-элементы
 * для игр с частым обновлением.
 */

import { useRef, useEffect } from 'react'
import { useSnakeGame } from '../../hooks/useSnakeGame'
import styles from './GameBoard.module.css'

// Размер одной клетки в пикселях
const CELL_SIZE = 20

/**
 * Игровое поле со змейкой.
 * @param {Object} props
 * @param {Function} props.onGameOver - Callback при окончании игры
 */
function GameBoard({ onGameOver }) {
  // Ref на canvas элемент
  const canvasRef = useRef(null)
  
  // Получаем состояние игры из хука
  const {
    snake,
    food,
    score,
    gameState,
    boardSize,
    startGame,
    togglePause,
  } = useSnakeGame(onGameOver)
  
  // Размер canvas в пикселях
  const canvasSize = boardSize * CELL_SIZE

  /**
   * Отрисовка игры на Canvas.
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    // Очищаем canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)
    
    // === Рисуем фон (сетка) ===
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvasSize, canvasSize)
    
    // Рисуем сетку
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    for (let i = 0; i <= boardSize; i++) {
      // Вертикальные линии
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, canvasSize)
      ctx.stroke()
      
      // Горизонтальные линии
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(canvasSize, i * CELL_SIZE)
      ctx.stroke()
    }
    
    // === Рисуем еду ===
    if (food) {
      const foodX = food.x * CELL_SIZE + CELL_SIZE / 2
      const foodY = food.y * CELL_SIZE + CELL_SIZE / 2
      const foodRadius = CELL_SIZE / 2 - 2
      
      // Свечение еды
      ctx.shadowColor = '#ff6b6b'
      ctx.shadowBlur = 15
      
      // Сама еда
      ctx.beginPath()
      ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
      
      // Сбрасываем shadow
      ctx.shadowBlur = 0
    }
    
    // === Рисуем змейку ===
    snake.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE
      const y = segment.y * CELL_SIZE
      const size = CELL_SIZE - 2
      const offset = 1
      
      // Голова ярче, хвост темнее
      const isHead = index === 0
      
      if (isHead) {
        // Свечение головы
        ctx.shadowColor = '#00ff87'
        ctx.shadowBlur = 10
      }
      
      // Градиент от головы к хвосту
      const gradientPosition = index / snake.length
      const r = Math.round(0 + gradientPosition * 96)
      const g = Math.round(255 - gradientPosition * 16)
      const b = Math.round(135 + gradientPosition * 120)
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      
      // Скруглённые углы
      const radius = 4
      ctx.beginPath()
      ctx.roundRect(x + offset, y + offset, size, size, radius)
      ctx.fill()
      
      // Глаза для головы
      if (isHead) {
        ctx.shadowBlur = 0
        ctx.fillStyle = '#1a1a2e'
        
        // Размер и позиция глаз зависят от направления
        const eyeSize = 3
        const eyeOffset = 5
        
        // Левый глаз
        ctx.beginPath()
        ctx.arc(x + CELL_SIZE / 2 - eyeOffset, y + CELL_SIZE / 2 - eyeOffset, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Правый глаз
        ctx.beginPath()
        ctx.arc(x + CELL_SIZE / 2 + eyeOffset, y + CELL_SIZE / 2 - eyeOffset, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.shadowBlur = 0
    })
    
  }, [snake, food, boardSize, canvasSize])

  /**
   * Автостарт при монтировании.
   */
  useEffect(() => {
    // Небольшая задержка, чтобы пользователь увидел поле
    const timer = setTimeout(() => {
      if (gameState === 'ready') {
        startGame()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      {/* Счёт */}
      <div className={styles.scorePanel}>
        <div className={styles.score}>
          <span className={styles.scoreLabel}>SCORE</span>
          <span className={styles.scoreValue}>{score}</span>
        </div>
        <div className={styles.length}>
          <span className={styles.scoreLabel}>LENGTH</span>
          <span className={styles.scoreValue}>{snake.length}</span>
        </div>
      </div>
      
      {/* Игровое поле */}
      <div className={styles.boardWrapper}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className={styles.canvas}
        />
        
        {/* Оверлей паузы */}
        {gameState === 'paused' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2>⏸️ PAUSED</h2>
              <p>Press SPACE to continue</p>
            </div>
          </div>
        )}
        
        {/* Оверлей "готов к игре" */}
        {gameState === 'ready' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2>🐍 READY?</h2>
              <p>Press SPACE or ENTER to start</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Подсказка */}
      <div className={styles.hint}>
        <span>SPACE = Pause</span>
        <span>↑↓←→ = Move</span>
      </div>
    </div>
  )
}

export default GameBoard
