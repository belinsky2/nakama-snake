/**
 * Главный компонент приложения.
 * 
 * Управляет "экранами" (screens):
 * - menu: главное меню
 * - playing: сама игра
 * - gameOver: экран окончания игры
 * - leaderboard: таблица лидеров
 */

import { useState, useCallback } from 'react'
import Menu from './components/Menu/Menu'
import GameBoard from './components/Game/GameBoard'
import GameOver from './components/GameOver/GameOver'
import Leaderboard from './components/Leaderboard/Leaderboard'
import './App.css'

function App() {
  // Текущий экран
  const [screen, setScreen] = useState('menu')
  
  // Результат последней игры (для экрана GameOver)
  const [lastGameResult, setLastGameResult] = useState(null)
  
  /**
   * Начать новую игру
   */
  const handleStartGame = useCallback(() => {
    setScreen('playing')
    setLastGameResult(null)
  }, [])
  
  /**
   * Игра окончена
   * @param {Object} result - Результат игры {score, snakeLength, duration}
   */
  const handleGameOver = useCallback((result) => {
    setLastGameResult(result)
    setScreen('gameOver')
  }, [])
  
  /**
   * Открыть таблицу лидеров
   */
  const handleShowLeaderboard = useCallback(() => {
    setScreen('leaderboard')
  }, [])
  
  /**
   * Вернуться в меню
   */
  const handleBackToMenu = useCallback(() => {
    setScreen('menu')
  }, [])
  
  return (
    <div className="app">
      {/* Заголовок (показываем везде кроме игры) */}
      {screen !== 'playing' && (
        <header className="app-header">
          <h1>🐍 SNAKE</h1>
        </header>
      )}
      
      {/* Контент в зависимости от экрана */}
      <main className="app-main">
        {screen === 'menu' && (
          <Menu 
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
          />
        )}
        
        {screen === 'playing' && (
          <GameBoard onGameOver={handleGameOver} />
        )}
        
        {screen === 'gameOver' && (
          <GameOver 
            result={lastGameResult}
            onPlayAgain={handleStartGame}
            onBackToMenu={handleBackToMenu}
            onShowLeaderboard={handleShowLeaderboard}
          />
        )}
        
        {screen === 'leaderboard' && (
          <Leaderboard onBack={handleBackToMenu} />
        )}
      </main>
      
      {/* Подсказка управления (показываем в меню) */}
      {screen === 'menu' && (
        <footer className="app-footer">
          <p>Управление: ↑ ↓ ← → или W A S D</p>
          <p>Пауза: Space</p>
        </footer>
      )}
    </div>
  )
}

export default App
