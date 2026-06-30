import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import HomePage    from './pages/HomePage'
import SetupPage   from './pages/SetupPage'
import GamePage    from './pages/GamePage'
import { calcRound } from './scoring'
import './styles/globals.css'

const STORAGE_KEY = 'blotenote-games-v1'

function loadGames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGames(games) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  } catch {
    // ignore quota errors
  }
}

export default function App() {
  const [screen,  setScreen]  = useState('splash')
  const [games,   setGames]   = useState(() => loadGames())
  const [current, setCurrent] = useState(null)

  // Сохраняем в localStorage при каждом изменении истории игр
  useEffect(() => {
    saveGames(games)
  }, [games])

  const handleSplashDone = () => setScreen('home')
  const handleNewGame    = () => setScreen('setup')
  const handleBack       = () => { setCurrent(null); setScreen('home') }

  const handleStart = ({ teamA, teamB, goal }) => {
    const newGame = {
      id: Date.now().toString(),
      startedAt: Date.now(),
      teamA, teamB, goal,
      scoreA: 0, scoreB: 0,
      rounds: [], winner: null,
    }
    setGames(prev => [...prev, newGame])
    setCurrent(newGame)
    setScreen('game')
  }

  const handleContinue = (game) => {
    setCurrent(game)
    setScreen('game')
  }

  const handleDelete = (id) => {
    setGames(prev => prev.filter(g => g.id !== id))
  }

  const handleAddRound = ({ declarer, suit, bid, isKaput, contra, oppSmall, declBonus, oppBonus, kaputDeclaredBonus }) => {
    setGames(prev => prev.map(g => {
      if (g.id !== current.id) return g

      const { scoreDecl, scoreOpp, made, declSmall, calc } = calcRound({
        declarer, suit, bid, isKaput, contra,
        oppSmall, declBonus, oppBonus,
        kaputDeclaredBonus,
      })

      const addA = declarer === 'a' ? scoreDecl : scoreOpp
      const addB = declarer === 'b' ? scoreDecl : scoreOpp

      const newScoreA = g.scoreA + addA
      const newScoreB = g.scoreB + addB

      let winner = null
      if (newScoreA >= g.goal || newScoreB >= g.goal) {
        if (newScoreA >= g.goal && newScoreB >= g.goal) {
          winner = newScoreA >= newScoreB ? 'a' : 'b'
        } else {
          winner = newScoreA >= g.goal ? 'a' : 'b'
        }
      }

      const round = {
        declarer, suit, bid, isKaput, contra, oppSmall, declSmall, made,
        scoreA: addA, scoreB: addB, calc,
      }
      const updated = { ...g, scoreA: newScoreA, scoreB: newScoreB, rounds: [...g.rounds, round], winner }

      setCurrent(updated)
      return updated
    }))
  }

  return (
    <>
      {screen === 'splash' && <SplashScreen onDone={handleSplashDone} />}

      <div style={{ display: screen === 'home'  ? 'block' : 'none' }}>
        <HomePage
          visible={screen === 'home'}
          games={games}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onDelete={handleDelete}
        />
      </div>
      <div style={{ display: screen === 'setup' ? 'block' : 'none' }}>
        <SetupPage visible={screen === 'setup'} onStart={handleStart} onBack={handleBack} />
      </div>
      <div style={{ display: screen === 'game'  ? 'block' : 'none' }}>
        <GamePage  visible={screen === 'game'}  game={current} onAddRound={handleAddRound} onBack={handleBack} />
      </div>
    </>
  )
}
