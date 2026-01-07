import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize gold theme by default
if (!localStorage.getItem('theme-color')) {
  localStorage.setItem('theme-color', 'gold');
}
document.documentElement.classList.add('theme-gold');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
