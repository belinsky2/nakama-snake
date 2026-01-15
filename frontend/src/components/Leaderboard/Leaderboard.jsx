/**
 * Таблица лидеров.
 * 
 * Показывает топ-10 лучших результатов.
 */

import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../api/scores'
import styles from './Leaderboard.module.css'

/**
 * Компонент таблицы лидеров.
 * @param {Object} props
 * @param {Function} props.onBack - Callback "Назад"
 */
function Leaderboard({ onBack }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Загружаем данные при монтировании
  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard()
        setEntries(data.entries || [])
      } catch (err) {
        console.error('Ошибка загрузки:', err)
        setError('Не удалось загрузить таблицу лидеров')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  
  /**
   * Форматировать дату
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }
  
  /**
   * Получить эмодзи для места
   */
  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }
  
  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h2>🏆 Таблица лидеров</h2>
      </div>
      
      {/* Состояние загрузки */}
      {loading && (
        <div className={styles.loading}>
          <span>Загрузка...</span>
        </div>
      )}
      
      {/* Ошибка */}
      {error && (
        <div className={styles.error}>
          <span>⚠️ {error}</span>
        </div>
      )}
      
      {/* Пустая таблица */}
      {!loading && !error && entries.length === 0 && (
        <div className={styles.empty}>
          <span>🎮 Пока нет результатов</span>
          <p>Сыграй первую игру!</p>
        </div>
      )}
      
      {/* Таблица */}
      {!loading && !error && entries.length > 0 && (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colRank}>#</span>
            <span className={styles.colName}>Игрок</span>
            <span className={styles.colScore}>Очки</span>
            <span className={styles.colDate}>Дата</span>
          </div>
          
          <div className={styles.tableBody}>
            {entries.map((entry, index) => (
              <div 
                key={index}
                className={`${styles.row} ${entry.rank <= 3 ? styles.topThree : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className={styles.colRank}>
                  {getRankEmoji(entry.rank)}
                </span>
                <span className={styles.colName}>
                  {entry.player_name}
                </span>
                <span className={styles.colScore}>
                  {entry.score}
                </span>
                <span className={styles.colDate}>
                  {formatDate(entry.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Кнопка назад */}
      <button 
        className="btn btn-secondary"
        onClick={onBack}
      >
        ← Назад
      </button>
    </div>
  )
}

export default Leaderboard
