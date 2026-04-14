import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme before React renders to prevent flash of wrong theme
const storedTheme = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('productivity-theme') || '{}');
    return stored?.state?.theme || 'dark';
  } catch {
    return 'dark';
  }
})();

if (storedTheme === 'dark' || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
