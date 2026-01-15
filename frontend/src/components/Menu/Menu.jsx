/**
 * Главное меню игры.
 */

import { useState, useEffect } from 'react'
import { getStats } from '../../api/scores'
import styles from './Menu.module.css'

/**
 * Компонент главного меню.
 * @param {Object} props
 * @param {Function} props.onStartGame - Callback при нажатии "Играть"
 * @param {Function} props.onShowLeaderboard - Callback при нажатии "Лидеры"
 */
function Menu({ onStartGame, onShowLeaderboard }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Загружаем статистику при монтировании
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStats()
        setStats(data)
      } catch (error) {
        console.log('Не удалось загрузить статистику:', error.message)
        // Это нормально при первом запуске — БД пустая
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])
  
  /**
   * Форматировать время в минуты:секунды
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={styles.menu}>
      {/* Кнопки */}
      <div className={styles.buttons}>
        <button 
          className="btn btn-primary"
          onClick={onStartGame}
        >
          🎮 Играть
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onShowLeaderboard}
        >
          🏆 Таблица лидеров
        </button>
      </div>
      
      {/* Статистика */}
      {!loading && stats && stats.total_games > 0 && (
        <div className={styles.stats}>
          <h3>📊 Твоя статистика</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total_games}</span>
              <span className={styles.statLabel}>Игр сыграно</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.best_score}</span>
              <span className={styles.statLabel}>Лучший счёт</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{Math.round(stats.average_score)}</span>
              <span className={styles.statLabel}>Средний счёт</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.longest_snake}</span>
              <span className={styles.statLabel}>Макс. длина</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{formatTime(stats.total_play_time_seconds)}</span>
              <span className={styles.statLabel}>Время в игре</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Подсказка для новых игроков */}
      {!loading && (!stats || stats.total_games === 0) && (
        <div className={styles.newPlayer}>
          <p>👋 Добро пожаловать!</p>
          <p>Это твоя первая игра. Удачи!</p>
        </div>
      )}
    </div>
  )
}

export default Menu
