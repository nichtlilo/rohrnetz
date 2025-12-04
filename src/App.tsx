import { useState, useEffect } from 'react'
import './App.css'
import Leistungsauftrag from './components/Leistungsauftrag'
import Tagesbericht from './components/Tagesbericht'
import LoadingScreen from './components/LoadingScreen'
import { useTheme } from './contexts/ThemeContext'

function App() {
  const [activeTab, setActiveTab] = useState<'leistungsauftrag' | 'tagesbericht'>('leistungsauftrag')
  const [isLoading, setIsLoading] = useState(true)
  const { isDarkMode, toggleDarkMode } = useTheme()

  useEffect(() => {
    // Simuliere Loading-Zeit
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 3 Sekunden Loading-Animation

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="app fade-in">
      <header className="app-header">
        <h1 className="company-name">ROHRNETZ Beil GmbH</h1>
        <h2 className="app-title">PDF Formular Generator</h2>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'leistungsauftrag' ? 'active' : ''}`}
          onClick={() => setActiveTab('leistungsauftrag')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leistungsauftrag
        </button>
        <button
          className={`tab-button ${activeTab === 'tagesbericht' ? 'active' : ''}`}
          onClick={() => setActiveTab('tagesbericht')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Tagesbericht
        </button>
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode} 
          aria-label="Toggle dark mode"
          title={isDarkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'leistungsauftrag' ? <Leistungsauftrag /> : <Tagesbericht />}
      </main>
    </div>
  )
}

export default App

