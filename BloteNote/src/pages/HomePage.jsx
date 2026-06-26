import { useState, useEffect } from 'react'
import './HomePage.css'

// placeholder games keyed by IP (will be replaced with real data later)
const MOCK_GAMES = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 30),
    teamA: 'Арам и Карен',
    teamB: 'Ваге и Давит',
    scoreA: 201,
    scoreB: 154,
    goal: 201,
    hands: 8,
    winner: 'a',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    teamA: 'Арам и Карен',
    teamB: 'Ваге и Давит',
    scoreA: 97,
    scoreB: 301,
    goal: 301,
    hands: 12,
    winner: 'b',
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    teamA: 'Арам и Карен',
    teamB: 'Ваге и Давит',
    scoreA: 101,
    scoreB: 88,
    goal: 101,
    hands: 5,
    winner: 'a',
  },
]

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)   return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400)return `${Math.floor(diff / 3600)} ч назад`
  return `${Math.floor(diff / 86400)} д назад`
}

export default function HomePage({ visible, onNewGame }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      // slight delay so CSS transition fires after mount
      const t = setTimeout(() => setMounted(true), 30)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <div className={`home${mounted ? ' home--visible' : ''}`}>

      {/* ── header ── */}
      <header className="home__header">
        <div className="home__logo">
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="14" fill="url(#h-grad)"/>
            <text x="28" y="38" textAnchor="middle" fontSize="28" fill="white" fontFamily="serif">♠</text>
            <defs>
              <linearGradient id="h-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa"/>
                <stop offset="1" stopColor="#6d57e8"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="home__wordmark">
            <span>Blote</span><span className="home__wordmark-note">Note</span>
          </span>
        </div>
      </header>

      {/* ── new game button ── */}
      <div className="home__cta-wrap">
        <button className="btn-new-game" onClick={onNewGame}>
          <span className="btn-new-game__icon">＋</span>
          Новая игра
        </button>
      </div>

      {/* ── history section ── */}
      <section className="home__history">
        <div className="history-label">
          История игр
          <span className="history-badge">{MOCK_GAMES.length}</span>
        </div>

        {MOCK_GAMES.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__icon">🃏</span>
            <p>Игр пока нет</p>
            <p className="history-empty__sub">Нажми «Новая игра» чтобы начать</p>
          </div>
        ) : (
          <div className="game-list">
            {MOCK_GAMES.map((g, i) => (
              <GameCard key={g.id} game={g} index={i} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

function GameCard({ game, index }) {
  const winnerName = game.winner === 'a' ? game.teamA : game.teamB
  return (
    <div
      className="game-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="game-card__top">
        <div className="game-card__teams">
          <span className={`game-card__team${game.winner === 'a' ? ' game-card__team--winner' : ''}`}>
            {game.teamA}
          </span>
          <span className="game-card__vs">vs</span>
          <span className={`game-card__team${game.winner === 'b' ? ' game-card__team--winner' : ''}`}>
            {game.teamB}
          </span>
        </div>
        <span className="game-card__time">{timeAgo(game.date)}</span>
      </div>

      <div className="game-card__bottom">
        <div className="game-card__score">
          <span className={game.winner === 'a' ? 'score--win' : 'score--loss'}>{game.scoreA}</span>
          <span className="score-sep">:</span>
          <span className={game.winner === 'b' ? 'score--win' : 'score--loss'}>{game.scoreB}</span>
        </div>

        <div className="game-card__meta">
          <span className="meta-chip">до {game.goal}</span>
          <span className="meta-chip">{game.hands} раздач</span>
        </div>
      </div>

      <div className="game-card__winner-line">
        🏆 {winnerName}
      </div>
    </div>
  )
}
