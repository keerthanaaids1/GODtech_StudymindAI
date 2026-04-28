import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import ChatPage from './pages/ChatPage'
import FlashcardsPage from './pages/FlashcardsPage'
import QuizPage from './pages/QuizPage'
import ConceptsPage from './pages/ConceptsPage'
import WelcomePage from './pages/WelcomePage'

export default function App() {
  const [theme, setTheme] = useState('ocean')
  const [notebooks, setNotebooks] = useState([])
  const [activeNotebook, setActiveNotebook] = useState(null)
  const [activePage, setActivePage] = useState('chat')

  const toggleTheme = () => setTheme(t => t === 'ocean' ? 'forest' : 'ocean')

  return (
    <div className={`theme-${theme}`} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }
        }}
      />
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        notebooks={notebooks}
        setNotebooks={setNotebooks}
        activeNotebook={activeNotebook}
        setActiveNotebook={setActiveNotebook}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!activeNotebook ? (
          <WelcomePage theme={theme} />
        ) : activePage === 'chat' ? (
          <ChatPage notebook={activeNotebook} />
        ) : activePage === 'flashcards' ? (
          <FlashcardsPage notebook={activeNotebook} />
        ) : activePage === 'quiz' ? (
          <QuizPage notebook={activeNotebook} />
        ) : activePage === 'concepts' ? (
          <ConceptsPage notebook={activeNotebook} />
        ) : null}
      </main>
    </div>
  )
}
