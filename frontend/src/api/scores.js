/**
 * API клиент для работы с backend.
 * 
 * Все HTTP запросы к серверу делаются здесь.
 * Это позволяет:
 * 1. Легко менять URL сервера в одном месте
 * 2. Добавлять общую обработку ошибок
 * 3. Тестировать API отдельно от компонентов
 */

// URL backend сервера
// В Docker используется /api (nginx проксирует на backend)
// В development используется полный URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Базовая функция для HTTP запросов.
 * @param {string} endpoint - Путь (например, '/scores')
 * @param {Object} options - Опции fetch
 * @returns {Promise<Object>} - Ответ сервера в JSON
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const response = await fetch(url, { ...defaultOptions, ...options })
  
  // Проверяем успешность запроса
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP Error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Сохранить результат игры.
 * @param {Object} data - Данные результата
 * @param {number} data.score - Количество очков
 * @param {number} data.snake_length - Длина змейки
 * @param {number} data.duration_seconds - Длительность в секундах
 * @returns {Promise<Object>} - Созданная запись
 */
export async function saveScore(data) {
  return fetchAPI('/scores', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Получить таблицу лидеров.
 * @param {number} limit - Количество записей (по умолчанию 10)
 * @returns {Promise<Object>} - {entries: [...]}
 */
export async function getLeaderboard(limit = 10) {
  return fetchAPI(`/leaderboard?limit=${limit}`)
}

/**
 * Получить статистику игрока.
 * @returns {Promise<Object>} - Объект со статистикой
 */
export async function getStats() {
  return fetchAPI('/stats')
}

/**
 * Проверить доступность сервера.
 * @returns {Promise<Object>} - {status: "ok", message: "..."}
 */
export async function healthCheck() {
  return fetchAPI('/health')
}
