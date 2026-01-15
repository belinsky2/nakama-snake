/**
 * Экран окончания игры (Game Over).
 * 
 * Показывает результат и сохраняет его на сервер.
 */

import { useState, useEffect } from 'react'
import { saveScore } from '../../api/scores'
import styles from './GameOver.module.css'

/**
 * Компонент Game Over.
 * @param {Object} props
 * @param {Object} props.result - Результат игры {score, snakeLength, duration}
 * @param {Function} props.onPlayAgain - Callback "Играть снова"
 * @param {Function} props.onBackToMenu - Callback "В меню"
 * @param {Function} props.onShowLeaderboard - Callback "Таблица лидеров"
 */
function GameOver({ result, onPlayAgain, onBackToMenu, onShowLeaderboard }) {
  const [saving, setSaving] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  
  // Сохраняем результат при монтировании
  useEffect(() => {
    async function save() {
      if (!result) return
      
      try {
        await saveScore({
          score: result.score,
          snake_length: result.snakeLength,
          duration_seconds: result.duration,
        })
        setSaved(true)
      } catch (err) {
        console.error('Ошибка сохранения:', err)
        setError('Не удалось сохранить результат')
      } finally {
        setSaving(false)
      }
    }
    
    save()
  }, [result])
  
  /**
   * Форматировать время
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!result) return null
  
  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h2 className={styles.title}>💀 GAME OVER</h2>
      </div>
      
      {/* Результаты */}
      <div className={styles.results}>
        <div className={styles.mainScore}>
          <span className={styles.scoreLabel}>SCORE</span>
          <span className={styles.scoreValue}>{result.score}</span>
        </div>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Длина змейки</span>
            <span className={styles.detailValue}>{result.snakeLength}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Время игры</span>
            <span className={styles.detailValue}>{formatTime(result.duration)}</span>
          </div>
        </div>
      </div>
      
      {/* Статус сохранения */}
      <div className={styles.saveStatus}>
        {saving && <span className={styles.saving}>💾 Сохранение...</span>}
        {saved && <span className={styles.saved}>✅ Результат сохранён!</span>}
        {error && <span className={styles.error}>⚠️ {error}</span>}
      </div>
      
      {/* Кнопки */}
      <div className={styles.buttons}>
        <button 
          className="btn btn-primary"
          onClick={onPlayAgain}
        >
          🔄 Ещё раз
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onShowLeaderboard}
        >
          🏆 Лидеры
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onBackToMenu}
        >
          ← Меню
        </button>
      </div>
    </div>
  )
}

export default GameOver
