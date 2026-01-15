/**
 * Точка входа React приложения.
 * 
 * Здесь мы "монтируем" React в DOM элемент #root
 * из index.html
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Находим элемент <div id="root"> в index.html
// и рендерим в него наше React приложение
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
